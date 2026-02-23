import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    getLeavesApi, getLeaveStatsApi, applyLeaveApi, deleteLeaveApi,
    getSwapsApi, requestSwapApi, respondSwapApi,
    getReimbursementsApi, applyReimbursementApi, deleteReimbursementApi, getReimbursementStatsApi,
} from '../api/endpoints';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    MdAdd, MdDelete, MdCalendarToday, MdWork, MdCheckCircle,
    MdHourglassEmpty, MdClose, MdSwapHoriz, MdStar,
    MdFavorite, MdLocalHospital, MdDashboard, MdCurrencyRupee,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

// Indian Public Holidays 2025
const HOLIDAYS_2025 = [
    { date: '2025-01-26', name: 'Republic Day' },
    { date: '2025-03-14', name: 'Holi' },
    { date: '2025-04-14', name: 'Dr. Ambedkar Jayanti' },
    { date: '2025-04-18', name: 'Good Friday' },
    { date: '2025-08-15', name: 'Independence Day' },
    { date: '2025-10-02', name: 'Gandhi Jayanti' },
    { date: '2025-10-23', name: 'Dussehra' },
    { date: '2025-11-05', name: 'Diwali' },
    { date: '2025-12-25', name: 'Christmas' },
];

const getWellnessScore = (stats) => {
    if (!stats || stats.Total === 0) return { score: 45, label: 'Getting Started', color: '#f59e0b' };
    const ratio = stats.Approved / Math.max(stats.Total, 1);
    const days = stats.ApprovedDays || 0;
    const score = Math.min(100, Math.round(ratio * 60 + Math.min(days * 2, 40)));
    if (score >= 70) return { score, label: 'Excellent Balance', color: '#4ade80' };
    if (score >= 45) return { score, label: 'Healthy', color: '#22c55e' };
    if (score >= 25) return { score, label: 'Needs Rest', color: '#f59e0b' };
    return { score, label: 'Burnout Risk', color: '#ef4444' };
};

// Apply Leave Modal
const ApplyLeaveModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({
        leaveType: 'Casual Leave', fromDate: '', toDate: '',
        reason: '', isEmergency: false, emergencyNote: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await applyLeaveApi(form);
            toast.success(form.isEmergency ? 'Emergency leave submitted' : 'Leave applied successfully');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply leave');
        } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold" style={{ color: '#f0f0f0' }}>Apply for Leave</h3>
                    <button onClick={onClose}><MdClose size={20} style={{ color: '#6b6b6b' }} /></button>
                </div>

                {/* Emergency toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl mb-4"
                    style={{
                        background: form.isEmergency ? 'rgba(249,115,22,0.1)' : '#1e1e1e',
                        border: '1px solid',
                        borderColor: form.isEmergency ? 'rgba(249,115,22,0.3)' : '#2a2a2a',
                    }}>
                    <div className="flex items-center gap-2">
                        <MdLocalHospital size={18} style={{ color: form.isEmergency ? '#f97316' : '#6b6b6b' }} />
                        <div>
                            <p className="text-sm font-semibold" style={{ color: form.isEmergency ? '#f97316' : '#f0f0f0' }}>Emergency Leave</p>
                            <p className="text-xs" style={{ color: '#6b6b6b' }}>Bypasses normal approval queue</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, isEmergency: !form.isEmergency })}
                        className="w-11 h-6 rounded-full transition-colors relative"
                        style={{ background: form.isEmergency ? '#f97316' : '#2a2a2a' }}
                    >
                        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                            style={{ left: form.isEmergency ? '22px' : '2px' }} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">Leave Type</label>
                        <select className="input-field" value={form.leaveType}
                            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                            {['Sick Leave', 'Casual Leave', 'Annual Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'].map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">From Date</label>
                            <input type="date" className="input-field" value={form.fromDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required />
                        </div>
                        <div>
                            <label className="form-label">To Date</label>
                            <input type="date" className="input-field" value={form.toDate}
                                min={form.fromDate || new Date().toISOString().split('T')[0]}
                                onChange={(e) => setForm({ ...form, toDate: e.target.value })} required />
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Reason</label>
                        <textarea className="input-field resize-none" rows={3} value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            placeholder="Brief reason for leave..." required />
                    </div>
                    {form.isEmergency && (
                        <div>
                            <label className="form-label" style={{ color: '#f97316' }}>Emergency Details</label>
                            <textarea className="input-field resize-none" rows={2} value={form.emergencyNote}
                                onChange={(e) => setForm({ ...form, emergencyNote: e.target.value })}
                                placeholder="Describe the emergency situation..." />
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading ? 'Submitting...' : form.isEmergency ? 'Submit Emergency' : 'Apply Leave'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Swap Request Modal
const SwapRequestModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ targetEmployeeId: '', requesterDate: '', targetDate: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestSwapApi(form);
            toast.success('Swap request sent');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send swap request');
        } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold" style={{ color: '#f0f0f0' }}>Request Leave Swap</h3>
                    <button onClick={onClose}><MdClose size={20} style={{ color: '#6b6b6b' }} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">Target Employee ID</label>
                        <input className="input-field" value={form.targetEmployeeId} placeholder="Enter employee user ID"
                            onChange={(e) => setForm({ ...form, targetEmployeeId: e.target.value })} required />
                        <p className="text-xs mt-1" style={{ color: '#6b6b6b' }}>Ask your manager for the employee ID</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Your Leave Date</label>
                            <input type="date" className="input-field" value={form.requesterDate}
                                onChange={(e) => setForm({ ...form, requesterDate: e.target.value })} required />
                        </div>
                        <div>
                            <label className="form-label">Their Leave Date</label>
                            <input type="date" className="input-field" value={form.targetDate}
                                onChange={(e) => setForm({ ...form, targetDate: e.target.value })} required />
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Message (optional)</label>
                        <textarea className="input-field resize-none" rows={2} value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            placeholder="Reason for swap..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Apply Reimbursement Modal
const ApplyReimbursementModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ title: '', category: 'Travel', amount: '', date: '', description: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await applyReimbursementApi(form);
            toast.success('Reimbursement request submitted');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold" style={{ color: '#f0f0f0' }}>Apply for Reimbursement</h3>
                    <button onClick={onClose}><MdClose size={20} style={{ color: '#6b6b6b' }} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">Expense Title</label>
                        <input className="input-field" value={form.title} placeholder="e.g., Client Meeting Travel"
                            onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Category</label>
                            <select className="input-field" value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                {['Travel', 'Medical', 'Food', 'Equipment', 'Other'].map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Amount (₹)</label>
                            <input type="number" className="input-field" value={form.amount} placeholder="0.00"
                                onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Date of Expense</label>
                        <input type="date" className="input-field" value={form.date}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                    </div>
                    <div>
                        <label className="form-label">Description</label>
                        <textarea className="input-field resize-none" rows={3} value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Provide details about the expense..." required />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Dashboard
const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState(null);
    const [swaps, setSwaps] = useState([]);
    const [reimbursements, setReimbursements] = useState([]);
    const [reimbursementStats, setReimbursementStats] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [showReimbursementModal, setShowReimbursementModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const activeTab = searchParams.get('tab') || 'dashboard';

    const fetchAll = useCallback(async () => {
        try {
            const [leavesRes, statsRes, swapsRes, reimbursementsRes, reimbursementStatsRes] = await Promise.all([
                getLeavesApi(), getLeaveStatsApi(), getSwapsApi(),
                getReimbursementsApi(), getReimbursementStatsApi(),
            ]);
            setLeaves(leavesRes.data.leaves || []);
            setStats(statsRes.data.stats || null);
            setSwaps(swapsRes.data.swaps || []);
            setReimbursements(reimbursementsRes.data.reimbursements || []);
            setReimbursementStats(reimbursementStatsRes.data.stats || null);
        } catch (_) {
            toast.error('Failed to load data');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleDelete = async (id) => {
        if (!confirm('Cancel this leave request?')) return;
        try {
            await deleteLeaveApi(id);
            toast.success('Leave cancelled');
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot delete');
        }
    };

    const handleSwapRespond = async (id, response) => {
        try {
            await respondSwapApi(id, response);
            toast.success(`Swap ${response}`);
            fetchAll();
        } catch (_) { toast.error('Failed to respond'); }
    };

    const handleDeleteReimbursement = async (id) => {
        if (!confirm('Delete this reimbursement request?')) return;
        try {
            await deleteReimbursementApi(id);
            toast.success('Request deleted');
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot delete');
        }
    };

    const wellness = getWellnessScore(stats);
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingHolidays = HOLIDAYS_2025.filter((h) => h.date >= todayStr).slice(0, 4);
    const pendingSwaps = swaps.filter((s) => s.targetEmployee?._id === user?._id && s.targetResponse === 'Pending');

    const statCards = [
        { label: 'Total Applied', value: stats?.Total ?? 0, icon: <MdCalendarToday size={22} />, color: '#4ade80' },
        { label: 'Approved', value: stats?.Approved ?? 0, icon: <MdCheckCircle size={22} />, color: '#22c55e' },
        { label: 'Pending', value: stats?.Pending ?? 0, icon: <MdHourglassEmpty size={22} />, color: '#f59e0b' },
        { label: 'Days Taken', value: stats?.ApprovedDays ?? 0, icon: <MdWork size={22} />, color: '#4ade80' },
    ];

    if (loading) return (
        <div className="flex h-screen" style={{ background: '#111111' }}>
            <Sidebar />
            <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#111111' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar title={activeTab === 'swap' ? 'Leave Swap' : 'My Dashboard'} />
                <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">

                    {/* DASHBOARD TAB */}
                    {activeTab !== 'swap' && (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {statCards.map((c) => (
                                    <div key={c.label} className="card-hover">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ background: `${c.color}18`, color: c.color }}>
                                                {c.icon}
                                            </div>
                                            <span style={{ color: c.color, fontSize: 24, fontWeight: 700 }}>{c.value}</span>
                                        </div>
                                        <p className="text-xs font-medium" style={{ color: '#6b6b6b' }}>{c.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Leave history */}
                                <div className="lg:col-span-2 card">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="font-bold text-base" style={{ color: '#f0f0f0' }}>My Leave History</h3>
                                        <button onClick={() => setShowApplyModal(true)} className="btn-primary btn-sm flex items-center gap-1.5">
                                            <MdAdd size={16} /> Apply Leave
                                        </button>
                                    </div>
                                    {leaves.length === 0 ? (
                                        <p className="text-center py-10 text-sm" style={{ color: '#4d4d4d' }}>No leave records yet</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {leaves.map((leave) => (
                                                <div key={leave._id} className="flex items-center justify-between p-3 rounded-xl"
                                                    style={{
                                                        background: leave.isEmergency ? 'rgba(249,115,22,0.05)' : '#1e1e1e',
                                                        border: '1px solid',
                                                        borderColor: leave.isEmergency ? 'rgba(249,115,22,0.2)' : '#2a2a2a',
                                                    }}>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-sm font-semibold" style={{ color: '#f0f0f0' }}>{leave.leaveType}</p>
                                                            {leave.isEmergency && <span className="badge-emergency">Emergency</span>}
                                                            <StatusBadge status={leave.status} />
                                                        </div>
                                                        <p className="text-xs mt-1" style={{ color: '#6b6b6b' }}>
                                                            {new Date(leave.fromDate).toLocaleDateString()} – {new Date(leave.toDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {leave.status === 'Pending' && (
                                                        <button onClick={() => handleDelete(leave._id)} className="btn-danger btn-sm">
                                                            <MdDelete size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right column */}
                                <div className="space-y-5">
                                    {/* Wellness Score */}
                                    <div className="card">
                                        <div className="flex items-center gap-2 mb-4">
                                            <MdFavorite size={18} style={{ color: '#4ade80' }} />
                                            <h3 className="font-bold text-sm" style={{ color: '#f0f0f0' }}>Work-Life Balance</h3>
                                        </div>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="relative w-24 h-24">
                                                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                                                    <circle cx="48" cy="48" r="38" fill="none" stroke="#1e1e1e" strokeWidth="8" />
                                                    <circle cx="48" cy="48" r="38" fill="none" stroke={wellness.color}
                                                        strokeWidth="8" strokeLinecap="round"
                                                        strokeDasharray={`${(wellness.score / 100) * 238.76} 238.76`} />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-bold" style={{ color: wellness.color }}>{wellness.score}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-center text-sm font-semibold" style={{ color: wellness.color }}>{wellness.label}</p>
                                        <p className="text-center text-xs mt-1" style={{ color: '#4d4d4d' }}>Based on your leave usage</p>
                                    </div>

                                    {/* Upcoming Holidays */}
                                    <div className="card">
                                        <div className="flex items-center gap-2 mb-4">
                                            <MdStar size={18} style={{ color: '#4ade80' }} />
                                            <h3 className="font-bold text-sm" style={{ color: '#f0f0f0' }}>Upcoming Holidays</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {upcomingHolidays.map((h) => (
                                                <div key={h.date} className="flex justify-between items-center p-2 rounded-lg"
                                                    style={{ background: '#1e1e1e' }}>
                                                    <p className="text-xs font-medium" style={{ color: '#f0f0f0' }}>{h.name}</p>
                                                    <p className="text-xs" style={{ color: '#4ade80' }}>
                                                        {new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                    </p>
                                                </div>
                                            ))}
                                            {upcomingHolidays.length === 0 && (
                                                <p className="text-xs text-center" style={{ color: '#4d4d4d' }}>No upcoming holidays</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* SWAP TAB */}
                    {activeTab === 'swap' && (
                        <div className="space-y-5">
                            {/* Pending incoming swaps */}
                            <div className="card">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <MdSwapHoriz size={20} style={{ color: '#4ade80' }} />
                                        <h3 className="font-bold text-base" style={{ color: '#f0f0f0' }}>Incoming Swap Requests</h3>
                                        {pendingSwaps.length > 0 && <span className="accent-pill">{pendingSwaps.length}</span>}
                                    </div>
                                    <button onClick={() => setShowSwapModal(true)} className="btn-primary btn-sm flex items-center gap-1.5">
                                        <MdAdd size={16} /> New Request
                                    </button>
                                </div>
                                {pendingSwaps.length === 0 ? (
                                    <p className="text-center py-8 text-sm" style={{ color: '#4d4d4d' }}>No pending swap requests</p>
                                ) : pendingSwaps.map((s) => (
                                    <div key={s._id} className="p-3 rounded-xl mb-2" style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
                                        <p className="text-xs font-semibold mb-1" style={{ color: '#f0f0f0' }}>
                                            {s.requester?.name} wants to swap
                                        </p>
                                        <p className="text-xs mb-2" style={{ color: '#6b6b6b' }}>
                                            Their {new Date(s.requesterDate).toLocaleDateString()} for your {new Date(s.targetDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs italic mb-3" style={{ color: '#4d4d4d' }}>{s.message}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleSwapRespond(s._id, 'Accepted')} className="btn-success btn-sm flex-1 text-xs">Accept</button>
                                            <button onClick={() => handleSwapRespond(s._id, 'Declined')} className="btn-danger btn-sm flex-1 text-xs">Decline</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* All my swaps history */}
                            <div className="card">
                                <h3 className="font-bold text-base mb-5" style={{ color: '#f0f0f0' }}>My Swap History</h3>
                                {swaps.filter(s => s.targetResponse !== 'Pending' || s.requester?._id === user?._id).length === 0 ? (
                                    <p className="text-center py-8 text-sm" style={{ color: '#4d4d4d' }}>No swap history</p>
                                ) : swaps.map((s) => (
                                    <div key={s._id} className="p-3 rounded-xl mb-2 flex items-center justify-between"
                                        style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
                                        <div>
                                            <p className="text-xs font-semibold" style={{ color: '#f0f0f0' }}>
                                                {s.requester?.name} → {s.targetEmployee?.name}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: '#6b6b6b' }}>
                                                {new Date(s.requesterDate).toLocaleDateString()} for {new Date(s.targetDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold`}
                                            style={{
                                                background: s.status === 'Approved' ? 'rgba(74,222,128,0.1)' : s.status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                                color: s.status === 'Approved' ? '#4ade80' : s.status === 'Pending' ? '#f59e0b' : '#ef4444',
                                            }}>
                                            {s.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* REIMBURSEMENT TAB */}
                    {activeTab === 'reimbursement' && (
                        <div className="space-y-6">
                            {/* Reimbursement Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Requests', value: reimbursementStats?.Total ?? 0, color: '#4ade80' },
                                    { label: 'Approved Amount', value: `₹${reimbursementStats?.ApprovedAmount ?? 0}`, color: '#22c55e' },
                                    { label: 'Pending Amount', value: `₹${reimbursementStats?.PendingAmount ?? 0}`, color: '#f59e0b' },
                                    { label: 'Total Amount', value: `₹${reimbursementStats?.TotalAmount ?? 0}`, color: '#4ade80' },
                                ].map((c) => (
                                    <div key={c.label} className="card-hover">
                                        <p className="text-[20px] font-bold mb-1" style={{ color: c.color }}>{c.value}</p>
                                        <p className="text-xs font-medium" style={{ color: '#6b6b6b' }}>{c.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="card">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <MdCurrencyRupee size={20} style={{ color: '#4ade80' }} />
                                        <h3 className="font-bold text-base" style={{ color: '#f0f0f0' }}>Reimbursement History</h3>
                                    </div>
                                    <button onClick={() => setShowReimbursementModal(true)} className="btn-primary btn-sm flex items-center gap-1.5">
                                        <MdAdd size={16} /> New Request
                                    </button>
                                </div>

                                {reimbursements.length === 0 ? (
                                    <p className="text-center py-10 text-sm" style={{ color: '#4d4d4d' }}>No reimbursement requests yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {reimbursements.map((req) => (
                                            <div key={req._id} className="p-4 rounded-xl flex items-center justify-between"
                                                style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
                                                        <MdCurrencyRupee size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-sm font-bold" style={{ color: '#f0f0f0' }}>{req.title}</p>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full"
                                                                style={{ background: '#2a2a2a', color: '#6b6b6b' }}>{req.category}</span>
                                                            <StatusBadge status={req.status} />
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs" style={{ color: '#6b6b6b' }}>
                                                            <span>₹{req.amount}</span>
                                                            <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
                                                            <span>{new Date(req.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {req.status === 'Pending' && (
                                                    <button onClick={() => handleDeleteReimbursement(req._id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors" style={{ color: '#4d4d4d' }}>
                                                        <MdDelete size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {showApplyModal && <ApplyLeaveModal onClose={() => setShowApplyModal(false)} onSuccess={fetchAll} />}
            {showSwapModal && <SwapRequestModal onClose={() => setShowSwapModal(false)} onSuccess={fetchAll} />}
            {showReimbursementModal && <ApplyReimbursementModal onClose={() => setShowReimbursementModal(false)} onSuccess={fetchAll} />}
        </div>
    );
};

export default EmployeeDashboard;
