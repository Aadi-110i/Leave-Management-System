import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginApi } from '../api/endpoints';
import toast from 'react-hot-toast';
import { MdEmail, MdLock, MdWork } from 'react-icons/md';
import { GlowingEffect } from '../components/ui/glowing-effect';
import { CalendarCheck, ShieldCheck, BarChart3, ArrowLeftRight, Bell, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { SplineScene } from '../components/ui/splite';
import { Spotlight } from '../components/ui/spotlight';

import Logo from "../assets/logo.png";

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const res = await loginApi(form);
            const { token, user } = res.data;
            login(user, token);
            toast.success(`Welcome back, ${user.name}!`);

            // Redirect based on role
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'manager') navigate('/manager');
            else navigate('/employee');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const demoAccounts = [
        { role: 'Admin', email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'admin@elms.com', password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || '' },
        { role: 'Manager', email: import.meta.env.VITE_DEMO_MANAGER_EMAIL || 'manager@elms.com', password: import.meta.env.VITE_DEMO_MANAGER_PASSWORD || '' },
        { role: 'Employee', email: import.meta.env.VITE_DEMO_EMPLOYEE_EMAIL || 'john@elms.com', password: import.meta.env.VITE_DEMO_EMPLOYEE_PASSWORD || '' },
    ];

    const fillDemo = (account) => {
        setForm({ email: account.email, password: account.password });
    };

    const features = [
        { icon: <CalendarCheck size={18} />, title: 'Smart Leave Management', desc: 'Apply, track & manage leave requests in real-time.' },
        { icon: <ShieldCheck size={18} />, title: 'Role-Based Access', desc: 'Employee, Manager and Admin portals with secure JWT auth.' },
        { icon: <ArrowLeftRight size={18} />, title: 'Leave Swap System', desc: 'Request and approve leave swaps between employees.' },
        { icon: <BarChart3 size={18} />, title: 'Analytics Dashboard', desc: 'Visual insights on leave trends across departments.' },
        { icon: <Bell size={18} />, title: 'Burnout Detection', desc: 'AI-style alerts when employees are at burnout risk.' },
        { icon: <Users size={18} />, title: 'Team Overview', desc: 'Managers get a full view of team availability and stats.' },
    ];

    return (
        <div className="h-screen flex relative" style={{ background: '#000000' }}>
            {/* Left panel */}
            <div className="hidden lg:flex w-1/2 flex-col items-center justify-center px-8 py-8 relative overflow-hidden" style={{ background: '#ffffff' }}>
                {/* Content */}
                <div className="relative z-[2] w-full flex flex-col items-center">

                    {/* Logo & Title */}
                    <div className="w-full max-w-lg mb-6 text-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center mb-3 mx-auto animate-float">
                            <img src={Logo} alt="ELMS Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-xl font-bold" style={{ color: '#111111' }}>
                            Employee Leave
                        </h1>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: '#111111' }}>
                            Management System
                        </p>
                        <p className="text-[10px] mt-1 mx-auto" style={{ color: '#6b7280' }}>
                            Streamline your HR workflow — apply, approve &amp; manage leave with ease.
                        </p>
                    </div>

                    {/* Glowing feature cards */}
                    <ul className="grid grid-cols-2 gap-2.5 w-full max-w-lg">
                        {features.map((f, i) => (
                            <li key={i} className="min-h-[7rem] list-none">
                                <div className="relative h-full rounded-[1.25rem] p-[2px]"
                                    style={{ border: '1px solid #e5e7eb' }}>
                                    <GlowingEffect
                                        spread={30}
                                        glow={false}
                                        disabled={false}
                                        proximity={60}
                                        inactiveZone={0.05}
                                        borderWidth={2}
                                    />
                                    <div className="relative flex h-full flex-col gap-2 overflow-hidden rounded-[1.1rem] p-3"
                                        style={{ background: '#f9fafb' }}>
                                        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'rgba(22,163,106,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,106,0.2)' }}>
                                            {f.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold leading-tight" style={{ color: '#111827' }}>{f.title}</h3>
                                            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6b7280' }}>{f.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                </div>{/* end content z-[2] */}
            </div>

            {/* Right panel */}
            <div className="w-full lg:w-1/2 flex-1 flex items-center justify-center px-6 sm:px-8 pt-20 lg:pt-36 pb-8 overflow-y-auto relative z-[2]">

                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-dark rounded-xl flex items-center justify-center">
                            <MdWork className="text-beige-300" size={22} />
                        </div>
                        <div>
                            <p className="font-bold text-dark text-sm">Employee Leave Management</p>
                        </div>
                    </div>

                    <div className="card">
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-white">Welcome back</h2>
                            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="form-label">Email Address</label>
                                <div className="relative">
                                    <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-beige-500" size={18} />
                                    <input
                                        id="login-email"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                        placeholder="you@company.com"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Password</label>
                                <div className="relative">
                                    <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-beige-500" size={18} />
                                    <input
                                        id="login-password"
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 text-base mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-beige-300 border-t-transparent rounded-full animate-spin" />
                                        Signing in...
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-5 text-center">
                            <p className="text-sm text-white/60">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-white font-semibold hover:underline">
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Demo accounts */}
                    <div className="mt-5 p-4 rounded-2xl" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#ffffff' }}>Quick Demo Login</p>
                        <div className="grid grid-cols-3 gap-2">
                            {demoAccounts.map((acc) => (
                                <button
                                    key={acc.role}
                                    onClick={() => fillDemo(acc)}
                                    className="text-xs rounded-xl py-2.5 px-2 font-medium transition-all duration-200 hover:border-green-400"
                                    style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#d4d4d4' }}
                                >
                                    {acc.role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
