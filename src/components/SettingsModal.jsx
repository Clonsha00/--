import React, { useState } from 'react';
import { PixelButton, PixelCard, PixelInput } from './PixelUI';
import useSoundEffects from '../hooks/useSoundEffects';
import { t } from '../utils/i18n';

export default function SettingsModal({ settings, onSave, onClose, level = 1, onResetProgress }) { // Default level 1
    const { playClick, playCancel } = useSoundEffects();
    const [formData, setFormData] = useState({ ...settings });
    const lang = settings?.language || 'en';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        playClick();
        onSave(formData);
    };

    // Lock Overlay Component
    const LockOverlay = ({ reqLevel }) => (
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
            border: '2px solid #ff003c',
            pointerEvents: 'none' // Block interaction visually, input disabled below handles logic
        }}>
            <div style={{
                color: '#ff003c',
                textShadow: '0 0 5px #ff003c',
                fontSize: '0.8rem',
                textAlign: 'center',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
            }}>
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
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: '#1a1a2e',
                border: '4px solid var(--primary-neon)',
                padding: '20px',
                width: '90%',
                maxWidth: '400px',
                maxHeight: '90vh',      // Prevent vertical overflow
                overflowY: 'auto',      // Scroll if needed
                boxShadow: '0 0 20px var(--primary-neon)',
                display: 'flex',        // Flex column for scrollable content
                flexDirection: 'column'
            }}>
                <h2 style={{
                    color: 'var(--primary-neon)',
                    textAlign: 'center',
                    marginTop: 0,
                    textShadow: '2px 2px #000',
                    flexShrink: 0       // Keep header visible
                }}>
                    {t('SYSTEM_CONFIG', lang)}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                    {/* ...inputs... */}
                    <div>
                        <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
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

                    <div>
                        <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
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
                            style={{ width: '100%', cursor: 'pointer' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
                            {t('BUBBLE_STYLE', lang)}
                        </label>
                        <select
                            name="bubbleStyle"
                            value={formData.bubbleStyle || 'pixel'}
                            onChange={handleChange}
                            style={{
                                fontFamily: 'var(--font-pixel)',
                                backgroundColor: 'var(--card-bg)',
                                color: 'white',
                                border: '4px solid #333',
                                padding: '10px',
                                width: '100%',
                                outline: 'none',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--secondary-neon)'}
                            onBlur={(e) => e.target.style.borderColor = '#333'}
                        >
                            <option value="pixel">{t('STYLE_PIXEL', lang)}</option>
                            <option value="planet" disabled={level < 15}>
                                {t('STYLE_PLANET', lang)} {level < 15 ? '🔒 (Lv.15)' : ''}
                            </option>
                        </select>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
                            {t('THEME', lang)}
                        </label>
                        <select
                            name="theme"
                            value={formData.theme || 'zen'}
                            onChange={handleChange}
                            style={{
                                fontFamily: 'var(--font-pixel)',
                                backgroundColor: 'var(--card-bg)',
                                color: 'white',
                                border: '4px solid #333',
                                padding: '10px',
                                width: '100%',
                                outline: 'none',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--secondary-neon)'}
                            onBlur={(e) => e.target.style.borderColor = '#333'}
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

                    <div>
                        <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
                            {t('LANGUAGE', lang)}
                        </label>
                        <select
                            name="language"
                            value={formData.language || 'zh-TW'}
                            onChange={handleChange}
                            style={{
                                fontFamily: 'var(--font-pixel)',
                                backgroundColor: 'var(--card-bg)',
                                color: 'white',
                                border: '4px solid #333',
                                padding: '10px',
                                width: '100%',
                                outline: 'none',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--secondary-neon)'}
                            onBlur={(e) => e.target.style.borderColor = '#333'}
                        >
                            <option value="en">English (Retrowave)</option>
                            <option value="zh-TW">繁體中文 (Traditional Chinese)</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '5px', marginTop: '20px', flexShrink: 0 }}>
                    <PixelButton onClick={handleSave} style={{ flex: '2 0 60px' }}>
                        {t('SAVE', lang)}
                    </PixelButton>
                    <PixelButton variant="danger" onClick={onResetProgress} style={{ flex: '1 0 60px', fontSize: '0.7rem' }}>
                        ⚠ RESET
                    </PixelButton>
                    <PixelButton variant="danger" onClick={() => { playCancel(); onClose(); }} style={{ flex: '1 0 60px' }}>
                        {t('CANCEL', lang)}
                    </PixelButton>
                </div>
            </div>
        </div>
    );
}
