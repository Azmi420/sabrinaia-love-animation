document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('heart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const fireworks = [];
    const particles = [];
    const textContainer = document.getElementById('text-container');

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    class Firework {
        constructor(x, y, targetX, targetY) {
            this.x = x;
            this.y = y;
            this.targetX = targetX;
            this.targetY = targetY;
            this.distanceToTarget = Math.sqrt((targetX - x) ** 2 + (targetY - y) ** 2);
            this.distanceTraveled = 0;
            this.coordinates = [];
            this.coordinateCount = 3;
            while (this.coordinateCount--) {
                this.coordinates.push([this.x, this.y]);
            }
            this.angle = Math.atan2(targetY - y, targetX - x);
            this.speed = 2;
            this.acceleration = 1.05;
            this.brightness = random(50, 70);
            this.targetRadius = 1;
        }

        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);

            if (this.targetRadius < 8) {
                this.targetRadius += 0.3;
            } else {
                this.targetRadius = 1;
            }

            this.speed *= this.acceleration;

            const vx = Math.cos(this.angle) * this.speed;
            const vy = Math.sin(this.angle) * this.speed;
            this.distanceTraveled = Math.sqrt((this.x + vx - this.x) ** 2 + (this.y + vy - this.y) ** 2);

            if (this.distanceTraveled >= this.distanceToTarget) {
                createParticles(this.targetX, this.targetY);
                fireworks.splice(index, 1);
            } else {
                this.x += vx;
                this.y += vy;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsl(${random(0, 360)}, 100%, ${this.brightness}%)`;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(this.targetX, this.targetY, this.targetRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.coordinates = [];
            this.coordinateCount = 5;
            while (this.coordinateCount--) {
                this.coordinates.push([this.x, this.y]);
            }
            this.angle = random(0, Math.PI * 2);
            this.speed = random(1, 10);
            this.friction = 0.95;
            this.gravity = 1;
            this.hue = random(0, 360);
            this.brightness = random(50, 80);
            this.alpha = 1;
            this.decay = random(0.015, 0.03);
        }

        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);

            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;

            if (this.alpha <= this.decay) {
                particles.splice(index, 1);
            }
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
            ctx.stroke();
        }
    }

    function createParticles(x, y) {
        let particleCount = 30;
        while (particleCount--) {
            particles.push(new Particle(x, y));
        }
    }

    function loop() {
        requestAnimationFrame(loop);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'lighter';

        let i = fireworks.length;
        while (i--) {
            fireworks[i].draw();
            fireworks[i].update(i);
        }

        let j = particles.length;
        while (j--) {
            particles[j].draw();
            particles[j].update(j);
        }

        if (fireworks.length === 0 && particles.length === 0) {
            textContainer.style.display = 'block';
            createRotatingText();
        }
    }

    function launchFirework() {
        fireworks.push(new Firework(width / 2, height, random(0, width), random(0, height / 2)));
    }

    function createRotatingText() {
        const heartPath = [];
        const steps = 200; // Increase steps for smoother animation
        for (let i = 0; i < steps; i++) {
            const t = (i / steps) * 2 * Math.PI;
            const x = 16 * Math.sin(t) ** 3;
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            heartPath.push({ x, y });
        }
        for (let i = 0; i < 8; i++) { // Reduce number of text elements for better performance
            const textElement = document.createElement('div');
            textElement.className = 'text';
            textElement.textContent = 'Sabrina';
            textContainer.appendChild(textElement);
        }
        const textElements = document.querySelectorAll('.text');
        let step = 0;
        const animate = () => {
            textElements.forEach((textElement, index) => {
                const { x, y } = heartPath[(step + index * 25) % steps];
                textElement.style.transform = `translate(${x * 10}px, ${-y * 10}px)`;
            });
            step = (step + 1) % steps;
            requestAnimationFrame(animate);
        };
        animate();
    }

    setInterval(launchFirework, 500);
    loop();
});