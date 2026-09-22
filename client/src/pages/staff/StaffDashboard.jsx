import { useEffect, useState } from 'react';
import { Calendar, DollarSign, ClipboardList, Megaphone } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatCurrency } from '../../utils/formatters';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/announcements?limit=3'),
      api.get('/holidays?limit=5'),
    ]).then(([statsRes, annRes, holRes]) => {
      setStats(statsRes.data.data);
      setAnnouncements(annRes.data.data.announcements);
      setHolidays(holRes.data.data.holidays);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Dashboard" role="staff"><LoadingSpinner /></DashboardLayout>;

  const emp = stats?.employee || user?.employee;

  return (
    <DashboardLayout title="Staff Dashboard" role="staff">
      <div className="mb-6 glass-card">
        <h2 className="text-2xl font-bold">Welcome, {emp?.fullName}!</h2>
        <p className="text-white/60">Employee ID: {emp?.employeeId}</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Calendar} label="Pending Leaves" value={stats?.pendingLeaves} color="amber" />
        <StatCard icon={Calendar} label="Annual Balance" value={emp?.leaveBalance?.annual} color="blue" />
        <StatCard icon={DollarSign} label="Latest Salary" value={formatCurrency(stats?.latestSalary?.netSalary)} color="green" />
        <StatCard icon={ClipboardList} label="EOD Today" value={stats?.eodSubmitted ? 'Submitted' : 'Pending'} color="purple" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card">
          <h3 className="mb-4 flex items-center gap-2 font-semibold"><Megaphone className="h-5 w-5" /> Latest Announcements</h3>
          {announcements.length === 0 ? <p className="text-white/50">No announcements</p> : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a._id} className="rounded-xl bg-white/5 p-3">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-white/50">{formatDate(a.publicationDate)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="glass-card">
          <h3 className="mb-4 flex items-center gap-2 font-semibold"><Calendar className="h-5 w-5" /> Upcoming Holidays</h3>
          {holidays.length === 0 ? <p className="text-white/50">No upcoming holidays</p> : (
            <div className="space-y-3">
              {holidays.map((h) => (
                <div key={h._id} className="flex justify-between rounded-xl bg-white/5 p-3">
                  <span>{h.name}</span>
                  <span className="text-white/50">{formatDate(h.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
