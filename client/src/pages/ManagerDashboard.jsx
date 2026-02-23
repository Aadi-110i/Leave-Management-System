import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    getLeavesApi, getLeaveStatsApi, approveLeaveApi, rejectLeaveApi,
    getBurnoutAlertsApi, getAllSwapsApi, managerSwapResponseApi,
    getReimbursementsApi, approveReimbursementApi, rejectReimbursementApi,
} from '../api/endpoints';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    MdCheckCircle, MdClose, MdCalendarToday, MdHourglassEmpty,
    MdWarning, MdSwapHoriz, MdPerson, MdLocalFireDepartment, MdAssignment,
    MdCurrencyRupee,
} from 'react-icons/md';

const ManagerDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState(null);
    const [burnout, setBurnout] = useState([]);
    const [swaps, setSwaps] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [reviewNote, setReviewNote] = useState('');
    const [reimbursementReviewNote, setReimbursementReviewNote] = useState('');
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewingReimbursementId, setReviewingReimbursementId] = useState(null);
    const [reimbursements, setReimbursements] = useState([]);

    const activeTab = searchParams.get('tab') || 'leaves';
    const setActiveTab = (tab) => {
        if (tab === 'leaves') setSearchParams({});
        else setSearchParams({ tab });
    };

    const fetchAll = useCallback(async () => {
        try {
            const [leavesRes, statsRes, burnoutRes, swapsRes, reimbursementsRes] = await Promise.all([
                getLeavesApi(statusFilter ? { status: statusFilter } : {}),
                getLeaveStatsApi(),
                getBurnoutAlertsApi(),
                getAllSwapsApi(),
                getReimbursementsApi(statusFilter ? { status: statusFilter } : {}),
            ]);
            setLeaves(leavesRes.data.leaves || []);
            setStats(statsRes.data.stats || {});
            setBurnout(burnoutRes.data.atRisk || []);
            setSwaps(swapsRes.data.swaps || []);
            setReimbursements(reimbursementsRes.data.reimbursements || []);
        } catch (_) {
            toast.error('Failed to load data');
        } finally { setLoading(false); }
    }, [statusFilter]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleApprove = async (id) => {
        try {
            await approveLeaveApi(id, { reviewNote });
            toast.success('Leave approved');
            setReviewingId(null);
            setReviewNote('');
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleReject = async (id) => {
        try {
            await rejectLeaveApi(id, { reviewNote });
            toast.success('Leave rejected');
            setReviewingId(null);
            setReviewNote('');
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleSwapDecision = async (id, decision) => {
        try {
            await managerSwapResponseApi(id, decision);
            toast.success(`Swap ${decision}`);
            fetchAll();
        } catch (_) { toast.error('Failed'); }
    };

    const handleApproveReimbursement = async (id) => {
        try {
            await approveReimbursementApi(id, { reviewNote: reimbursementReviewNote });
            toast.success('Reimbursement approved');
            setReviewingReimbursementId(null);
            setReimbursementReviewNote('');
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleRejectReimbursement = async (id) => {
        try {
            await rejectReimbursementApi(id, { reviewNote: reimbursementReviewNote });
            toast.success('Reimbursement rejected');
            setReviewingReimbursementId(null);
            setReimbursementReviewNote('');
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const statCards = [
        { label: 'Total Requests', value: stats?.Total ?? 0, icon: <MdCalendarToday size={20} />, color: '#4ade80' },
        { label: 'Pending', value: stats?.Pending ?? 0, icon: <MdHourglassEmpty size={20} />, color: '#f59e0b' },
        { label: 'Approved', value: stats?.Approved ?? 0, icon: <MdCheckCircle size={20} />, color: '#22c55e' },
        { label: 'Burnout Risk', value: burnout.length, icon: <MdLocalFireDepartment size={20} />, color: '#ef4444' },
    ];

    const pendingSwaps = swaps.filter((s) => s.targetResponse === 'Accepted' && s.managerStatus === 'Pending');
    const emergencyLeaves = leaves.filter((l) => l.isEmergency && l.status === 'Pending');

    const tabs = [
        { key: 'leaves', label: 'Leave Requests', icon: <MdAssignment size={16} />, count: leaves.filter(l => l.status === 'Pending').length },
        { key: 'reimbursements', label: 'Reimbursements', icon: <MdCurrencyRupee size={16} />, count: reimbursements.filter(r => r.status === 'Pending').length },
        { key: 'burnout', label: 'Burnout Alerts', icon: <MdLocalFireDepartment size={16} />, count: burnout.length },
        { key: 'swaps', label: 'Swap Approvals', icon: <MdSwapHoriz size={16} />, count: pendingSwaps.length },
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
                <Navbar title="Manager Dashboard" />
                <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">

                    {/* Emergency Alert Banner */}
                    {emergencyLeaves.length > 0 && (
                        <div className="p-4 rounded-xl flex items-center gap-3"
                            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)' }}>
                            <MdWarning size={22} style={{ color: '#f97316' }} />
                            <div>
                                <p className="font-bold text-sm" style={{ color: '#f97316' }}>
                                    {emergencyLeaves.length} Emergency Leave{emergencyLeaves.length > 1 ? 's' : ''} Pending
                                </p>
                                <p className="text-xs" style={{ color: '#6b6b6b' }}>These require immediate attention</p>
                            </div>
                        </div>
                    )}

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

                    {/* Tab bar */}
                    <div className="flex gap-2" style={{ borderBottom: '1px solid #2a2a2a' }}>
                        {tabs.map((tab) => (
                            <button key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className="px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2"
                                style={{
                                    color: activeTab === tab.key ? '#4ade80' : '#6b6b6b',
                                    borderBottom: activeTab === tab.key ? '2px solid #4ade80' : '2px solid transparent',
                                }}>
                                {tab.icon}
                                {tab.label}
                                {tab.count > 0 && <span className="accent-pill">{tab.count}</span>}
                            </button>
                        ))}
                    </div>

                    {/* Leave Requests Tab */}
                    {activeTab === 'leaves' && (
                        <div className="card">
                            <div className="flex flex-wrap items-center gap-3 mb-5">
                                <h3 className="font-bold text-base flex-1" style={{ color: '#f0f0f0' }}>All Leave Requests</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {['', 'Pending', 'Approved', 'Rejected'].map((s) => (
                                        <button key={s || 'all'}
                                            onClick={() => setStatusFilter(s)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                            style={{
                                                background: statusFilter === s ? '#4ade80' : '#1e1e1e',
                                                color: statusFilter === s ? '#000' : '#9e9e9e',
                                                border: '1px solid', borderColor: statusFilter === s ? '#4ade80' : '#2a2a2a',
                                            }}>
                                            {s || 'All'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {leaves.length === 0 ? (
                                    <p className="text-center py-10 text-sm" style={{ color: '#4d4d4d' }}>No leave requests</p>
                                ) : leaves.map((leave) => (
                                    <div key={leave._id} className="rounded-xl p-4"
                                        style={{
                                            background: leave.isEmergency ? 'rgba(249,115,22,0.05)' : '#1e1e1e',
                                            border: '1px solid', borderColor: leave.isEmergency ? 'rgba(249,115,22,0.25)' : '#2a2a2a',
                                        }}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                        style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
                                                        {leave.employee?.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <p className="font-semibold text-sm" style={{ color: '#f0f0f0' }}>{leave.employee?.name}</p>
                                                    <span className="text-xs" style={{ color: '#6b6b6b' }}>{leave.employee?.department}</span>
                                                    {leave.isEmergency && (
                                                        <span className="badge-emergency">Emergency</span>
                                                    )}
                                                    <StatusBadge status={leave.status} />
                                                </div>
                                                <p className="text-sm font-medium mb-0.5" style={{ color: '#d4d4d4' }}>{leave.leaveType}</p>
                                                <p className="text-xs" style={{ color: '#6b6b6b' }}>
                                                    {new Date(leave.fromDate).toLocaleDateString()} – {new Date(leave.toDate).toLocaleDateString()}
                                                    {' · '}{leave.days || 1} day(s)
                                                </p>
                                                <p className="text-xs italic mt-1" style={{ color: '#555555' }}>{leave.reason}</p>
                                            </div>

                                            {leave.status === 'Pending' && (
                                                <button onClick={() => setReviewingId(reviewingId === leave._id ? null : leave._id)}
                                                    className="btn-secondary btn-sm text-xs flex-shrink-0">Review</button>
                                            )}
                                        </div>

                                        {reviewingId === leave._id && (
                                            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #2a2a2a' }}>
                                                <textarea
                                                    value={reviewNote}
                                                    onChange={(e) => setReviewNote(e.target.value)}
                                                    className="input-field resize-none text-xs mb-3"
                                                    rows={2}
                                                    placeholder="Optional review note..." />
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApprove(leave._id)} className="btn-success btn-sm flex-1 flex items-center justify-center gap-1">
                                                        <MdCheckCircle size={14} /> Approve
                                                    </button>
                                                    <button onClick={() => handleReject(leave._id)} className="btn-danger btn-sm flex-1 flex items-center justify-center gap-1">
                                                        <MdClose size={14} /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reimbursements Tab */}
                    {activeTab === 'reimbursements' && (
                        <div className="card">
                            <div className="flex flex-wrap items-center gap-3 mb-5">
                                <h3 className="font-bold text-base flex-1" style={{ color: '#f0f0f0' }}>Reimbursement Requests</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {['', 'Pending', 'Approved', 'Rejected'].map((s) => (
                                        <button key={s || 'all'}
                                            onClick={() => setStatusFilter(s)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                            style={{
                                                background: statusFilter === s ? '#4ade80' : '#1e1e1e',
                                                color: statusFilter === s ? '#000' : '#9e9e9e',
                                                border: '1px solid', borderColor: statusFilter === s ? '#4ade80' : '#2a2a2a',
                                            }}>
                                            {s || 'All'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {reimbursements.length === 0 ? (
                                    <p className="text-center py-10 text-sm" style={{ color: '#4d4d4d' }}>No reimbursement requests</p>
                                ) : reimbursements.map((req) => (
                                    <div key={req._id} className="rounded-xl p-4" style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                        style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
                                                        {req.employee?.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <p className="font-semibold text-sm" style={{ color: '#f0f0f0' }}>{req.employee?.name}</p>
                                                    <span className="text-xs" style={{ color: '#6b6b6b' }}>{req.employee?.department}</span>
                                                    <StatusBadge status={req.status} />
                                                </div>
                                                <p className="text-sm font-bold mt-1" style={{ color: '#d4d4d4' }}>{req.title} <span className="text-xs font-normal" style={{ color: '#6b6b6b' }}>({req.category})</span></p>
                                                <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: '#6b6b6b' }}>
                                                    <span className="font-bold" style={{ color: '#4ade80' }}>₹{req.amount}</span>
                                                    <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
                                                    <span>{new Date(req.date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs mt-2" style={{ color: '#f0f0f0' }}>{req.description}</p>
                                            </div>

                                            {req.status === 'Pending' && (
                                                <button onClick={() => setReviewingReimbursementId(reviewingReimbursementId === req._id ? null : req._id)}
                                                    className="btn-secondary btn-sm text-xs flex-shrink-0">Review</button>
                                            )}
                                        </div>

                                        {reviewingReimbursementId === req._id && (
                                            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #2a2a2a' }}>
                                                <textarea
                                                    value={reimbursementReviewNote}
                                                    onChange={(e) => setReimbursementReviewNote(e.target.value)}
                                                    className="input-field resize-none text-xs mb-3"
                                                    rows={2}
                                                    placeholder="Optional review note..." />
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApproveReimbursement(req._id)} className="btn-success btn-sm flex-1 flex items-center justify-center gap-1">
                                                        <MdCheckCircle size={14} /> Approve
                                                    </button>
                                                    <button onClick={() => handleRejectReimbursement(req._id)} className="btn-danger btn-sm flex-1 flex items-center justify-center gap-1">
                                                        <MdClose size={14} /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Burnout Alerts Tab */}
                    {activeTab === 'burnout' && (
                        <div className="card">
                            <div className="flex items-center gap-3 mb-5">
                                <MdLocalFireDepartment size={22} style={{ color: '#ef4444' }} />
                                <div>
                                    <h3 className="font-bold text-base" style={{ color: '#f0f0f0' }}>Burnout Risk Detector</h3>
                                    <p className="text-xs" style={{ color: '#6b6b6b' }}>Employees with no approved leave in 90+ days</p>
                                </div>
                            </div>
                            {burnout.length === 0 ? (
                                <div className="text-center py-10">
                                    <MdCheckCircle size={40} style={{ color: '#4ade80', margin: '0 auto 8px' }} />
                                    <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>All employees have taken recent leave</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {burnout.map(({ employee, daysSinceLeave, risk }) => (
                                        <div key={employee._id} className="flex items-center justify-between p-4 rounded-xl"
                                            style={{
                                                background: '#1e1e1e',
                                                border: `1px solid ${risk === 'High' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                                            }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                                                    style={{
                                                        background: risk === 'High' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                                        color: risk === 'High' ? '#ef4444' : '#f59e0b',
                                                    }}>
                                                    {employee.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm" style={{ color: '#f0f0f0' }}>{employee.name}</p>
                                                    <p className="text-xs" style={{ color: '#6b6b6b' }}>{employee.department}</p>
                                                    <p className="text-xs mt-0.5" style={{ color: risk === 'High' ? '#ef4444' : '#f59e0b' }}>
                                                        {daysSinceLeave != null ? `${daysSinceLeave} days since last leave` : 'Never taken leave'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                                style={{
                                                    background: risk === 'High' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                                    color: risk === 'High' ? '#ef4444' : '#f59e0b',
                                                    border: `1px solid ${risk === 'High' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                                                }}>
                                                {risk} Risk
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Swap Approvals Tab */}
                    {activeTab === 'swaps' && (
                        <div className="card">
                            <div className="flex items-center gap-3 mb-5">
                                <MdSwapHoriz size={22} style={{ color: '#4ade80' }} />
                                <div>
                                    <h3 className="font-bold text-base" style={{ color: '#f0f0f0' }}>Leave Swap Approvals</h3>
                                    <p className="text-xs" style={{ color: '#6b6b6b' }}>Swaps awaiting your approval</p>
                                </div>
                            </div>
                            {pendingSwaps.length === 0 ? (
                                <p className="text-center py-10 text-sm" style={{ color: '#4d4d4d' }}>No swap requests pending approval</p>
                            ) : pendingSwaps.map((swap) => (
                                <div key={swap._id} className="p-4 rounded-xl mb-3" style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="text-center">
                                            <div className="flex items-center gap-1">
                                                <MdPerson size={14} style={{ color: '#4ade80' }} />
                                                <p className="text-xs font-semibold" style={{ color: '#f0f0f0' }}>{swap.requester?.name}</p>
                                            </div>
                                            <p className="text-xs" style={{ color: '#4ade80' }}>{new Date(swap.requesterDate).toLocaleDateString()}</p>
                                        </div>
                                        <MdSwapHoriz size={20} style={{ color: '#6b6b6b' }} />
                                        <div className="text-center">
                                            <div className="flex items-center gap-1">
                                                <MdPerson size={14} style={{ color: '#4ade80' }} />
                                                <p className="text-xs font-semibold" style={{ color: '#f0f0f0' }}>{swap.targetEmployee?.name}</p>
                                            </div>
                                            <p className="text-xs" style={{ color: '#4ade80' }}>{new Date(swap.targetDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleSwapDecision(swap._id, 'Approved')} className="btn-success btn-sm flex-1">Approve</button>
                                        <button onClick={() => handleSwapDecision(swap._id, 'Rejected')} className="btn-danger btn-sm flex-1">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ManagerDashboard;
