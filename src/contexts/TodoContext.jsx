import React, { createContext, useContext, useState, useEffect } from 'react';

const TodoContext = createContext();

export function TodoProvider({ children }) {
    // --- 任務數據 ---
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem('pixel-todos');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        // Optimization: Debounce storage writes to avoid blocking main thread on rapid updates
        const handler = setTimeout(() => {
            localStorage.setItem('pixel-todos', JSON.stringify(todos));
        }, 500);
        return () => clearTimeout(handler);
    }, [todos]);

    // --- XP 系統數據 ---
    const [xpData, setXpData] = useState(() => {
        const saved = localStorage.getItem('pixel-xp');
        return saved ? JSON.parse(saved) : { xp: 0, level: 0, totalXp: 0 };
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            localStorage.setItem('pixel-xp', JSON.stringify(xpData));
        }, 500);
        return () => clearTimeout(handler);
    }, [xpData]);

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

    const resetProgress = () => {
        setXpData({ xp: 0, level: 0, totalXp: 0 });
        localStorage.removeItem('pixel-xp');
    };

    const nextLevelXp = xpData.level * 500;

    const value = {
        todos,
        setTodos,
        xpData,
        addXp,
        resetProgress,
        nextLevelXp
    };

    return (
        <TodoContext.Provider value={value}>
            {children}
        </TodoContext.Provider>
    );
}

export function useTodo() {
    return useContext(TodoContext);
}
