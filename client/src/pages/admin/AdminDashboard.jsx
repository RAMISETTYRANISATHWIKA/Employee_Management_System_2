import { useEffect, useState } from 'react';
import { Users, UserCheck, Calendar, FileText, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard').then(({ data }) => setStats(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Dashboard" role="admin"><LoadingSpinner /></DashboardLayout>;

  const deptData = stats?.departmentStats?.map((d) => ({ name: d._id, count: d.count })) || [];

  return (
    <DashboardLayout title="Admin Dashboard" role="admin">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="Total Employees" value={stats?.totalEmployees} color="blue" />
        <StatCard icon={UserCheck} label="Active Employees" value={stats?.activeEmployees} color="green" />
        <StatCard icon={Calendar} label="Pending Leaves" value={stats?.pendingLeaves} color="amber" />
        <StatCard icon={FileText} label="EOD Today" value={stats?.eodStats?.today} color="purple" />
        <StatCard icon={DollarSign} label="Salaries Credited" value={stats?.creditedSalaries} color="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card">
          <h3 className="mb-4 font-semibold">Department Distribution</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptData}>
                <XAxis dataKey="name" stroke="#ffffff60" fontSize={12} />
                <YAxis stroke="#ffffff60" fontSize={12} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-white/50">No data available</p>}
        </div>

        <div className="glass-card">
          <h3 className="mb-4 font-semibold">Leave Usage by Type</h3>
          {stats?.leaveStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stats.leaveStats.map((l) => ({ name: l._id, value: l.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.leaveStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-white/50">No leave data</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
