/**
 * Sphere Visualizer — VigIA
 * Static circle with reactive particles around it.
 * Particles react to AI speech (TTS audio) via a global energy API.
 * Clicking the sphere opens the AI chat.
 */

(function () {
    "use strict";

    const canvas = document.getElementById("sphereCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // --- Config ---
    const NUM_PARTICLES = 140;
    const BASE_RADIUS = 120;
    const CIRCLE_RADIUS = 100;
    const IDLE_AMPLITUDE = 3;
    const REACTIVE_MULTIPLIER = 2.2;
    const PARTICLE_SIZE_MIN = 1.2;
    const PARTICLE_SIZE_MAX = 3.5;
    const GLOW_BLUR = 18;

    // Colors
    const COLOR_PRIMARY = { r: 59, g: 130, b: 246 };
    const COLOR_ACCENT = { r: 147, g: 197, b: 253 };
    const COLOR_WHITE = { r: 255, g: 255, b: 255 };

    // --- State ---
    let animId = null;
    let time = 0;
    let dpr = window.devicePixelRatio || 1;
    let ttsEnergy = 0;          // 0..1, set externally
    let ttsEnergySmooth = 0;    // smoothed version
    let ttsActive = false;

    // --- Global API for TTS reactivity ---
    // settings_chatbot.js will call these
    window.sphereSetTTSActive = function (active) {
        ttsActive = active;
        if (!active) ttsEnergy = 0;
    };

    window.sphereSetTTSEnergy = function (energy) {
        ttsEnergy = Math.min(1, Math.max(0, energy));
    };

    // Simulate speech energy from TTS utterance events
    // Called periodically while TTS is speaking
    let ttsSimInterval = null;
    window.sphereStartTTSPulse = function () {
        ttsActive = true;
        if (ttsSimInterval) clearInterval(ttsSimInterval);
        ttsSimInterval = setInterval(function () {
            // Create organic-feeling energy pulses
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
        const size = Math.min(container.clientWidth, container.clientHeight, 420);
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + "px";
        canvas.style.height = size + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener("resize", resize);
    resize();

    // --- Helpers ---
    function lerp(a, b, t) { return a + (b - a) * t; }

    function lerpColor(c1, c2, t) {
        return {
            r: Math.round(lerp(c1.r, c2.r, t)),
            g: Math.round(lerp(c1.g, c2.g, t)),
            b: Math.round(lerp(c1.b, c2.b, t)),
        };
    }

    // --- Draw ---
    function draw() {
        time += 0.006;

        // Smooth TTS energy
        const targetEnergy = ttsActive ? ttsEnergy : 0;
        ttsEnergySmooth += (targetEnergy - ttsEnergySmooth) * 0.12;

        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        const cx = w / 2;
        const cy = h / 2;
        const e = ttsEnergySmooth;

        ctx.clearRect(0, 0, w, h);

        // --- Outer glow (reactive) ---
        const glowRadius = CIRCLE_RADIUS + 50 + e * 80;
        const glowGrad = ctx.createRadialGradient(cx, cy, CIRCLE_RADIUS * 0.5, cx, cy, glowRadius);
        const glowAlpha = 0.05 + e * 0.18;
        glowGrad.addColorStop(0, `rgba(${COLOR_PRIMARY.r}, ${COLOR_PRIMARY.g}, ${COLOR_PRIMARY.b}, ${glowAlpha})`);
        glowGrad.addColorStop(0.5, `rgba(${COLOR_ACCENT.r}, ${COLOR_ACCENT.g}, ${COLOR_ACCENT.b}, ${glowAlpha * 0.3})`);
        glowGrad.addColorStop(1, `rgba(${COLOR_PRIMARY.r}, ${COLOR_PRIMARY.g}, ${COLOR_PRIMARY.b}, 0)`);
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        // --- Static inner circle (glass fill) ---
        const innerGrad = ctx.createRadialGradient(cx - CIRCLE_RADIUS * 0.3, cy - CIRCLE_RADIUS * 0.3, 0, cx, cy, CIRCLE_RADIUS);
        innerGrad.addColorStop(0, `rgba(${COLOR_ACCENT.r}, ${COLOR_ACCENT.g}, ${COLOR_ACCENT.b}, 0.08)`);
        innerGrad.addColorStop(0.7, `rgba(${COLOR_PRIMARY.r}, ${COLOR_PRIMARY.g}, ${COLOR_PRIMARY.b}, 0.04)`);
        innerGrad.addColorStop(1, `rgba(${COLOR_PRIMARY.r}, ${COLOR_PRIMARY.g}, ${COLOR_PRIMARY.b}, 0.12)`);
        ctx.beginPath();
        ctx.arc(cx, cy, CIRCLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = innerGrad;
        ctx.fill();

        // --- Static circle border ---
        ctx.beginPath();
        ctx.arc(cx, cy, CIRCLE_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${COLOR_ACCENT.r}, ${COLOR_ACCENT.g}, ${COLOR_ACCENT.b}, ${0.2 + e * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // --- Second ring (subtle, slightly larger) ---
        ctx.beginPath();
        ctx.arc(cx, cy, CIRCLE_RADIUS + 8 + e * 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${COLOR_ACCENT.r}, ${COLOR_ACCENT.g}, ${COLOR_ACCENT.b}, ${0.06 + e * 0.1})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // --- Reactive particles around the circle ---
        ctx.save();
        ctx.shadowColor = `rgba(${COLOR_PRIMARY.r}, ${COLOR_PRIMARY.g}, ${COLOR_PRIMARY.b}, 0.6)`;
        ctx.shadowBlur = GLOW_BLUR * (0.3 + e * 0.7);

        for (let i = 0; i < NUM_PARTICLES; i++) {
            const angle = (i / NUM_PARTICLES) * Math.PI * 2;

            // Idle wobble (subtle, constant)
            const idleOffset =
                Math.sin(time * 1.5 + angle * 3) * IDLE_AMPLITUDE +
                Math.sin(time * 2.5 + angle * 5) * (IDLE_AMPLITUDE * 0.4);

            // Reactive offset (from TTS)
            const reactiveBase = e * BASE_RADIUS * 0.5 * REACTIVE_MULTIPLIER;
            // Add per-particle variation for organic feel
            const particlePhase = Math.sin(time * 3 + i * 0.7) * 0.3 + 0.7;
            const reactiveOffset = reactiveBase * particlePhase;

            const r = BASE_RADIUS + idleOffset + reactiveOffset;
            const px = cx + Math.cos(angle) * r;
            const py = cy + Math.sin(angle) * r;

            const size = lerp(PARTICLE_SIZE_MIN, PARTICLE_SIZE_MAX, e * particlePhase) +
                Math.sin(time * 3 + i) * 0.4;
            const color = lerpColor(COLOR_ACCENT, COLOR_WHITE, e * particlePhase);

            ctx.beginPath();
            ctx.arc(px, py, Math.max(size, 0.5), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.4 + e * 0.5})`;
            ctx.fill();
        }
        ctx.restore();

        // --- Connecting lines between nearby particles ---
        if (e > 0.05) {
            const connectDist = 25 + e * 35;
            ctx.strokeStyle = `rgba(${COLOR_ACCENT.r}, ${COLOR_ACCENT.g}, ${COLOR_ACCENT.b}, ${e * 0.12})`;
            ctx.lineWidth = 0.4;
            for (let i = 0; i < NUM_PARTICLES; i += 3) {
                const angle1 = (i / NUM_PARTICLES) * Math.PI * 2;
                const idle1 = Math.sin(time * 1.5 + angle1 * 3) * IDLE_AMPLITUDE;
                const react1 = e * BASE_RADIUS * 0.5 * REACTIVE_MULTIPLIER *
                    (Math.sin(time * 3 + i * 0.7) * 0.3 + 0.7);
                const r1 = BASE_RADIUS + idle1 + react1;
                const x1 = cx + Math.cos(angle1) * r1;
                const y1 = cy + Math.sin(angle1) * r1;

                for (let j = i + 3; j < Math.min(i + 15, NUM_PARTICLES); j += 3) {
                    const angle2 = (j / NUM_PARTICLES) * Math.PI * 2;
                    const idle2 = Math.sin(time * 1.5 + angle2 * 3) * IDLE_AMPLITUDE;
                    const react2 = e * BASE_RADIUS * 0.5 * REACTIVE_MULTIPLIER *
                        (Math.sin(time * 3 + j * 0.7) * 0.3 + 0.7);
                    const r2 = BASE_RADIUS + idle2 + react2;
                    const x2 = cx + Math.cos(angle2) * r2;
                    const y2 = cy + Math.sin(angle2) * r2;

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

        // --- Inner orbiting particles (ambient, always visible) ---
        const numInner = 30;
        for (let i = 0; i < numInner; i++) {
            const orbitAngle = (i / numInner) * Math.PI * 2 + time * 0.4;
            const orbitRadius = CIRCLE_RADIUS * (0.25 + (i % 4) * 0.15);
            const wobble = Math.sin(time * 2 + i * 1.5) * 5;
            const ix = cx + Math.cos(orbitAngle) * (orbitRadius + wobble);
            const iy = cy + Math.sin(orbitAngle) * (orbitRadius + wobble);
            const iSize = 0.8 + Math.sin(time * 1.5 + i) * 0.5;
            const alpha = 0.1 + e * 0.25 + Math.sin(time + i) * 0.05;
            ctx.beginPath();
            ctx.arc(ix, iy, Math.max(iSize, 0.3), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${COLOR_ACCENT.r}, ${COLOR_ACCENT.g}, ${COLOR_ACCENT.b}, ${Math.max(alpha, 0)})`;
            ctx.fill();
        }

        // --- Pulsing core ---
        const coreRadius = 3 + Math.sin(time * 1.5) * 1.5 + e * 6;
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.5 + e * 0.5})`);
        coreGrad.addColorStop(1, `rgba(${COLOR_PRIMARY.r}, ${COLOR_PRIMARY.g}, ${COLOR_PRIMARY.b}, 0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // --- VigIA label inside circle ---
        ctx.save();
        ctx.font = `600 ${14 + e * 2}px 'Comfortaa', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + e * 0.3})`;
        ctx.fillText("VigIA", cx, cy);
        ctx.restore();

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
