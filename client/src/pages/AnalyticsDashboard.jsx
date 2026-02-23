import { useState, useEffect } from 'react';
import { getAnalyticsApi } from '../api/endpoints';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler,
} from 'chart.js';
import {
    MdBarChart, MdTrendingUp, MdPeople, MdCalendarToday,
    MdEmergency, MdHourglassEmpty,
} from 'react-icons/md';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const chartDefaults = {
    plugins: {
        legend: { labels: { color: '#9e9e9e', font: { size: 11 } } },
    },
    scales: {
        x: { ticks: { color: '#6b6b6b' }, grid: { color: '#1e1e1e' } },
        y: { ticks: { color: '#6b6b6b' }, grid: { color: '#1e1e1e' } },
    },
};

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await getAnalyticsApi();
                setData(res.data);
            } catch (_) {
                toast.error('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return (
        <div className="flex h-screen" style={{ background: '#111111' }}>
            <Sidebar />
            <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
        </div>
    );

    const { monthlyTrend = [], leaveTypeBreakdown = [], deptBreakdown = [], summary = {} } = data || {};

    // Monthly trend chart
    const trendLabels = monthlyTrend.map((m) => `${MONTHS[m._id.month - 1]} ${m._id.year}`);
    const trendData = {
        labels: trendLabels,
        datasets: [
            {
                label: 'Total',
                data: monthlyTrend.map((m) => m.total),
                borderColor: '#4ade80',
                backgroundColor: 'rgba(74,222,128,0.08)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4ade80',
                pointRadius: 4,
            },
            {
                label: 'Approved',
                data: monthlyTrend.map((m) => m.approved),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34,197,94,0.05)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#22c55e',
                pointRadius: 3,
            },
            {
                label: 'Rejected',
                data: monthlyTrend.map((m) => m.rejected),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239,68,68,0.05)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ef4444',
                pointRadius: 3,
            },
        ],
    };

    // Leave type doughnut
    const leaveColors = ['#4ade80', '#22c55e', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6'];
    const donutData = {
        labels: leaveTypeBreakdown.map((l) => l._id),
        datasets: [{
            data: leaveTypeBreakdown.map((l) => l.count),
            backgroundColor: leaveColors.map((c) => `${c}99`),
            borderColor: leaveColors,
            borderWidth: 1,
        }],
    };

    // Department bar chart
    const deptData = {
        labels: deptBreakdown.map((d) => d._id || 'Unknown'),
        datasets: [{
            label: 'Approved Leaves',
            data: deptBreakdown.map((d) => d.totalLeaves),
            backgroundColor: 'rgba(74,222,128,0.5)',
            borderColor: '#4ade80',
            borderWidth: 1,
            borderRadius: 6,
        }],
    };

    const summaryCards = [
        { label: 'Total Requests', value: summary.total ?? 0, icon: <MdCalendarToday size={20} />, color: '#4ade80' },
        { label: 'Approved', value: summary.approved ?? 0, icon: <MdTrendingUp size={20} />, color: '#22c55e' },
        { label: 'Pending', value: summary.pending ?? 0, icon: <MdHourglassEmpty size={20} />, color: '#f59e0b' },
        { label: 'Emergency', value: summary.emergency ?? 0, icon: <MdEmergency size={20} />, color: '#f97316' },
    ];

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#111111' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar title="Analytics Dashboard" />
                <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">

                    {/* Summary stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {summaryCards.map((c) => (
                            <div key={c.label} className="card-hover">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: `${c.color}18`, color: c.color }}>
                                        {c.icon}
                                    </div>
                                    <span style={{ color: c.color, fontSize: 28, fontWeight: 700 }}>{c.value}</span>
                                </div>
                                <p className="text-xs font-medium" style={{ color: '#6b6b6b' }}>{c.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Monthly Trend */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-5">
                            <MdTrendingUp size={20} style={{ color: '#4ade80' }} />
                            <h3 className="font-bold" style={{ color: '#f0f0f0' }}>Monthly Leave Trend (12 Months)</h3>
                        </div>
                        {monthlyTrend.length === 0 ? (
                            <p className="text-center py-10" style={{ color: '#4d4d4d' }}>Not enough data yet</p>
                        ) : (
                            <div style={{ height: 240 }}>
                                <Line data={trendData} options={{ ...chartDefaults, responsive: true, maintainAspectRatio: false }} />
                            </div>
                        )}
                    </div>

                    {/* Two charts side-by-side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Leave Types Doughnut */}
                        <div className="card">
                            <div className="flex items-center gap-2 mb-5">
                                <MdBarChart size={20} style={{ color: '#4ade80' }} />
                                <h3 className="font-bold" style={{ color: '#f0f0f0' }}>Leave Type Breakdown</h3>
                            </div>
                            {leaveTypeBreakdown.length === 0 ? (
                                <p className="text-center py-10" style={{ color: '#4d4d4d' }}>No data</p>
                            ) : (
                                <div style={{ height: 220 }}>
                                    <Doughnut data={donutData} options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'right', labels: { color: '#9e9e9e', font: { size: 11 }, boxWidth: 12 } },
                                        },
                                    }} />
                                </div>
                            )}
                        </div>

                        {/* Department Bar */}
                        <div className="card">
                            <div className="flex items-center gap-2 mb-5">
                                <MdPeople size={20} style={{ color: '#4ade80' }} />
                                <h3 className="font-bold" style={{ color: '#f0f0f0' }}>Department Absenteeism</h3>
                            </div>
                            {deptBreakdown.length === 0 ? (
                                <p className="text-center py-10" style={{ color: '#4d4d4d' }}>No data</p>
                            ) : (
                                <div style={{ height: 220 }}>
                                    <Bar data={deptData} options={{ ...chartDefaults, responsive: true, maintainAspectRatio: false }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Department table */}
                    <div className="card">
                        <h3 className="font-bold mb-4" style={{ color: '#f0f0f0' }}>Department Leave Summary</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                                        {['Department', 'Total Leaves', 'Total Days', 'Avg Days/Leave'].map((h) => (
                                            <th key={h} className="table-header">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {deptBreakdown.map((d) => (
                                        <tr key={d._id} style={{ borderBottom: '1px solid #1e1e1e' }}>
                                            <td className="table-cell font-medium">{d._id || 'N/A'}</td>
                                            <td className="table-cell" style={{ color: '#4ade80' }}>{d.totalLeaves}</td>
                                            <td className="table-cell">{Math.round(d.totalDays)}</td>
                                            <td className="table-cell">{(d.totalDays / d.totalLeaves).toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div >
    );
};

export default AnalyticsDashboard;
