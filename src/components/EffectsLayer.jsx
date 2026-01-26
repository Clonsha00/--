import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

const EffectsLayer = forwardRef((props, ref) => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const trail = useRef([]);
    const mousePos = useRef({ x: 0, y: 0 });
    const mode = useRef('neon'); // 'neon', 'rainbow', 'pixel', 'ghost', 'fire', 'matrix'

    useImperativeHandle(ref, () => ({
        spawnExplosion: (x, y, color) => {
            // 1. Floating XP Text
            particles.current.push({
                x: x - 20, // Center roughly
                y: y,
                vx: 0,
                vy: -2, // Float UP
                color: '#FFD700', // Gold
                life: 2.0, // Longer life
                size: 20,
                text: '+100 XP',
                type: 'floating_text'
            });

            // 2. Golden Sparkles
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 2;
                particles.current.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: Math.random() > 0.5 ? '#FFD700' : (Math.random() > 0.5 ? '#FFFFFF' : '#FFA500'),
                    life: 1.0,
                    size: Math.random() * 3 + 2,
                    type: 'sparkle'
                });
            }
        },
        spawnBlackHole: (x, y, debrisColor) => {
            // 1. Singleton Black Hole Core
            particles.current.push({
                x, y,
                vx: 0, vy: 0,
                color: '#ff4500', // M87 Orange
                life: 1.0, // Disappears at 1 second
                size: 20,
                type: 'black_hole'
            });

            // 2. In-sucking Debris
            const debrisCount = 80; // Increased for more dramatic effect
            for (let i = 0; i < debrisCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 50 + 60; // Start further out
                particles.current.push({
                    x: x + Math.cos(angle) * dist,
                    y: y + Math.sin(angle) * dist,
                    targetX: x, // Aim at center
                    targetY: y,
                    vx: 0, vy: 0,
                    color: debrisColor || '#ffffff',
                    life: 2.0 + Math.random() * 0.5,
                    size: Math.random() * 4 + 2,
                    type: 'debris_in'
                });
            }

            // 3. XP Text (Still spawn it but maybe sucks in? nah keep it distinct)
            particles.current.push({
                x: x - 20, y: y - 50, // Higher up
                vx: 0, vy: -1,
                color: '#FFD700',
                life: 2.0,
                size: 20,
                text: '+100 XP',
                type: 'floating_text'
            });
        },
        setMode: (newMode) => {
            mode.current = newMode;
        }
    }));

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Store GLOBAL coordinates to prevent drift when canvas moves
            mousePos.current = {
                x: e.clientX,
                y: e.clientY
            };
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        let animationFrameId;
        let tick = 0;

        const resize = () => {
            if (canvasRef.current && canvasRef.current.parentElement) {
                canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
                canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
                // No need to clear trail anymore since we use global coords!
            }
        };

        // Use ResizeObserver to handle container size changes (e.g. CSS transitions)
        const resizeObserver = new ResizeObserver(() => resize());
        if (canvasRef.current && canvasRef.current.parentElement) {
            resizeObserver.observe(canvasRef.current.parentElement);
        }

        // Also keep window resize as a fallback
        window.addEventListener('resize', resize);
        resize();

        const render = () => {
            tick++;
            // Get current canvas position to convert Global -> Local
            // This ensures trails stay pinned to the screen even if the canvas slides around
            const rect = canvasRef.current.getBoundingClientRect();

            // Local Mouse Position for this frame
            const localMouseX = mousePos.current.x - rect.left;
            const localMouseY = mousePos.current.y - rect.top;

            // Clear canvas
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // 1. Update & Draw Mouse Trail
            if (mode.current === 'pixel') {
                // Pixel Dust Mode
                if (Math.random() < 0.5 && (Math.abs(mousePos.current.x) > 1)) { // Check if initialized
                    particles.current.push({
                        x: localMouseX,
                        y: localMouseY,
                        vx: (Math.random() - 0.5) * 1,
                        vy: Math.random() * 2 + 1, // Fall down
                        color: `hsl(${tick * 5}, 100%, 50%)`,
                        life: 1.0,
                        size: Math.random() * 3 + 1
                    });
                }
            } else if (mode.current === 'fire') {
                // Fire Mode
                if (Math.random() < 0.8 && (Math.abs(mousePos.current.x) > 1)) {
                    particles.current.push({
                        x: localMouseX + (Math.random() - 0.5) * 10,
                        y: localMouseY,
                        vx: (Math.random() - 0.5) * 0.5,
                        vy: -Math.random() * 2 - 1, // Float UP
                        color: Math.random() > 0.5 ? '#ff4d00' : '#ffae00',
                        life: 1.0,
                        size: Math.random() * 6 + 2
                    });
                }
            } else if (mode.current === 'matrix') {
                // Matrix Mode
                if (Math.random() < 0.3 && (Math.abs(mousePos.current.x) > 1)) {
                    particles.current.push({
                        x: localMouseX,
                        y: localMouseY,
                        vx: 0,
                        vy: Math.random() * 2 + 2,
                        color: '#39ff14',
                        life: 1.2,
                        size: 14,
                        char: Math.random() > 0.5 ? '1' : '0',
                        type: 'text'
                    });
                }
            } else if (mode.current === 'ghost') {
                // Ghost Mode: Fading white circles
                trail.current.push({ ...mousePos.current, life: 1.0 });
                if (trail.current.length > 20) trail.current.shift();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                for (let i = 0; i < trail.current.length; i++) {
                    const point = trail.current[i];
                    // Convert stored Global point to Local
                    const lx = point.x - rect.left;
                    const ly = point.y - rect.top;

                    const size = (i / trail.current.length) * 15;
                    ctx.beginPath();
                    ctx.arc(lx, ly, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Line Modes (Neon, Rainbow)
                trail.current.push({ ...mousePos.current, life: 1.0 });
                if (trail.current.length > 20) trail.current.shift();

                if (trail.current.length > 1) {
                    ctx.beginPath();
                    // Convert Start Point Global -> Local
                    ctx.moveTo(trail.current[0].x - rect.left, trail.current[0].y - rect.top);

                    for (let i = 1; i < trail.current.length; i++) {
                        const point = trail.current[i];
                        // Convert Global -> Local
                        ctx.lineTo(point.x - rect.left, point.y - rect.top);
                    }

                    let strokeStyle;
                    if (mode.current === 'rainbow') {
                        // Gradient needs local coords too? Yes
                        const start = trail.current[0];
                        const end = trail.current[trail.current.length - 1];
                        const gradient = ctx.createLinearGradient(
                            start.x - rect.left, start.y - rect.top,
                            end.x - rect.left, end.y - rect.top
                        );
                        for (let i = 0; i <= 1; i += 0.1) {
                            gradient.addColorStop(i, `hsl(${(tick * 2 + i * 360) % 360}, 100%, 50%)`);
                        }
                        strokeStyle = gradient;
                    } else {
                        // Neon
                        const start = trail.current[0];
                        const end = trail.current[trail.current.length - 1];
                        const gradient = ctx.createLinearGradient(
                            start.x - rect.left, start.y - rect.top,
                            end.x - rect.left, end.y - rect.top
                        );
                        gradient.addColorStop(0, 'rgba(57, 255, 20, 0)');
                        gradient.addColorStop(1, 'rgba(57, 255, 20, 0.5)');
                        strokeStyle = gradient;
                    }

                    ctx.strokeStyle = strokeStyle;
                    ctx.lineWidth = 4;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.stroke();
                }
            }

            // 2. Update & Draw Particles
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];

                // Physics Update (Skip for special types)
                if (p.type !== 'black_hole' && p.type !== 'debris_in') {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.2; // Gravity
                }

                // Life decay
                if (p.type === 'black_hole') p.life -= 0.005; // Much slower decay for hole
                else p.life -= 0.02;

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                    continue;
                }

                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;

                if (p.type === 'black_hole') {
                    // Draw Black Hole (M87 Style)
                    const r = p.size;

                    // 1. Accretion Disk Glow
                    const gradient = ctx.createRadialGradient(p.x, p.y, r * 0.4, p.x, p.y, r * 3);
                    gradient.addColorStop(0, '#000000');     // Center Hole
                    gradient.addColorStop(0.3, '#000000');   // Event Horizon
                    gradient.addColorStop(0.35, '#ffcc00');  // Inner Bright Ring
                    gradient.addColorStop(0.5, '#ff4500');   // Outer Red Ring
                    gradient.addColorStop(1, 'transparent'); // Fade out

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r * 3.5, 0, Math.PI * 2);
                    ctx.fill();

                    // 2. Pure Black Core (Sharp)
                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r * 0.4, 0, Math.PI * 2);
                    ctx.fill();

                } else if (p.type === 'debris_in') {
                    // Calculate vector to center
                    const dx = p.targetX - p.x;
                    const dy = p.targetY - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 10) {
                        p.life = 0; // Swallowed
                    } else {
                        // Spiral motion toward center
                        const angle = Math.atan2(dy, dx);
                        const speed = 2 + (100 / (dist + 1));

                        // Add tangential component for spiral effect
                        const tangentAngle = angle + Math.PI / 2; // Perpendicular to radial
                        const spiralStrength = 0.4; // Controls how much spiral vs direct

                        // Combine radial (toward center) and tangential (spiral) motion
                        p.x += Math.cos(angle) * speed * 0.3 + Math.cos(tangentAngle) * speed * spiralStrength;
                        p.y += Math.sin(angle) * speed * 0.3 + Math.sin(tangentAngle) * speed * spiralStrength;

                        // Draw Debris
                        ctx.fillStyle = p.color;
                        ctx.beginPath();
                        // Irregular shard shape
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p.x + p.size, p.y + p.size / 2);
                        ctx.lineTo(p.x, p.y + p.size);
                        ctx.fill();
                    }
                } else if (p.type === 'floating_text') {
                    ctx.font = `bold ${p.size}px "Press Start 2P", monospace`;
                    ctx.shadowColor = 'black';
                    ctx.shadowBlur = 4;
                    ctx.fillText(p.text, p.x, p.y);
                    ctx.shadowBlur = 0;
                    p.vy *= 0.95; // Slow down ascent
                } else if (p.type === 'text') {
                    ctx.font = `${p.size}px monospace`;
                    ctx.fillText(p.char, p.x, p.y);
                } else {
                    // Sparkles with gravity
                    p.vy += 0.1;
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                }

                ctx.globalAlpha = 1.0;
            }

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // Allow clicks to pass through
                zIndex: 95 // Above bubbles and focus backdrop
            }}
        />
    );
});

export default EffectsLayer;
