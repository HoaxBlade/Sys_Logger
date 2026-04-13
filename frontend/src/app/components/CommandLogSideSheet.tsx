import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Shield, Database, Activity, Clock } from 'lucide-react';
import { AuditLog } from './hooks/useAuditLogs';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CommandLogSideSheetProps {
    isOpen: boolean;
    onClose: () => void;
    logs: AuditLog[];
    onClear: () => void;
}

export const CommandLogSideSheet: React.FC<CommandLogSideSheetProps> = ({
    isOpen,
    onClose,
    logs,
    onClear
}) => {
    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const getCategoryStyles = (category: AuditLog['category']) => {
        switch (category) {
            case 'SECURITY': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'DATA': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'MANAGEMENT': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        }
    };

    const getCategoryIcon = (category: AuditLog['category']) => {
        switch (category) {
            case 'SECURITY': return <Shield size={12} />;
            case 'DATA': return <Database size={12} />;
            case 'MANAGEMENT': return <Activity size={12} />;
            default: return <Terminal size={12} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
                    />

                    {/* Side Sheet */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl z-[9999] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center ring-1 ring-orange-500/20">
                                    <Terminal className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white tracking-tight uppercase">Command Log</h2>
                                    <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">System Audit Stream</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Logs List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 pointer-events-none">
                                    <Terminal size={48} className="text-zinc-600 mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-600">No activity recorded</p>
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={log.id}
                                        className="p-4 rounded-2xl bg-zinc-800/30 border border-zinc-800/50 hover:bg-zinc-800/50 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className={cn(
                                                "flex items-center gap-2 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                                getCategoryStyles(log.category)
                                            )}>
                                                {getCategoryIcon(log.category)}
                                                {log.category}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500">
                                                <Clock size={10} />
                                                {formatTime(log.timestamp)}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">
                                                <span className="text-orange-500/80 font-black">@{log.user.split('@')[0]}</span> {log.action}
                                            </p>
                                            {log.target && (
                                                <p className="text-[10px] text-zinc-500 font-bold font-mono bg-black/20 p-1.5 rounded-lg border border-white/5 inline-block">
                                                    DESC :: {log.target}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
                            <button
                                onClick={() => {
                                    if (confirm('CAUTION: This will permanently wipe all local audit logs for this session. Proceed?')) {
                                        onClear();
                                    }
                                }}
                                className="w-full py-3 bg-zinc-800/50 border border-orange-500/20 hover:border-red-500/50 text-orange-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                            >
                                <X size={14} className="group-hover:rotate-90 transition-transform" />
                                Purge Session Logs
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
