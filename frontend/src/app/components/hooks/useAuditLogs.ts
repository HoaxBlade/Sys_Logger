import { useState, useEffect, useCallback } from 'react';

export interface AuditLog {
    id: string;
    timestamp: string;
    category: 'SECURITY' | 'MANAGEMENT' | 'DATA' | 'SYSTEM';
    action: string;
    user: string;
    target?: string;
}

export const useAuditLogs = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);

    // Load logs from localStorage on mount
    useEffect(() => {
        const savedLogs = localStorage.getItem('sys_audit_logs');
        if (savedLogs) {
            try {
                setLogs(JSON.parse(savedLogs));
            } catch (err) {
                console.error('Failed to parse audit logs', err);
            }
        }
    }, []);

    // Persist logs whenever they change
    useEffect(() => {
        localStorage.setItem('sys_audit_logs', JSON.stringify(logs));
    }, [logs]);

    const logAction = useCallback((
        category: AuditLog['category'],
        action: string,
        user: string,
        target?: string
    ) => {
        const newLog: AuditLog = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            category,
            action,
            user,
            target
        };

        setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 actions
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
        localStorage.removeItem('sys_audit_logs');
    }, []);

    return {
        logs,
        logAction,
        clearLogs
    };
};
