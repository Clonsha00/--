import React, { useState } from 'react';
import { PixelButton, PixelCard, PixelInput } from './PixelUI';
import useSoundEffects from '../hooks/useSoundEffects';
import { t } from '../utils/i18n';
import { useSettings } from '../contexts/SettingsContext';
import { useTodo } from '../contexts/TodoContext';
import '../styles/SettingsModal.css';

export default function SettingsModal() {
    const {
        settings, setSettings, setShowSettings,
        musicVolume, setMusicVolume,
        customFileName, handleMusicUpload, handleResetMusic
    } = useSettings();
    const { xpData, resetProgress } = useTodo();
    const realLevel = xpData.level;
    const level = isDevMode ? 99 : realLevel;

    const { playClick, playCancel } = useSoundEffects();
    const [formData, setFormData] = useState({ ...settings });
    const lang = settings?.language || 'en';

    // Sync formData with settings when settings change (if needed)
    // Actually formData is used for "Save/Cancel" pattern.
    // MUSIC VOLUME, however, we want instant effect.
    // So distinct handling: formData for visual settings, direct context for Music.

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        playClick();
        setSettings(formData);
        setShowSettings(false);
    };

    const handleClose = () => {
        playCancel();
        setShowSettings(false);
    };

    // Lock Overlay Component
    const LockOverlay = ({ reqLevel }) => (
        <div className="lock-overlay">
            <div className="lock-content">
                <span style={{ fontSize: '1.2rem' }}>⛓️🔒</span>
                <div>
                    <div>LOCKED</div>
                    <div style={{ fontSize: '0.6rem' }}>REQ LV.{reqLevel}</div>
                </div>
                <span style={{ fontSize: '1.2rem' }}>🔒⛓️</span>
            </div>
        </div>
    );

    return (
        <div className="modal-backdrop">
            <div className="modal-container">
                <h2 className="modal-title">
                    {t('SYSTEM_CONFIG', lang)}
                </h2>

                <div className="modal-body">
                    {/* Input Header */}
                    <div className="setting-item">
                        <label className="setting-label">
                            {t('INPUT_HEADER', lang)} (Max 14)
                        </label>
                        <PixelInput
                            name="headerText"
                            value={formData.headerText || ''}
                            onChange={handleChange}
                            placeholder={t('PLACEHOLDER_HEADER', lang)}
                            maxLength={14}
                        />
                    </div>

                    <div className="setting-item">
                        <label className="setting-label">
                            {t('HEADER_SIZE', lang)}: {formData.headerSize || 1.5}rem
                        </label>
                        <input
                            type="range"
                            name="headerSize"
                            min="1.5"
                            max="2.0"
                            step="0.1"
                            value={formData.headerSize || 1.5}
                            onChange={handleChange}
                            className="setting-range"
                        />
                    </div>

                    <div className="setting-item">
                        <label className="setting-label">
                            {t('BUBBLE_STYLE', lang)}
                        </label>
                        <select
                            name="bubbleStyle"
                            value={formData.bubbleStyle || 'pixel'}
                            onChange={handleChange}
                            className="setting-select"
                        >
                            <option value="pixel">{t('STYLE_PIXEL', lang)}</option>
                            <option value="planet" disabled={level < 15}>
                                {t('STYLE_PLANET', lang)} {level < 15 ? '🔒 (Lv.15)' : ''}
                            </option>
                        </select>
                    </div>

                    <div className="setting-item">
                        <label className="setting-label">
                            {t('THEME', lang)}
                        </label>
                        <select
                            name="theme"
                            value={formData.theme || 'zen'}
                            onChange={handleChange}
                            className="setting-select"
                        >
                            <option value="zen">{t('THEME_ZEN', lang)}</option>
                            <option value="retrowave" disabled={level < 10}>
                                {t('THEME_RETRO', lang)} {level < 10 ? '🔒 (Lv.10)' : ''}
                            </option>
                            <option value="cyberpunk" disabled={level < 10}>
                                {t('THEME_CYBER', lang)} {level < 10 ? '🔒 (Lv.10)' : ''}
                            </option>
                            <option value="random">{t('THEME_RANDOM', lang)}</option>
                        </select>
                    </div>



                    <div className="setting-item">
                        <label className="setting-label">
                            {t('CUSTOM_MUSIC', lang) || '自訂音樂 (Custom Music)'}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>
                                {t('SUPPORTED_FORMATS', lang) || '支援格式: MP3, WAV, OGG'}
                            </div>

                            {customFileName ? (
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: 'var(--card-bg)', padding: '5px 10px',
                                    border: '2px solid var(--primary-neon)'
                                }}>
                                    <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                                        🎵 {customFileName}
                                    </span>
                                    <PixelButton
                                        variant="danger"
                                        onClick={handleResetMusic}
                                        style={{ padding: '4px 8px', margin: 0, fontSize: '0.6rem' }}
                                    >
                                        RESET
                                    </PixelButton>
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => handleMusicUpload(e.target.files[0])}
                                    style={{
                                        fontSize: '0.8rem',
                                        color: '#ccc',
                                        // Standard file input styling is hard, keep it simple or use a label wrapper
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="setting-item">
                        <label className="setting-label">
                            {t('LANGUAGE', lang)}
                        </label>
                        <select
                            name="language"
                            value={formData.language || 'zh-TW'}
                            onChange={handleChange}
                            className="setting-select"
                        >
                            <option value="en">English (Retrowave)</option>
                            <option value="zh-TW">繁體中文 (Traditional Chinese)</option>
                        </select>
                    </div>
                </div>

                <div className="modal-footer">
                    <PixelButton onClick={handleSave} style={{ flex: '2 0 60px' }}>
                        {t('SAVE', lang)}
                    </PixelButton>
                    <PixelButton variant="danger" onClick={resetProgress} style={{ flex: '1 0 60px', fontSize: '0.7rem' }}>
                        ⚠ RESET
                    </PixelButton>
                    <PixelButton variant="danger" onClick={handleClose} style={{ flex: '1 0 60px' }}>
                        {t('CANCEL', lang)}
                    </PixelButton>
                </div>
            </div>
        </div>
    );
}
