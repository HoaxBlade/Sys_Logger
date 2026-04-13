import { useState, useEffect, useCallback } from 'react';

export interface AuditLog {
    id: string;
    timestamp: string;
    category: 'SECURITY' | 'MANAGEMENT' | 'DATA' | 'SYSTEM';
    action: string;
    user: string;
    orgId: string;
    target?: string;
}

export const useAuditLogs = (tenantId: string | undefined) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const storageKey = `sys_audit_logs_${tenantId || 'anonymous'}`;

    // Load logs from localStorage on mount or when tenant changes
    useEffect(() => {
        if (!tenantId) return;
        const savedLogs = localStorage.getItem(storageKey);
        if (savedLogs) {
            try {
                setLogs(JSON.parse(savedLogs));
            } catch (err) {
                console.error('Failed to parse audit logs', err);
            }
        } else {
            setLogs([]); // Reset if switching to an org with no logs
        }
    }, [tenantId, storageKey]);

    // Persist logs whenever they change
    useEffect(() => {
        if (!tenantId || logs.length === 0) return;
        localStorage.setItem(storageKey, JSON.stringify(logs));
    }, [logs, tenantId, storageKey]);

    const logAction = useCallback((
        category: AuditLog['category'],
        action: string,
        user: string,
        target?: string
    ) => {
        if (!tenantId) return;

        const newLog: AuditLog = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            category,
            action,
            user,
            orgId: tenantId,
            target
        };

        setLogs(prev => {
            const updated = [newLog, ...prev].slice(0, 100);
            return updated;
        });
    }, [tenantId]);

    const clearLogs = useCallback(() => {
        if (!tenantId) return;
        setLogs([]);
        localStorage.removeItem(storageKey);
    }, [tenantId, storageKey]);

    return {
        logs,
        logAction,
        clearLogs
    };
};
