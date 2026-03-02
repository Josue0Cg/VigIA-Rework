/**
 * Hawk Avatar Visualizer — VigIA
 * Renders the VigIA hawk logo as a floating, breathing 3D-style avatar.
 * Particles orbit in emerald/teal palette.
 * Reacts to TTS audio via a global energy API.
 */

(function () {
    "use strict";

    const canvas = document.getElementById("sphereCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // --- Config ---
    const NUM_PARTICLES = 120;
    const ORBIT_RADIUS = 155;
    const IDLE_AMPLITUDE = 3;
    const REACTIVE_MULTIPLIER = 2.0;
    const PARTICLE_SIZE_MIN = 1.2;
    const PARTICLE_SIZE_MAX = 3.8;
    const GLOW_BLUR = 20;

    // Emerald / Teal / Navy palette
    const COLOR_PRIMARY = { r: 16, g: 85, b: 81 }; // deep teal
    const COLOR_ACCENT = { r: 38, g: 166, b: 154 }; // emerald green
    const COLOR_SECONDARY = { r: 10, g: 36, b: 99 }; // deep navy
    const COLOR_LIGHT = { r: 144, g: 224, b: 210 }; // light mint
    const COLOR_WHITE = { r: 255, g: 255, b: 255 };

    // Hawk image sizing (fraction of canvas)
    const HAWK_SCALE = 0.72;

    // --- State ---
    let animId = null;
    let time = 0;
    let dpr = window.devicePixelRatio || 1;
    let ttsEnergy = 0;
    let ttsEnergySmooth = 0;
    let ttsActive = false;

    // Mouse interaction
    let mouseX = 0.5, mouseY = 0.5; // normalized 0..1
    let isHovering = false;

    // Blink state
    let blinkTimer = 0;
    let nextBlink = 3 + Math.random() * 5;
    let blinkProgress = 0; // 0 = open, 1 = closed
    let isBlinking = false;

    // Hawk image
    let hawkImg = null;
    let hawkLoaded = false;

    // --- Load hawk image ---
    const hawkSrc = canvas.getAttribute("data-hawk-src");
    if (hawkSrc) {
        hawkImg = new Image();
        hawkImg.crossOrigin = "anonymous";
        hawkImg.onload = function () {
            hawkLoaded = true;
        };
        hawkImg.src = hawkSrc;
    }

    // --- Global API for TTS reactivity ---
    window.sphereSetTTSActive = function (active) {
        ttsActive = active;
        if (!active) ttsEnergy = 0;
    };

    window.sphereSetTTSEnergy = function (energy) {
        ttsEnergy = Math.min(1, Math.max(0, energy));
    };

    let ttsSimInterval = null;
    window.sphereStartTTSPulse = function () {
        ttsActive = true;
        if (ttsSimInterval) clearInterval(ttsSimInterval);
        ttsSimInterval = setInterval(function () {
            ttsEnergy = 0.3 + Math.random() * 0.5 + Math.sin(Date.now() / 200) * 0.2;
        }, 80);
    };

    window.sphereStopTTSPulse = function () {
        ttsActive = false;
        ttsEnergy = 0;
        if (ttsSimInterval) {
            clearInterval(ttsSimInterval);
            ttsSimInterval = null;
        }
    };

    // --- Resize ---
    function resize() {
        dpr = window.devicePixelRatio || 1;
        const container = canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight, 460);
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + "px";
        canvas.style.height = size + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener("resize", resize);
    resize();

    // --- Mouse tracking ---
    const container = canvas.parentElement;
    container.addEventListener("mousemove", function (e) {
        const rect = container.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = (e.clientY - rect.top) / rect.height;
        isHovering = true;
    });
    container.addEventListener("mouseleave", function () {
        isHovering = false;
    });

    // --- Helpers ---
    function lerp(a, b, t) { return a + (b - a) * t; }
    function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }

    function lerpColor(c1, c2, t) {
        return {
            r: Math.round(lerp(c1.r, c2.r, t)),
            g: Math.round(lerp(c1.g, c2.g, t)),
            b: Math.round(lerp(c1.b, c2.b, t)),
        };
    }

    function rgba(c, a) {
        return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
    }

    // --- Draw ---
    function draw() {
        time += 0.005;

        // Smooth TTS energy
        const targetEnergy = ttsActive ? ttsEnergy : 0;
        ttsEnergySmooth += (targetEnergy - ttsEnergySmooth) * 0.1;

        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        const cx = w / 2;
        const cy = h / 2;
        const e = ttsEnergySmooth;

        ctx.clearRect(0, 0, w, h);

        // --- Blink timer ---
        blinkTimer += 0.016; // ~60fps
        if (!isBlinking && blinkTimer > nextBlink) {
            isBlinking = true;
            blinkProgress = 0;
            blinkTimer = 0;
            nextBlink = 3 + Math.random() * 6;
        }
        if (isBlinking) {
            blinkProgress += 0.12;
            if (blinkProgress >= 1) {
                isBlinking = false;
                blinkProgress = 0;
            }
        }

        // --- Idle breathing ---
        const breathe = Math.sin(time * 1.2) * 0.018 + 1.0;

        // --- Floating / bobbing ---
        const bobY = Math.sin(time * 0.8) * 4 + Math.sin(time * 1.6) * 1.5;
        const bobX = Math.sin(time * 0.6 + 1.2) * 2;

        // --- TTS reactive scale & rotation ---
        const ttsScale = 1.0 + e * 0.06;
        const ttsRotation = Math.sin(time * 4) * e * 0.035; // ±2° at peak

        // --- Mouse tilt ---
        let tiltX = 0, tiltY = 0;
        if (isHovering) {
            tiltX = (mouseX - 0.5) * 8;
            tiltY = (mouseY - 0.5) * 5;
        }

        // --- Outer glow (emerald/teal) ---
        const glowRadius = 140 + e * 80;
        const glowGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, glowRadius);
        const glowAlpha = 0.04 + e * 0.15;
        glowGrad.addColorStop(0, rgba(COLOR_ACCENT, glowAlpha));
        glowGrad.addColorStop(0.5, rgba(COLOR_PRIMARY, glowAlpha * 0.3));
        glowGrad.addColorStop(1, rgba(COLOR_SECONDARY, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        // --- Draw hawk image with animations ---
        if (hawkLoaded && hawkImg) {
            const imgAspect = hawkImg.width / hawkImg.height;
            const drawH = w * HAWK_SCALE;
            const drawW = drawH * imgAspect;

            const totalScale = breathe * ttsScale;
            const drawX = cx + bobX + tiltX;
            const drawY = cy + bobY + tiltY;

            ctx.save();
            ctx.translate(drawX, drawY);
            ctx.rotate(ttsRotation);
            ctx.scale(totalScale, totalScale);

            // --- Paper-cut 3D parallax layers (when TTS active) ---
            if (e > 0.02) {
                // Back shadow layer
                const shadowOff = 3 + e * 8;
                ctx.save();
                ctx.globalAlpha = 0.12 + e * 0.08;
                ctx.filter = "blur(4px) brightness(0.3)";
                ctx.drawImage(hawkImg, -drawW / 2 + shadowOff, -drawH / 2 + shadowOff, drawW, drawH);
                ctx.restore();

                // Depth layer 1 (offset back)
                ctx.save();
                ctx.globalAlpha = 0.15 * e;
                ctx.translate(e * -4, e * 3);
                ctx.filter = "blur(1px) brightness(0.7) saturate(1.3)";
                ctx.drawImage(hawkImg, -drawW / 2, -drawH / 2, drawW, drawH);
                ctx.restore();

                // Depth layer 2 (offset opposite)
                ctx.save();
                ctx.globalAlpha = 0.1 * e;
                ctx.translate(e * 3, e * -2);
                ctx.filter = "blur(2px) brightness(0.5)";
                ctx.drawImage(hawkImg, -drawW / 2, -drawH / 2, drawW, drawH);
                ctx.restore();
            }

            // --- Main hawk image ---
            ctx.globalAlpha = 1;
            ctx.filter = "none";
            ctx.drawImage(hawkImg, -drawW / 2, -drawH / 2, drawW, drawH);

            // --- Highlight shimmer on TTS ---
            if (e > 0.1) {
                ctx.save();
                ctx.globalCompositeOperation = "overlay";
                ctx.globalAlpha = e * 0.15;
                const shimmerGrad = ctx.createLinearGradient(-drawW / 2, -drawH / 2, drawW / 2, drawH / 2);
                const shimmerPos = (Math.sin(time * 3) + 1) / 2;
                shimmerGrad.addColorStop(Math.max(0, shimmerPos - 0.2), "transparent");
                shimmerGrad.addColorStop(shimmerPos, rgba(COLOR_LIGHT, 0.6));
                shimmerGrad.addColorStop(Math.min(1, shimmerPos + 0.2), "transparent");
                ctx.fillStyle = shimmerGrad;
                ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
                ctx.restore();
            }

            // --- Blink overlay (darkening on eye area) ---
            if (isBlinking) {
                const blinkEase = Math.sin(blinkProgress * Math.PI);
                ctx.save();
                ctx.globalAlpha = blinkEase * 0.35;
                ctx.fillStyle = rgba(COLOR_PRIMARY, 1);
                // Eye region: approximate upper portion of hawk head
                ctx.beginPath();
                ctx.ellipse(drawW * 0.03, -drawH * 0.16, drawW * 0.13, drawH * 0.07, -0.15, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            ctx.restore();
        } else {
            // Fallback: simple loading circle while image loads
            ctx.beginPath();
            ctx.arc(cx, cy, 60, 0, Math.PI * 2);
            ctx.strokeStyle = rgba(COLOR_ACCENT, 0.15);
            ctx.lineWidth = 2;
            ctx.stroke();
            // Loading spinner arc
            const arcStart = time * 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 60, arcStart, arcStart + 1.5);
            ctx.strokeStyle = rgba(COLOR_ACCENT, 0.5);
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // --- Orbiting particles (emerald/teal palette) ---
        ctx.save();
        ctx.shadowColor = rgba(COLOR_ACCENT, 0.5);
        ctx.shadowBlur = GLOW_BLUR * (0.3 + e * 0.7);

        for (let i = 0; i < NUM_PARTICLES; i++) {
            const angle = (i / NUM_PARTICLES) * Math.PI * 2;

            // Idle wobble
            const idleOffset =
                Math.sin(time * 1.5 + angle * 3) * IDLE_AMPLITUDE +
                Math.sin(time * 2.5 + angle * 5) * (IDLE_AMPLITUDE * 0.4);

            // Reactive offset
            const particlePhase = Math.sin(time * 3 + i * 0.7) * 0.3 + 0.7;
            const reactiveOffset = e * ORBIT_RADIUS * 0.4 * REACTIVE_MULTIPLIER * particlePhase;

            const r = ORBIT_RADIUS + idleOffset + reactiveOffset;
            const px = cx + Math.cos(angle + time * 0.15) * r + bobX * 0.3;
            const py = cy + Math.sin(angle + time * 0.15) * r + bobY * 0.3;

            const size = lerp(PARTICLE_SIZE_MIN, PARTICLE_SIZE_MAX, e * particlePhase) +
                Math.sin(time * 3 + i) * 0.4;
            const color = lerpColor(COLOR_ACCENT, COLOR_LIGHT, e * particlePhase);

            ctx.beginPath();
            ctx.arc(px, py, Math.max(size, 0.5), 0, Math.PI * 2);
            ctx.fillStyle = rgba(color, 0.35 + e * 0.5);
            ctx.fill();
        }
        ctx.restore();

        // --- Connecting lines between nearby particles ---
        if (e > 0.05) {
            const connectDist = 25 + e * 35;
            ctx.strokeStyle = rgba(COLOR_ACCENT, e * 0.1);
            ctx.lineWidth = 0.4;
            for (let i = 0; i < NUM_PARTICLES; i += 3) {
                const a1 = (i / NUM_PARTICLES) * Math.PI * 2 + time * 0.15;
                const idle1 = Math.sin(time * 1.5 + a1 * 3) * IDLE_AMPLITUDE;
                const react1 = e * ORBIT_RADIUS * 0.4 * REACTIVE_MULTIPLIER *
                    (Math.sin(time * 3 + i * 0.7) * 0.3 + 0.7);
                const r1 = ORBIT_RADIUS + idle1 + react1;
                const x1 = cx + Math.cos(a1) * r1;
                const y1 = cy + Math.sin(a1) * r1;

                for (let j = i + 3; j < Math.min(i + 15, NUM_PARTICLES); j += 3) {
                    const a2 = (j / NUM_PARTICLES) * Math.PI * 2 + time * 0.15;
                    const idle2 = Math.sin(time * 1.5 + a2 * 3) * IDLE_AMPLITUDE;
                    const react2 = e * ORBIT_RADIUS * 0.4 * REACTIVE_MULTIPLIER *
                        (Math.sin(time * 3 + j * 0.7) * 0.3 + 0.7);
                    const r2 = ORBIT_RADIUS + idle2 + react2;
                    const x2 = cx + Math.cos(a2) * r2;
                    const y2 = cy + Math.sin(a2) * r2;

                    const dist = Math.hypot(x2 - x1, y2 - y1);
                    if (dist < connectDist) {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    }
                }
            }
        }

        // --- Inner ambient dots (around hawk body) ---
        const numInner = 25;
        for (let i = 0; i < numInner; i++) {
            const orbitAngle = (i / numInner) * Math.PI * 2 + time * 0.35;
            const orbitR = 55 + (i % 5) * 18;
            const wobble = Math.sin(time * 2 + i * 1.5) * 6;
            const ix = cx + Math.cos(orbitAngle) * (orbitR + wobble) + bobX * 0.5;
            const iy = cy + Math.sin(orbitAngle) * (orbitR + wobble) + bobY * 0.5;
            const iSize = 0.6 + Math.sin(time * 1.5 + i) * 0.5;
            const alpha = 0.08 + e * 0.2 + Math.sin(time + i) * 0.04;
            ctx.beginPath();
            ctx.arc(ix, iy, Math.max(iSize, 0.3), 0, Math.PI * 2);
            ctx.fillStyle = rgba(COLOR_LIGHT, Math.max(alpha, 0));
            ctx.fill();
        }

        // --- Soft ring around hawk (subtle, glass-like) ---
        const ringAlpha = 0.06 + e * 0.12;
        ctx.beginPath();
        ctx.arc(cx + bobX * 0.2, cy + bobY * 0.2, ORBIT_RADIUS - 15, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(COLOR_ACCENT, ringAlpha);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Second ring
        ctx.beginPath();
        ctx.arc(cx + bobX * 0.1, cy + bobY * 0.1, ORBIT_RADIUS + 5 + e * 8, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(COLOR_ACCENT, ringAlpha * 0.4);
        ctx.lineWidth = 0.6;
        ctx.stroke();

        animId = requestAnimationFrame(draw);
    }

    // Start animation
    draw();

    // Cleanup
    window.addEventListener("beforeunload", function () {
        cancelAnimationFrame(animId);
        if (ttsSimInterval) clearInterval(ttsSimInterval);
    });
})();
