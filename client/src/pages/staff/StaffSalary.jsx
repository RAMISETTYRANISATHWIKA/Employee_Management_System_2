import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate, formatCurrency, statusBadge } from '../../utils/formatters';
import api from '../../services/api';

export default function StaffSalary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/salaries/my').then(({ data }) => setData(data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Salary" role="staff">
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="mb-6 glass-card">
            <p className="text-white/60">Current Base Salary</p>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(data?.currentSalary)}</p>
          </div>

          {data?.salaries?.length === 0 ? (
            <EmptyState title="No salary records" description="Salary records will appear here once processed" />
          ) : (
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/60">
                    <th className="pb-3 pr-4">Period</th>
                    <th className="pb-3 pr-4">Gross</th>
                    <th className="pb-3 pr-4">Deductions</th>
                    <th className="pb-3 pr-4">Bonus</th>
                    <th className="pb-3 pr-4">Net</th>
                    <th className="pb-3 pr-4">Credit Date</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.salaries?.map((s) => (
                    <tr key={s._id} className="border-b border-white/5">
                      <td className="py-3 pr-4">{s.payrollPeriod}</td>
                      <td className="py-3 pr-4">{formatCurrency(s.grossSalary)}</td>
                      <td className="py-3 pr-4">{formatCurrency(s.deductions)}</td>
                      <td className="py-3 pr-4">{formatCurrency(s.bonus)}</td>
                      <td className="py-3 pr-4 font-medium">{formatCurrency(s.netSalary)}</td>
                      <td className="py-3 pr-4">{formatDate(s.creditDate)}</td>
                      <td className="py-3"><span className={statusBadge(s.status)}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
