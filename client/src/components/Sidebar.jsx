import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar as useGlobalSidebar } from '../context/SidebarContext';
import { Sidebar, SidebarBody, SidebarLink } from './ui/sidebar';
import {
    LayoutDashboard, Users, FileText, LogOut, Briefcase,
    BarChart3, ArrowLeftRight, TrendingUp, Flame, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const NewSidebar = () => {
    const { user, logout } = useAuth();
    const { isOpen: open, setIsOpen: setOpen } = useGlobalSidebar();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        toast.success('Logged out');
        navigate('/login');
    };

    const employeeLinks = [
        { href: '/employee', label: 'Dashboard', icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
        { href: '/employee?tab=reimbursement', label: 'Reimbursements', icon: <TrendingUp className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
        { href: '/employee?tab=swap', label: 'Leave Swap', icon: <ArrowLeftRight className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    ];

    const managerLinks = [
        { href: '/manager', label: 'Leave Requests', icon: <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
        { href: '/manager?tab=reimbursements', label: 'Reimbursements', icon: <TrendingUp className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
        { href: '/manager?tab=burnout', label: 'Burnout Alerts', icon: <Flame className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
        { href: '/manager?tab=swaps', label: 'Swap Approvals', icon: <ArrowLeftRight className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
        { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    ];

    const adminLinks = [
        { href: '/admin', label: 'User Management', icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
        { href: '/admin?tab=reimbursements', label: 'Reimbursements', icon: <TrendingUp className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
        { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    ];

    const links = user?.role === 'admin' ? adminLinks : user?.role === 'manager' ? managerLinks : employeeLinks;

    return (
        <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10 bg-neutral-100 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    {open ? <Logo /> : <LogoIcon />}
                    <div className="mt-8 flex flex-col gap-2">
                        {links.map((link, idx) => (
                            <SidebarLink key={idx} link={link} className={location.pathname + location.search === link.href ? "bg-neutral-200 dark:bg-neutral-800 rounded-md px-2" : ""} />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                    <SidebarLink
                        link={{
                            label: user?.name || "User",
                            href: "#",
                            icon: (
                                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            ),
                        }}
                    />
                    <button onClick={handleLogout} className="flex items-center justify-start gap-2 group/sidebar py-2 px-0 text-neutral-700 dark:text-neutral-200 hover:text-red-500 transition-colors">
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {open && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm">Logout</motion.span>}
                    </button>
                </div>
            </SidebarBody>
        </Sidebar>
    );
};

const Logo = () => {
    return (
        <div className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20">
            <div className="h-6 w-7 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 flex items-center justify-center">
                <Briefcase size={14} className="text-white dark:text-black" />
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
            >
                <span className="font-bold text-black dark:text-white whitespace-pre text-sm leading-tight">
                    Employee Leave
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Management System
                </span>
            </motion.div>
        </div>
    );
};

const LogoIcon = () => {
    return (
        <div className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20">
            <div className="h-6 w-7 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 flex items-center justify-center">
                <Briefcase size={14} className="text-white dark:text-black" />
            </div>
        </div>
    );
};

export default NewSidebar;
