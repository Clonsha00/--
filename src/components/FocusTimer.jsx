import React, { useState, useEffect, useRef } from 'react';
import { t } from '../utils/i18n';
import useSoundEffects from '../hooks/useSoundEffects';

export default function FocusTimer({ lang = 'en', onComplete }) {
    const [elapsed, setElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);
    const { playClick, playFanfare } = useSoundEffects();

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsed(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        playClick();
        setIsRunning(prev => !prev);
    };

    const resetTimer = () => {
        playClick();
        setIsRunning(false);
        setElapsed(0);
    };

    return (
        <div style={{
            fontFamily: 'var(--font-pixel)',
            color: 'var(--primary-neon)',
            textShadow: '0 0 10px var(--primary-neon)',
            textAlign: 'center',
            marginTop: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '15px',
            border: '4px solid var(--primary-neon)',
            display: 'inline-block'
        }}>
            <div style={{ fontSize: '3rem', letterSpacing: '4px', marginBottom: '10px' }}>
                {formatTime(elapsed)}
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                    onClick={toggleTimer}
                    style={{
                        background: isRunning ? 'var(--danger)' : 'var(--primary-neon)',
                        color: isRunning ? 'white' : 'black',
                        border: 'none',
                        padding: '10px 20px',
                        fontSize: '1.2rem',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        boxShadow: isRunning ? '0 0 10px var(--danger)' : '0 0 10px var(--primary-neon)'
                    }}
                >
                    {isRunning ? (lang === 'zh-TW' ? '暫停' : 'PAUSE') : (lang === 'zh-TW' ? '開始' : 'START')}
                </button>
                <button
                    onClick={resetTimer}
                    style={{
                        background: 'none',
                        border: '2px solid #555',
                        color: '#aaa',
                        padding: '10px 20px',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                    }}
                >
                    {lang === 'zh-TW' ? '重置' : 'RESET'}
                </button>
            </div>
        </div>
    );
}
