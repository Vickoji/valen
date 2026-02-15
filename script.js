/* ================================================================== */
/* Valentine's Day Website — JavaScript                               */
/* ================================================================== */

// ================================================================== //
// CUSTOMIZE: Set your relationship start date here!                   //
// Format: new Date(year, month - 1, day, hour, minute)               //
// Example: January 15, 2023 → new Date(2023, 0, 15, 0, 0)           //
// ================================================================== //
const RELATIONSHIP_START = new Date(2025, 5, 26, 23, 59, 0); // June 26, 2025 at 11:59 PM

// ================================================================== //
// 1. FLOATING HEARTS PARTICLE SYSTEM                                  //
// ================================================================== //
class HeartParticle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = this.canvas.height + 20;
        this.size = Math.random() * 14 + 6;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.wobbleAmplitude = Math.random() * 30 + 10;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.life = 0;
    }

    update() {
        this.life++;
        this.y -= this.speedY;
        this.x += Math.sin(this.life * this.wobbleSpeed + this.wobbleOffset) * 0.5;
        this.rotation += this.rotationSpeed;

        if (this.y < -30) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = `hsl(${340 + Math.random() * 20}, 80%, 70%)`;
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♥', 0, 0);
        ctx.restore();
    }
}

class HeartCanvas {
    constructor() {
        this.canvas = document.getElementById('heartsCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 20;
        this.resize();
        this.init();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        for (let i = 0; i < this.particleCount; i++) {
            const p = new HeartParticle(this.canvas);
            p.y = Math.random() * this.canvas.height;
            this.particles.push(p);
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            p.update();
            p.draw(this.ctx);
        });
        requestAnimationFrame(() => this.animate());
    }
}

// ================================================================== //
// 2. SCROLL REVEAL (Intersection Observer)                            //
// ================================================================== //
class ScrollReveal {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        // Stagger the reveal of cards
                        const delay = entry.target.classList.contains('reveal-card')
                            ? index * 120
                            : 0;
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, delay);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        document.querySelectorAll('.reveal, .reveal-card').forEach(el => {
            this.observer.observe(el);
        });
    }
}

// ================================================================== //
// 3. LIVE TIME COUNTER                                                //
// ================================================================== //
class TimeCounter {
    constructor(startDate) {
        this.startDate = startDate;
        this.elements = {
            years: document.getElementById('count-years'),
            months: document.getElementById('count-months'),
            days: document.getElementById('count-days'),
            hours: document.getElementById('count-hours'),
            minutes: document.getElementById('count-minutes'),
            seconds: document.getElementById('count-seconds'),
        };
        this.hasAnimated = false;
        this.setupObserver();
    }

    setupObserver() {
        const counterSection = document.getElementById('counter');
        if (!counterSection) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.hasAnimated = true;
                        this.startCounting();
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(counterSection);
    }

    startCounting() {
        // Animate from 0 to real values
        const realValues = this.calculateTime();
        this.animateNumbers(realValues, 2000);

        // Then start live update
        setTimeout(() => {
            this.updateLoop();
        }, 2200);
    }

    animateNumbers(targetValues, duration) {
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart

            Object.keys(targetValues).forEach(key => {
                if (this.elements[key]) {
                    const value = Math.floor(targetValues[key] * eased);
                    this.elements[key].textContent = value;
                }
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    calculateTime() {
        const now = new Date();
        const diff = now - this.startDate;

        // Ensure we don't show negatives if date is in the future
        if (diff < 0) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

        // Calculate years and months more accurately
        let years = now.getFullYear() - this.startDate.getFullYear();
        let months = now.getMonth() - this.startDate.getMonth();
        let days = now.getDate() - this.startDate.getDate();

        // Adjust for negative days
        if (days < 0) {
            months--;
            // Get the last day of the previous month
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
        }

        // Adjust for negative months
        if (months < 0) {
            years--;
            months += 12;
        }

        // Calculate time components from the remaining hours/minutes/seconds
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
            this.startDate.getHours(), this.startDate.getMinutes(), this.startDate.getSeconds());
        let timeDiff = now - startOfToday;

        // If we haven't reached the time of day yet, subtract a day and add 24h
        if (timeDiff < 0) {
            days--;
            if (days < 0) {
                months--;
                if (months < 0) { years--; months += 12; }
                const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                days += prevMonth.getDate();
            }
            timeDiff += 24 * 60 * 60 * 1000;
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        return { years, months, days, hours, minutes, seconds };
    }

    updateLoop() {
        const values = this.calculateTime();
        Object.keys(values).forEach(key => {
            if (this.elements[key]) {
                this.elements[key].textContent = values[key];
            }
        });
        setTimeout(() => this.updateLoop(), 1000);
    }
}

// ================================================================== //
// 4. NAVIGATION DOTS                                                  //
// ================================================================== //
class NavDots {
    constructor() {
        this.dots = document.querySelectorAll('.nav-dot');
        this.sections = document.querySelectorAll('.section');
        this.setupClickHandlers();
        this.setupScrollObserver();
    }

    setupClickHandlers() {
        this.dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const sectionIndex = parseInt(dot.dataset.section);
                this.sections[sectionIndex]?.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    setupScrollObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const index = Array.from(this.sections).indexOf(entry.target);
                        this.setActiveDot(index);
                    }
                });
            },
            { threshold: 0.5 }
        );

        this.sections.forEach(section => observer.observe(section));
    }

    setActiveDot(index) {
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
}

// ================================================================== //
// 5. FLOATING MINI HEARTS (Message Section)                           //
// ================================================================== //
class MiniHearts {
    constructor() {
        const container = document.querySelector('.message-bg-hearts');
        if (!container) return;

        const hearts = ['💕', '💗', '💖', '💝', '❤️', '🩷', '💘', '✨'];
        const count = 25;

        for (let i = 0; i < count; i++) {
            const heart = document.createElement('span');
            heart.classList.add('mini-heart');
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.fontSize = (Math.random() * 1.5 + 0.6) + 'rem';
            heart.style.animationDuration = (Math.random() * 6 + 4) + 's';
            heart.style.animationDelay = (Math.random() * 8) + 's';
            container.appendChild(heart);
        }
    }
}

// ================================================================== //
// 6. LOVE BUTTON BURST EFFECT                                         //
// ================================================================== //
class LoveButton {
    constructor() {
        const btn = document.getElementById('loveBtn');
        if (!btn) return;

        btn.addEventListener('click', (e) => {
            this.createBurst(e.clientX, e.clientY);
            this.showLoveMessage();
        });
    }

    createBurst(x, y) {
        const emojis = ['❤️', '💕', '💖', '💗', '💘', '✨', '🌹', '💝'];
        const count = 20;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                font-size: ${Math.random() * 24 + 12}px;
                pointer-events: none;
                z-index: 10000;
                transition: all ${Math.random() * 1.5 + 0.8}s cubic-bezier(0.16, 1, 0.3, 1);
            `;
            document.body.appendChild(particle);

            requestAnimationFrame(() => {
                const angle = (Math.PI * 2 * i) / count;
                const distance = Math.random() * 200 + 80;
                particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`;
                particle.style.opacity = '0';
            });

            setTimeout(() => particle.remove(), 2500);
        }
    }

    showLoveMessage() {
        const btn = document.getElementById('loveBtn');
        const originalText = btn.querySelector('.btn-text').textContent;
        const messages = [
            'I Love You More! 💕',
            'You Are My World 🌍❤️',
            'Forever & Always 💘',
            'My Heart Is Yours 💝',
            'You Complete Me ✨',
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        btn.querySelector('.btn-text').textContent = randomMsg;

        setTimeout(() => {
            btn.querySelector('.btn-text').textContent = originalText;
        }, 2000);
    }
}

// ================================================================== //
// 7. GALLERY DRAG SCROLL                                              //
// ================================================================== //
class GalleryScroll {
    constructor() {
        const container = document.querySelector('.gallery-scroll-container');
        if (!container) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });

        // Set initial cursor
        container.style.cursor = 'grab';
    }
}

// ================================================================== //
// 8. SMOOTH PARALLAX ON SCROLL                                        //
// ================================================================== //
class ParallaxEffect {
    constructor() {
        this.orbs = document.querySelectorAll('.orb');
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    onScroll() {
        const scrollY = window.scrollY;
        this.orbs.forEach((orb, i) => {
            const speed = 0.3 + i * 0.1;
            orb.style.transform = `translateY(${scrollY * speed}px)`;
        });
    }
}

// ================================================================== //
// 9. MUSIC PLAYER                                                     //
// ================================================================== //
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('bgMusic');
        this.btn = document.getElementById('musicBtn');
        this.container = document.getElementById('musicContainer');
        this.slider = document.getElementById('seekSlider');

        if (!this.audio || !this.btn) return;

        this.isPlaying = false;
        this.isDragging = false;

        this.init();
    }

    init() {
        // Toggle Play/Pause
        this.btn.addEventListener('click', () => this.toggle());

        if (this.slider) {
            this.slider.value = 0;
            this.slider.min = 0;
            this.slider.step = 0.1;

            // Update duration when available (browsers may report it only after play/canplay)
            const setDuration = () => {
                if (Number.isFinite(this.audio.duration)) {
                    this.slider.max = this.audio.duration;
                }
            };

            this.audio.addEventListener('loadedmetadata', setDuration);
            this.audio.addEventListener('durationchange', setDuration);
            this.audio.addEventListener('canplay', setDuration);
            if (this.audio.readyState >= 1) setDuration();

            // Update slider current position as audio plays; also try to set duration on first timeupdate
            this.audio.addEventListener('timeupdate', () => {
                setDuration();
                if (!this.isDragging && Number.isFinite(this.audio.currentTime)) {
                    this.slider.value = this.audio.currentTime;
                }
            });

            // Start dragging: Pause UI updates
            this.slider.addEventListener('mousedown', () => { this.isDragging = true; });
            this.slider.addEventListener('touchstart', () => { this.isDragging = true; });

            // During dragging: seek audio in real time so slider feels responsive
            this.slider.addEventListener('input', (e) => {
                this.isDragging = true;
                const targetTime = parseFloat(e.target.value);
                if (Number.isFinite(targetTime) && this.audio.readyState >= 1) {
                    this.audio.currentTime = targetTime;
                }
            });

            // Finish dragging: ensure seek applied and clear flag (fallback for devices that don't fire input)
            const endDrag = () => {
                if (this.isDragging) {
                    const targetTime = parseFloat(this.slider.value);
                    if (Number.isFinite(targetTime) && this.audio.readyState >= 1) {
                        this.audio.currentTime = targetTime;
                    }
                    this.isDragging = false;
                }
            };

            this.slider.addEventListener('change', endDrag);
            window.addEventListener('mouseup', () => { if (this.isDragging) this.isDragging = false; });
            window.addEventListener('touchend', () => { if (this.isDragging) this.isDragging = false; });
        }

        // Handle audio end
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updateUI();
        });
    }

    toggle() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().catch(err => console.log("Autoplay blocked or error:", err));
        }
        this.isPlaying = !this.isPlaying;
        this.updateUI();
    }

    updateUI() {
        if (this.isPlaying) {
            this.btn.classList.add('playing');
            this.container?.classList.add('active');
            this.btn.querySelector('.music-label').textContent = 'Now Playing';
            this.btn.querySelector('.music-icon').textContent = '🎶';
        } else {
            this.btn.classList.remove('playing');
            this.container?.classList.remove('active');
            this.btn.querySelector('.music-label').textContent = 'Play Song';
            this.btn.querySelector('.music-icon').textContent = '🎵';
        }
    }
}

// ================================================================== //
// INITIALIZE EVERYTHING                                               //
// ================================================================== //
document.addEventListener('DOMContentLoaded', () => {
    new HeartCanvas();
    new ScrollReveal();
    new TimeCounter(RELATIONSHIP_START);
    new NavDots();
    new MiniHearts();
    new LoveButton();
    new GalleryScroll();
    new ParallaxEffect();
    new MusicPlayer();

    // Trigger hero animation immediately
    setTimeout(() => {
        document.querySelector('.hero-content')?.classList.add('visible');
    }, 300);
});
