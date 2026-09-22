import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, Calendar, FileText, DollarSign } from 'lucide-react';
import api from '../../services/api';

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard').then(({ data }) => setStats(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Reports" role="admin"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Reports & Analytics" role="admin">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Employees" value={stats?.totalEmployees} color="blue" />
        <StatCard icon={Calendar} label="Pending Leaves" value={stats?.pendingLeaves} color="amber" />
        <StatCard icon={FileText} label="Total EOD Submissions" value={stats?.eodStats?.total} color="purple" />
        <StatCard icon={DollarSign} label="Credited Salaries" value={stats?.creditedSalaries} color="green" />
      </div>

      <div className="mt-6 glass-card">
        <h3 className="mb-4 font-semibold">Department Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="pb-3 pr-4">Department</th>
                <th className="pb-3">Employee Count</th>
              </tr>
            </thead>
            <tbody>
              {stats?.departmentStats?.map((d) => (
                <tr key={d._id} className="border-b border-white/5">
                  <td className="py-3 pr-4">{d._id}</td>
                  <td className="py-3">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
