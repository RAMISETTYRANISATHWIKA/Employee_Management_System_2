import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/audit-logs').then(({ data }) => {
      setLogs(data.data.logs);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Audit Logs" role="admin">
      {loading ? <LoadingSpinner /> : logs.length === 0 ? (
        <EmptyState title="No audit logs" />
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">Resource</th>
                <th className="pb-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id} className="border-b border-white/5">
                  <td className="py-3 pr-4">{formatDate(l.createdAt)}</td>
                  <td className="py-3 pr-4">{l.user?.email}</td>
                  <td className="py-3 pr-4">{l.action}</td>
                  <td className="py-3 pr-4">{l.resource}</td>
                  <td className="py-3">{l.ipAddress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
