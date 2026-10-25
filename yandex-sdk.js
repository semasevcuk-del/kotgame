/**
 * Universal Platform SDK Manager
 * Seamlessly supports:
 * 1. Yandex Games (SDK v2)
 * 2. VK Games / VK Mini Apps (VK Bridge)
 * 3. Local/Mock Mode (Browser testing with simulated ads and localStorage)
 */

class UniversalSDKManager {
    constructor() {
        this.platform = 'mock'; // 'yandex' | 'vk' | 'mock'
        this.ysdk = null;
        this.player = null;
        this.isInitialized = false;
        this.lastFullscreenTime = 0;
        this.fullscreenCooldownMs = 60000;
        this.lang = 'ru';

        // Callbacks for sound muting during ads
        this.onPauseAudio = null;
        this.onResumeAudio = null;
    }

    /**
     * Auto-detect environment and initialize appropriate SDK
     */
    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const isVKEnvironment = urlParams.has('vk_user_id') || urlParams.has('vk_app_id') || (typeof vkBridge !== 'undefined' && vkBridge.isWebView && vkBridge.isWebView());
        const hasYaGames = typeof YaGames !== 'undefined';

        console.log('[SDKManager] Detecting platform...', { isVKEnvironment, hasYaGames });

        // --- 1. VK Games ---
        if (isVKEnvironment || (typeof vkBridge !== 'undefined' && !hasYaGames && window.location.protocol === 'https:')) {
            try {
                if (typeof vkBridge !== 'undefined') {
                    console.log('[SDKManager] Initializing VK Bridge...');
                    const res = await vkBridge.send('VKWebAppInit');
                    this.platform = 'vk';
                    this.isInitialized = true;
                    console.log('[SDKManager] VK Bridge initialized successfully:', res);
                    return;
                }
            } catch (err) {
                console.warn('[SDKManager] VK Bridge init failed, falling back:', err);
            }
        }

        // --- 2. Yandex Games ---
        if (hasYaGames) {
            try {
                console.log('[SDKManager] Initializing Yandex Games SDK...');
                this.ysdk = await YaGames.init();
                this.platform = 'yandex';
                this.isInitialized = true;
                this.lang = this.ysdk.environment.i18n.lang || 'ru';

                // Init Cloud Player
                try {
                    this.player = await this.ysdk.getPlayer({ scopes: false });
                } catch (e) {
                    console.warn('[SDKManager] Yandex player init non-fatal error:', e);
                }

                // Notify Yandex Loading complete
                if (this.ysdk.features && this.ysdk.features.LoadingAPI) {
                    this.ysdk.features.LoadingAPI.ready();
                }
                console.log('[SDKManager] Yandex SDK initialized successfully.');
                return;
            } catch (err) {
                console.warn('[SDKManager] Yandex SDK init error:', err);
            }
        }

        // --- 3. Local / Standalone Mock Mode ---
        console.log('[SDKManager] Running in MOCK / LOCAL test mode.');
        this.platform = 'mock';
        this.lang = (navigator.language || 'ru').toLowerCase().startsWith('ru') ? 'ru' : 'en';
        this.isInitialized = true;
    }

    /**
     * Save data across platforms
     */
    async saveData(data) {
        // LocalStorage fallback is always written
        try {
            localStorage.setItem('yg_cat_clicker_save', JSON.stringify(data));
        } catch (e) {}

        if (this.platform === 'yandex' && this.player) {
            try {
                await this.player.setData({ gameData: JSON.stringify(data) }, true);
            } catch (e) {
                console.warn('[SDKManager] Yandex cloud save error:', e);
            }
        } else if (this.platform === 'vk' && typeof vkBridge !== 'undefined') {
            try {
                await vkBridge.send('VKWebAppStorageSet', {
                    key: 'cat_save',
                    value: JSON.stringify(data)
                });
            } catch (e) {
                console.warn('[SDKManager] VK storage save error:', e);
            }
        }
    }

    /**
     * Load data across platforms
     */
    async loadData() {
        // 1. VK Cloud Storage
        if (this.platform === 'vk' && typeof vkBridge !== 'undefined') {
            try {
                const res = await vkBridge.send('VKWebAppStorageGet', { keys: ['cat_save'] });
                if (res && res.keys && res.keys[0] && res.keys[0].value) {
                    return JSON.parse(res.keys[0].value);
                }
            } catch (e) {
                console.warn('[SDKManager] VK storage load error:', e);
            }
        }

        // 2. Yandex Cloud Storage
        if (this.platform === 'yandex' && this.player) {
            try {
                const res = await this.player.getData(['gameData']);
                if (res && res.gameData) {
                    return JSON.parse(res.gameData);
                }
            } catch (e) {
                console.warn('[SDKManager] Yandex cloud load error:', e);
            }
        }

        // 3. LocalStorage
        try {
            const local = localStorage.getItem('yg_cat_clicker_save');
            if (local) return JSON.parse(local);
        } catch (e) {}

        return null;
    }

    /**
     * Show Interstitial / Fullscreen Ad
     */
    showFullscreenAd({ onOpen, onClose } = {}) {
        const now = Date.now();
        if (now - this.lastFullscreenTime < this.fullscreenCooldownMs) {
            if (onClose) onClose(false);
            return;
        }

        if (this.onPauseAudio) this.onPauseAudio();
        if (onOpen) onOpen();

        const handleClose = (shown = true) => {
            this.lastFullscreenTime = Date.now();
            if (this.onResumeAudio) this.onResumeAudio();
            if (onClose) onClose(shown);
        };

        // --- VK Games Ad ---
        if (this.platform === 'vk' && typeof vkBridge !== 'undefined') {
            vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
                .then(data => handleClose(data && data.result))
                .catch(err => {
                    console.warn('[SDKManager] VK Interstitial error:', err);
                    handleClose(false);
                });
            return;
        }

        // --- Yandex Games Ad ---
        if (this.platform === 'yandex' && this.ysdk) {
            this.ysdk.adv.showFullscreenAdv({
                callbacks: {
                    onOpen: () => {},
                    onClose: (shown) => handleClose(shown),
                    onError: (err) => handleClose(false)
                }
            });
            return;
        }

        // --- Mock Mode ---
        this.showMockAdModal('Межстраничная реклама (Яндекс / ВКонтакте)', () => {
            handleClose(true);
        });
    }

    /**
     * Show Rewarded Video Ad
     */
    showRewardedVideo({ onRewarded, onOpen, onClose, onError } = {}) {
        if (this.onPauseAudio) this.onPauseAudio();
        if (onOpen) onOpen();

        const finishAd = (rewardGranted) => {
            if (rewardGranted && onRewarded) onRewarded();
            if (this.onResumeAudio) this.onResumeAudio();
            if (onClose) onClose(rewardGranted);
        };

        // --- VK Games Rewarded ---
        if (this.platform === 'vk' && typeof vkBridge !== 'undefined') {
            vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' })
                .then(data => {
                    const ok = data && data.result;
                    finishAd(ok);
                })
                .catch(err => {
                    console.warn('[SDKManager] VK Rewarded error:', err);
                    if (onError) onError(err);
                    finishAd(false);
                });
            return;
        }

        // --- Yandex Games Rewarded ---
        if (this.platform === 'yandex' && this.ysdk) {
            let rewarded = false;
            this.ysdk.adv.showRewardedVideo({
                callbacks: {
                    onOpen: () => {},
                    onRewarded: () => { rewarded = true; },
                    onClose: () => finishAd(rewarded),
                    onError: (err) => {
                        if (onError) onError(err);
                        finishAd(false);
                    }
                }
            });
            return;
        }

        // --- Mock Mode ---
        this.showMockAdModal('Реклама за награду (Просмотр 3 сек...)', () => {
            finishAd(true);
        }, 3000);
    }

    /**
     * Submit score to Leaderboard
     */
    async setLeaderboardScore(leaderboardName, score) {
        if (this.platform === 'yandex' && this.ysdk) {
            try {
                const lb = await this.ysdk.getLeaderboards();
                await lb.setLeaderboardScore(leaderboardName, Math.floor(score));
                return true;
            } catch (e) {
                console.warn('[SDKManager] Yandex leaderboard error:', e);
            }
        } else if (this.platform === 'vk' && typeof vkBridge !== 'undefined') {
            try {
                // In VK, leaderboards for games can be submitted via VKWebAppCallAPIMethod or custom backend
                console.log('[SDKManager] VK score recorded:', score);
                return true;
            } catch (e) {}
        }
        return false;
    }

    /**
     * Fetch top leaderboard entries
     */
    async getLeaderboardEntries(leaderboardName, topCount = 10) {
        if (this.platform === 'yandex' && this.ysdk) {
            try {
                const lb = await this.ysdk.getLeaderboards();
                const res = await lb.getLeaderboardEntries(leaderboardName, {
                    quantityTop: topCount,
                    includeUser: true
                });
                return res.entries.map(e => ({
                    rank: e.rank,
                    name: e.player.publicName || 'Игрок',
                    score: e.score,
                    isUser: e.player.uniqueID === (this.player ? this.player.getUniqueID() : null)
                }));
            } catch (e) {
                console.warn('[SDKManager] Yandex leaderboard fetch error:', e);
            }
        }

        // Mock / Default entries
        return [
            { rank: 1, name: 'Кот Матроскин', score: 1000000 },
            { rank: 2, name: 'Чеширский', score: 500000 },
            { rank: 3, name: 'Барсик 007', score: 250000 },
            { rank: 4, name: 'Вы (Игрок)', score: Math.floor(window.game ? window.game.coins : 100), isUser: true }
        ];
    }

    /**
     * VK-specific feature: Invite friends / Share to wall
     */
    async sharePost(text = 'Я играю в Кото-Кликер: Мурр-Магнат! Заходи и строй свою кошачью империю! 🐱') {
        if (this.platform === 'vk' && typeof vkBridge !== 'undefined') {
            try {
                await vkBridge.send('VKWebAppShowWallPostBox', { message: text });
                return true;
            } catch (e) {
                console.warn('[SDKManager] VK share cancelled or error:', e);
            }
        } else {
            if (navigator.share) {
                navigator.share({ title: 'Кото-Кликер: Мурр-Магнат', text: text, url: window.location.href }).catch(() => {});
            } else {
                alert(text);
            }
        }
        return false;
    }

    /**
     * VK-specific feature: Add game to Home Screen (Mobile shortcut)
     */
    async addToHomeScreen() {
        if (this.platform === 'vk' && typeof vkBridge !== 'undefined') {
            try {
                await vkBridge.send('VKWebAppAddToHomeScreen');
            } catch (e) {}
        }
    }

    gameplayStart() {
        if (this.platform === 'yandex' && this.ysdk?.features?.GameplayAPI) {
            this.ysdk.features.GameplayAPI.start();
        }
    }

    gameplayStop() {
        if (this.platform === 'yandex' && this.ysdk?.features?.GameplayAPI) {
            this.ysdk.features.GameplayAPI.stop();
        }
    }

    /**
     * Sleek Mock Ad Modal for local testing
     */
    showMockAdModal(title, callback, duration = 1800) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(10, 15, 30, 0.95);
            z-index: 999999; display: flex; flex-direction: column;
            align-items: center; justify-content: center; color: white;
            font-family: sans-serif; text-align: center; padding: 20px;
        `;
        overlay.innerHTML = `
            <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px solid #f59e0b; border-radius: 16px; padding: 30px; max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <div style="font-size: 40px; margin-bottom: 12px;">📺</div>
                <h3 style="margin: 0 0 10px; color: #fbbf24; font-size: 20px;">[Тестовый Режим]</h3>
                <p style="margin: 0 0 15px; font-size: 15px; color: #cbd5e1;">${title}</p>
                <div style="width: 100%; height: 8px; background: #334155; border-radius: 4px; overflow: hidden; margin-bottom: 15px;">
                    <div id="mock-progress" style="height: 100%; width: 0%; background: #10b981; transition: width ${duration}ms linear;"></div>
                </div>
                <div id="mock-status" style="font-size: 13px; color: #94a3b8;">Имитация показа рекламы (VK / Яндекс)...</div>
            </div>
        `;
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            const bar = document.getElementById('mock-progress');
            if (bar) bar.style.width = '100%';
        });

        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
            if (callback) callback();
        }, duration);
    }
}

// Global instance compatible with previous references
window.yandexSDK = new UniversalSDKManager();
window.platformSDK = window.yandexSDK;
