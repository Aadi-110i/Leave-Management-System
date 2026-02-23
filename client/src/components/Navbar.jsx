import { useState, useEffect } from 'react';
import {
    MdNotifications, MdClose, MdCheckCircle, MdLocalFireDepartment,
    MdDone, MdWarning, MdSwapHoriz, MdMenu,
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { getNotificationsApi, markAllReadApi } from '../api/endpoints';

const Navbar = ({ title }) => {
    const { user } = useAuth();
    const { toggle } = useSidebar();
    const [notifs, setNotifs] = useState([]);
    const [open, setOpen] = useState(false);

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const unread = notifs.filter((n) => !n.isRead).length;

    useEffect(() => {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 60000); // poll every minute
        return () => clearInterval(interval);
    }, []);

    const fetchNotifs = async () => {
        try {
            const res = await getNotificationsApi();
            setNotifs(res.data.notifications || []);
        } catch (_) { }
    };

    const handleMarkAll = async () => {
        try {
            await markAllReadApi();
            setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (_) { }
    };

    const typeIcon = (type) => {
        if (type === 'burnout_risk') return { icon: MdLocalFireDepartment, color: '#ef4444' };
        if (type === 'leave_approved') return { icon: MdDone, color: '#4ade80' };
        if (type === 'leave_rejected') return { icon: MdClose, color: '#ef4444' };
        if (type === 'emergency_leave') return { icon: MdWarning, color: '#f97316' };
        if (type === 'swap_request') return { icon: MdSwapHoriz, color: '#4ade80' };
        return { icon: MdNotifications, color: '#6b6b6b' };
    };

    return (
        <header className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-30"
            style={{ background: '#111111', borderBottom: '1px solid #1e1e1e' }}>
            <div className="flex items-center gap-3">
                {/* Hamburger — mobile only */}
                <button onClick={toggle}
                    className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#9e9e9e' }}>
                    <MdMenu size={20} />
                </button>
                <div>
                    <h1 className="text-lg sm:text-2xl font-bold tracking-tight" style={{ color: '#f0f0f0' }}>{title}</h1>
                    <p className="page-subtitle hidden sm:block">{today}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notification bell */}
                <div className="relative">
                    <button
                        id="notif-bell"
                        onClick={() => setOpen(!open)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors relative"
                        style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}
                    >
                        <MdNotifications size={20} style={{ color: unread > 0 ? '#4ade80' : '#6b6b6b' }} />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold text-black"
                                style={{ background: '#4ade80' }}>
                                {unread > 9 ? '9+' : unread}
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {open && (
                        <div className="absolute right-0 top-11 w-80 rounded-xl shadow-2xl z-50 overflow-hidden"
                            style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
                            <div className="flex items-center justify-between px-4 py-3"
                                style={{ borderBottom: '1px solid #2a2a2a' }}>
                                <p className="font-semibold text-sm" style={{ color: '#f0f0f0' }}>
                                    Notifications {unread > 0 && <span className="accent-pill ml-1">{unread} new</span>}
                                </p>
                                <div className="flex items-center gap-2">
                                    {unread > 0 && (
                                        <button onClick={handleMarkAll} className="text-xs flex items-center gap-1"
                                            style={{ color: '#4ade80' }}>
                                            <MdCheckCircle size={14} /> Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setOpen(false)}
                                        className="text-sm" style={{ color: '#6b6b6b' }}>
                                        <MdClose size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-72 overflow-y-auto">
                                {notifs.length === 0 ? (
                                    <p className="text-center py-8 text-sm" style={{ color: '#4d4d4d' }}>No notifications yet</p>
                                ) : notifs.slice(0, 10).map((n) => (
                                    <div key={n._id}
                                        className="px-4 py-3 flex items-start gap-3 transition-colors"
                                        style={{
                                            borderBottom: '1px solid #1e1e1e',
                                            background: n.isRead ? 'transparent' : 'rgba(74,222,128,0.05)',
                                        }}>
                                        <div className="flex-shrink-0 mt-0.5" style={{ color: typeIcon(n.type).color }}>
                                            {(() => { const { icon: Icon } = typeIcon(n.type); return <Icon size={16} />; })()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold truncate" style={{ color: '#f0f0f0' }}>{n.title}</p>
                                            <p className="text-xs mt-0.5 leading-snug" style={{ color: '#6b6b6b' }}>{n.message}</p>
                                            <p className="text-[10px] mt-1" style={{ color: '#3d3d3d' }}>
                                                {new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: '#4ade80' }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User avatar */}
                <div className="flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid #2a2a2a' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-sm font-semibold leading-tight" style={{ color: '#f0f0f0' }}>{user?.name}</p>
                        <p className="text-xs capitalize" style={{ color: '#6b6b6b' }}>{user?.department}</p>
                    </div>
                    <div className="lg:hidden">
                        <p className="text-xs font-semibold leading-tight" style={{ color: '#f0f0f0' }}>{user?.name?.split(' ')[0]}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
