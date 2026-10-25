/**
 * Procedural Web Audio Sound Synthesizer
 * High-performance, zero-asset sound generator for clicks, coins, level-ups, and special events.
 */

class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;

        // Load sound preference
        try {
            const saved = localStorage.getItem('yg_sound_enabled');
            if (saved !== null) {
                this.enabled = saved === 'true';
            }
        } catch (e) {}
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.initialized = true;
            }
        } catch (e) {
            console.warn('[SoundManager] AudioContext not supported:', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        try {
            localStorage.setItem('yg_sound_enabled', this.enabled);
        } catch (e) {}
        if (this.enabled) {
            this.playClick();
        }
        return this.enabled;
    }

    /**
     * Play satisfying click "pop" sound with slight pitch variation
     */
    playClick() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Randomize pitch slightly for organic feel
            const freq = 420 + Math.random() * 80;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.08);
        } catch (e) {}
    }

    /**
     * Crisp coin collect chime
     */
    playCoin() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, now); // B5
            osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.22);
        } catch (e) {}
    }

    /**
     * Upgrade purchase sound
     */
    playUpgrade() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.04);

                gain.gain.setValueAtTime(0.12, now + idx * 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.12);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now + idx * 0.04);
                osc.stop(now + idx * 0.04 + 0.12);
            });
        } catch (e) {}
    }

    /**
     * Golden Event / Frenzy Bell
     */
    playGoldenSpawn() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1760, now); // A6
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.45);
        } catch (e) {}
    }

    /**
     * Frenzy Mode Active / Reward sound
     */
    playFrenzy() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            [587.33, 739.99, 880.00, 1174.66, 1479.98].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.06);

                gain.gain.setValueAtTime(0.2, now + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now + idx * 0.06);
                osc.stop(now + idx * 0.06 + 0.25);
            });
        } catch (e) {}
    }

    /**
     * Achievement fanfare
     */
    playAchievement() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major
            chord.forEach((freq) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 0.6);
            });
        } catch (e) {}
    }
}

window.soundManager = new SoundManager();
