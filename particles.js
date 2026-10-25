/**
 * Particle and Floating Text Effects
 */

class ParticleSystem {
    constructor() {
        this.container = null;
    }

    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'particle-container';
        this.container.style.cssText = `
            position: fixed; inset: 0; pointer-events: none; z-index: 999; overflow: hidden;
        `;
        document.body.appendChild(this.container);
    }

    /**
     * Spawn floating number text on click
     * @param {number} x 
     * @param {number} y 
     * @param {string} text 
     * @param {boolean} isCrit 
     */
    spawnFloatingText(x, y, text, isCrit = false) {
        this.init();
        const el = document.createElement('div');
        el.className = 'floating-score' + (isCrit ? ' crit' : '');
        el.innerText = text;

        // Slight offset randomness
        const offsetX = (Math.random() - 0.5) * 36;
        const startX = x + offsetX;
        const startY = y - 10;

        el.style.left = `${startX}px`;
        el.style.top = `${startY}px`;

        this.container.appendChild(el);

        // Remove element after animation completes
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 850);
    }

    /**
     * Spawn sparkles / coin burst
     */
    spawnBurst(x, y, count = 10, emoji = '✨') {
        this.init();
        for (let i = 0; i < count; i++) {
            const spark = document.createElement('div');
            spark.className = 'sparkle-particle';
            spark.innerText = emoji;

            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const distance = 40 + Math.random() * 60;
            const targetX = Math.cos(angle) * distance;
            const targetY = Math.sin(angle) * distance;

            spark.style.left = `${x}px`;
            spark.style.top = `${y}px`;
            spark.style.setProperty('--tx', `${targetX}px`);
            spark.style.setProperty('--ty', `${targetY}px`);

            this.container.appendChild(spark);

            setTimeout(() => {
                if (spark.parentNode) spark.parentNode.removeChild(spark);
            }, 650);
        }
    }

    /**
     * Confetti celebration for achievements or prestige
     */
    launchConfetti() {
        this.init();
        const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#eab308'];
        const total = 50;

        for (let i = 0; i < total; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti-piece';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            conf.style.left = `${Math.random() * 100}vw`;
            conf.style.top = `-20px`;
            conf.style.transform = `scale(${0.6 + Math.random() * 0.8}) rotate(${Math.random() * 360}deg)`;

            const duration = 1800 + Math.random() * 1400;
            const drift = (Math.random() - 0.5) * 200;
            conf.style.setProperty('--drift', `${drift}px`);
            conf.style.animationDuration = `${duration}ms`;

            this.container.appendChild(conf);

            setTimeout(() => {
                if (conf.parentNode) conf.parentNode.removeChild(conf);
            }, duration + 100);
        }
    }
}

window.particleSystem = new ParticleSystem();
