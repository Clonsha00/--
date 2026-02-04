import React, { createContext, useContext, useState, useEffect } from 'react';
import useAmbientMusic from '../hooks/useAmbientMusic';

// 1. 建立 Context 物件
const SettingsContext = createContext();

// 2. 建立 Provider 元件 (經理)
export function SettingsProvider({ children, xpLevel = 1 }) { // 接收 xpLevel 是為了處理主題解鎖邏輯
    // --- 此處為從 App.jsx 搬移過來的邏輯 ---

    // 設定與持久化
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('pixel-settings');
        return saved ? JSON.parse(saved) : { headerText: '> TASKS_LOG', headerSize: 1.5, theme: 'zen', bubbleStyle: 'pixel', language: 'zh-TW' };
    });

    const [showSettings, setShowSettings] = useState(false);

    // 隨機主題邏輯 (Session Random)
    const [sessionRandomTheme] = useState(() => {
        // 注意：這裡只讀取一次作 Session 隨機，簡單起見我們依賴傳入的 xpLevel 或是重讀 Storage
        // 為了避免複雜依賴，這裡稍微簡化：如果重整頁面，會重新計算隨機池
        const pool = ['zen'];
        if (xpLevel >= 10) pool.push('retrowave', 'cyberpunk');
        return pool[Math.floor(Math.random() * pool.length)];
    });

    // 決定當前主題 (包含等級鎖定檢查)
    const activeTheme = (() => {
        let t = settings.theme || 'zen';
        if (t === 'random') t = sessionRandomTheme;

        // 安全檢查：若等級不足且非開發者模式，降級回 Zen
        if ((t === 'retrowave' || t === 'cyberpunk') && xpLevel < 10 && !isDevMode) {
            return 'zen';
        }
        return t;
    })();

    // 監聽並應用副作用
    useEffect(() => {
        localStorage.setItem('pixel-settings', JSON.stringify(settings));

        // 應用主題樣式到 Body
        document.body.className = '';
        if (activeTheme !== 'zen') {
            document.body.classList.add(`theme-${activeTheme}`);
        }

        // 限制 Header 大小
        if (settings.headerSize > 2.0) {
            setSettings(prev => ({ ...prev, headerSize: 2.0 }));
        }
    }, [settings, activeTheme]);

    // Focus Mode 狀態
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [focusedId, setFocusedId] = useState(null);

    // 全局鍵盤監聽事件
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = e.target.tagName.toUpperCase();
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;

            if (e.key.toLowerCase() === 'f') {
                setIsFocusMode(prev => {
                    const next = !prev;
                    if (!next) setFocusedId(null);
                    return next;
                });
            }
            if (e.key === 'Escape') {
                if (focusedId) {
                    setFocusedId(null);
                } else if (isFocusMode) {
                    setIsFocusMode(false);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFocusMode, focusedId]);


    // --- Ambient Music Management ---
    const ambientAudio = useAmbientMusic();
    const [musicVolume, setMusicVolume] = useState(() => {
        const saved = localStorage.getItem('pixel-music-volume');
        return saved ? parseInt(saved, 10) : 0; // Default off (0) or 50? Let's default 0 for courtesy
    });

    // Custom Audio State
    const [customFileName, setCustomFileName] = useState(null);

    // Developer Mode
    const [isDevMode, setIsDevMode] = useState(false);

    const handleMusicUpload = async (file) => {
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('audio/')) {
            alert('Please select a valid audio file (MP3, WAV, OGG).');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            // We need the audio context to decode. 
            // ambientAudio.ctxRef might be null if not initialized.
            // Force init if needed.
            let ctx = ambientAudio.initAudio();
            // Wait: initAudio returns void in current hook, but sets ctxRef.current
            if (!ambientAudio.ctxRef.current) {
                // This shouldn't happen if initAudio works, but let's be safe
                // We can use the global getter from useSoundEffects if needed
                // But let's assume initAudio populated ctxRef.
            }
            ctx = ambientAudio.ctxRef.current;

            const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
            ambientAudio.setCustomBuffer(decodedBuffer);
            setCustomFileName(file.name);

            // If volume is > 0, ensure we are playing
            if (musicVolume > 0 && !ambientAudio.isPlaying.current) {
                ambientAudio.toggle();
            }
        } catch (error) {
            console.error('Error decoding audio:', error);
            alert('Failed to process audio file.');
        }
    };

    const handleResetMusic = () => {
        ambientAudio.setCustomBuffer(null);
        setCustomFileName(null);
    };

    // 3. 打包要提供給員工的值
    const value = {
        settings,
        setSettings,
        showSettings,
        setShowSettings,
        activeTheme,
        isFocusMode,
        setIsFocusMode,
        focusedId,
        setFocusedId,
        // Music Exports
        ambientAudio,
        musicVolume,
        setMusicVolume,
        customFileName,
        handleMusicUpload,
        handleResetMusic,
        isDevMode,
        setIsDevMode
    };
    useEffect(() => {
        const baseVol = musicVolume / 100; // Convert 0-100 to 0.0-1.0
        const targetVol = focusedId ? baseVol * 0.2 : baseVol; // Duck to 20% when focused
        ambientAudio.setVolume(targetVol);

        // Persist
        localStorage.setItem('pixel-music-volume', musicVolume);

        // Auto-start if validation passed (User interaction needed usually, but if volume > 0 we try)
        if (musicVolume > 0 && !ambientAudio.isPlaying.current) {
            // Initialize audio engine
            ambientAudio.initAudio();

            // Try to resume if just initialized or suspended
            // We need to access the raw context or trigger the resume logic.
            // Since useAmbientMusic doesn't expose strict 'play', we use toggle if we know it's off.
            // But toggle checks ref.current. Let's rely on toggle() which handles Init -> Resume.

            // However, toggle() toggles. If isPlayingRef is false, it Resumes.
            // So calling toggle() here is correct because we checked !isPlaying.current
            ambientAudio.toggle();
        }
    }, [musicVolume, focusedId, ambientAudio]);




    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

// 4. 自定義 Hook (方便員工呼叫)
export function useSettings() {
    return useContext(SettingsContext);
}
