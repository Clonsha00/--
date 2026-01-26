import React, { useState, useEffect, useRef } from 'react';
import ListSection from './components/ListSection';
import IntuitiveSection from './components/IntuitiveSection';
import XPBar from './components/XPBar';
import SettingsModal from './components/SettingsModal';
import useSoundEffects from './hooks/useSoundEffects';

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('pixel-todos');
    return saved ? JSON.parse(saved) : [];
  });

  // Settings System
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pixel-settings');
    return saved ? JSON.parse(saved) : { headerText: '> TASKS_LOG', headerSize: 1.5, theme: 'zen', bubbleStyle: 'pixel', language: 'zh-TW' };
  });
  const [showSettings, setShowSettings] = useState(false);

  // XP System
  const [xpData, setXpData] = useState(() => {
    const saved = localStorage.getItem('pixel-xp');
    return saved ? JSON.parse(saved) : { xp: 0, level: 1, totalXp: 0 };
  });

  const { playSuccess } = useSoundEffects();

  useEffect(() => {
    localStorage.setItem('pixel-todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('pixel-xp', JSON.stringify(xpData));
  }, [xpData]);

  // Random Theme Logic (Calculated once per session mount, respects unlocks)
  const [sessionRandomTheme] = useState(() => {
    const savedXp = localStorage.getItem('pixel-xp');
    const level = savedXp ? JSON.parse(savedXp).level : 1;

    const pool = ['zen'];
    if (level >= 10) pool.push('retrowave', 'cyberpunk');

    return pool[Math.floor(Math.random() * pool.length)];
  });

  // Determine Active Theme (Enforce Level Locks)
  const activeTheme = (() => {
    let t = settings.theme || 'zen';
    if (t === 'random') t = sessionRandomTheme;

    // Safety Fallback: If current theme requires higher level, downgrade to Zen
    if ((t === 'retrowave' || t === 'cyberpunk') && xpData.level < 10) {
      return 'zen';
    }
    return t;
  })();

  useEffect(() => {
    localStorage.setItem('pixel-settings', JSON.stringify(settings));

    // Apply Theme & Enforce Limits
    document.body.className = ''; // Clear prev
    if (activeTheme !== 'zen') {
      document.body.classList.add(`theme-${activeTheme}`);
    }

    // Auto-fix header size if it exceeds new limit
    if (settings.headerSize > 2.0) {
      setSettings(prev => ({ ...prev, headerSize: 2.0 }));
    }
  }, [settings, activeTheme]);

  // Focus Mode State (Lifted)
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusedId, setFocusedId] = useState(null);

  // Global Key Listener for Focus Mode
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

  const addXp = (amount) => {
    setXpData(prev => {
      let { xp, level, totalXp } = prev;
      xp += amount;
      totalXp += amount;
      const nextLevelXp = level * 500;
      if (xp >= nextLevelXp) {
        xp -= nextLevelXp;
        level++;
      }
      return { xp, level, totalXp };
    });
  };

  const nextLevelXp = xpData.level * 500;

  // Layout Logic: Only expand if Focus Mode is active AND a bubble is focused
  const isExpanded = isFocusMode && focusedId;

  const resetProgress = () => {
    setXpData({ xp: 0, level: 1, totalXp: 0 });
    localStorage.removeItem('pixel-xp');
    // window.location.reload(); // Optional: force reload to ensure clean state, but state update should be enough
  };

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>

      {/* List Panel - Slides out in Focus Mode */}
      <div style={{
        width: isExpanded ? '0px' : '40%',
        opacity: isExpanded ? 0 : 1,
        overflow: 'hidden',
        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
        zIndex: 10,
        whiteSpace: 'nowrap'
      }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}> {/* Inner container to prevent squashing */}
          <ListSection
            todos={todos}
            setTodos={setTodos}
            addXp={addXp}
            settings={settings}
            onOpenSettings={() => setShowSettings(true)}
            highlightId={focusedId}
            onItemSelect={(id) => setFocusedId(prev => prev === id ? null : id)}
          />
        </div>
      </div>

      {/* Universe Panel - Expands */}
      <div style={{
        flex: 1,
        position: 'relative',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' // Sync with width transition
      }}>
        <IntuitiveSection
          todos={todos}
          setTodos={setTodos}
          addXp={addXp}
          settings={settings}
          activeTheme={activeTheme}
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode}
          focusedId={focusedId}
          setFocusedId={setFocusedId}
        />
      </div>

      <XPBar xp={xpData.xp} level={xpData.level} nextLevelXp={nextLevelXp} />

      {showSettings && (
        <SettingsModal
          settings={settings}
          level={xpData.level}
          onResetProgress={resetProgress}
          onSave={(newSettings) => { setSettings(newSettings); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
