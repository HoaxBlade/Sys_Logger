'use client'

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UsageGraph } from './components/UsageGraph'
import { OrgManager } from './components/OrgManager'
import { useUsageData } from './components/hooks/useUsageData'
import { useUnits } from './components/hooks/useUnits'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { Unit, UsageData } from './components/types'
import {
    Monitor, Server, Database, Globe,
    ChevronRight, Download, Cpu, HardDrive,
    Wifi, Zap, Clock, AlertTriangle,
    Terminal, Pencil, Trash2, X, Save, Activity, Menu, ArrowLeft, Shield, LogOut
} from 'lucide-react'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface DashboardViewProps {
    orgId?: string
}

interface PricingPlan {
    plan_id: number;
    name: string;
    slug: string;
    price_monthly: number;
    node_limit: number;
    features: string[];
    is_active: boolean;
}


import { useAuth } from './components/AuthContext';
import { useRouter } from 'next/navigation';

// ----------------------------------------------------------------------

const getHealthStatus = (unit: Unit) => {
    if (unit.status !== 'online') return 'inactive';
    const cpu = unit.metrics?.cpu ?? 0;
    const ram = unit.metrics?.ram ?? 0;
    
    if (cpu > 90 || ram > 90) return 'critical';
    if (cpu > 70 || ram > 80) return 'warning';
    return 'healthy';
};

const CompactStatCard = ({ unit, onClick }: { unit: Unit; onClick: () => void }) => {
    const { user } = useAuth();
    const isOnline = unit.status === 'online';
    const isPending = unit.status === 'pending';
    const metrics = unit.metrics;
    const status = getHealthStatus(unit);

    return (
        <motion.button
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "flex flex-col p-6 rounded-[2.5rem] text-left group relative overflow-hidden transition-all duration-500",
                isOnline
                    ? "bg-white/60 backdrop-blur-3xl ring-1 ring-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.12)] hover:ring-orange-200/50"
                    : "bg-white/20 backdrop-blur-md ring-1 ring-zinc-200/50 opacity-70 grayscale hover:grayscale-0 hover:opacity-100"
            )}
        >
            {/* Background Accent */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 transition-colors duration-700",
                isOnline ? "bg-orange-500/10 group-hover:bg-orange-500/20" : "bg-zinc-400/5"
            )} />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            (user?.role === 'ROOT' && isOnline) ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" :
                            status === 'healthy' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" : 
                            status === 'warning' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" :
                            status === 'critical' ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse" :
                            isPending ? "bg-orange-400 animate-bounce" : "bg-zinc-300"
                        )} />
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em]",
                            (user?.role === 'ROOT' && (status === 'healthy' || status === 'warning')) ? "text-emerald-600" :
                            status === 'healthy' ? "text-emerald-600" :
                            status === 'warning' ? "text-amber-600" :
                            status === 'critical' ? "text-red-600" :
                            "text-zinc-400"
                        )}>
                            {status === 'healthy' ? 'Connected' : 
                             status === 'warning' ? 'Busy' :
                             status === 'critical' ? 'Critical' :
                             isPending ? 'Waiting' : 'Disconnected'}
                        </span>
                    </div>
                    <h3 className="font-black text-lg tracking-tighter text-zinc-900 truncate leading-none mt-1">
                        {unit.name.split('/').pop()}
                    </h3>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5 text-zinc-400 group-hover:text-orange-500 transition-all duration-300">
                    <ChevronRight size={18} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-5 relative z-10">
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                            <Cpu size={11} /> CPU
                        </span>
                        <span className="text-[10px] font-black text-zinc-900 font-mono">
                            {metrics?.cpu !== undefined ? metrics.cpu.toFixed(0) : '0'}%
                        </span>
                    </div>
                    <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${metrics?.cpu || 0}%` }}
                            className={cn(
                                "h-full rounded-full transition-colors",
                                (metrics?.cpu || 0) > 80 ? 'bg-orange-500' : 'bg-zinc-900'
                            )} 
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                            <HardDrive size={11} /> RAM
                        </span>
                        <span className="text-[10px] font-black text-zinc-900 font-mono">
                            {metrics?.ram !== undefined ? metrics.ram.toFixed(0) : '0'}%
                        </span>
                    </div>
                    <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${metrics?.ram || 0}%` }}
                            className="h-full bg-zinc-900 rounded-full" 
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                            <Zap size={11} /> GPU
                        </span>
                        <span className="text-[10px] font-black text-zinc-900 font-mono">
                            {metrics?.gpu !== undefined ? metrics.gpu.toFixed(0) : '0'}%
                        </span>
                    </div>
                    <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${metrics?.gpu || 0}%` }}
                            className="h-full bg-emerald-500 rounded-full" 
                        />
                    </div>
                </div>

                <div className="space-y-1.5 text-right">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1 justify-end mb-1">
                        <Wifi size={11} /> NET
                    </span>
                    <p className="text-lg font-black font-mono text-zinc-900 tracking-tighter leading-none">
                        {metrics?.network_rx !== undefined ? metrics.network_rx.toFixed(1) : '0'}<span className="text-[9px] opacity-30 ml-0.5 whitespace-nowrap">MB/s</span>
                    </p>
                </div>
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-100/50 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <Globe size={12} className="text-zinc-300" />
                    <span className="text-[10px] font-bold text-zinc-400 tracking-tight">{unit.ip || 'DISCONNECTED'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-zinc-300" />
                    <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest" suppressHydrationWarning>
                        {unit.last_seen ? new Date(unit.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NEVER'}
                    </span>
                </div>
            </div>
        </motion.button>
    );
};

export default function DashboardView({ orgId: propOrgId }: DashboardViewProps) {
    const { user, token, logout, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [token, isLoading, router]);

    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
    const [mockUsageData, setMockUsageData] = useState<UsageData[]>([])
    const [currentTime, setCurrentTime] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    const [viewOrgId] = useState<string | null>(propOrgId || null)
    const [filterStatus, setFilterStatus] = useState<'all' | 'connected' | 'warning' | 'critical' | 'disconnected'>('all')

    // Real API Hooks
    const apiUsage = useUsageData(viewOrgId || undefined)
    const apiUnits = useUnits(viewOrgId || undefined)

    // Sync selected unit with usage hook
    useEffect(() => {
        if (selectedUnit) {
            apiUsage.setSelectedUnitId(selectedUnit.id);
        } else {
            apiUsage.setSelectedUnitId(null);
        }
    }, [selectedUnit, apiUsage]);

    // Determine which data to use
    const units = apiUnits.units
    const sortedUnits = useMemo(() => {
        let filtered = [...units];
        
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(u => 
                u.name.toLowerCase().includes(q) || 
                (u.ip && u.ip.toLowerCase().includes(q)) ||
                (u.org_name && u.org_name.toLowerCase().includes(q))
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(u => {
                const health = getHealthStatus(u);
                if (filterStatus === 'connected') return u.status === 'online';
                if (filterStatus === 'disconnected') return u.status === 'offline';
                if (filterStatus === 'warning') return health === 'warning';
                if (filterStatus === 'critical') return health === 'critical';
                return true;
            });
        }

        return filtered.sort((a, b) => {
            // 1. Primary Sort: Health Status (Critical/Warning first)
            const aHealth = getHealthStatus(a);
            const bHealth = getHealthStatus(b);
            const healthOrder = { critical: 0, warning: 1, healthy: 2, inactive: 3 };
            if (healthOrder[aHealth] !== healthOrder[bHealth]) {
                return healthOrder[aHealth] - healthOrder[bHealth];
            }
            
            // 2. Secondary Sort: Status (Online first)
            if (a.status === 'online' && b.status !== 'online') return -1;
            if (a.status !== 'online' && b.status === 'online') return 1;
            
            // 3. Tertiary Sort: Name
            return a.name.localeCompare(b.name);
        });
    }, [units, searchQuery, filterStatus]);

    const usageData = apiUsage.data
    const loading = apiUnits.loading
    const selectedUnitId = apiUsage.selectedUnitId

    const [activeTab, setActiveTab] = useState<'metrics' | 'logs' | 'management'>('metrics')
    const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'gpu' | 'ram' | 'network_rx'>('cpu')


    const [isEditing, setIsEditing] = useState(false)
    const [editModeData, setEditModeData] = useState({ org_id: '', comp_id: '' })
    const [isDeleting, setIsDeleting] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Add Node State
    const [isAddNodeOpen, setIsAddNodeOpen] = useState(false)
    const [newNodeName, setNewNodeName] = useState('')
    const [isDownloading, setIsDownloading] = useState(false)
    const [addNodeError, setAddNodeError] = useState('')
    const [generatedLink, setGeneratedLink] = useState('')
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
    const [plans, setPlans] = useState<PricingPlan[]>([])
    const [paymentLoading, setPaymentLoading] = useState<string | null>(null)
    const [isReportModalOpen, setIsReportModalOpen] = useState(false)
    const [reportTarget, setReportTarget] = useState<{id: string, name: string, type: 'node' | 'org'}>({id: '', name: '', type: 'node'})
    const [logoIndex, setLogoIndex] = useState(0)

    // Dynamic logos configuration
    const logos = useMemo(() => [
        { img: '/krishishayogi.png', title: 'KRISHI SAHAYOGI', pre: 'BUILT BY', sub: 'NIELIT BHUBANESHWAR', bgClass: 'bg-zinc-900 shadow-inner', imgClass: '' },
        { img: '/Nielit_logo.jpeg', title: 'NIELIT', pre: 'POWERED BY', sub: 'BHUBANESWAR CENTRE', bgClass: 'bg-white ring-1 ring-zinc-200', imgClass: 'mix-blend-multiply opacity-90' },
        { img: '/India-AI_logo.jpeg', title: 'INDIA AI', pre: 'SUPPORTED BY', sub: 'MIN. OF ELECTRONICS & IT', bgClass: 'bg-white ring-1 ring-zinc-200', imgClass: 'mix-blend-multiply opacity-90' }
    ], [])

    // Clock and Carousel Timers
    useEffect(() => {
        const timeInterval = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000)

        const logoInterval = setInterval(() => {
            setLogoIndex((prev) => (prev + 1) % logos.length)
        }, 3000)

        // Load Razorpay & fetch plans
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        fetch('/api/pricing')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => { if (Array.isArray(data) && data.length > 0) setPlans(data) })
            .catch(() => setPlans([
                { plan_id: 2, name: "Pro", slug: "pro", price_monthly: 99, node_limit: 5, features: ["5 Active Nodes", "Advanced Metrics", "Priority Support"], is_active: true },
                { plan_id: 3, name: "Business", slug: "business", price_monthly: 199, node_limit: 10, features: ["10 Nodes", "Global Fleet Control", "24/7 Support"], is_active: true }
            ]))

        return () => {
            clearInterval(timeInterval)
            clearInterval(logoInterval)
            if (document.body.contains(script)) document.body.removeChild(script);
        }
    }, [logos.length])

    const handlePayment = async (plan: PricingPlan) => {
        setPaymentLoading(plan.slug);
        try {
            const orderResp = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ plan_slug: plan.slug })
            });
            const orderData = await orderResp.json();
            if (!orderResp.ok) throw new Error(orderData.error || 'Failed to create order');

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "SysLogger",
                description: `Upgrade to ${plan.name} Plan`,
                order_id: orderData.order_id,
                handler: async (response: any) => {
                    const verifyResp = await fetch('/api/payments/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });
                    const verifyData = await verifyResp.json();
                    if (verifyResp.ok) {
                        setIsUpgradeModalOpen(false);
                        alert(`✅ Upgraded to ${verifyData.tier}! You can now add more monitors.`);
                        apiUnits.refetchUnits();
                    } else {
                        alert('Payment verification failed: ' + verifyData.error);
                    }
                },
                prefill: { name: '', email: user?.email || '' },
                theme: { color: '#f97316' }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err: any) {
            alert(err.message || 'Payment failed to initiate');
        } finally {
            setPaymentLoading(null);
        }
    };

    useEffect(() => {
        if (selectedUnitId && units.length > 0) {
            const updatedUnit = units.find(u => u.id === selectedUnitId)
            if (updatedUnit) setSelectedUnit(updatedUnit)
        }
    }, [units, selectedUnitId])

    const handleUnitToggle = (unit: Unit) => {
        if (selectedUnitId === unit.id) {
            setIsMobileMenuOpen(false)
            return;
        }
        setSelectedUnit(unit)
        apiUsage.setSelectedUnitId(unit.id)
        setIsEditing(false)
        setIsMobileMenuOpen(false)
        setSelectedMetric('cpu') // Reset to CPU when switching units
    }

    const clearSelection = () => {
        setSelectedUnit(null)
        apiUsage.setSelectedUnitId(null)
        setIsEditing(false)
    }

    const handleCustomDownload = () => {
        if (!selectedUnit) return
        setReportTarget({
          id: selectedUnit.id.toString(),
          name: (selectedUnit.name || 'Unknown Node').split('/').pop() || '',
          type: 'node'
        })
        setIsReportModalOpen(true)
    }

    const triggerRawExport = (id: string, range: string) => {
      window.open(`/api/units/${id}/export?range=${range}`, '_blank')
    }

    const triggerIntelligentReport = (id: string, type: 'node' | 'org', range: string) => {
      window.open(`/report/${type}/${id}?range=${range}`, '_blank')
    }

    const handleUpdateUnit = async () => {
        if (!selectedUnit) return
        try {
            const response = await fetch(`/api/units/${selectedUnit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editModeData)
            })
            if (response.ok) {
                const updatedUnit = await response.json()
                setSelectedUnit(updatedUnit)
                setIsEditing(false)
            }
        } catch (err) {
            console.error('Failed to update unit:', err)
        }
    }

    const handleDeleteUnit = async () => {
        if (!selectedUnit) return
        if (!confirm(`Are you sure you want to permanently delete ${selectedUnit.name}? All history will be lost.`)) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/units/${selectedUnit.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                clearSelection()
                apiUnits.refetchUnits()
            }
        } catch (err) {
            console.error('Failed to delete unit:', err)
        } finally {
            setIsDeleting(false)
        }
    }

    const downloadInstaller = async (compName: string) => {
        setIsDownloading(true)
        setAddNodeError('')

        try {
            const response = await fetch('/api/units/download-installer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ comp_id: compName })
            })

            if (!response.ok) {
                const data = await response.json()
                // Check for limit_reached error and open upgrade modal
                if (data.error === 'limit_reached') {
                    setIsAddNodeOpen(false)
                    setIsUpgradeModalOpen(true)
                    return false
                }
                setAddNodeError(data.message || 'Failed to download installer')
                return false
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `sys_logger_installer_${compName}.zip`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            return true
        } catch (err) {
            console.error('Download error:', err)
            setAddNodeError('Connection failure while preparing installer')
            return false
        } finally {
            setIsDownloading(false)
        }
    }

    const handleAddNode = async () => {
        if (!newNodeName.trim()) {
            setAddNodeError('Unit Name is required')
            return
        }

        const success = await downloadInstaller(newNodeName)
        if (success) {
            setIsAddNodeOpen(false)
            setNewNodeName('')
            apiUnits.refetchUnits()
        }
    }

    const handleGenerateLink = async (compName: string) => {
        if (!compName.trim()) {
            setAddNodeError('Unit Name is required')
            return
        }

        setIsDownloading(true)
        setAddNodeError('')
        setGeneratedLink('')

        try {
            const response = await fetch('/api/units/generate-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ comp_id: compName })
            })

            const data = await response.json()
            if (!response.ok) {
                if (data.error === 'limit_reached') {
                    setIsAddNodeOpen(false)
                    setIsUpgradeModalOpen(true)
                    return false
                }
                setAddNodeError(data.message || 'Failed to generate link')
                return false
            }

            const fullUrl = window.location.origin + data.download_url;
            setGeneratedLink(fullUrl)
            return true
        } catch (err) {
            console.error('Link generation error:', err)
            setAddNodeError('Connection failure while generating link')
            return false
        } finally {
            setIsDownloading(false)
        }
    }

    const systemHealth = useMemo(() => {
        if (!usageData.length) return 100
        const last = usageData[usageData.length - 1]
        const cpu = last.cpu ?? last.cpu_usage ?? 0
        const ram = last.ram ?? last.ram_usage ?? 0
        return Math.max(0, 100 - (cpu * 0.6 + ram * 0.4))
    }, [usageData])

    const lastData = usageData.length > 0 ? usageData[usageData.length - 1] : null
    const activeUnits = units.filter(u => u.status === 'online').length
    const totalUnits = units.length

    // Data for the Mini-Cards
    const currentMetrics = useMemo(() => [
        { id: 'cpu', title: 'Processing', label: 'CPU Load', value: (lastData?.cpu ?? lastData?.cpu_usage ?? 0).toFixed(1), unit: '%', icon: <Cpu className="w-5 h-5" />, color: 'orange', info: 'Shows how hard the processor is working. High usage may slow down the system.' },
        { id: 'gpu', title: 'Graphics', label: 'GPU Status', value: (lastData?.gpu ?? lastData?.gpu_load ?? 0).toFixed(1), unit: '%', icon: <Zap className="w-5 h-5" />, color: 'emerald', info: 'Usage of graphics hardware. Important for visual processing and complex calculations.' },
        { id: 'ram', title: 'Memory', label: 'RAM Usage', value: (lastData?.ram ?? lastData?.ram_usage ?? 0).toFixed(1), unit: '%', icon: <HardDrive className="w-5 h-5" />, color: 'orange', info: 'Short-term memory usage. More memory usage means more apps are running at once.' },
        { id: 'network_rx', title: 'Network', label: 'Incoming', value: (lastData?.network_rx ?? 0).toFixed(3), unit: 'MB/s', icon: <Wifi className="w-5 h-5" />, color: 'orange', info: 'Speed of data coming into the system from the internet.' }
    ], [lastData])

    const activeMetricData = currentMetrics.find(m => m.id === selectedMetric)

    return (
        <div className="h-screen overflow-hidden bg-[#FAFAFA] text-zinc-900 font-sans flex flex-col p-2 sm:p-4 lg:p-6 gap-4 lg:gap-6 relative selection:bg-orange-500/20">
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    .h-screen { height: auto !important; overflow: visible !important; }
                    aside, header, .sidebar-filters, .action-buttons { display: none !important; }
                    .main-content { padding: 0 !important; margin: 0 !important; width: 100% !important; }
                    .glass-panel { background: white !important; box-shadow: none !important; border: 1px solid #eee !important; }
                }
                .print-only { display: none; }
            `}</style>
            
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-center items-center">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[60%] bg-orange-500/5 blur-[200px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[60%] bg-orange-600/5 blur-[200px] rounded-full" />
            </div>

            {/* HEADER SECTION */}
            <header className="bg-white ring-1 ring-zinc-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl px-4 lg:px-6 py-3 lg:py-4 flex justify-between items-center z-20 shrink-0">
                <div className="flex items-center gap-3 lg:gap-6">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 hover:text-orange-600 rounded-lg transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-3 lg:pr-6">

                        <button
                            onClick={() => {
                                if (selectedUnit) {
                                    clearSelection();
                                } else {
                                    router.push('/');
                                }
                            }}
                            className="hidden sm:flex items-center justify-center w-10 h-10 bg-zinc-100 text-zinc-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors shadow-sm"
                            title={selectedUnit ? "Back to Fleet Overview" : "Return to Home"}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        <button
                            onClick={clearSelection}
                            className="text-left group"
                        >
                            <h1 className="text-xl lg:text-2xl font-black tracking-tight text-zinc-900 uppercase group-hover:text-orange-600 transition-colors">
                                Dashboard
                            </h1>
                        </button>
                    </div>
                </div>

                {/* Branding in Header */}
                <div className="hidden xl:flex items-center gap-6 px-6 border-l border-zinc-100 ml-6">
                    <div className="flex flex-col items-end mr-6 pr-6 border-r border-zinc-100">
                        <div className="flex items-center gap-1.5 lg:gap-2 text-zinc-800 font-mono font-bold text-sm lg:text-base tracking-tight">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            {currentTime}
                        </div>
                        <span className="text-[9px] text-green-600 flex items-center gap-1.5 font-bold uppercase tracking-[0.1em] mt-1 bg-green-50 px-2.5 py-0.5 rounded-md ring-1 ring-green-200/50">
                            <Shield className="w-3 h-3 text-green-500" />
                            <span className="hidden sm:inline">Connection Secure</span>
                            <span className="sm:hidden">Secure</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="https://www.krishisahayogi.in/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                            <img src="/krishishayogi.png" alt="Krishi Sahayogi" className="h-16 lg:h-20 object-contain mix-blend-multiply scale-125" />
                        </a>
                        <div className="h-12 w-[1px] bg-zinc-100" />
                        <img src="/Nielit_logo.jpeg" alt="NIELIT" className="h-12 object-contain mix-blend-multiply" />
                        <img src="/India-AI_logo.jpeg" alt="India AI" className="h-12 object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">Built by</span>
                        <span className="text-sm font-black text-orange-600 uppercase tracking-tighter leading-none">Krishi Sahayogi</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden gap-6 relative z-10 min-w-0 min-h-0">

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-[100] lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <aside className={cn(
                    "fixed inset-y-0 left-0 z-[110] w-[85%] sm:w-80 bg-white/40 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(249,115,22,0.15)] lg:border border-white/60 lg:ring-1 lg:ring-white/40 lg:rounded-[2.5rem] flex flex-col shrink-0 overflow-hidden lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    {/* Header: Menu Title */}
                    <div className="flex items-center justify-between p-4 border-b border-white/60 lg:hidden bg-white/60 backdrop-blur-md">
                        <span className="font-black text-zinc-800 text-xs tracking-widest uppercase flex items-center gap-2">
                            <Activity size={16} className="text-orange-500" /> System Control
                        </span>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-1.5 text-zinc-400 hover:text-orange-600 bg-white/50 hover:bg-white/90 rounded-xl transition-all shadow-sm"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Fleet Health Meter */}
                    <div className="p-5 lg:p-6 border-b border-white/60 bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-xl shadow-sm z-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-bl-full blur-2xl pointer-events-none group-hover:bg-orange-400/20 transition-colors duration-700" />
                        
                        <div className="flex justify-between items-end mb-4 relative z-10">
                            <div>
                                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">System Health</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-zinc-900 tracking-tighter">
                                        {totalUnits > 0 ? Math.round((activeUnits / totalUnits) * 100) : 100}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[9px] font-black text-emerald-600 ring-1 ring-emerald-100 uppercase tracking-tighter">
                                    {activeUnits} Connected
                                </span>
                                {user?.role !== 'ROOT' && units.some(u => getHealthStatus(u) === 'warning' || getHealthStatus(u) === 'critical') && (
                                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-[9px] font-black text-red-600 ring-1 ring-red-100 uppercase tracking-tighter animate-pulse">
                                        {units.filter(u => getHealthStatus(u) === 'warning' || getHealthStatus(u) === 'critical').length} Issues
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="w-full bg-zinc-200/50 rounded-full h-1.5 overflow-hidden shadow-inner relative z-10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${totalUnits > 0 ? (activeUnits / totalUnits) * 100 : 0}%` }}
                                className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full shadow-[0_0_12px_rgba(249,115,22,0.4)] relative"
                            >
                                <div className="absolute inset-0 bg-white/20 blur-[1px]" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Quick Search */}
                    <div className="px-5 py-4 bg-white/10">
                        <div className="relative group">
                            <Monitor size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/50 backdrop-blur-md rounded-2xl py-3 pl-10 pr-4 text-[11px] font-bold text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 ring-1 ring-white/60 transition-all shadow-sm"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons & Filters */}
                    <div className="px-4 lg:px-5 flex flex-col gap-4 pb-2">
                        {/* Quick Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear-right">
                            {(['all', 'connected', 'warning', 'critical', 'disconnected'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ring-1",
                                        filterStatus === status
                                            ? "bg-zinc-900 text-white ring-zinc-900 shadow-md"
                                            : "bg-white/50 text-zinc-500 ring-white/60 hover:bg-white hover:text-zinc-800"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        
                        <button
                            onClick={() => setIsAddNodeOpen(true)}
                            className="w-full py-4 bg-zinc-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:scale-[1.01] active:scale-95 transition-all duration-300 group ring-1 ring-zinc-800/50"
                        >
                            <Zap className="w-4 h-4 text-orange-400 group-hover:text-orange-300 group-hover:drop-shadow-[0_0_8px_rgba(251,146,60,0.8)] transition-all" />
                            Set Up Monitor
                        </button>

                        {user?.role === 'ROOT' && (
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        setActiveTab(activeTab === 'management' ? 'metrics' : 'management');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "w-full py-3.5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2.5 transition-all duration-300 ring-1 shadow-sm hover:scale-[1.01] active:scale-95",
                                        activeTab === 'management'
                                            ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.3)] ring-orange-400/50"
                                            : "bg-white/60 backdrop-blur-md text-zinc-600 hover:bg-white hover:text-orange-500 ring-white hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)]"
                                    )}
                                >
                                    <Shield className="w-4 h-4" />
                                    {activeTab === 'management' ? 'Exit Settings' : 'System Settings'}
                                </button>
                                
                                {activeTab === 'management' && user?.org_id && (
                                    <button
                                        onClick={() => {
                                            setReportTarget({
                                                id: user.org_id.toString(),
                                                name: 'Full Health Report',
                                                type: 'org'
                                            });
                                            setIsReportModalOpen(true);
                                        }}
                                        className="w-full py-3.5 bg-zinc-900 border border-zinc-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2.5 hover:bg-zinc-800 transition-all hover:scale-[1.01] shadow-lg shadow-zinc-900/10"
                                    >
                                        <Activity className="w-4 h-4 text-orange-400" />
                                        Download Health Report
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation / Node List */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-6 no-scrollbar bg-white/5 relative mt-2">
                        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10" />
                        
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-8 gap-4">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-8 h-8 border-2 border-zinc-200 border-t-orange-500 rounded-full"
                                />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Syncing Systems...</span>
                            </div>
                        ) : units.length === 0 ? (
                            <div className="text-center p-10 bg-white/40 rounded-3xl border border-dashed border-zinc-200 m-2">
                                <Server className="w-8 h-8 text-zinc-300 mx-auto mb-3 opacity-50" />
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">No Systems Found</p>
                            </div>
                        ) : (
                            Object.entries(
                                sortedUnits.reduce((acc, unit) => {
                                    const org = unit.org_name || 'Global';
                                    if (!acc[org]) acc[org] = [];
                                    acc[org].push(unit);
                                    return acc;
                                }, {} as Record<string, Unit[]>)
                            ).map(([org, orgUnits]) => (
                                <div key={org} className="space-y-3">
                                    <div className="flex items-center gap-3 px-1 mb-3">
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 px-2">
                                            {org}
                                        </span>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                                    </div>
                                    <div className="space-y-2.5">
                                        {orgUnits.map((unit) => {
                                            const isSelected = selectedUnitId === unit.id;
                                            const isOnline = unit.status === 'online';
                                            const isPending = unit.status === 'pending';

                                            return (
                                                <motion.div
                                                    key={unit.id}
                                                    whileHover={{ x: 4 }}
                                                    onClick={() => handleUnitToggle(unit)}
                                                    className={cn(
                                                        "w-full text-left p-4 rounded-[1.5rem] transition-all duration-300 relative overflow-hidden group/card cursor-pointer",
                                                        isSelected
                                                            ? 'bg-white shadow-[0_12px_30px_rgba(249,115,22,0.12)] ring-1 ring-orange-400/50 scale-[1.02]'
                                                            : 'hover:bg-white hover:shadow-xl hover:shadow-zinc-900/5'
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("p-2.5 rounded-2xl transition-all duration-300",
                                                                isSelected 
                                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                                                                    : 'bg-zinc-100 text-zinc-400 group-hover/card:bg-orange-50 group-hover/card:text-orange-500'
                                                            )}>
                                                                <Monitor size={16} />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className={cn("font-black truncate text-[13px] tracking-tight transition-colors", isSelected ? 'text-zinc-900' : 'text-zinc-700 group-hover/card:text-zinc-900')}>
                                                                    {unit.name.split('/').pop()}
                                                                </span>
                                                                <span className={cn("text-[9px] font-bold transition-opacity", 
                                                                    (user?.role === 'ROOT' && (getHealthStatus(unit) === 'healthy' || getHealthStatus(unit) === 'warning')) ? 'text-emerald-500' :
                                                                    getHealthStatus(unit) === 'healthy' ? 'text-emerald-500' : 
                                                                    getHealthStatus(unit) === 'warning' ? 'text-amber-500' :
                                                                    getHealthStatus(unit) === 'critical' ? 'text-red-500' :
                                                                    isPending ? 'text-orange-500 animate-pulse' : 'text-zinc-400 opacity-60'
                                                                )}>
                                                                    {getHealthStatus(unit) === 'healthy' ? 'CONNECTED' : 
                                                                     getHealthStatus(unit) === 'warning' ? 'HIGH LOAD' :
                                                                     getHealthStatus(unit) === 'critical' ? 'CRITICAL' :
                                                                     isPending ? 'WAITING' : 'DISCONNECTED'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0 shadow-sm transition-colors",
                                                            (user?.role === 'ROOT' && isOnline) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                                                            getHealthStatus(unit) === 'healthy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                                                            getHealthStatus(unit) === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' :
                                                            getHealthStatus(unit) === 'critical' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]' :
                                                            isPending ? 'bg-orange-400 animate-pulse' : 'bg-zinc-300'
                                                        )} />
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer: User Identity */}
                    <div className="p-4 border-t border-white/60 bg-white/40 backdrop-blur-2xl">
                        <div className="p-4 bg-zinc-900 rounded-[1.75rem] shadow-xl group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-orange-500/20 transition-colors" />
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-2xl flex items-center justify-center text-orange-400 font-black text-xs ring-1 ring-white/10 shadow-lg">
                                    {user?.email.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-white truncate tracking-tight lowercase opacity-90">{user?.email}</p>
                                    <p className="text-[9px] font-black text-orange-500/80 uppercase tracking-[0.2em] mt-0.5">{user?.role}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all"
                                    title="Exit Terminal"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>


                {/* ADD MONITOR MODAL */}
                <AnimatePresence>
                    {isAddNodeOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsAddNodeOpen(false)}
                                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-10 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-emerald-500" />

                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-3 bg-zinc-900 rounded-2xl shadow-lg shadow-zinc-900/20">
                                        <Activity className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <button
                                        onClick={() => setIsAddNodeOpen(false)}
                                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <h2 className="text-2xl font-black text-zinc-900 mb-2 tracking-tight">Add New Monitor.</h2>
                                <p className="text-sm font-medium text-zinc-500 mb-8">Deploy a telemetry agent to your system</p>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Unit Identifier</label>
                                        <div className="relative">
                                            <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                            <input
                                                type="text"
                                                value={newNodeName}
                                                onChange={(e) => setNewNodeName(e.target.value)}
                                                className="w-full bg-zinc-50 border-none ring-1 ring-zinc-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500/20 transition-all font-bold placeholder:text-zinc-300"
                                                placeholder="e.g. primary-server"
                                            />
                                        </div>
                                    </div>

                                    {addNodeError && (
                                        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-black ring-1 ring-red-100 animate-shake">
                                            <AlertTriangle className="w-4 h-4" />
                                            {addNodeError.toUpperCase()}
                                        </div>
                                    )}

                                    <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-orange-500 rounded-lg shadow-sm">
                                                <Download className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Generated Bundle</span>
                                        </div>
                                        <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                                            We will generate a specialized ZIP package pre-configured for your account. Simply extract and run <code className="font-black text-orange-600">install.bat</code>.
                                        </p>
                                    </div>

                                    {generatedLink ? (
                                        <div className="flex flex-col gap-3">
                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Shareable Link</span>
                                                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full">Valid for 24h</span>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    readOnly 
                                                    value={generatedLink} 
                                                    className="w-full bg-white border-none ring-1 ring-emerald-200 rounded-xl py-3 px-4 text-xs font-mono text-zinc-600 focus:outline-none"
                                                    onClick={(e) => { e.currentTarget.select(); navigator.clipboard.writeText(generatedLink); }}
                                                />
                                                <p className="text-[10px] text-emerald-600 font-medium">Click the link above to copy it to your clipboard. Share it with your team to install the agent without logging in.</p>
                                            </div>
                                            <button
                                                onClick={() => { setIsAddNodeOpen(false); setNewNodeName(''); setGeneratedLink(''); apiUnits.refetchUnits(); }}
                                                className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-md"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={handleAddNode}
                                                disabled={isDownloading}
                                                className="flex-1 bg-zinc-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50 group shadow-lg"
                                            >
                                                {isDownloading ? (
                                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        Download directly
                                                        <Download className="w-3.5 h-3.5" />
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleGenerateLink(newNodeName)}
                                                disabled={isDownloading}
                                                className="flex-1 bg-white text-zinc-700 ring-1 ring-zinc-200 rounded-2xl py-4 font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2 hover:ring-zinc-300 hover:bg-zinc-50 transition-all disabled:opacity-50 group"
                                            >
                                                {isDownloading ? (
                                                    <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-700 rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        Generate Link
                                                        <Globe className="w-3.5 h-3.5" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* UPGRADE MODAL */}
                <AnimatePresence>
                    {isUpgradeModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsUpgradeModalOpen(false)}
                                className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] p-10 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-emerald-500" />
                                <button
                                    onClick={() => setIsUpgradeModalOpen(false)}
                                    className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>

                                <div className="mb-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 ring-1 ring-orange-200 mb-4">
                                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Node Limit Reached</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Upgrade Your Plan</h2>
                                    <p className="text-sm font-medium text-zinc-500">You've used all your available node slots. Upgrade below to unlock more monitors instantly.</p>
                                </div>

                                {plans && plans.length > 0 && (
                                    <div className="space-y-4">
                                        {plans
                                            .filter(p => p.price_monthly > 0) // Only show paid plans for upgrade
                                            .map((plan) => {
                                                const isCurrentPlan = user?.tier?.toUpperCase() === plan.slug.toUpperCase();
                                                const isRecommended = (user?.tier?.toUpperCase() === 'PRO' && plan.slug === 'business') ||
                                                    (user?.tier?.toUpperCase() !== 'PRO' && plan.slug === 'pro');

                                                return (
                                                    <div key={plan.plan_id} className={`relative flex items-center justify-between p-5 rounded-2xl ring-1 transition-all ${isRecommended ? 'ring-orange-300 bg-orange-50/50' : 'ring-zinc-200 bg-zinc-50/50'} ${isCurrentPlan ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                                                        {isRecommended && (
                                                            <div className="absolute -top-2.5 left-4 px-3 py-0.5 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                                                                Recommended
                                                            </div>
                                                        )}
                                                        {isCurrentPlan && (
                                                            <div className="absolute -top-2.5 left-4 px-3 py-0.5 bg-zinc-400 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                                                                Current Plan
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-black text-zinc-900 uppercase tracking-wider text-sm">{plan.name}</p>
                                                            <p className="text-xs font-medium text-zinc-500 mt-0.5">{plan.node_limit} Active Nodes • ₹{plan.price_monthly}/mo</p>
                                                        </div>
                                                        <button
                                                            onClick={() => !isCurrentPlan && handlePayment(plan)}
                                                            disabled={paymentLoading === plan.slug || isCurrentPlan}
                                                            className={`px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all disabled:opacity-50 ${isRecommended ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/10' : 'bg-white text-zinc-700 ring-1 ring-zinc-200 hover:ring-zinc-300'}`}
                                                        >
                                                            {paymentLoading === plan.slug ? (
                                                                <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                                            ) : isCurrentPlan ? 'Active' : 'Upgrade Now'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* LINK MODAL FOR ACTIVE NODES */}
                <AnimatePresence>
                    {generatedLink && !isAddNodeOpen && (!selectedUnit || selectedUnit.status !== 'pending') && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setGeneratedLink('')}
                                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-10 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-emerald-500" />
                                <button
                                    onClick={() => setGeneratedLink('')}
                                    className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                                <div className="mb-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200 mb-4">
                                        <Globe className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Link Generated</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Share Installer</h2>
                                    <p className="text-sm font-medium text-zinc-500">Copy the URL below. It will expire in 24 hours.</p>
                                </div>
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={generatedLink} 
                                    className="w-full bg-zinc-50 border-none ring-1 ring-zinc-200 rounded-xl py-4 px-4 text-xs font-mono text-zinc-600 focus:outline-none mb-6 text-center"
                                    onClick={(e) => { e.currentTarget.select(); navigator.clipboard.writeText(generatedLink); }}
                                />
                                <button
                                    onClick={() => { navigator.clipboard.writeText(generatedLink); setGeneratedLink(''); }}
                                    className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-md"
                                >
                                    Copy & Close
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* EXPORT & REPORT MODAL */}
                <AnimatePresence>
                    {isReportModalOpen && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsReportModalOpen(false)}
                                className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-12 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-zinc-900" />
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <div className="flex items-center gap-2 text-orange-500 mb-2">
                                            <Activity size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Fleet Audit Engine</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase whitespace-pre-line">Audit & Export{"\n"}Generation</h2>
                                        <p className="text-sm font-bold text-zinc-400 mt-2 uppercase tracking-wide">Target: <span className="text-zinc-900">{reportTarget.name}</span></p>
                                    </div>
                                    <button onClick={() => setIsReportModalOpen(false)} className="p-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 rounded-2xl transition-all"><X size={20} /></button>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1 block mb-3">1. Select Audit Timeframe</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {['1d', '7d', '30d', '1y'].map((r) => (
                                                <button 
                                                    key={r}
                                                    onClick={() => setReportTarget({ ...reportTarget, range: r } as any)}
                                                    className={cn(
                                                        "py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ring-1",
                                                        (reportTarget as any).range === r 
                                                            ? "bg-zinc-900 text-white ring-zinc-900 shadow-lg shadow-zinc-900/20" 
                                                            : "bg-white text-zinc-500 ring-zinc-100 hover:ring-zinc-300"
                                                    )}
                                                >
                                                    {r === '1d' ? '24H' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '1 Year'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <button 
                                            onClick={() => { triggerIntelligentReport(reportTarget.id, reportTarget.type, (reportTarget as any).range || '7d'); setIsReportModalOpen(false); }}
                                            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-[1.5rem] py-5 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-orange-500/20 transition-all border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
                                        >
                                            <Zap size={18} />
                                            View Intelligent Audit Report
                                        </button>
                                        <button 
                                            onClick={() => { triggerRawExport(reportTarget.id, (reportTarget as any).range || '7d'); setIsReportModalOpen(false); }}
                                            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-[1.5rem] py-5 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all"
                                        >
                                            <Download size={18} />
                                            Download Raw CSV Data
                                        </button>
                                    </div>

                                    <p className="text-[10px] text-center text-zinc-400 font-medium leading-relaxed italic">
                                        * Intelligent reports utilize heuristic patterns to detect bottlenecks, performance anomalies and provide automated resource advice.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <main className="flex-1 flex flex-col relative overflow-hidden w-full min-h-0">
                    <AnimatePresence mode="wait">
                        {activeTab === 'management' ? (
                            <motion.div
                                key="management"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar"
                            >
                                <OrgManager />
                            </motion.div>
                        ) : selectedUnit ? (
                            <motion.div
                                key={selectedUnit.id}
                                initial={{ opacity: 0, scale: 0.99, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.99, y: -5 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="flex-1 flex flex-col overflow-y-auto no-scrollbar h-full"
                            >
                                {/* ... existing unit view ... */}
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 bg-white p-5 lg:p-6 rounded-2xl lg:rounded-3xl ring-1 ring-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] gap-4">
                                    <div className="flex-1 w-full">
                                        {isEditing ? (
                                            <div className="flex flex-col gap-3 lg:gap-4 w-full">
                                                <div className="flex flex-col gap-3 lg:gap-4 relative">
                                                    <div className="w-full">
                                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Computer ID</label>
                                                        <input
                                                            type="text"
                                                            value={editModeData.comp_id}
                                                            onChange={(e) => setEditModeData({ ...editModeData, comp_id: e.target.value })}
                                                            className="w-full bg-zinc-50 ring-1 ring-zinc-200 rounded-xl p-3 text-sm font-bold text-zinc-800 focus:ring-orange-500 outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 lg:gap-3 mt-1 lg:mt-2">
                                                    <button onClick={handleUpdateUnit} className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-500 text-white rounded-xl px-4 lg:px-6 py-2.5 lg:py-3 text-[10px] lg:text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20">
                                                        <Save size={16} /> <span className="hidden sm:inline">Save Identity</span><span className="sm:hidden">Save</span>
                                                    </button>
                                                    <button onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none px-4 lg:px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl py-2.5 lg:py-3 text-[10px] lg:text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                                                        <X size={16} /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex flex-wrap items-center gap-3 lg:gap-4 mb-2 lg:mb-0">
                                                    <h2 className="text-3xl lg:text-4xl font-black text-zinc-900 tracking-tighter uppercase truncate max-w-full leading-none">{selectedUnit.name.split('/').pop()}</h2>
                                                    <div className={cn(
                                                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ring-1",
                                                        selectedUnit.status === 'online' 
                                                            ? 'bg-emerald-50 text-emerald-600 ring-emerald-200/50' 
                                                            : 'bg-red-50 text-red-600 ring-red-200/50'
                                                    )}>
                                                        {selectedUnit.status}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-6 mt-3 text-[11px] font-bold text-zinc-400">
                                                    <span className="flex items-center gap-2 pr-6 border-r border-zinc-100 uppercase tracking-widest"><Globe className="w-4 h-4 text-zinc-300" /> {selectedUnit.ip || 'DISCONNECTED'}</span>
                                                    <span className="flex items-center gap-2 uppercase tracking-widest font-mono"><Database className="w-4 h-4 text-zinc-300" /> {selectedUnit.id}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 lg:gap-5 border-t lg:border-t-0 border-zinc-100 pt-5 lg:pt-0 mt-3 lg:mt-0">
                                        <div className="flex items-center gap-2 bg-zinc-50/50 p-1.5 rounded-2xl ring-1 ring-zinc-200/50 shadow-inner">
                                            {!isEditing && (
                                                <button onClick={() => { setEditModeData({ org_id: selectedUnit.org_id || '', comp_id: selectedUnit.comp_id || '' }); setIsEditing(true); }} className="p-3 bg-white hover:bg-orange-50 hover:text-orange-600 text-zinc-400 rounded-xl transition-all shadow-sm ring-1 ring-zinc-200/20" title="Edit Identity">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => handleGenerateLink(selectedUnit.comp_id || selectedUnit.name.split('/').pop() || '')} disabled={isDownloading} className="p-3 bg-white hover:bg-blue-50 hover:text-blue-600 text-zinc-400 rounded-xl transition-all shadow-sm ring-1 ring-zinc-200/20 disabled:opacity-50" title="Get Installer Link">
                                                <Globe className="w-4 h-4" />
                                            </button>
                                            <button onClick={handleDeleteUnit} disabled={isDeleting} className="p-3 bg-white hover:bg-red-50 hover:text-red-600 text-zinc-400 rounded-xl transition-all shadow-sm ring-1 ring-zinc-200/20 disabled:opacity-50" title="Remove Node">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="mx-2 w-[1px] h-6 bg-zinc-200" />
                                            <button onClick={() => window.print()} className="p-3 bg-white hover:bg-zinc-900 hover:text-white text-zinc-400 rounded-xl transition-all shadow-sm ring-1 ring-zinc-200/20" title="Official Print">
                                                <Activity className="w-4 h-4" />
                                            </button>
                                            <div className="mx-2 w-[1px] h-6 bg-zinc-200" />
                                            <button onClick={handleCustomDownload} className="flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-all shadow-lg active:scale-95">
                                                <Download className="w-4 h-4" />
                                                <span className="hidden sm:inline text-[11px] font-black uppercase tracking-[0.2em]">Export Data</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {selectedUnit.status === 'pending' ? (
                                    <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
                                        <div className="max-w-xl w-full bg-white rounded-[2.5rem] border border-zinc-200/60 p-10 lg:p-12 text-center shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/20 via-orange-500 to-orange-500/20" />

                                            <div className="mb-8 relative inline-block">
                                                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center ring-4 ring-white shadow-xl">
                                                    <Download className="w-10 h-10 text-orange-500 animate-bounce" />
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 bg-zinc-900 text-white p-2 rounded-xl shadow-lg ring-4 ring-white">
                                                    <Shield className="w-4 h-4 text-emerald-400" />
                                                </div>
                                            </div>

                                            <h2 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">Awaiting Installation.</h2>
                                            <p className="text-zinc-500 font-medium mb-10 text-sm lg:text-base leading-relaxed">
                                                We've registered your unit <span className="text-zinc-900 font-black px-2 py-1 bg-zinc-100 rounded-lg">{selectedUnit.name.split('/').pop()}</span>.
                                                Now, you need to deploy the telemetry agent to start receiving live metrics.
                                            </p>

                                            <div className="space-y-4 mb-10">
                                                <div className="flex items-start gap-4 text-left p-5 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-orange-200 transition-colors">
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md">1</div>
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-1">Transfer Bundle</p>
                                                        <p className="text-xs font-bold text-zinc-700">Move the downloaded ZIP to your target server and extract it.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-left p-5 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-orange-200 transition-colors">
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md">2</div>
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-1">Single Command Install</p>
                                                        <p className="text-xs font-bold text-zinc-700">Open a terminal in the folder and run <code className="text-orange-600 font-black">install.bat</code>.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {generatedLink ? (
                                                <div className="flex flex-col gap-3">
                                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col gap-2 text-left">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Shareable Link</span>
                                                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full">Valid for 24h</span>
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            readOnly 
                                                            value={generatedLink} 
                                                            className="w-full bg-white border-none ring-1 ring-emerald-200 rounded-xl py-3 px-4 text-xs font-mono text-zinc-600 focus:outline-none"
                                                            onClick={(e) => { e.currentTarget.select(); navigator.clipboard.writeText(generatedLink); }}
                                                        />
                                                        <p className="text-[10px] text-emerald-600 font-medium">Click the link above to copy it to your clipboard.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <button
                                                        onClick={() => downloadInstaller(selectedUnit.name.split('/').pop() || '')}
                                                        disabled={isDownloading}
                                                        className="flex-1 bg-zinc-900 text-white rounded-2xl py-5 px-8 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10 disabled:opacity-50"
                                                    >
                                                        {isDownloading ? (
                                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Download className="w-4 h-4" />
                                                                Download
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleGenerateLink(selectedUnit.name.split('/').pop() || '')}
                                                        disabled={isDownloading}
                                                        className="flex-1 bg-white text-zinc-700 ring-1 ring-zinc-200 rounded-2xl py-5 px-8 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:ring-zinc-300 hover:bg-zinc-50 transition-all disabled:opacity-50"
                                                    >
                                                        {isDownloading ? (
                                                            <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-700 rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Globe className="w-4 h-4" />
                                                                Get Link
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={handleDeleteUnit}
                                                        className="px-8 bg-zinc-100 hover:bg-red-50 hover:text-red-600 text-zinc-500 rounded-2xl py-5 font-black uppercase tracking-widest text-[11px] transition-all"
                                                    >
                                                        Cancel Setup
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : activeTab === 'metrics' ? (
                                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 pb-4 lg:pb-6 flex-1 min-h-0">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-4 shrink-0 lg:w-64 xl:w-72 overflow-y-auto no-scrollbar px-10 py-5">
                                            {currentMetrics.map((metric, idx) => (
                                                <button 
                                                    key={metric.id} 
                                                    onClick={() => setSelectedMetric(metric.id as any)} 
                                                    className={cn(
                                                        "p-5 text-left rounded-[2rem] transition-all duration-500 flex flex-col justify-between items-start group relative bg-white/40 backdrop-blur-md ring-1 ring-white/60",
                                                        selectedMetric === metric.id 
                                                            ? 'bg-white/95 ring-2 ring-orange-500 scale-[1.03] z-20 shadow-[0_10px_30px_rgba(249,115,22,0.1)]' 
                                                            : 'hover:ring-white hover:bg-white/60 hover:shadow-xl hover:-translate-y-1 hover:z-[50]'
                                                    )}
                                                >
                                                    {selectedMetric === metric.id && (
                                                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                                                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-orange-500/20 blur-[40px] rounded-full" />
                                                        </div>
                                                    )}
                                                        <div className="flex items-center justify-between w-full mb-4 relative z-10">
                                                            <div className={cn(
                                                                "p-2.5 rounded-2xl transition-all duration-500",
                                                                selectedMetric === metric.id 
                                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                                                                    : 'bg-zinc-100 text-zinc-400 group-hover:bg-white group-hover:text-zinc-600'
                                                            )}>
                                                                {metric.icon}
                                                            </div>
                                                            <div className="relative group/tip flex items-center justify-center p-1.5 rounded-xl bg-zinc-100/50 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all scale-90 group-hover:scale-100">
                                                                <span className="text-[10px] font-black">i</span>
                                                                
                                                                {/* In-Card Info Overlay */}
                                                                <div className="absolute top-[-20px] left-[-180px] w-[200px] p-4 bg-zinc-900/95 backdrop-blur-xl text-white text-[10px] font-bold rounded-[1.5rem] opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl scale-95 group-hover/tip:scale-100 origin-bottom-right leading-relaxed ring-1 ring-white/20">
                                                                    {metric.info}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    <div className="space-y-1">
                                                        <p className={cn(
                                                            "text-xs font-black uppercase tracking-widest transition-colors",
                                                            selectedMetric === metric.id ? 'text-zinc-900' : 'text-zinc-500'
                                                        )}>{metric.label}</p>
                                                        <p className="text-2xl font-black font-mono text-zinc-900 tracking-tighter">
                                                            {metric.value} <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest ml-1">{metric.unit}</span>
                                                        </p>
                                                    </div>

                                                    {selectedMetric === metric.id && (
                                                        <motion.div 
                                                            layoutId="metric-glow"
                                                            className="absolute inset-x-0 -bottom-px h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-sm" 
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex-1 bg-white backdrop-blur-3xl p-6 lg:p-8 rounded-[3rem] ring-1 ring-white flex flex-col min-w-0 min-h-0 transition-all duration-500">
                                            <div className="flex justify-between items-end mb-8">
                                                <div className="space-y-1">
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Real-time Usage Details</h3>
                                                    <h2 className="text-2xl lg:text-3xl font-black text-zinc-900 tracking-tighter uppercase leading-none">{activeMetricData?.label}</h2>
                                                </div>
                                                <div className="text-center bg-white/60 backdrop-blur-md px-8 py-4 rounded-[2rem] ring-1 ring-white/50 shadow-sm min-w-[140px]">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block mb-1">Live Status</span>
                                                    <span className="text-3xl font-black font-mono text-zinc-900 tracking-tighter leading-none">
                                                        {activeMetricData?.value}<span className="text-xs text-zinc-400 font-bold uppercase ml-1">{activeMetricData?.unit}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-h-0 relative bg-zinc-100/80 rounded-3xl ring-1 ring-zinc-200/50 p-6">
                                                <UsageGraph data={usageData} metric={selectedMetric} className="h-full" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* <div className="bg-[#09090B] rounded-2xl lg:rounded-3xl shadow-xl border border-zinc-800 h-full min-h-[400px] lg:min-h-[500px] flex flex-col overflow-hidden">
                                        <div className="bg-[#18181B] p-3 lg:p-4 border-b border-zinc-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2 lg:gap-3">
                                                <Terminal className="text-orange-500 w-4 h-4 lg:w-5 lg:h-5" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Secure Node Terminal</span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                                            </div>
                                        </div>
                                        <div className="p-4 lg:p-6 font-mono text-xs lg:text-[13px] text-zinc-400 space-y-2 overflow-y-auto flex-1 leading-relaxed break-words">
                                            <p>[{currentTime}] <span className="text-orange-400 font-bold">CONNECT</span>: Establishing secure tunnel to {selectedUnit.id}...</p>
                                            <p>[{currentTime}] <span className="text-emerald-400 font-bold">SUCCESS</span>: Auth token verified.</p>
                                            <p>[{currentTime}] <span className="text-zinc-500 font-bold">INFO</span>: Telemetry stream initialized at 1000ms polling rate.</p>
                                            <p className="animate-pulse mt-4 text-zinc-600 font-bold">_</p>
                                        </div>
                                    </div> */
                                    null
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="fleet-overview"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="flex-1 flex flex-col min-h-0"
                            >
                                <div className="flex items-center justify-between mb-8 shrink-0 pt-2 px-1">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase leading-none">System List</h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Real-time usage details across {units.length} registered systems</p>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] ring-1 ring-white shadow-sm">
                                        <div className="flex items-center gap-3 pr-4 border-r border-zinc-100">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                            <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{activeUnits} Connected</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                                            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-tight">{totalUnits - activeUnits} Disconnected</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4">
                                    {units.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-3xl ring-1 ring-zinc-200/50 text-center shadow-sm">
                                            <div className="mb-6 p-6 bg-zinc-50 rounded-full ring-1 ring-zinc-100 shadow-inner">
                                                <Server className="w-12 h-12 text-zinc-300" />
                                            </div>
                                            <h2 className="text-xl font-black text-zinc-900 tracking-tight uppercase mb-2">No nodes found</h2>
                                            <p className="text-zinc-500 max-w-sm text-xs font-medium leading-relaxed mb-8">
                                                Start by deploying a monitor to your first system to see real-time statistics here.
                                            </p>
                                            <button
                                                onClick={() => setIsAddNodeOpen(true)}
                                                className="bg-zinc-900 text-white rounded-2xl py-4 px-8 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10"
                                            >
                                                <Zap className="w-4 h-4 text-orange-400" /> Set Up First Monitor
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5 pb-8">
                                            {sortedUnits.map((unit) => (
                                                <CompactStatCard
                                                    key={unit.id}
                                                    unit={unit}
                                                    onClick={() => handleUnitToggle(unit)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}