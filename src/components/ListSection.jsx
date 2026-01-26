import React, { useState } from 'react';
import { PixelButton, PixelInput, PixelCard } from './PixelUI';
import { PixelDatePicker } from './PixelDatePicker';
import useSoundEffects from '../hooks/useSoundEffects';
import { t } from '../utils/i18n';

export default function ListSection({ todos, setTodos, addXp, settings, onOpenSettings }) {
    const lang = settings?.language || 'en';
    const { playClick, playDelete } = useSoundEffects();

    const [formData, setFormData] = useState({
        title: '',
        deadline: null,
        type: '一般',
        note: ''
    });

    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem('pixel-todo-categories');
        return saved ? JSON.parse(saved) : ['Work', 'Personal', 'Hobby'];
    });
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const saveCategories = (newCats) => {
        setCategories(newCats);
        localStorage.setItem('pixel-todo-categories', JSON.stringify(newCats));
    };

    const handleAddCategory = () => {
        if (!newCategory.trim() || categories.includes(newCategory)) return;
        playClick();
        const updated = [...categories, newCategory];
        saveCategories(updated);
        setNewCategory('');
        setFormData({ ...formData, type: newCategory });
    };

    const handleDeleteCategory = (catToDelete) => {
        playDelete();
        const updated = categories.filter(c => c !== catToDelete);
        saveCategories(updated);
        if (formData.type === catToDelete) {
            setFormData({ ...formData, type: updated[0] || '' });
        }
    };

    const handleChange = (e) => {
        if (e.target.name === 'type' && e.target.value === '___OTHER___') {
            playClick();
            setShowCategoryManager(true);
            return;
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, deadline: date });
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.deadline) return;

        // Limit Check
        if (todos.length >= 40) {
            if (playCancel) playCancel(); // Safety check
            alert(lang === 'zh-TW' ? '已達上限 (40)' : 'LIMIT REACHED (40)');
            return;
        }

        playClick();
        const newTodo = {
            id: Date.now(),
            ...formData,
            deadline: formData.deadline.toISOString(),
            createdAt: new Date().toISOString()
        };
        const newTodos = [...todos, newTodo].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setTodos(newTodos);
        setFormData({ ...formData, title: '', deadline: null, note: '' });
    };

    const handleDelete = (id) => {
        playDelete();
        setTodos(todos.filter(t => t.id !== id));
        if (addXp) addXp(100);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            borderRight: '4px solid #333',
            position: 'relative',
            backgroundColor: 'var(--bg-color)', // Ensure background covers list when scrolling
        }}>
            {/* 1. FIXED HEADER & INPUT */}
            <div style={{
                padding: '20px',
                borderBottom: '4px solid #333',
                backgroundColor: 'rgba(26, 26, 46, 0.95)', // Slight transparency
                zIndex: 20
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{
                        color: 'var(--primary-neon)',
                        textShadow: '3px 3px #000',
                        margin: '0 10px 0 0', // Right margin for spacing 
                        fontSize: `${settings?.headerSize || 1.5}rem`,
                        letterSpacing: '2px',
                        lineHeight: '1.2',
                        flex: 1,       // Allow flexible width
                        minWidth: 0,   // Allow shrinking
                        wordBreak: 'break-word' // Wrap long words
                    }}>
                        {settings?.headerText || '> TASKS_LOG'}
                    </h2>
                    <button
                        onClick={() => { playClick(); onOpenSettings(); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#555',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontSize: '0.8rem',
                            flexShrink: 0, // Prevent disappearing
                            marginLeft: '10px'
                        }}
                    >
                        {t('CONFIG', lang)}
                    </button>
                </div>

                <div style={{ width: '100%' }}>
                    <PixelCard style={{ margin: 0 }}> {/* Remove default margin for tighter fit */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label>{t('TASK_NAME', lang)}</label>
                            <PixelInput name="title" value={formData.title} onChange={handleChange} placeholder={t('ENTER_TASK', lang)} />

                            <label>{t('DEADLINE', lang)}</label>
                            <PixelDatePicker
                                selected={formData.deadline}
                                onChange={handleDateChange}
                                placeholder={t('SELECT_DATE', lang)}
                            />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <label>{t('TYPE', lang)}</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        style={{
                                            fontFamily: 'var(--font-pixel)',
                                            backgroundColor: 'var(--card-bg)',
                                            color: 'white',
                                            border: '4px solid #333',
                                            padding: '10px',
                                            marginTop: '8px',
                                            width: '100%',
                                            outline: 'none',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--secondary-neon)'}
                                        onBlur={(e) => e.target.style.borderColor = '#333'}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{t(cat, lang)}</option>
                                        ))}
                                        <option value="___OTHER___">{t('MANAGE', lang)}</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <label>{t('NOTE', lang)}</label>
                                    <PixelInput name="note" value={formData.note} onChange={handleChange} placeholder={t('ENTER_NOTE', lang)} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <PixelButton onClick={handleSubmit} style={{ flex: 2 }}>{t('ADD_TASK', lang)}</PixelButton>
                                <PixelButton variant="secondary" onClick={() => {
                                    const remaining = 40 - todos.length;
                                    if (remaining <= 0) {
                                        if (playCancel) playCancel();
                                        alert(lang === 'zh-TW' ? '已達上限 (40)' : 'LIMIT REACHED (40)');
                                        return;
                                    }

                                    playClick();
                                    const isZh = lang === 'zh-TW';
                                    const adjectives = isZh
                                        ? ['緊急', '秘密', '宇宙', '懶惰', '史詩', '損壞', '隱藏', '霓虹']
                                        : ['Urgent', 'Secret', 'Cosmic', 'Lazy', 'Epic', 'Broken', 'Hidden', 'Neon'];
                                    const nouns = isZh
                                        ? ['專案', '會議', 'Bug', '點子', '披薩', '程式碼', '訊號', '數據']
                                        : ['Project', 'Meeting', 'Bug', 'Idea', 'Pizza', 'Code', 'Signal', 'Data'];

                                    const countToAdd = Math.min(15, remaining);
                                    const newTasks = Array.from({ length: countToAdd }).map((_, i) => {
                                        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
                                        const noun = nouns[Math.floor(Math.random() * nouns.length)];
                                        const randomHours = (Math.random() * 168) - 48; // -48h to +120h (-2 days to +5 days)
                                        const deadline = new Date(Date.now() + randomHours * 3600000);
                                        return {
                                            id: Date.now() + i,
                                            title: `${adj}${isZh ? '' : ' '}${noun} #${Math.floor(Math.random() * 99)}`,
                                            deadline: deadline.toISOString(),
                                            type: categories[Math.floor(Math.random() * categories.length)],
                                            note: isZh ? '由除錯協議生成' : 'Generated by Debug Protocol',
                                            createdAt: new Date().toISOString()
                                        };
                                    });
                                    setTodos(prev => [...prev, ...newTasks]);
                                }} style={{ flex: 1, fontSize: '0.7rem' }}>{t('SPAWN_15', lang).replace('15', 'ALL')}</PixelButton>
                                <PixelButton variant="danger" onClick={() => {
                                    playDelete();
                                    setTodos([]);
                                }} style={{ flex: 1, fontSize: '0.7rem' }}>{t('CLEAR_ALL', lang)}</PixelButton>
                            </div>
                        </div>
                    </PixelCard>
                </div>
            </div>

            {/* 2. SCROLLABLE LIST */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px'
            }}>
                {[...todos].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map(todo => (
                    <PixelCard key={todo.id} style={{ padding: '20px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: '0 0 8px 0', color: 'var(--secondary-neon)', fontSize: '1.2rem' }}>{todo.title}</h4>
                                <div style={{ fontSize: '0.85rem', color: '#888', lineHeight: '1.5' }}>
                                    {t('EXP', lang)}: {new Date(todo.deadline).toLocaleString()}<br />
                                    {t('TYPE', lang)}: {t(todo.type, lang)} | {t('NOTE', lang)}: {todo.note || todo.duration}
                                </div>
                            </div>
                            <PixelButton variant="danger" onClick={() => handleDelete(todo.id)} style={{ padding: '8px' }}>X</PixelButton>
                        </div>
                    </PixelCard>
                ))}
                {todos.length === 0 && <p style={{ textAlign: 'center', color: '#555', marginTop: '20px' }}>{t('NO_DATA', lang)}</p>}
            </div>

            {showCategoryManager && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: '#1a1a2e',
                        border: '4px solid var(--primary-neon)',
                        padding: '20px',
                        width: '80%',
                        maxWidth: '300px',
                        boxShadow: '0 0 20px var(--primary-neon)'
                    }}>
                        <h3 style={{ color: 'var(--secondary-neon)', marginTop: 0 }}>CATEGORY_MGR</h3>

                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', border: '2px solid #333', padding: '5px' }}>
                            {categories.map(cat => (
                                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', padding: '5px', borderBottom: '1px dashed #333' }}>
                                    <span>{cat}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(cat)}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent-neon)', cursor: 'pointer', fontFamily: 'inherit' }}
                                    >
                                        [DEL]
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <PixelInput
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="New Category..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <PixelButton onClick={handleAddCategory} style={{ flex: 1 }}>ADD</PixelButton>
                            <PixelButton variant="danger" onClick={() => { playClick(); setShowCategoryManager(false); }} style={{ flex: 1 }}>CLOSE</PixelButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
