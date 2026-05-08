'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Play, Square, Settings, Trash2, Plus, Loader2, Maximize2, Shield, Wifi, Info, Globe } from 'lucide-react';
import { useAuth } from './AuthContext';

interface CameraItem {
    camera_id: number;
    name: string;
    rtsp_url: string;
    status: string;
}

export const RemoteCameraMonitor = () => {
    const { user, token } = useAuth();
    const [cameras, setCameras] = useState<CameraItem[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<CameraItem | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [quality, setQuality] = useState<'SUBSTREAM' | 'HD'>('SUBSTREAM');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Camera Add Form State
    const [newCamName, setNewCamName] = useState('');
    const [newCamUrl, setNewCamUrl] = useState('');
    const [newCamHost, setNewCamHost] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (token) fetchCameras();
    }, [token]);

    const fetchCameras = async () => {
        try {
            const response = await fetch(`${API_URL}/api/cameras`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCameras(data);
            }
        } catch (err) {
            console.error('Failed to fetch cameras');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCamera = async () => {
        if (!newCamName || !newCamUrl || !newCamHost) {
            setError('Please fill in all fields including Host Node ID');
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/cameras`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newCamName,
                    rtsp_url: newCamUrl,
                    host_unit_id: newCamHost
                })
            });
            const data = await response.json();
            if (response.ok) {
                setIsAddModalOpen(false);
                fetchCameras();
                setNewCamName(''); setNewCamUrl(''); setNewCamHost('');
            } else {
                setError(data.message || data.error || 'Failed to add camera');
            }
        } catch (err) {
            setError('Failed to add camera');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleLive = () => {
        if (!selectedCamera) return;
        setIsLive(!isLive);
    };

    const changeQuality = (newQuality: 'SUBSTREAM' | 'HD') => {
        setQuality(newQuality);
        // Note: Backend quality scaling can be implemented later via query parameters
    };

    const handleDeleteCamera = async (id: number) => {
        if (!confirm('Are you sure you want to delete this camera registration?')) return;
        try {
            await fetch(`${API_URL}/api/cameras/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCameras();
            if (selectedCamera?.camera_id === id) {
                setSelectedCamera(null);
                setIsLive(false);
            }
        } catch (err) {
            alert('Delete failed');
        }
    };

    const maxCameras = user?.tier?.toLowerCase() === 'business' ? 10 : user?.tier?.toLowerCase() === 'pro' ? 2 : 0;
    const isQuotaReached = cameras.length >= maxCameras && user?.role !== 'ROOT';

    return (
        <div className="flex flex-col h-full bg-[#F8F9FA] rounded-[2.5rem] overflow-hidden border border-zinc-200/50 shadow-xl relative">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 bg-white flex items-center justify-between z-10 relative">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-2xl">
                        <Camera size={24} className="text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase">Central Monitoring</h2>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Global IP Camera Network</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex text-xs bg-zinc-100 px-4 py-2 rounded-xl text-zinc-500 font-bold tracking-widest uppercase items-center gap-2">
                        Quota: <span className="text-zinc-900">{cameras.length} / {user?.role === 'ROOT' ? '∞' : maxCameras}</span>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        disabled={isQuotaReached}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg ${
                            isQuotaReached ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-orange-600'
                        }`}
                    >
                        <Plus size={16} /> Register Camera
                    </button>
                </div>
            </div>

            {isQuotaReached && (
                <div className="bg-orange-100 border-b border-orange-200 text-orange-800 px-6 py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Shield size={14} />
                    You have reached your tier's camera limit. Upgrade to add more.
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Camera List */}
                <div className="w-80 border-r border-zinc-100 bg-white/50 overflow-y-auto p-4 space-y-3 z-10">
                    <h3 className="px-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Active Lab Feeds</h3>
                    {cameras.map((cam) => (
                        <button
                            key={cam.camera_id}
                            onClick={() => {
                                if (isLive) toggleLive();
                                setSelectedCamera(cam);
                            }}
                            className={`w-full p-4 rounded-3xl text-left transition-all duration-300 group relative overflow-hidden ${
                                selectedCamera?.camera_id === cam.camera_id 
                                ? 'bg-white shadow-xl ring-1 ring-orange-200' 
                                : 'hover:bg-white/80'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                    selectedCamera?.camera_id === cam.camera_id ? 'bg-orange-100 text-orange-600' : 'bg-zinc-100 text-zinc-400'
                                }`}>
                                    {'IP FEED'}
                                </span>
                                <Trash2 
                                    size={14} 
                                    className="text-zinc-300 hover:text-red-500 cursor-pointer transition-colors" 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCamera(cam.camera_id); }}
                                />
                            </div>
                            <h4 className="font-black text-zinc-900 tracking-tight mb-1">{cam.name}</h4>
                            <p className="text-[10px] text-zinc-400 font-bold font-mono truncate">{cam.rtsp_url}</p>
                            
                            {selectedCamera?.camera_id === cam.camera_id && (
                                <motion.div layoutId="active-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full" />
                            )}
                        </button>
                    ))}

                    {cameras.length === 0 && !isLoading && (
                        <div className="text-center py-12 px-6">
                            <Camera size={32} className="mx-auto text-zinc-200 mb-4" />
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">No cameras registered yet</p>
                        </div>
                    )}
                </div>

                {/* Main Viewport */}
                <div className="flex-1 bg-zinc-900 relative flex flex-col">
                    <AnimatePresence mode="wait">
                        {selectedCamera ? (
                            <div className="flex-1 flex flex-col relative">
                                {/* Camera Controls Header */}
                                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                                    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
                                        <div className="px-4 py-1.5 bg-zinc-900/80 rounded-xl">
                                            <span className="text-[10px] font-black text-white tracking-widest uppercase">{selectedCamera.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => changeQuality('SUBSTREAM')}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                                                    quality === 'SUBSTREAM' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-white/40 hover:text-white'
                                                }`}
                                            >
                                                360P
                                            </button>
                                            <button 
                                                onClick={() => changeQuality('HD')}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                                                    quality === 'HD' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-white/40 hover:text-white'
                                                }`}
                                            >
                                                1080P
                                            </button>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={toggleLive}
                                        className={`flex items-center gap-3 px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                                            isLive 
                                            ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                                            : 'bg-white text-black hover:scale-105'
                                        }`}
                                    >
                                        {isLive ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                        {isLive ? 'TERMINATE FEED' : 'START MONITORING'}
                                    </button>
                                </div>

                                {/* Frame Render */}
                                <div className="flex-1 flex items-center justify-center p-12">
                                    {isLive ? (
                                        <motion.img 
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            src={`${API_URL}/api/cameras/${selectedCamera.camera_id}/stream?token=${token}`}
                                            className="w-full h-full object-contain rounded-3xl shadow-2xl ring-1 ring-white/10"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : (
                                        <div className="text-center space-y-6 opacity-40">
                                            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 mx-auto">
                                                <Shield size={40} className="text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-white tracking-tight uppercase">Connection Ready</h3>
                                                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Select a quality level and start monitoring</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 hidden flex items-center justify-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span className="text-sm font-black uppercase tracking-widest text-white/40">Stream Offline or Unreachable</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Info Footer */}
                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
                                    <div className="flex items-center gap-6 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{isLive ? 'Active Tunnel' : 'Tunnel Closed'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Wifi size={14} className="text-white/20" />
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{quality === 'HD' ? 'Bandwidth: ~1.5 Mbps' : 'Bandwidth: ~200 Kbps'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/10 italic text-[10px]">
                                        <Shield size={12} /> Proxied via Backend Securely
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center max-w-sm px-12">
                                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/5 mx-auto mb-8 shadow-inner">
                                        <Globe className="w-16 h-16 text-white/10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-4">No Camera Selected</h3>
                                    <p className="text-sm font-bold text-white/20 uppercase tracking-widest leading-relaxed">Select a lab camera from the sidebar to establish a live monitoring bridge.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Registration Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] p-10 w-full max-w-lg relative shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-bl-full blur-3xl pointer-events-none" />
                            
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase mb-2">New Camera</h2>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-8">Establish a new IP stream gateway</p>

                                <div className="space-y-6">
                                    {error && (
                                        <div className="bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                                            {error}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Camera Label</label>
                                        <input 
                                            value={newCamName} onChange={(e) => setNewCamName(e.target.value)}
                                            placeholder="e.g. Main Lab Entrance"
                                            className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 placeholder:text-zinc-300 focus:ring-2 ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Local RTSP URL</label>
                                        <input 
                                            value={newCamUrl} onChange={(e) => setNewCamUrl(e.target.value)}
                                            placeholder="rtsp://admin:pass@192.168.1.x:554"
                                            className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 placeholder:text-zinc-300 focus:ring-2 ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                        />
                                        <div className="flex items-center gap-2 mt-2 ml-4">
                                            <Info size={12} className="text-orange-500" />
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Proxied via main backend securely</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Host Node ID</label>
                                        <input 
                                            value={newCamHost} onChange={(e) => setNewCamHost(e.target.value)}
                                            placeholder="e.g. 5902"
                                            className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 placeholder:text-zinc-300 focus:ring-2 ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                        />
                                        <div className="flex items-center gap-2 mt-2 ml-4">
                                            <Info size={12} className="text-orange-500" />
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">The ID of the local PC relaying this camera</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-12">
                                    <button 
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 px-8 py-4 border border-zinc-200 text-zinc-400 rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleAddCamera}
                                        disabled={isSubmitting}
                                        className="flex-2 px-12 py-4 bg-zinc-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Adding...' : 'Establish Gateway'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
