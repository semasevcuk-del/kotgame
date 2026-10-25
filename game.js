/**
 * Cat Tycoon / Кото-Кликер: Мурр-Магнат
 * Core Game Engine
 */

class ClickerGame {
    constructor() {
        this.coins = 0;
        this.totalCoinsEarned = 0;
        this.totalClicks = 0;
        this.baseClickPower = 1;
        this.prestigeCount = 0;
        this.prestigeStars = 0;
        this.selectedSkin = 'classic';

        // Upgrades storage: { id: level }
        this.upgrades = {};

        // Active boosts
        this.frenzyTimer = 0; // seconds left
        this.frenzyMultiplier = 7;
        this.adBoostTimer = 0; // seconds left (x2 income)

        // Statistics
        this.goldenEventsClicked = 0;
        this.adsWatched = 0;
        this.achievementsUnlocked = [];

        // Timing
        this.lastSaveTime = Date.now();
        this.lastTickTime = Date.now();
        this.nextGoldenEventTime = Date.now() + 35000 + Math.random() * 30000;

        // Upgrades Configuration
        this.clickUpgradeDefs = [
            { id: 'c_claws', name: 'Острые коготки', baseCost: 15, costMult: 1.25, power: 1, icon: '🐾' },
            { id: 'c_laser', name: 'Лазерная указка', baseCost: 100, costMult: 1.28, power: 5, icon: '🔦' },
            { id: 'c_mouse_toy', name: 'Заводная мышка', baseCost: 600, costMult: 1.30, power: 22, icon: '🐁' },
            { id: 'c_golden_paw', name: 'Золотая лапка', baseCost: 3500, costMult: 1.32, power: 110, icon: '✨' },
            { id: 'c_cyber_glove', name: 'Кибер-перчатка', baseCost: 20000, costMult: 1.35, power: 550, icon: '🦾' },
            { id: 'c_quantum_tap', name: 'Квантовый тык', baseCost: 150000, costMult: 1.40, power: 3000, icon: '🌌' }
        ];

        this.idleUpgradeDefs = [
            { id: 'i_yarn', name: 'Клубок пряжи', baseCost: 30, costMult: 1.15, dps: 1, icon: '🧶' },
            { id: 'i_catnip', name: 'Кустик мяты', baseCost: 150, costMult: 1.16, dps: 6, icon: '🌿' },
            { id: 'i_scratch', name: 'Когтеточка люкс', baseCost: 800, costMult: 1.17, dps: 30, icon: '🪵' },
            { id: 'i_feeder', name: 'Авто-кормушка', baseCost: 4500, costMult: 1.18, dps: 160, icon: '🍲' },
            { id: 'i_fish_market', name: 'Рыбный рынок', baseCost: 24000, costMult: 1.19, dps: 750, icon: '🐟' },
            { id: 'i_cat_cafe', name: 'Уютное кото-кафе', baseCost: 130000, costMult: 1.20, dps: 3600, icon: '☕' },
            { id: 'i_hotel', name: 'Отель для котиков', baseCost: 800000, costMult: 1.22, dps: 18000, icon: '🏨' },
            { id: 'i_bank', name: 'Кошачий банк', baseCost: 5000000, costMult: 1.23, dps: 90000, icon: '🏦' },
            { id: 'i_space_station', name: 'Орбитальная станция', baseCost: 35000000, costMult: 1.25, dps: 500000, icon: '🛸' },
            { id: 'i_galaxy', name: 'Мурр-Галактика', baseCost: 250000000, costMult: 1.28, dps: 3000000, icon: '🌌' }
        ];

        // Skins definition
        this.skins = [
            { id: 'classic', name: 'Рыжик', desc: 'Любимый рыжий проказник', unlockType: 'free' },
            { id: 'gangster', name: 'Кот-Босс', desc: 'Модные очки и галстук-бабочка', unlockType: 'clicks', req: 500 },
            { id: 'cyber', name: 'Кибер-Кот', desc: 'Неоновые импланты и кибер-визор', unlockType: 'coins', req: 100000 },
            { id: 'king', name: 'Царь-Кот', desc: 'Золотая корона и королевская стать', unlockType: 'prestige', req: 1 },
            { id: 'astronaut', name: 'Космо-Кот', desc: 'Скафандр покорителя космоса', unlockType: 'prestige', req: 3 }
        ];

        // Achievements
        this.achievementDefs = [
            { id: 'first_click', name: 'Первый мурр', desc: 'Сделайте первый клик', reward: 50, icon: '🐾' },
            { id: 'click_100', name: 'Быстрые лапки', desc: 'Сделайте 100 кликов', reward: 500, icon: '⚡' },
            { id: 'click_1000', name: 'Мастер тапа', desc: 'Сделайте 1,000 кликов', reward: 5000, icon: '🏆' },
            { id: 'coins_1k', name: 'Первые сбережения', desc: 'Заработайте 1,000 монет', reward: 250, icon: '💰' },
            { id: 'coins_100k', name: 'Кошачий капитал', desc: 'Заработайте 100,000 монет', reward: 15000, icon: '💎' },
            { id: 'coins_10m', name: 'Мурр-Миллионер', desc: 'Заработайте 10,000,000 монет', reward: 500000, icon: '👑' },
            { id: 'first_upgrade', name: 'Первая инвестиция', desc: 'Купите любое улучшение', reward: 100, icon: '📈' },
            { id: 'golden_mouse', name: 'Охотник за золотом', desc: 'Поймайте золотую мышку', reward: 2000, icon: '🧀' },
            { id: 'first_prestige', name: 'Кошачья нирвана', desc: 'Совершите первое перерождение', reward: 50000, icon: '✨' },
            { id: 'ad_support', name: 'Спонсор игры', desc: 'Посмотрите бонусную рекламу', reward: 1000, icon: '📺' }
        ];
    }

    /**
     * Format numbers into readable SI / suffix format
     */
    static formatNumber(n) {
        if (n === null || n === undefined || isNaN(n)) return '0';
        if (n < 1000) return Math.floor(n).toLocaleString('ru-RU');

        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        const i = Math.floor(Math.log10(n) / 3);

        if (i < suffixes.length) {
            const formatted = (n / Math.pow(10, i * 3)).toFixed(i < 3 ? 1 : 2);
            return `${formatted} ${suffixes[i]}`;
        }

        return n.toExponential(2);
    }

    /**
     * Compute current Click Power
     */
    getClickPower() {
        let power = this.baseClickPower;

        for (const def of this.clickUpgradeDefs) {
            const lvl = this.upgrades[def.id] || 0;
            power += lvl * def.power;
        }

        // Apply prestige multiplier (+15% per star)
        const prestigeMult = 1 + (this.prestigeStars * 0.15);
        power *= prestigeMult;

        // Apply Frenzy Boost (x7)
        if (this.frenzyTimer > 0) {
            power *= this.frenzyMultiplier;
        }

        return Math.max(1, Math.floor(power));
    }

    /**
     * Compute Passive Income (coins per second)
     */
    getPassiveIncome() {
        let income = 0;

        for (const def of this.idleUpgradeDefs) {
            const lvl = this.upgrades[def.id] || 0;
            income += lvl * def.dps;
        }

        // Prestige multiplier (+15% per star)
        const prestigeMult = 1 + (this.prestigeStars * 0.15);
        income *= prestigeMult;

        // Rewarded Ad Boost (x2)
        if (this.adBoostTimer > 0) {
            income *= 2;
        }

        // Frenzy Boost (x7)
        if (this.frenzyTimer > 0) {
            income *= this.frenzyMultiplier;
        }

        return Math.floor(income);
    }

    /**
     * Get upgrade current cost
     */
    getUpgradeCost(def) {
        const level = this.upgrades[def.id] || 0;
        return Math.floor(def.baseCost * Math.pow(def.costMult, level));
    }

    /**
     * Handle manual click on the mascot
     */
    handleClick(clientX, clientY) {
        const power = this.getClickPower();
        const isCrit = Math.random() < 0.10; // 10% critical hit chance!
        const earned = isCrit ? power * 2.5 : power;

        this.coins += earned;
        this.totalCoinsEarned += earned;
        this.totalClicks++;

        // Audio
        if (window.soundManager) {
            window.soundManager.playClick();
        }

        // Visual floating text
        if (window.particleSystem && clientX && clientY) {
            const text = `+${ClickerGame.formatNumber(earned)}${isCrit ? ' КРИТ!' : ''}`;
            window.particleSystem.spawnFloatingText(clientX, clientY, text, isCrit);
            if (isCrit) {
                window.particleSystem.spawnBurst(clientX, clientY, 8, '💥');
            }
        }

        this.checkAchievements();
        this.updateUI();
    }

    /**
     * Buy an upgrade
     */
    buyUpgrade(upgradeId) {
        let def = this.clickUpgradeDefs.find(u => u.id === upgradeId);
        if (!def) {
            def = this.idleUpgradeDefs.find(u => u.id === upgradeId);
        }
        if (!def) return false;

        const cost = this.getUpgradeCost(def);
        if (this.coins >= cost) {
            this.coins -= cost;
            this.upgrades[def.id] = (this.upgrades[def.id] || 0) + 1;

            if (window.soundManager) {
                window.soundManager.playUpgrade();
            }

            this.checkAchievements();
            this.updateUI();
            this.save();
            return true;
        }

        return false;
    }

    /**
     * Trigger Frenzy Mode (e.g. from Golden Mouse)
     */
    activateFrenzy(durationSeconds = 30) {
        this.frenzyTimer = Math.max(this.frenzyTimer, durationSeconds);
        if (window.soundManager) {
            window.soundManager.playFrenzy();
        }
        if (window.particleSystem) {
            window.particleSystem.launchConfetti();
        }
        this.showToast('🔥 ФРЕНЗИ! Доход и клики увеличены в 7 раз на 30 сек!');
        this.updateUI();
    }

    /**
     * Trigger 2x Rewarded Ad Income Boost
     */
    activateAdDoubleBoost(durationSeconds = 180) {
        this.adBoostTimer = Math.max(this.adBoostTimer, durationSeconds);
        this.adsWatched++;
        if (window.soundManager) {
            window.soundManager.playCoin();
        }
        this.showToast('🚀 Буст активен! Пассивный доход удвоен на 3 минуты!');
        this.checkAchievements();
        this.updateUI();
        this.save();
    }

    /**
     * Trigger Instant Chest Reward (15 mins of passive income)
     */
    grantInstantChestReward() {
        const income = this.getPassiveIncome();
        // At least grant a nice chunk if income is low
        const reward = Math.max(1000, income * 60 * 15);
        this.coins += reward;
        this.totalCoinsEarned += reward;
        this.adsWatched++;

        if (window.soundManager) {
            window.soundManager.playCoin();
        }
        if (window.particleSystem) {
            window.particleSystem.launchConfetti();
        }

        this.showToast(`🎁 Награда из сундука: +${ClickerGame.formatNumber(reward)} монет!`);
        this.checkAchievements();
        this.updateUI();
        this.save();
    }

    /**
     * Check if player qualifies for prestige
     */
    getPendingPrestigeStars() {
        if (this.totalCoinsEarned < 500000) return 0;
        // 1 star per 500,000 lifetime coins earned (cube root scaling)
        const totalPossible = Math.floor(Math.pow(this.totalCoinsEarned / 500000, 0.5));
        return Math.max(0, totalPossible - this.prestigeStars);
    }

    /**
     * Execute Prestige (Перерождение)
     */
    doPrestige() {
        const pending = this.getPendingPrestigeStars();
        if (pending <= 0) return false;

        this.prestigeStars += pending;
        this.prestigeCount++;

        // Reset progress
        this.coins = 0;
        this.upgrades = {};
        this.frenzyTimer = 0;
        this.adBoostTimer = 0;

        if (window.soundManager) {
            window.soundManager.playAchievement();
        }
        if (window.particleSystem) {
            window.particleSystem.launchConfetti();
        }

        this.showToast(`✨ Перерождение свершилось! Получено ${pending} звёзд нирваны!`);
        this.checkAchievements();
        this.updateUI();
        this.save();

        // Check leaderboard sync
        if (window.yandexSDK) {
            window.yandexSDK.setLeaderboardScore('top_coins', this.totalCoinsEarned);
        }

        return true;
    }

    /**
     * Check unlock conditions for achievements
     */
    checkAchievements() {
        for (const ach of this.achievementDefs) {
            if (this.achievementsUnlocked.includes(ach.id)) continue;

            let unlocked = false;
            if (ach.id === 'first_click' && this.totalClicks >= 1) unlocked = true;
            if (ach.id === 'click_100' && this.totalClicks >= 100) unlocked = true;
            if (ach.id === 'click_1000' && this.totalClicks >= 1000) unlocked = true;
            if (ach.id === 'coins_1k' && this.totalCoinsEarned >= 1000) unlocked = true;
            if (ach.id === 'coins_100k' && this.totalCoinsEarned >= 100000) unlocked = true;
            if (ach.id === 'coins_10m' && this.totalCoinsEarned >= 10000000) unlocked = true;
            if (ach.id === 'first_upgrade' && Object.values(this.upgrades).reduce((a, b) => a + b, 0) >= 1) unlocked = true;
            if (ach.id === 'golden_mouse' && this.goldenEventsClicked >= 1) unlocked = true;
            if (ach.id === 'first_prestige' && this.prestigeCount >= 1) unlocked = true;
            if (ach.id === 'ad_support' && this.adsWatched >= 1) unlocked = true;

            if (unlocked) {
                this.achievementsUnlocked.push(ach.id);
                this.coins += ach.reward;
                this.totalCoinsEarned += ach.reward;

                if (window.soundManager) {
                    window.soundManager.playAchievement();
                }
                if (window.particleSystem) {
                    window.particleSystem.launchConfetti();
                }

                this.showToast(`🏆 Достижение: "${ach.name}"! +${ClickerGame.formatNumber(ach.reward)} 🪙`);
            }
        }
    }

    /**
     * Check if skin is unlocked
     */
    isSkinUnlocked(skin) {
        if (skin.unlockType === 'free') return true;
        if (skin.unlockType === 'clicks') return this.totalClicks >= skin.req;
        if (skin.unlockType === 'coins') return this.totalCoinsEarned >= skin.req;
        if (skin.unlockType === 'prestige') return this.prestigeCount >= skin.req;
        return false;
    }

    /**
     * Equip skin
     */
    selectSkin(skinId) {
        const skin = this.skins.find(s => s.id === skinId);
        if (!skin || !this.isSkinUnlocked(skin)) return false;

        this.selectedSkin = skinId;
        this.updateCatVisuals();
        this.save();
        return true;
    }

    /**
     * Show notification toast
     */
    showToast(msg) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const el = document.createElement('div');
        el.className = 'game-toast';
        el.innerHTML = msg;
        toastContainer.appendChild(el);

        setTimeout(() => {
            el.classList.add('hide');
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 400);
        }, 3200);
    }

    /**
     * Golden Mouse random spawner
     */
    spawnGoldenMouse() {
        const existing = document.getElementById('golden-mouse');
        if (existing) return;

        const mouse = document.createElement('div');
        mouse.id = 'golden-mouse';
        mouse.innerHTML = '🧀<span class="wings">✨</span>';
        mouse.title = 'Поймай золотую мышь!';

        const startY = 15 + Math.random() * 60; // 15% to 75% height
        mouse.style.top = `${startY}vh`;
        mouse.style.left = `-80px`;

        if (window.soundManager) {
            window.soundManager.playGoldenSpawn();
        }

        mouse.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            this.goldenEventsClicked++;
            this.activateFrenzy(30);
            if (mouse.parentNode) mouse.parentNode.removeChild(mouse);
        });

        document.body.appendChild(mouse);

        // Animate across screen
        let pos = -80;
        const speed = 2.4 + Math.random() * 1.5;
        const interval = setInterval(() => {
            pos += speed;
            mouse.style.left = `${pos}px`;

            if (pos > window.innerWidth + 80) {
                clearInterval(interval);
                if (mouse.parentNode) mouse.parentNode.removeChild(mouse);
            }
        }, 16);
    }

    /**
     * Main Game Loop Tick (Called every 100ms or 1s)
     */
    tick(deltaTimeSec) {
        // Decrement timers
        if (this.frenzyTimer > 0) {
            this.frenzyTimer = Math.max(0, this.frenzyTimer - deltaTimeSec);
        }

        if (this.adBoostTimer > 0) {
            this.adBoostTimer = Math.max(0, this.adBoostTimer - deltaTimeSec);
        }

        // Add passive earnings
        const incomePerSec = this.getPassiveIncome();
        const earned = incomePerSec * deltaTimeSec;

        if (earned > 0) {
            this.coins += earned;
            this.totalCoinsEarned += earned;
        }

        // Golden Mouse trigger check
        if (Date.now() > this.nextGoldenEventTime) {
            this.spawnGoldenMouse();
            this.nextGoldenEventTime = Date.now() + 45000 + Math.random() * 45000;
        }

        // Check periodic save (every 15 sec)
        if (Date.now() - this.lastSaveTime > 15000) {
            this.save();
        }

        this.updateUI();
    }

    /**
     * Update Cat Mascot visuals based on selected skin
     */
    updateCatVisuals() {
        const catElem = document.getElementById('mascot-cat');
        if (!catElem) return;

        catElem.className = `cat-mascot skin-${this.selectedSkin}`;

        // Accessories based on skin
        const accessoryEl = document.getElementById('cat-accessories');
        if (accessoryEl) {
            let html = '';
            if (this.selectedSkin === 'gangster') {
                html = '<div class="accessory sunglasses">🕶️</div><div class="accessory bowtie">🎀</div>';
            } else if (this.selectedSkin === 'cyber') {
                html = '<div class="accessory cyber-visor">🥽</div><div class="accessory cyber-glow">⚡</div>';
            } else if (this.selectedSkin === 'king') {
                html = '<div class="accessory crown">👑</div><div class="accessory cape">🧣</div>';
            } else if (this.selectedSkin === 'astronaut') {
                html = '<div class="accessory helmet">👨‍🚀</div><div class="accessory jetpack">🚀</div>';
            }
            accessoryEl.innerHTML = html;
        }
    }

    /**
     * Update all DOM UI elements
     */
    updateUI() {
        // Balances
        const coinsEl = document.getElementById('coins-display');
        if (coinsEl) coinsEl.innerText = ClickerGame.formatNumber(this.coins);

        const dpsEl = document.getElementById('dps-display');
        if (dpsEl) dpsEl.innerText = ClickerGame.formatNumber(this.getPassiveIncome());

        const clickPowerEl = document.getElementById('click-power-display');
        if (clickPowerEl) clickPowerEl.innerText = ClickerGame.formatNumber(this.getClickPower());

        // Boost indicators
        const frenzyBanner = document.getElementById('frenzy-indicator');
        if (frenzyBanner) {
            if (this.frenzyTimer > 0) {
                frenzyBanner.classList.remove('hidden');
                frenzyBanner.innerText = `🔥 ФРЕНЗИ x7: ${Math.ceil(this.frenzyTimer)}с`;
            } else {
                frenzyBanner.classList.add('hidden');
            }
        }

        const boostBanner = document.getElementById('ad-boost-indicator');
        if (boostBanner) {
            if (this.adBoostTimer > 0) {
                boostBanner.classList.remove('hidden');
                boostBanner.innerText = `⚡ БУСТ ДОХОДА x2: ${Math.ceil(this.adBoostTimer)}с`;
            } else {
                boostBanner.classList.add('hidden');
            }
        }

        // Prestige info
        const prestigeStarsEl = document.getElementById('prestige-stars-display');
        if (prestigeStarsEl) prestigeStarsEl.innerText = `${this.prestigeStars} ⭐ (+${Math.floor(this.prestigeStars * 15)}%)`;

        const pendingStarsEl = document.getElementById('pending-stars-display');
        if (pendingStarsEl) {
            const pending = this.getPendingPrestigeStars();
            pendingStarsEl.innerText = `+${pending} ⭐`;
            const prestigeBtn = document.getElementById('prestige-confirm-btn');
            if (prestigeBtn) {
                prestigeBtn.disabled = pending <= 0;
            }
        }

        // Upgrades buttons state
        for (const def of [...this.clickUpgradeDefs, ...this.idleUpgradeDefs]) {
            const card = document.getElementById(`card-${def.id}`);
            if (card) {
                const cost = this.getUpgradeCost(def);
                const canAfford = this.coins >= cost;
                card.classList.toggle('can-afford', canAfford);

                const costEl = card.querySelector('.upgrade-cost');
                if (costEl) costEl.innerText = ClickerGame.formatNumber(cost);

                const lvlEl = card.querySelector('.upgrade-lvl');
                if (lvlEl) lvlEl.innerText = `ур. ${this.upgrades[def.id] || 0}`;
            }
        }
    }

    /**
     * Render Upgrades Lists into DOM
     */
    renderUpgradeLists() {
        const clickList = document.getElementById('click-upgrades-list');
        if (clickList) {
            clickList.innerHTML = this.clickUpgradeDefs.map(def => {
                const lvl = this.upgrades[def.id] || 0;
                const cost = this.getUpgradeCost(def);
                return `
                    <div id="card-${def.id}" class="upgrade-card" onclick="window.game.buyUpgrade('${def.id}')">
                        <div class="upgrade-icon">${def.icon}</div>
                        <div class="upgrade-details">
                            <div class="upgrade-header">
                                <span class="upgrade-title">${def.name}</span>
                                <span class="upgrade-lvl">ур. ${lvl}</span>
                            </div>
                            <div class="upgrade-sub">+${ClickerGame.formatNumber(def.power)} к клику</div>
                            <div class="upgrade-cost-badge">🪙 <span class="upgrade-cost">${ClickerGame.formatNumber(cost)}</span></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const idleList = document.getElementById('idle-upgrades-list');
        if (idleList) {
            idleList.innerHTML = this.idleUpgradeDefs.map(def => {
                const lvl = this.upgrades[def.id] || 0;
                const cost = this.getUpgradeCost(def);
                return `
                    <div id="card-${def.id}" class="upgrade-card" onclick="window.game.buyUpgrade('${def.id}')">
                        <div class="upgrade-icon">${def.icon}</div>
                        <div class="upgrade-details">
                            <div class="upgrade-header">
                                <span class="upgrade-title">${def.name}</span>
                                <span class="upgrade-lvl">ур. ${lvl}</span>
                            </div>
                            <div class="upgrade-sub">+${ClickerGame.formatNumber(def.dps)} /сек</div>
                            <div class="upgrade-cost-badge">🪙 <span class="upgrade-cost">${ClickerGame.formatNumber(cost)}</span></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    /**
     * Render Skins and Achievements in their respective modals
     */
    renderSkinsList() {
        const list = document.getElementById('skins-list');
        if (!list) return;

        list.innerHTML = this.skins.map(skin => {
            const unlocked = this.isSkinUnlocked(skin);
            const isEquipped = this.selectedSkin === skin.id;

            let conditionText = '';
            if (!unlocked) {
                if (skin.unlockType === 'clicks') conditionText = `🔒 Нужно ${skin.req} кликов`;
                if (skin.unlockType === 'coins') conditionText = `🔒 Нужно ${ClickerGame.formatNumber(skin.req)} монет`;
                if (skin.unlockType === 'prestige') conditionText = `🔒 Нужно ${skin.req} перерождений`;
            }

            return `
                <div class="skin-item ${unlocked ? 'unlocked' : 'locked'} ${isEquipped ? 'equipped' : ''}">
                    <div class="skin-name">${skin.name} ${isEquipped ? '✔️' : ''}</div>
                    <div class="skin-desc">${skin.desc}</div>
                    ${!unlocked ? `<div class="skin-req">${conditionText}</div>` : ''}
                    ${unlocked && !isEquipped ? `
                        <button class="btn btn-sm btn-primary" onclick="window.game.selectSkin('${skin.id}')">Выбрать</button>
                    ` : ''}
                    ${isEquipped ? `<span class="badge-equipped">Надето</span>` : ''}
                </div>
            `;
        }).join('');
    }

    renderAchievementsList() {
        const list = document.getElementById('achievements-list');
        if (!list) return;

        list.innerHTML = this.achievementDefs.map(ach => {
            const isDone = this.achievementsUnlocked.includes(ach.id);
            return `
                <div class="ach-item ${isDone ? 'completed' : 'locked'}">
                    <div class="ach-icon">${ach.icon}</div>
                    <div class="ach-info">
                        <div class="ach-title">${ach.name} ${isDone ? '✅' : ''}</div>
                        <div class="ach-desc">${ach.desc}</div>
                        <div class="ach-reward">Награда: +${ClickerGame.formatNumber(ach.reward)} 🪙</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Save Game State
     */
    save() {
        this.lastSaveTime = Date.now();
        const data = {
            coins: this.coins,
            totalCoinsEarned: this.totalCoinsEarned,
            totalClicks: this.totalClicks,
            prestigeCount: this.prestigeCount,
            prestigeStars: this.prestigeStars,
            selectedSkin: this.selectedSkin,
            upgrades: this.upgrades,
            goldenEventsClicked: this.goldenEventsClicked,
            adsWatched: this.adsWatched,
            achievementsUnlocked: this.achievementsUnlocked,
            lastSaveTimestamp: this.lastSaveTime
        };

        if (window.yandexSDK) {
            window.yandexSDK.saveData(data);
        }
    }

    /**
     * Load Game State
     */
    async load() {
        let data = null;
        if (window.yandexSDK) {
            data = await window.yandexSDK.loadData();
        }

        if (data) {
            this.coins = Number(data.coins) || 0;
            this.totalCoinsEarned = Number(data.totalCoinsEarned) || this.coins;
            this.totalClicks = Number(data.totalClicks) || 0;
            this.prestigeCount = Number(data.prestigeCount) || 0;
            this.prestigeStars = Number(data.prestigeStars) || 0;
            this.selectedSkin = data.selectedSkin || 'classic';
            this.upgrades = data.upgrades || {};
            this.goldenEventsClicked = Number(data.goldenEventsClicked) || 0;
            this.adsWatched = Number(data.adsWatched) || 0;
            this.achievementsUnlocked = Array.isArray(data.achievementsUnlocked) ? data.achievementsUnlocked : [];

            // Calculate offline earnings!
            if (data.lastSaveTimestamp) {
                const now = Date.now();
                const diffSeconds = Math.floor((now - data.lastSaveTimestamp) / 1000);

                if (diffSeconds > 30) {
                    const passive = this.getPassiveIncome();
                    if (passive > 0) {
                        const cappedSeconds = Math.min(diffSeconds, 8 * 3600); // Max 8 hours
                        const earnedOffline = cappedSeconds * passive;

                        if (earnedOffline > 0) {
                            this.showOfflineModal(earnedOffline, cappedSeconds);
                        }
                    }
                }
            }
        }

        this.renderUpgradeLists();
        this.updateCatVisuals();
        this.updateUI();
    }

    /**
     * Offline Earnings Modal with Rewarded x3 option
     */
    showOfflineModal(coins, seconds) {
        const modal = document.getElementById('offline-modal');
        const amountEl = document.getElementById('offline-amount');
        const timeEl = document.getElementById('offline-time');

        if (!modal || !amountEl) return;

        amountEl.innerText = ClickerGame.formatNumber(coins);

        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        timeEl.innerText = hours > 0 ? `${hours}ч ${mins}мин` : `${mins} мин`;

        this.pendingOfflineCoins = coins;
        modal.classList.remove('hidden');
    }

    claimOfflineReward(multiplier = 1) {
        const modal = document.getElementById('offline-modal');
        if (modal) modal.classList.add('hidden');

        if (!this.pendingOfflineCoins) return;

        const totalReward = this.pendingOfflineCoins * multiplier;
        this.coins += totalReward;
        this.totalCoinsEarned += totalReward;
        this.pendingOfflineCoins = 0;

        if (window.soundManager) {
            window.soundManager.playCoin();
        }
        if (window.particleSystem) {
            window.particleSystem.launchConfetti();
        }

        this.showToast(`💰 Получено +${ClickerGame.formatNumber(totalReward)} монет за время отсутствия!`);
        this.updateUI();
        this.save();
    }

    /**
     * Claim x3 Offline earnings by watching Rewarded Video Ad
     */
    claimOfflineRewardWithAd() {
        if (!window.yandexSDK) {
            this.claimOfflineReward(3);
            return;
        }

        window.yandexSDK.showRewardedVideo({
            onRewarded: () => {
                this.adsWatched++;
                this.claimOfflineReward(3);
            },
            onError: () => {
                this.claimOfflineReward(1);
            }
        });
    }

    /**
     * Start Game Loop
     */
    start() {
        this.lastTickTime = Date.now();

        setInterval(() => {
            const now = Date.now();
            const delta = (now - this.lastTickTime) / 1000;
            this.lastTickTime = now;

            this.tick(delta);
        }, 100);

        // Periodic Interstitial Ad trigger (every 3 minutes when interacting)
        setInterval(() => {
            if (window.yandexSDK && !document.hidden) {
                window.yandexSDK.showFullscreenAd();
            }
        }, 180000);
    }
}

// Global Game Instance
window.game = new ClickerGame();
