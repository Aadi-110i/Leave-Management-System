import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerApi } from '../api/endpoints';
import toast from 'react-hot-toast';
import { MdEmail, MdLock, MdPerson, MdWork } from 'react-icons/md';
import { GlowingEffect } from '../components/ui/glowing-effect';
import { CalendarCheck, ShieldCheck, BarChart3, ArrowLeftRight, Bell, Users } from 'lucide-react';
import Logo from "../assets/logo.png";

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'IT', 'Legal'];
const ROLES = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
];

const Register = () => {
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'employee', department: 'Engineering',
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await registerApi(form);
            const { token, user } = res.data;
            login(user, token);
            toast.success(`Account created! Welcome, ${user.name}!`);

            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'manager') navigate('/manager');
            else navigate('/employee');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
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
            <div className="w-full lg:w-1/2 flex-1 flex items-center justify-center px-6 sm:px-8 pt-20 lg:pt-8 pb-8 overflow-y-auto relative z-[2]">

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
                            <h2 className="text-xl font-bold text-white">Create Account</h2>
                            <p className="text-gray-500 text-sm mt-1">Join Employee Leave Management System</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="form-label">Full Name</label>
                                <div className="relative">
                                    <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-beige-500" size={18} />
                                    <input
                                        id="register-name"
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Email Address</label>
                                <div className="relative">
                                    <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-beige-500" size={18} />
                                    <input
                                        id="register-email"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Password</label>
                                <div className="relative">
                                    <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-beige-500" size={18} />
                                    <input
                                        id="register-password"
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label">Role</label>
                                    <select
                                        id="register-role"
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        className="input-field bg-[#1e1e1e]"
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">Department</label>
                                    <select
                                        id="register-department"
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        className="input-field bg-[#1e1e1e]"
                                    >
                                        {DEPARTMENTS.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                id="register-submit"
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 text-base mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-beige-300 border-t-transparent rounded-full animate-spin" />
                                        Creating account...
                                    </span>
                                ) : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-5 text-center">
                            <p className="text-sm text-white/60">
                                Already have an account?{' '}
                                <Link to="/login" className="text-white font-semibold hover:underline">Sign in</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
