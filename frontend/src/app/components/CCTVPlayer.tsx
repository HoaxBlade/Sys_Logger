'use client';

import React from 'react';

interface CCTVPlayerProps {
    cameraId: number;
    name: string;
    status: string;
    apiUrl: string;
    token: string;
    onDelete?: (id: number) => void;
}

export default function CCTVPlayer({ cameraId, name, status, apiUrl, token, onDelete }: CCTVPlayerProps) {
    const streamUrl = `${apiUrl}/api/cameras/${cameraId}/stream?token=${token}`;

    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden relative group h-full flex flex-col">
            <div className="p-3 bg-gray-900/80 flex justify-between items-center z-10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <h3 className="text-sm font-medium text-gray-200 truncate">{name}</h3>
                </div>
                {onDelete && (
                    <button 
                        onClick={() => onDelete(cameraId)}
                        className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove Camera"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>
            
            <div className="relative flex-grow bg-black flex items-center justify-center min-h-[200px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={streamUrl} 
                    alt={`Stream from ${name}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                />
                <div className="absolute inset-0 hidden flex items-center justify-center text-gray-500">
                    <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-xs">Stream Offline or Error</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
