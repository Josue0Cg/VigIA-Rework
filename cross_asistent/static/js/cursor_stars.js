/**
 * VigIA — Interactive Star Field
 * Static star particles scattered across the page that react
 * to cursor proximity — similar to Antigravity's landing page.
 * Stars drift gently and get pushed away when the mouse approaches.
 */
(function () {
    'use strict';

    const canvas = document.createElement('canvas');
    canvas.id = 'cursorTrailCanvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w, h;
    let mouse = { x: -9999, y: -9999 };
    let particles = [];

    const PARTICLE_COUNT = 120;
    const MOUSE_RADIUS = 160;       // how far the mouse influence reaches
    const PUSH_FORCE = 16;          // how strongly particles get pushed
    const RETURN_SPEED = 0.06;      // how fast particles return to origin
    const DRIFT_SPEED = 0.35;       // gentle idle drift speed

    // Star colors matching dark theme
    const COLORS = [
        { r: 147, g: 197, b: 253 },  // light blue
        { r: 59, g: 130, b: 246 },    // blue
        { r: 255, g: 255, b: 255 },   // white
        { r: 96, g: 165, b: 250 },    // medium blue
        { r: 199, g: 210, b: 254 },   // lavender
    ];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        if (particles.length === 0) initParticles();
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const col = COLORS[Math.floor(Math.random() * COLORS.length)];
            const baseX = Math.random() * w;
            const baseY = Math.random() * h;
            particles.push({
                // base (home) position
                baseX: baseX,
                baseY: baseY,
                // current position
                x: baseX,
                y: baseY,
                // velocity
                vx: 0,
                vy: 0,
                // appearance
                size: Math.random() * 2.5 + 0.8,
                color: col,
                alpha: Math.random() * 0.5 + 0.3,
                // idle drift
                driftAngle: Math.random() * Math.PI * 2,
                driftSpeed: Math.random() * DRIFT_SPEED + 0.05,
                driftRadius: Math.random() * 15 + 5,
                // twinkle
                twinkleSpeed: Math.random() * 0.02 + 0.008,
                twinkleOffset: Math.random() * Math.PI * 2,
            });
        }
    }

    resize();
    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        // Redistribute particles on resize
        particles.forEach(p => {
            p.baseX = Math.random() * w;
            p.baseY = Math.random() * h;
        });
    });

    // Track mouse
    document.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', function () {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    let time = 0;

    function animate() {
        ctx.clearRect(0, 0, w, h);
        time += 0.016; // ~60fps

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Idle drift target (gentle floating)
            p.driftAngle += p.driftSpeed * 0.02;
            const driftX = p.baseX + Math.cos(p.driftAngle) * p.driftRadius;
            const driftY = p.baseY + Math.sin(p.driftAngle * 0.7) * p.driftRadius;

            // Mouse repulsion
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS && dist > 0) {
                const force = (1 - dist / MOUSE_RADIUS) * PUSH_FORCE;
                const angle = Math.atan2(dy, dx);
                p.vx += Math.cos(angle) * force;
                p.vy += Math.sin(angle) * force;
            }

            // Spring back to drift position
            p.vx += (driftX - p.x) * RETURN_SPEED;
            p.vy += (driftY - p.y) * RETURN_SPEED;

            // Damping
            p.vx *= 0.82;
            p.vy *= 0.82;

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Twinkle effect
            const twinkle = 0.5 + 0.5 * Math.sin(time * p.twinkleSpeed * 60 + p.twinkleOffset);
            const alpha = p.alpha * (0.6 + 0.4 * twinkle);

            // Draw particle
            const { r, g, b } = p.color;

            // Glow
            ctx.save();
            ctx.globalAlpha = alpha * 0.4;
            ctx.shadowBlur = 12;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Core
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Bright center
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(animate);
    }

    animate();
})();
