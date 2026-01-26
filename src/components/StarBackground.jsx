import React, { useMemo } from 'react';

const StarBackground = () => {
    // Generate stars only once
    const stars = useMemo(() => {
        const temp = [];
        const count = 80; // Increased count
        for (let i = 0; i < count; i++) {
            temp.push({
                id: i,
                top: Math.random() * 100,
                left: Math.random() * 100,
                size: Math.random() > 0.8 ? 4 : 2, // Bigger stars (4px)
                delay: Math.random() * 5,
                duration: Math.random() * 3 + 1, // Faster twinkle
                opacity: Math.random() * 0.6 + 0.4 // Brighter (0.4 to 1.0)
            });
        }
        return temp;
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#0f0f1a', // Deep space
            zIndex: 0
        }}>
            {stars.map(star => (
                <div
                    key={star.id}
                    className="star-twinkle"
                    style={{
                        position: 'absolute',
                        top: `${star.top}%`,
                        left: `${star.left}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        backgroundColor: '#ffffff',
                        opacity: star.opacity,
                        boxShadow: `0 0 ${star.size + 2}px rgba(255,255,255,0.8)`, // Stronger glow
                        animationDuration: `${star.duration}s`,
                        animationDelay: `${star.delay}s`
                    }}
                />
            ))}

            {/* Subtle Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.3) 100%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default StarBackground;
