import React from 'react';
import ListSection from './components/ListSection';
import IntuitiveSection from './components/IntuitiveSection';
import XPBar from './components/XPBar';
import SettingsModal from './components/SettingsModal';
import { TodoProvider, useTodo } from './contexts/TodoContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import './styles/App.css';

// 1. 內部組件：負責主要的 Layout 與 UI 渲染
function AppContent() {
  const { xpData, nextLevelXp } = useTodo();
  const {
    showSettings,
    isFocusMode,
    focusedId,
  } = useSettings();

  // Layout Logic: Only expand if Focus Mode is active AND a bubble is focused
  const isExpanded = isFocusMode && focusedId;

  return (
    <div className="app-container">

      {/* List Panel - Slides out in Focus Mode */}
      <div className={`list-panel ${isExpanded ? 'collapsed' : 'expanded'}`}>
        <div className="list-panel-content">
          <ListSection />
        </div>
      </div>

      {/* Universe Panel - Expands */}
      <div className="universe-panel">
        <IntuitiveSection />
      </div>

      <XPBar xp={xpData.xp} level={xpData.level} nextLevelXp={nextLevelXp} />

      {showSettings && (
        <SettingsModal />
      )}
    </div>
  );
}

// 2. 中介層：連接 TodoContext 的數據到 SettingsContext (因為 Settings 需要 xpLevel)
function SettingsProviderWrapper({ children }) {
  const { xpData } = useTodo();
  return (
    <SettingsProvider xpLevel={xpData.level}>
      {children}
    </SettingsProvider>
  );
}

// 3. 根組件：只負責 Context 的嵌套
function App() {
  return (
    <TodoProvider>
      <SettingsProviderWrapper>
        <AppContent />
      </SettingsProviderWrapper>
    </TodoProvider>
  );
}

export default App;
