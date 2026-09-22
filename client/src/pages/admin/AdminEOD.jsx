import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate, statusBadge } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminEOD() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/eod?status=submitted').then(({ data }) => {
      setReports(data.data.reports);
    }).finally(() => setLoading(false));
  }, []);

  const review = async (id, status) => {
    const feedback = prompt('Feedback (optional):') || '';
    try {
      await api.patch(`/eod/${id}/review`, { status, adminFeedback: feedback });
      toast.success('EOD reviewed');
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <DashboardLayout title="EOD Reports" role="admin">
      {loading ? <LoadingSpinner /> : reports.length === 0 ? (
        <EmptyState title="No pending EOD reports" />
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r._id} className="glass-card">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{r.employee?.fullName}</h3>
                  <p className="text-sm text-white/60">{r.employee?.department} · {formatDate(r.workDate)}</p>
                </div>
                <span className={statusBadge(r.status)}>{r.status}</span>
              </div>
              <p className="text-sm">{r.workSummary}</p>
              {r.tasksCompleted && <p className="mt-2 text-sm text-white/60"><strong>Completed:</strong> {r.tasksCompleted}</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => review(r._id, 'reviewed')} className="btn-primary text-sm py-1.5">Approve</button>
                <button onClick={() => review(r._id, 'returned')} className="btn-secondary text-sm py-1.5">Return</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
