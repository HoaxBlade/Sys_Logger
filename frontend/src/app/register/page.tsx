'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Lock, Mail, ChevronRight, AlertCircle, User, Briefcase, Zap, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../components/hooks/apiUtils';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState<'Individual' | 'Pro' | 'Business'>('Individual');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const validatePassword = (pwd: string): string | null => {
        if (!pwd) return "Password cannot be empty.";
        if (pwd.length < 8) return "Password must be at least 8 characters long.";
        if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
        if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
        if (!/\d/.test(pwd)) return "Password must contain at least one digit.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain at least one special character.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setLoading(true);

        try {
            if (orgType === 'Business' || orgType === 'Pro') {
                // 1. Create registration payment order
                const orderResp = await apiFetch('/api/auth/register-order', {
                    method: 'POST',
                    body: JSON.stringify({ email, org_name: orgName, plan_slug: orgType.toLowerCase() })
                });
                const orderData = await orderResp.json();
                if (!orderResp.ok) throw new Error(orderData.message || orderData.error || 'Failed to create payment order');

                // 2. Load Razorpay script if not already loaded
                if (!(window as any).Razorpay) {
                    await new Promise<void>((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                        script.async = true;
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
                        document.body.appendChild(script);
                    });
                }

                // 3. Open Razorpay modal
                const options = {
                    key: orderData.key_id,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "SysLogger",
                    description: `${orgType} Tier Registration`,
                    order_id: orderData.order_id,
                    handler: async (response: any) => {
                        try {
                            setLoading(true);
                            // 4. Complete registration with payment info
                            const regResp = await apiFetch('/api/auth/register', {
                                method: 'POST',
                                body: JSON.stringify({
                                    email,
                                    password,
                                    org_name: orgName,
                                    org_type: orgType,
                                    payment_info: {
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_signature: response.razorpay_signature
                                    }
                                })
                            });
                            const regData = await regResp.json();
                            if (regResp.ok) {
                                setSuccess(true);
                                setTimeout(() => router.push('/login'), 2000);
                            } else {
                                setError(regData.message || regData.error || 'Registration failed');
                            }
                        } catch (err: any) {
                            setError(err.message || 'Registration failed after payment verification.');
                        } finally {
                            setLoading(false);
                        }
                    },
                    prefill: {
                        email: email
                    },
                    theme: {
                        color: "#F97316"
                    },
                    modal: {
                        ondismiss: () => {
                            setLoading(false);
                        }
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();

            } else {
                // Individual signup flow
                const response = await apiFetch('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ email, password, org_name: orgName, org_type: orgType }),
                });

                const data = await response.json();

                if (response.ok) {
                    setSuccess(true);
                    setTimeout(() => router.push('/login'), 2000);
                } else {
                    setError(data.message || data.error || 'Registration failed');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Connection failed. Please check your backend.');
        } finally {
            if (orgType === 'Individual') {
                setLoading(false);
            }
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[2.5rem] shadow-xl text-center max-w-sm w-full"
                >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-black text-zinc-900 mb-2">Account Created!</h2>
                    <p className="text-zinc-500 font-medium">Redirecting you to login...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/70 backdrop-blur-2xl ring-1 ring-zinc-200/80 rounded-[2.5rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] p-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-zinc-900/20">
                            <Activity className="w-8 h-8 text-orange-500" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">Join the Fleet.</h1>
                        <p className="text-zinc-500 font-medium">Initialize your monitoring hub</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Tier Selection */}
                        <div className="flex p-1 bg-zinc-100 rounded-2xl mb-6">
                            <button
                                type="button"
                                onClick={() => setOrgType('Individual')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${orgType === 'Individual' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
                            >
                                <User className="w-3.5 h-3.5" />
                                Individual
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrgType('Pro')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${orgType === 'Pro' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                Pro
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrgType('Business')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${orgType === 'Business' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
                            >
                                <Briefcase className="w-3.5 h-3.5" />
                                Business
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">
                                {orgType === 'Individual' ? 'Personal Name' : 'Company Name'}
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    className="w-full bg-zinc-50 border-none ring-1 ring-zinc-200/80 rounded-2xl py-4 pl-12 pr-4 text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                                    placeholder={orgType === 'Individual' ? 'e.g. John Doe' : 'e.g. Acme Corp'}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-50 border-none ring-1 ring-zinc-200/80 rounded-2xl py-4 pl-12 pr-4 text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                                    placeholder="Email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-50 border-none ring-1 ring-zinc-200/80 rounded-2xl py-4 pl-12 pr-12 text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                                    placeholder="Password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Dynamic Tier Info */}
                        <div className="px-4 py-3 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-start gap-3 mt-4">
                            <div className="p-1.5 bg-white rounded-lg ring-1 ring-zinc-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                                    {orgType === 'Individual' ? 'Free-Tier Initialization' : `${orgType}-Tier Subscription`}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                                    {orgType === 'Individual' && 'All new hubs start on the Free tier (1 node). Upgrade to Pro or Business anytime from your dashboard.'}
                                    {orgType === 'Pro' && 'Upgrading to Pro tier (5 nodes) requires a monthly payment of ₹100. You will pay via Razorpay to complete registration.'}
                                    {orgType === 'Business' && 'Upgrading to Business tier (30 nodes) requires a monthly payment of ₹1000. You will pay via Razorpay to complete registration.'}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold ring-1 ring-red-200"
                            >
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50 mt-4 group shadow-xl shadow-zinc-900/10"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    {orgType === 'Individual' ? 'Complete Initialization' : 'Pay & Register'}
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-zinc-400 font-medium mt-6">
                            Already have an account?{' '}
                            <Link href="/login" className="text-zinc-900 hover:text-orange-500 transition-colors font-bold">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
