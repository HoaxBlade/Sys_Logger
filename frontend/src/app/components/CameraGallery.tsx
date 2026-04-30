'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Clock, X, ChevronLeft, ChevronRight, Maximize2, Loader2, User, Play, Square } from 'lucide-react';
import { apiFetch } from './hooks/apiUtils';
import { io, Socket } from 'socket.io-client';

interface Photo {
    photo_id: number;
    photo_url: string;
    photo_type: string;
    captured_at: string;
}

interface CameraGalleryProps {
    unitId: string;
    unitName: string;
}

export const CameraGallery = ({ unitId, unitName }: CameraGalleryProps) => {
    const [isLive, setIsLive] = useState(false);
    const [liveFrame, setLiveFrame] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // SocketIO Setup for Live Stream
        const newSocket = io('http://187.127.142.58', {
            path: '/socket.io',
            transports: ['websocket']
        });

        newSocket.on('connect', () => {
            console.log('Connected to stream socket');
        });

        newSocket.on('live_frame', (data: { unit_id: string, frame: string }) => {
            if (data.unit_id === unitId) {
                setLiveFrame(data.frame);
            }
        });

        setSocket(newSocket);

        return () => {
            if (isLive) {
                newSocket.emit('leave_stream', { unit_id: unitId });
            }
            newSocket.disconnect();
        };
    }, [unitId]);

    const toggleLive = () => {
        if (!socket) return;

        if (!isLive) {
            socket.emit('join_stream', { unit_id: unitId });
            setIsLive(true);
        } else {
            socket.emit('leave_stream', { unit_id: unitId });
            setIsLive(false);
            setLiveFrame(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#111] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Camera size={18} className="text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Live Monitoring: {unitName}</h3>
                        <p className="text-xs text-white/40">Unit ID: {unitId}</p>
                    </div>
                </div>
                
                <button 
                    onClick={toggleLive}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                        isLive 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                    {isLive ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    {isLive ? 'STOP LIVE' : 'GO LIVE'}
                </button>
            </div>

            {/* Viewport */}
            <div className="relative flex-1 min-h-[400px] flex items-center justify-center bg-black group">
                <AnimatePresence mode="wait">
                    {isLive ? (
                        liveFrame ? (
                            <motion.img 
                                key="frame"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={liveFrame}
                                className="w-full h-full object-contain"
                                alt="Live Stream"
                            />
                        ) : (
                            <motion.div 
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-4 text-white/60"
                            >
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                <p className="text-sm font-medium animate-pulse tracking-wide">WAKING UP REMOTE CAMERA...</p>
                            </motion.div>
                        )
                    ) : (
                        <motion.div 
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-6 text-center px-6"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-2">
                                <Camera size={32} className="text-white/20" />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-white mb-2">Camera Feed Idle</h4>
                                <p className="text-sm text-white/40 max-w-xs mx-auto">
                                    Live streaming is currently disabled for this unit. Click "GO LIVE" to start the remote connection.
                                </p>
                            </div>
                            <button 
                                onClick={toggleLive}
                                className="px-8 py-3 bg-white text-black rounded-full text-sm font-bold hover:scale-105 transition-transform duration-300 shadow-xl"
                            >
                                START MONITORING
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Live Badge */}
                {isLive && (
                    <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full shadow-lg z-10">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-white tracking-widest uppercase">LIVE</span>
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="px-6 py-4 bg-black/60 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500' : 'bg-white/10'}`} />
                        {isLive ? 'Link Active' : 'Link Idle'}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        Real-time Data
                    </span>
                </div>
                <span>Secured Stream via VPS-Node</span>
            </div>
        </div>
    );
};
