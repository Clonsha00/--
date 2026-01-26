import React, { useEffect, useState } from 'react';

export default function XPBar({ xp, level, nextLevelXp }) {
    const [displayXp, setDisplayXp] = useState(xp);
    const [isLevelingUp, setIsLevelingUp] = useState(false);

    // Smooth lerp for visual bar
    useEffect(() => {
        let animationFrame;
        const animate = () => {
            setDisplayXp(prev => {
                const diff = xp - prev;
                if (Math.abs(diff) < 0.5) return xp;
                return prev + diff * 0.1;
            });
            animationFrame = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrame);
    }, [xp]);

    // Level Up Flash Effect
    useEffect(() => {
        setIsLevelingUp(true);
        const timer = setTimeout(() => setIsLevelingUp(false), 1000);
        return () => clearTimeout(timer);
    }, [level]);

    const progress = Math.min((displayXp / nextLevelXp) * 100, 100);

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '4px', // Ultra minimal
            backgroundColor: '#000',
            zIndex: 9999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'end'
        }}>
            {/* The Bar */}
            <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: isLevelingUp ? '#fff' : 'var(--primary-neon)',
                boxShadow: isLevelingUp ? '0 0 20px #fff' : '0 0 10px var(--primary-neon)',
                transition: 'background-color 0.2s, box-shadow 0.2s',
                position: 'relative'
            }}>
                {/* Sparkle at the leading edge */}
                <div style={{
                    position: 'absolute',
                    right: '-2px',
                    top: '-6px',
                    width: '4px',
                    height: '16px',
                    backgroundColor: '#fff',
                    opacity: progress > 0 ? 1 : 0,
                    boxShadow: '0 0 10px #fff'
                }} />
            </div>

            {/* Subtle Level Text */}
            <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.8rem',
                color: isLevelingUp ? '#fff' : 'rgba(255,255,255,0.3)',
                textShadow: '2px 2px #000',
                transition: 'color 0.5s'
            }}>
                LV.{level}
            </div>
        </div>
    );
}
