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
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [liveFrame, setLiveFrame] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    const fetchPhotos = async () => {
        setLoading(true);
        try {
            const response = await apiFetch(`/api/units/${unitId}/photos`);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setPhotos(data);
                } else {
                    setError("Invalid data format received");
                }
            } else {
                setError("Failed to load photos from server");
            }
        } catch (err) {
            console.error("Error fetching photos:", err);
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();

        // SocketIO Setup for Live Stream
        const newSocket = io(window.location.origin, {
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

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString([], { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="bg-white rounded-[2rem] border border-zinc-200/60 overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                        <Camera size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Physical Audit Logs</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Visual confirmation of unit presence</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={toggleLive}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            isLive 
                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' 
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                    >
                        {isLive ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                        {isLive ? 'Live View' : 'Go Live'}
                    </button>
                    <button 
                        onClick={fetchPhotos} 
                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-colors"
                        title="Refresh Gallery"
                    >
                        <Clock size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto no-scrollbar min-h-[400px]">
                {isLive ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 bg-zinc-950 rounded-[1.5rem] overflow-hidden relative group border border-white/5">
                        {liveFrame ? (
                            <img 
                                src={liveFrame} 
                                alt="Live Stream" 
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Waking up remote camera...</p>
                            </div>
                        )}
                        <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase rounded-full flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                            Live
                        </div>
                    </div>
                ) : loading && photos.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3 py-12">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Accessing Camera Logs...</p>
                    </div>
                ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2 py-12">
                        <p className="text-xs font-bold text-red-500">{error}</p>
                        <button onClick={fetchPhotos} className="text-[10px] font-black text-orange-600 uppercase underline">Try Again</button>
                    </div>
                ) : photos.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 py-12 opacity-40">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
                            <Camera size={32} className="text-zinc-300" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">
                            No camera logs found <br/> 
                            <span className="font-bold opacity-60">Installation might be pending</span>
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {photos.map((photo) => (
                            <motion.div 
                                key={photo.photo_id}
                                layoutId={`photo-${photo.photo_id}`}
                                onClick={() => setSelectedPhoto(photo)}
                                className="group relative aspect-video bg-zinc-100 rounded-2xl overflow-hidden ring-1 ring-zinc-200/50 cursor-pointer hover:ring-orange-500/50 transition-all shadow-sm"
                            >
                                <img 
                                    src={photo.photo_url} 
                                    alt="Physical audit" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                    <p className="text-[9px] font-black text-white uppercase tracking-wider">{formatTime(photo.captured_at)}</p>
                                </div>
                                <div className="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 size={12} className="text-white" />
                                </div>
                                {photo.photo_type === 'ASSET' && (
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black uppercase tracking-tighter rounded-md shadow-lg">
                                        Asset
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 bg-zinc-950/90 backdrop-blur-xl"
                    >
                        <button 
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]"
                        >
                            <X size={24} />
                        </button>

                        <div className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center gap-6">
                            <motion.div 
                                layoutId={`photo-${selectedPhoto.photo_id}`}
                                className="relative w-full max-h-[80vh] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/10"
                            >
                                <img 
                                    src={selectedPhoto.photo_url} 
                                    alt="Audit Full View" 
                                    className="w-full h-full object-contain bg-black/40"
                                />
                            </motion.div>

                            <div className="flex flex-col items-center gap-2">
                                <h4 className="text-xl font-black text-white tracking-tight uppercase">{unitName}</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                        <Clock size={14} className="text-orange-400" />
                                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{formatTime(selectedPhoto.captured_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                        <User size={14} className="text-emerald-400" />
                                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Autonomous Capture</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
