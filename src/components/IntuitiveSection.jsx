import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';

import useSoundEffects from '../hooks/useSoundEffects';
import EffectsLayer from './EffectsLayer';
import StarBackground from './StarBackground';
import FocusTimer from './FocusTimer';
import { t } from '../utils/i18n';
import { useTodo } from '../contexts/TodoContext';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/IntuitiveSection.css';

// Helper to get random number in range
const randomRange = (min, max) => Math.random() * (max - min) + min;

const SUBSTEPS = 8;
const FRICTION = 1.0;

export default function IntuitiveSection() {
    const { todos, setTodos, addXp } = useTodo();
    const { settings, activeTheme, isFocusMode, focusedId, setFocusedId, musicVolume, setMusicVolume } = useSettings();

    const { playCharge, playPop, playCancel } = useSoundEffects();
    // ambientAudio logic moved to SettingsContext
    const containerRef = useRef(null);
    const requestRef = useRef();
    const effectsRef = useRef(null);

    const [trailMode] = useState('neon'); // Removed unused setTrailMode if not used, or keep if intended for future
    const comboRef = useRef({ count: 0, lastTime: 0 });
    const physicsState = useRef([]);
    const bubbleRefs = useRef({});

    const bubbleStyle = settings?.bubbleStyle || 'pixel';

    // Physics Update Loop
    const animate = () => {
        if (!containerRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        for (let step = 0; step < SUBSTEPS; step++) {
            physicsState.current.forEach((obj) => {
                if (obj.isHovering || obj.isHolding) return;
                obj.x += obj.vx / SUBSTEPS;
                obj.y += obj.vy / SUBSTEPS;

                if (obj.x - obj.radius < 0) { obj.x = obj.radius; obj.vx = Math.abs(obj.vx) * FRICTION; }
                else if (obj.x + obj.radius > width) { obj.x = width - obj.radius; obj.vx = -Math.abs(obj.vx) * FRICTION; }
                if (obj.y - obj.radius < 0) { obj.y = obj.radius; obj.vy = Math.abs(obj.vy) * FRICTION; }
                else if (obj.y + obj.radius > height) { obj.y = height - obj.radius; obj.vy = -Math.abs(obj.vy) * FRICTION; }
            });

            for (let i = 0; i < physicsState.current.length; i++) {
                for (let j = i + 1; j < physicsState.current.length; j++) {
                    const obj = physicsState.current[i];
                    const other = physicsState.current[j];
                    const dx = other.x - obj.x;
                    const dy = other.y - obj.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = obj.radius + other.radius;

                    if (dist < minDist) {
                        const angle = Math.atan2(dy, dx);
                        const overlap = minDist - dist;
                        const moveX = overlap * Math.cos(angle);
                        const moveY = overlap * Math.sin(angle);

                        const frozenI = obj.isHovering || obj.isHolding;
                        const frozenJ = other.isHovering || other.isHolding;

                        if (!frozenI && !frozenJ) {
                            obj.x -= moveX * 0.5; obj.y -= moveY * 0.5;
                            other.x += moveX * 0.5; other.y += moveY * 0.5;

                            const nx = dx / dist; const ny = dy / dist;
                            const tx = -ny; const ty = nx;
                            const dpTan1 = obj.vx * tx + obj.vy * ty;
                            const dpTan2 = other.vx * tx + other.vy * ty;
                            const dpNorm1 = obj.vx * nx + obj.vy * ny;
                            const dpNorm2 = other.vx * nx + other.vy * ny;
                            const m1 = 1, m2 = 1;
                            const mom1 = (dpNorm1 * (m1 - m2) + 2 * m2 * dpNorm2) / (m1 + m2);
                            const mom2 = (dpNorm2 * (m2 - m1) + 2 * m1 * dpNorm1) / (m1 + m2);
                            obj.vx = tx * dpTan1 + nx * mom1; obj.vy = ty * dpTan1 + ny * mom1;
                            other.vx = tx * dpTan2 + nx * mom2; other.vy = ty * dpTan2 + ny * mom2;

                        } else if (frozenI && !frozenJ) {
                            other.x += moveX; other.y += moveY;
                            const nx = dx / dist; const ny = dy / dist;
                            const dot = other.vx * nx + other.vy * ny;
                            other.vx = other.vx - 2 * dot * nx;
                            other.vy = other.vy - 2 * dot * ny;
                        } else if (!frozenI && frozenJ) {
                            obj.x -= moveX; obj.y -= moveY;
                            const nx = dx / dist; const ny = dy / dist;
                            const dot = obj.vx * nx + obj.vy * ny;
                            obj.vx = obj.vx - 2 * dot * nx;
                            obj.vy = obj.vy - 2 * dot * ny;
                        }
                    }
                }
            }
        }

        physicsState.current.forEach(obj => {
            const el = bubbleRefs.current[obj.id];
            if (el) el.style.transform = `translate(${obj.x - obj.radius}px, ${obj.y - obj.radius}px)`;
        });
        requestRef.current = requestAnimationFrame(animate);
    };

    useLayoutEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    useEffect(() => {
        if (effectsRef.current) {
            effectsRef.current.setMode(trailMode);
            effectsRef.current.mode = trailMode;
        }
    }, [trailMode]);

    useEffect(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const getUrgencySize = (d) => {
            const h = (new Date(d) - new Date()) / 36e5;
            if (h < 0) return 80;
            if (h < 1) return 170;
            if (h / 24 <= 1) return 150;
            return Math.max(100, 150 - (h / 24 * 10));
        };

        physicsState.current.forEach(p => {
            if (!todos.find(t => t.id === p.id)) {
                if (effectsRef.current) {
                    const themeColors = {
                        'retrowave': '#39ff14',
                        'cyberpunk': '#fcee0a',
                        'zen': '#00ff41'
                    };
                    const themeColor = themeColors[activeTheme] || '#39ff14';

                    let color = themeColor;
                    const isPlanet = settings?.bubbleStyle === 'planet';

                    if (p.todo) {
                        const h = (new Date(p.todo.deadline) - new Date()) / 36e5;
                        if (isPlanet) {
                            if (h <= 24) color = '#ff5e62';
                            else if (h <= 72) color = '#eacda3';
                            else {
                                const safeColors = ['#00c6ff', '#a1c4fd', '#8e9eab'];
                                color = safeColors[p.todo.id % safeColors.length];
                            }
                            effectsRef.current.spawnBlackHole(p.x, p.y, color);
                        } else {
                            if (h <= 24) color = '#ff073a';
                            else if (h <= 72) color = '#ffdd40';
                            effectsRef.current.spawnExplosion(p.x, p.y, color);
                        }
                    } else {
                        effectsRef.current.spawnExplosion(p.x, p.y, color);
                    }
                }
                if (addXp) addXp(100);
            }
        });

        const newPhysics = todos.map(todo => {
            const existing = physicsState.current.find(p => p.id === todo.id);
            const size = getUrgencySize(todo.deadline);
            if (existing) return { ...existing, radius: size / 2, todo };
            return {
                id: todo.id, todo, radius: size / 2,
                x: randomRange(size / 2, rect.width - size / 2),
                y: randomRange(size / 2, rect.height - size / 2),
                vx: randomRange(-0.5, 0.5), vy: randomRange(-0.5, 0.5),
                isHovering: false, isHolding: false, isPopping: false
            };
        });
        physicsState.current = newPhysics;
    }, [todos]);

    const handleBubbleClick = (id) => {
        setFocusedId(id === focusedId ? null : id);
    };

    const handleTaskComplete = (todo) => {
        const now = Date.now();
        if (now - comboRef.current.lastTime < 2000) comboRef.current.count = Math.min(comboRef.current.count + 1, 10);
        else comboRef.current.count = 1;
        comboRef.current.lastTime = now;

        playPop(1.0);
        setTodos(todos.filter(t => t.id !== todo.id));
        if (focusedId === todo.id) setFocusedId(null);
    };

    return (
        <div ref={containerRef} className="intuitive-container" style={{ cursor: isFocusMode ? 'default' : 'crosshair' }}>
            <StarBackground />

            {/* Music Controls - Quick Access */}
            <div className="music-controls">
                <div className="music-label" style={{
                    color: musicVolume > 0 ? 'var(--primary-neon)' : '#ccc',
                    textShadow: musicVolume > 0 ? '0 0 5px var(--primary-neon)' : '1px 1px 2px black'
                }}>
                    [{t('MUSIC', settings?.language)} {musicVolume > 0 ? `${musicVolume}%` : t('OFF', settings?.language)}]
                </div>
                <input type="range" min="0" max="100" step="10"
                    value={musicVolume} // Use global state
                    onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMusicVolume(val); // This now auto-initializes audio
                    }}
                    className="volume-slider"
                    style={{
                        background: `linear-gradient(to right, var(--primary-neon) ${musicVolume}%, #333 ${musicVolume}%)`
                    }}
                />
            </div>

            {!isFocusMode && (
                <div className="focus-status-off">
                    {t('FOCUS_STATUS_OFF', settings?.language)}
                </div>
            )}

            {isFocusMode && (
                <div className="focus-active-container" style={{
                    top: focusedId ? '60px' : '50px',
                    right: focusedId ? '20px' : '25px',
                }}>
                    <div className="focus-active-text">
                        {t('FOCUS_STATUS_ACTIVE', settings?.language)}
                    </div>
                    {/* Focus Timer */}
                    {focusedId && (
                        <div className="focus-timer-wrapper">
                            <FocusTimer lang={settings?.language || 'en'} />
                        </div>
                    )}
                </div>
            )}

            {isFocusMode && focusedId && (
                <>
                    <div className="focus-overlay-backdrop" />
                    <button
                        onClick={() => { playCancel(); setFocusedId(null); }}
                        className="return-btn"
                        onMouseEnter={(e) => {
                            e.target.style.background = 'var(--primary-neon)';
                            e.target.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(0, 0, 0, 0.8)';
                            e.target.style.color = 'var(--primary-neon)';
                        }}
                    >
                        {t('RETURN', settings?.language)}
                    </button>
                </>
            )}

            {todos.map(todo => (
                <Bubble key={todo.id} todo={todo}
                    bubbleStyle={bubbleStyle}
                    activeTheme={activeTheme}
                    getUrgencySize={(d) => {
                        const h = (new Date(d) - new Date()) / 36e5;
                        if (h < 0) return 80; if (h < 1) return 170; if (h / 24 <= 1) return 150;
                        return Math.max(100, 150 - (h / 24 * 10));
                    }}
                    onComplete={() => handleTaskComplete(todo)}
                    playCharge={playCharge} playCancel={playCancel}
                    innerRef={el => bubbleRefs.current[todo.id] = el}
                    onHoverStateChange={h => { const p = physicsState.current.find(x => x.id === todo.id); if (p) p.isHovering = h; }}
                    onHoldStateChange={h => { const p = physicsState.current.find(x => x.id === todo.id); if (p) p.isHolding = h; }}
                    isFocusMode={isFocusMode}
                    isFocused={isFocusMode && focusedId === todo.id}
                    hasFocusedItem={isFocusMode && !!focusedId}
                    isHighlighted={!isFocusMode && focusedId === todo.id}
                    onFocusSelect={() => handleBubbleClick(todo.id)}
                />
            ))}

            <EffectsLayer ref={effectsRef} />

            {todos.length === 0 && (
                <div className="empty-state">
                    {t('ALL_CLEAR', settings?.language)}<br /><span style={{ fontSize: '0.6em' }}>{t('RELAX_MODE', settings?.language)}</span>
                </div>
            )}
        </div>
    );
}

function Bubble({ todo, bubbleStyle, activeTheme, getUrgencySize, onComplete, playCharge, playCancel, innerRef, onHoverStateChange, onHoldStateChange, isFocusMode, isFocused, hasFocusedItem, onFocusSelect, isHighlighted }) {
    const [isHolding, setIsHolding] = useState(false);
    const [isPopping, setIsPopping] = useState(false);
    const timerRef = useRef(null);
    const audioRef = useRef(null);

    const radius = getUrgencySize(todo.deadline) / 2;
    const diameter = radius * 2;
    const label = (() => {
        const h = (new Date(todo.deadline) - new Date()) / 36e5;
        if (h < 1 && h > 0) return "< 1h";
        return `${Math.ceil(h / 24)}d left`;
    })();

    const planetType = (() => {
        const h = (new Date(todo.deadline) - new Date()) / 36e5;
        if (h <= 24) return 'planet-lava';
        if (h <= 72) return 'planet-gas';
        const safeTypes = ['planet-terran', 'planet-ice', 'planet-void'];
        return safeTypes[todo.id % safeTypes.length];
    })();
    const hasRing = todo.id % 3 === 0;

    const startHold = (e) => {
        if (isPopping) return;
        if (e.type === 'mousedown' && e.button !== 0) return;
        if (isFocusMode && !isFocused) { onFocusSelect(); return; }
        setIsHolding(true); onHoldStateChange(true);
        audioRef.current = playCharge();
        timerRef.current = setTimeout(() => {
            if (audioRef.current) { audioRef.current.osc.stop(); audioRef.current = null; }
            setIsHolding(false); onHoldStateChange(false); setIsPopping(true);
            setTimeout(onComplete, 300);
        }, 700);
    };

    const endHold = () => {
        if (isPopping || isFocusMode) return;
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        if (audioRef.current) {
            try {
                const now = audioRef.current.ctx.currentTime;
                audioRef.current.gain.gain.linearRampToValueAtTime(0, now + 0.1);
                audioRef.current.osc.stop(now + 0.1);
            } catch (e) { }
            audioRef.current = null;
            if (isHolding) playCancel();
        }
        setIsHolding(false); onHoldStateChange(false);
    };

    const urgencyClass = (() => {
        const h = (new Date(todo.deadline) - new Date()) / 36e5;
        if (h <= 24) return 'urgency-critical shake';
        if (h / 24 <= 3) return 'urgency-warning';
        return '';
    })();

    const isPlanet = bubbleStyle === 'planet';
    let animationClass = urgencyClass;
    if (isPopping) {
        animationClass = isPlanet ? 'imploding' : 'popping';
    } else if (isHolding) {
        animationClass = 'shake';
    } else if (isHighlighted || isFocused) {
        animationClass = urgencyClass.replace('shake', '').trim();
    }
    const mainClass = isPlanet
        ? `planet-base ${planetType} ${animationClass} ${hasRing ? 'planet-ring' : ''}`
        : `pixel-border ${animationClass}`;

    // Dynamic Theme Colors
    const holdColors = {
        'retrowave': { border: '#ff073a', bg: 'rgba(255, 7, 58, 0.3)' },
        'cyberpunk': { border: '#fcee0a', bg: 'rgba(252, 238, 10, 0.3)' },
        'zen': { border: '#00ff41', bg: 'rgba(0, 255, 65, 0.3)' }
    };
    const currentTheme = holdColors[activeTheme] || holdColors['retrowave'];
    const isCyberSafe = activeTheme === 'cyberpunk';
    const borderColor = isHolding ? currentTheme.border : (isCyberSafe ? 'var(--secondary-neon)' : 'var(--primary-neon)');
    const bgColor = isHolding ? currentTheme.bg : (isCyberSafe ? 'rgba(5, 217, 232, 0.15)' : 'rgba(57, 255, 20, 0.1)');

    let focusStyle = {};
    if (isFocused) {
        focusStyle = {
            boxShadow: `0 0 50px ${borderColor}, inset 0 0 20px ${borderColor}`,
            transform: 'scale(1.5)',
            zIndex: 100
        };
    } else if (isHighlighted) {
        if (isPlanet) {
            focusStyle = {
                boxShadow: 'none',
                zIndex: 60,
                transform: 'scale(1.2)'
            };
        } else {
            focusStyle = {
                boxShadow: `0 0 30px ${borderColor}, inset 0 0 10px ${borderColor}`,
                zIndex: 60,
                filter: 'brightness(1.5)',
                transform: 'scale(1.2)'
            };
        }
    } else if (hasFocusedItem) {
        focusStyle = { opacity: 0.1, filter: 'grayscale(100%)', transform: 'scale(0.8)' };
    }

    const commonStyle = {
        // Dynamic styles remain inline or mixed
        ...focusStyle
    };

    const pixelStyle = {
        border: `4px solid ${borderColor}`,
        backgroundColor: bgColor,
        boxShadow: `0 0 15px ${borderColor}`,
        ...commonStyle
    };

    const planetStyle = {
        ...commonStyle,
        border: 'none',
        boxShadow: isFocused ? `0 0 60px ${borderColor}` : `0 0 20px rgba(255,255,255,0.2)`,
        // Layout fixes to ensure circular shape
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 0,
        overflow: 'hidden'
    };

    return (
        <div ref={innerRef} className="bubble-container" style={{ width: `${diameter}px`, height: `${diameter}px`, zIndex: isFocused ? 100 : (isHighlighted ? 90 : (isHolding ? 50 : 1)) }}>
            <div className={mainClass}
                onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={() => { onHoverStateChange(false); endHold(); }} onMouseEnter={() => onHoverStateChange(true)} onTouchStart={startHold} onTouchEnd={endHold}
                onClick={(e) => { e.stopPropagation(); if (!isPopping) onFocusSelect(); }}
                style={isPlanet ? planetStyle : { ...pixelStyle, width: '100%', height: '100%', borderRadius: '50%', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', transition: 'all 0.5s ease', userSelect: 'none', cursor: isFocusMode ? 'crosshair' : 'pointer', minWidth: 0, overflow: 'hidden' }}
            /* Note: Keeping some inline styles for Pixel Style because they merge dynamic vars 'borderColor' and 'bgColor' */
            >
                <div className="bubble-title" style={{ textShadow: isPlanet ? '0 0 3px #000, 0 0 6px #000, 0 0 8px #000' : '2px 2px black', maxWidth: '90%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{todo.title}</div>
                <div className="bubble-label">{label}</div>
            </div>
            {isPlanet && isHighlighted && (
                <div className="orbit-system">
                    <div className="ufo-orbit orbit-1"><div className="ufo" /></div>
                    <div className="ufo-orbit orbit-2"><div className="ufo" /></div>
                    <div className="ufo-orbit orbit-3"><div className="ufo" /></div>
                </div>
            )}
        </div>
    );
}
