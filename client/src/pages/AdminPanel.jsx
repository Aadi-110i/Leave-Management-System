import { useState, useEffect, useCallback } from 'react';
import {
    getAllUsersApi, createUserApi, updateUserApi, deleteUserApi,
    getReimbursementsApi, approveReimbursementApi, rejectReimbursementApi,
} from '../api/endpoints';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    MdAdd, MdEdit, MdDelete, MdClose, MdPeople, MdAdminPanelSettings,
    MdCurrencyRupee, MdCheckCircle,
} from 'react-icons/md';
import StatusBadge from '../components/StatusBadge';

const ROLES = ['employee', 'manager', 'admin'];
const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'IT', 'Legal', 'General'];

const roleBadge = (role) => {
    const classes = {
        admin: 'bg-purple-100 text-purple-700',
        manager: 'bg-blue-100 text-blue-700',
        employee: 'bg-beige-200 text-dark',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${classes[role] || 'bg-gray-100 text-gray-700'}`}>
            {role}
        </span>
    );
};

const defaultForm = { name: '', email: '', password: '', role: 'employee', department: 'Engineering' };

const UserModal = ({ user, onClose, onSuccess }) => {
    const isEdit = !!user;
    const [form, setForm] = useState(isEdit ? {
        name: user.name, email: user.email, password: '', role: user.role, department: user.department || 'General',
    } : defaultForm);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
        if (!isEdit && !form.password) { toast.error('Password is required for new users'); return; }

        setLoading(true);
        try {
            const payload = { ...form };
            if (isEdit && !payload.password) delete payload.password;

            if (isEdit) {
                await updateUserApi(user._id, payload);
                toast.success('User updated successfully');
            } else {
                await createUserApi(payload);
                toast.success('User created successfully');
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-dark">{isEdit ? 'Edit User' : 'Add New User'}</h2>
                        <p className="text-sm text-dark/50 mt-0.5">{isEdit ? 'Update user information' : 'Create a new system user'}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-beige-100 hover:bg-beige-200 flex items-center justify-center">
                        <MdClose size={18} className="text-dark" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                        <input
                            id="user-modal-name"
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-field"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="form-label">Email Address <span className="text-red-500">*</span></label>
                        <input
                            id="user-modal-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="input-field"
                            placeholder="john@company.com"
                        />
                    </div>

                    <div>
                        <label className="form-label">
                            Password {isEdit && <span className="text-dark/40 font-normal">(leave blank to keep unchanged)</span>}
                            {!isEdit && <span className="text-red-500"> *</span>}
                        </label>
                        <input
                            id="user-modal-password"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="input-field"
                            placeholder={isEdit ? '••••••••' : 'Min. 6 characters'}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="form-label">Role</label>
                            <select
                                id="user-modal-role"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="input-field"
                            >
                                {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Department</label>
                            <select
                                id="user-modal-department"
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                className="input-field"
                            >
                                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-beige-300 border-t-transparent rounded-full animate-spin" />
                                    {isEdit ? 'Saving...' : 'Creating...'}
                                </span>
                            ) : (isEdit ? 'Save Changes' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, user: null });
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [reimbursements, setReimbursements] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [reimbursementReviewNote, setReimbursementReviewNote] = useState('');
    const [reviewingReimbursementId, setReviewingReimbursementId] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [usersRes, reimbursementsRes] = await Promise.all([
                getAllUsersApi(),
                getReimbursementsApi(statusFilter ? { status: statusFilter } : {}),
            ]);
            setUsers(usersRes.data.users);
            setReimbursements(reimbursementsRes.data.reimbursements || []);
        } catch (err) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (user) => {
        if (!confirm(`Delete user "${user.name}"? This action cannot be undone.`)) return;
        try {
            await deleteUserApi(user._id);
            toast.success(`User ${user.name} deleted`);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleApproveReimbursement = async (id) => {
        try {
            await approveReimbursementApi(id, { reviewNote: reimbursementReviewNote });
            toast.success('Reimbursement approved');
            setReviewingReimbursementId(null);
            setReimbursementReviewNote('');
            fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleRejectReimbursement = async (id) => {
        try {
            await rejectReimbursementApi(id, { reviewNote: reimbursementReviewNote });
            toast.success('Reimbursement rejected');
            setReviewingReimbursementId(null);
            setReimbursementReviewNote('');
            fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: users.length,
        admins: users.filter((u) => u.role === 'admin').length,
        managers: users.filter((u) => u.role === 'manager').length,
        employees: users.filter((u) => u.role === 'employee').length,
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar title="Admin Panel" />

                <main className="flex-1 p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Users', value: stats.total, color: 'bg-dark text-beige-300' },
                            { label: 'Admins', value: stats.admins, color: 'bg-purple-100 text-purple-700' },
                            { label: 'Managers', value: stats.managers, color: 'bg-blue-100 text-blue-700' },
                            { label: 'Employees', value: stats.employees, color: 'bg-beige-200 text-dark' },
                        ].map((s) => (
                            <div key={s.label} className={`card flex flex-col items-center py-5 ${s.color}`}>
                                <p className="text-3xl font-bold">{s.value}</p>
                                <p className="text-sm font-medium mt-1 opacity-80">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-2" style={{ borderBottom: '1px solid #2a2a2a' }}>
                        {[
                            { key: 'users', label: 'User Management', icon: <MdPeople size={16} /> },
                            { key: 'reimbursements', label: 'Reimbursements', icon: <MdCurrencyRupee size={16} />, count: reimbursements.filter(r => r.status === 'Pending').length },
                        ].map((tab) => (
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

                    {/* Users Management Tab */}
                    {activeTab === 'users' && (
                        <div className="card">
                            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                                <div>
                                    <h2 className="font-bold text-dark text-lg">User Management</h2>
                                    <p className="text-sm text-dark/50">Manage all system users and their roles</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="search-users"
                                        type="text"
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="input-field w-52 py-2"
                                    />
                                    <button
                                        id="add-user-btn"
                                        onClick={() => setModal({ open: true, user: null })}
                                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <MdAdd size={18} />
                                        Add User
                                    </button>
                                </div>
                            </div>

                            {loading ? <LoadingSpinner /> : (
                                <div className="w-full">
                                    {filteredUsers.length === 0 ? (
                                        <div className="text-center py-12">
                                            <MdPeople className="mx-auto text-beige-400 mb-3" size={48} />
                                            <p className="text-dark/50 font-medium">
                                                {search ? 'No users match your search' : 'No users found'}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Desktop Table View */}
                                            <div className="hidden lg:block overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-beige-100">
                                                            <th className="table-header rounded-l-lg">Name</th>
                                                            <th className="table-header">Email</th>
                                                            <th className="table-header">Department</th>
                                                            <th className="table-header">Role</th>
                                                            <th className="table-header">Status</th>
                                                            <th className="table-header rounded-r-lg">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-beige-100">
                                                        {filteredUsers.map((user) => (
                                                            <tr key={user._id} className="hover:bg-beige-50 transition-colors">
                                                                <td className="table-cell">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-9 h-9 rounded-full bg-dark text-beige-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                                            {user.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <span className="font-medium text-dark">{user.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="table-cell text-dark/60">{user.email}</td>
                                                                <td className="table-cell text-dark/60">{user.department || '—'}</td>
                                                                <td className="table-cell">{roleBadge(user.role)}</td>
                                                                <td className="table-cell">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                                        {user.isActive !== false ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </td>
                                                                <td className="table-cell">
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            id={`edit-user-${user._id}`}
                                                                            onClick={() => setModal({ open: true, user })}
                                                                            className="w-8 h-8 rounded-lg bg-beige-100 hover:bg-beige-200 flex items-center justify-center transition-colors"
                                                                            title="Edit user"
                                                                        >
                                                                            <MdEdit size={15} className="text-dark" />
                                                                        </button>
                                                                        <button
                                                                            id={`delete-user-${user._id}`}
                                                                            onClick={() => handleDelete(user)}
                                                                            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                                                                            title="Delete user"
                                                                        >
                                                                            <MdDelete size={15} className="text-red-500" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Card View */}
                                            <div className="lg:hidden space-y-4">
                                                {filteredUsers.map((user) => (
                                                    <div key={user._id} className="p-4 rounded-xl border border-beige-100 bg-white shadow-sm space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-dark text-beige-300 flex items-center justify-center font-bold text-sm">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-dark">{user.name}</p>
                                                                    <p className="text-xs text-dark/50">{user.email}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                {roleBadge(user.role)}
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                                    {user.isActive !== false ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="pt-2 flex items-center justify-between border-t border-beige-50">
                                                            <p className="text-xs text-dark/60 font-medium">Dept: {user.department || '—'}</p>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setModal({ open: true, user })}
                                                                    className="px-3 py-1.5 rounded-lg bg-beige-100 text-dark text-xs font-semibold"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(user)}
                                                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reimbursements Tab */}
                    {activeTab === 'reimbursements' && (
                        <div className="card">
                            <div className="flex flex-wrap items-center gap-3 mb-5">
                                <h3 className="font-bold text-base flex-1" style={{ color: '#f0f0f0' }}>Reimbursement Overview</h3>
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
                                ) : (
                                    reimbursements.map((req) => (
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
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {modal.open && (
                <UserModal
                    user={modal.user}
                    onClose={() => setModal({ open: false, user: null })}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

export default AdminPanel;
