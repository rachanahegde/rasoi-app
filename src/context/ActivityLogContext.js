import React, { createContext, useContext, useState, useEffect } from 'react';

const ActivityLogContext = createContext();

export const useActivityLog = () => {
    const context = useContext(ActivityLogContext);
    if (!context) {
        throw new Error('useActivityLog must be used within ActivityLogProvider');
    }
    return context;
};

export const ActivityLogProvider = ({ children }) => {
    const [activities, setActivities] = useState([]);

    // Load activities from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('chefs_notebook_activity_log');
        if (stored) {
            try {
                setActivities(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse activity log:', e);
            }
        }
    }, []);

    // Save activities to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('chefs_notebook_activity_log', JSON.stringify(activities));
    }, [activities]);

    const addActivity = (type, message, details = null, tags = null) => {
        const newActivity = {
            id: Date.now().toString(),
            type,
            message,
            details,
            tags,
            timestamp: new Date().toISOString()
        };

        setActivities(prev => [newActivity, ...prev]);
    };

    const clearActivities = () => {
        setActivities([]);
    };

    return (
        <ActivityLogContext.Provider value={{ activities, addActivity, clearActivities }}>
            {children}
        </ActivityLogContext.Provider>
    );
};
