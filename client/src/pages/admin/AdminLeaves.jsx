import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate, statusBadge } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchLeaves = () => {
    api.get(`/leaves?status=${filter}`).then(({ data }) => {
      setLeaves(data.data.leaves);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); fetchLeaves(); }, [filter]);

  const review = async (id, status) => {
    const comment = status === 'rejected' ? prompt('Rejection reason:') : '';
    if (status === 'rejected' && !comment) return;
    try {
      await api.patch(`/leaves/${id}/review`, { status, approvalComment: comment });
      toast.success(`Leave ${status}`);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <DashboardLayout title="Leave Approval" role="admin">
      <div className="mb-4 flex gap-2">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button key={s || 'all'} onClick={() => setFilter(s)} className={`rounded-xl px-4 py-2 text-sm ${filter === s ? 'bg-primary' : 'bg-white/10'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : leaves.length === 0 ? (
        <EmptyState title="No leave requests" />
      ) : (
        <div className="space-y-4">
          {leaves.map((l) => (
            <div key={l._id} className="glass-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{l.employee?.fullName} ({l.employee?.employeeId})</h3>
                  <p className="text-sm text-white/60">{l.employee?.department} · {l.leaveType} · {l.totalDays} day(s)</p>
                  <p className="text-sm">{formatDate(l.startDate)} - {formatDate(l.endDate)}</p>
                  <p className="mt-2 text-sm text-white/70">{l.reason}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={statusBadge(l.status)}>{l.status}</span>
                  {l.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => review(l._id, 'approved')} className="btn-primary text-sm py-1.5">Approve</button>
                      <button onClick={() => review(l._id, 'rejected')} className="btn-danger text-sm py-1.5">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
