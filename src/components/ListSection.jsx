import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PixelButton, PixelInput, PixelCard } from './PixelUI';
import { PixelDatePicker } from './PixelDatePicker';
import useSoundEffects from '../hooks/useSoundEffects';
import { t } from '../utils/i18n';
import { generateGoogleCalendarUrl, downloadICS } from '../utils/calendarHelper';
import { useTodo } from '../contexts/TodoContext';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/ListSection.css';

export default function ListSection() {
    const { todos, setTodos, addXp } = useTodo();
    const { settings, setShowSettings, focusedId, setFocusedId, isDevMode, setIsDevMode } = useSettings();

    const highlightId = focusedId;

    // Dev Mode Trigger Logic
    const titleClickCountRef = useRef(0);
    const titleClickTimerRef = useRef(null);

    const handleTitleClick = () => {
        titleClickCountRef.current += 1;
        if (titleClickTimerRef.current) clearTimeout(titleClickTimerRef.current);

        if (titleClickCountRef.current >= 5) {
            setIsDevMode(prev => !prev);
            playClick(); // Feedback
            alert(isDevMode ? 'DEV MODE DEACTIVATED' : 'DEV MODE ACTIVATED\n[Spawn Debug] unlocked');
            titleClickCountRef.current = 0;
            return;
        }

        titleClickTimerRef.current = setTimeout(() => {
            titleClickCountRef.current = 0;
        }, 1000);
    };

    const handleItemSelect = (id) => {
        setFocusedId(prev => prev === id ? null : id);
    };

    const itemRefs = useRef({});

    useEffect(() => {
        if (highlightId && itemRefs.current[highlightId]) {
            itemRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightId]);

    const lang = settings?.language || 'en';
    const { playClick, playDelete, playCancel } = useSoundEffects();

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

        if (todos.length >= 40) {
            if (playCancel) playCancel();
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

    // Optimization: Memoize sorted list to avoid re-sorting on every render (e.g. typing)
    const sortedTodos = useMemo(() => {
        return [...todos].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }, [todos]);

    return (
        <div className="list-section-container">
            {/* 1. FIXED HEADER & INPUT */}
            <div className="list-header">
                <div className="title-row">
                    <h2 className="app-title" onClick={handleTitleClick} style={{
                        fontSize: `${settings?.headerSize || 1.5}rem`,
                        cursor: 'pointer', userSelect: 'none'
                    }}>
                        {settings?.headerText || '> TASKS_LOG'}
                    </h2>
                    <button className="config-btn" onClick={() => { playClick(); setShowSettings(true); }}>
                        {t('CONFIG', lang)}
                    </button>
                    {isDevMode && (
                        <button className="config-btn" style={{ marginLeft: '10px', borderColor: 'var(--secondary-neon)', color: 'var(--secondary-neon)' }} onClick={() => {
                            playClick();
                            const now = Date.now();
                            if (todos.length + 4 > 40) {
                                alert('DEV ERROR: Limit (40) exceeded');
                                return;
                            }
                            const debugTasks = [
                                { id: now, title: 'CRITICAL BUG', deadline: new Date(now + 1000 * 60 * 30).toISOString(), type: 'Bug', note: 'Critical urgency test' }, // 30 mins left
                                { id: now + 1, title: 'Warning Task', deadline: new Date(now + 1000 * 60 * 60 * 25).toISOString(), type: 'Work', note: '25 hours left' }, // 25 hours
                                { id: now + 2, title: 'Chill Planet', deadline: new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString(), type: 'Hobby', note: '5 days left' }, // 5 days
                                { id: now + 3, title: 'Future Dream', deadline: new Date(now + 1000 * 60 * 60 * 24 * 30).toISOString(), type: 'Idea', note: '30 days left' }, // 30 days
                            ];
                            setTodos(prev => [...prev, ...debugTasks]);
                        }}>
                            DEV
                        </button>
                    )}
                </div>

                <div style={{ width: '100%' }}>
                    <PixelCard style={{ margin: 0 }}>
                        <div className="input-group">
                            <label>{t('TASK_NAME', lang)}</label>
                            <PixelInput name="title" value={formData.title} onChange={handleChange} placeholder={t('ENTER_TASK', lang)} />

                            <label>{t('DEADLINE', lang)}</label>
                            <PixelDatePicker
                                selected={formData.deadline}
                                onChange={handleDateChange}
                                placeholder={t('SELECT_DATE', lang)}
                            />

                            <div className="input-row">
                                <div className="input-col">
                                    <label>{t('TYPE', lang)}</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="type-select"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{t(cat, lang)}</option>
                                        ))}
                                        <option value="___OTHER___">{t('MANAGE', lang)}</option>
                                    </select>
                                </div>
                                <div className="input-col min-width">
                                    <label>{t('NOTE', lang)}</label>
                                    <PixelInput name="note" value={formData.note} onChange={handleChange} placeholder={t('ENTER_NOTE', lang)} />
                                </div>
                            </div>

                            <div className="action-row">
                                <PixelButton onClick={handleSubmit} style={{ flex: 2 }}>{t('ADD_TASK', lang)}</PixelButton>
                                {isDevMode && (
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
                                            const randomHours = (Math.random() * 168) - 48;
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
                                    }} style={{ flex: 1, fontSize: '0.7rem' }}>{t('SPAWN_15', lang)}</PixelButton>
                                )}
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
            <div className="scrollable-list">
                {sortedTodos.map(todo => (
                    <div key={todo.id} ref={el => itemRefs.current[todo.id] = el}
                        onClick={() => handleItemSelect(todo.id)}
                        className="todo-item-container"
                    >
                        <PixelCard className={`todo-card ${highlightId === todo.id ? 'highlighted' : ''}`}>
                            <div className="todo-content">
                                <div>
                                    <h4 className="todo-title">{todo.title}</h4>
                                    <div className="todo-details">
                                        {t('EXP', lang)}: {new Date(todo.deadline).toLocaleString()}<br />
                                        {t('TYPE', lang)}: {t(todo.type, lang)} | {t('NOTE', lang)}: {todo.note || todo.duration}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <PixelButton
                                            variant="secondary"
                                            onClick={(e) => { e.stopPropagation(); window.open(generateGoogleCalendarUrl(todo), '_blank'); }}
                                            style={{ padding: '8px 4px', fontSize: '0.8rem' }}
                                            title="Add to Google Calendar"
                                        >
                                            📅
                                        </PixelButton>
                                    </div>
                                    <PixelButton variant="danger" onClick={() => handleDelete(todo.id)} style={{ padding: '8px' }}>X</PixelButton>
                                </div>
                            </div>
                        </PixelCard>
                    </div>
                ))}
                {todos.length === 0 && <p style={{ textAlign: 'center', color: '#555', marginTop: '20px' }}>{t('NO_DATA', lang)}</p>}
            </div>

            {showCategoryManager && (
                <div className="category-manager-overlay">
                    <div className="category-manager-modal">
                        <h3 style={{ color: 'var(--secondary-neon)', marginTop: 0 }}>CATEGORY_MGR</h3>

                        <div className="category-list">
                            {categories.map(cat => (
                                <div key={cat} className="category-item">
                                    <span>{cat}</span>
                                    <button
                                        className="delete-cat-btn"
                                        onClick={() => handleDeleteCategory(cat)}
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
