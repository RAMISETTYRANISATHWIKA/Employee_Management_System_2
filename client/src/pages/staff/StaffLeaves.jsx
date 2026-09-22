import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, statusBadge } from '../../utils/formatters';
import api from '../../services/api';

export default function StaffLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      leaveType: 'annual',
      dayType: 'full',
    },
  });

  const selectedLeaveType = watch('leaveType');
  const selectedDayType = watch('dayType');

  const fetchLeaves = () => {
    api.get('/leaves/my').then(({ data }) => setLeaves(data.data.leaves)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/leaves', data);
      toast.success('Leave request submitted');
      setModalOpen(false);
      reset();
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  };

  const cancelLeave = async (id) => {
    try {
      await api.patch(`/leaves/${id}/cancel`);
      toast.success('Leave cancelled');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <DashboardLayout title="Leave Management" role="staff">
      <div className="mb-4 flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Request Leave</button>
      </div>

      {loading ? <LoadingSpinner /> : leaves.length === 0 ? (
        <EmptyState title="No leave requests" description="Create your first leave request" />
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Dates</th>
                <th className="pb-3 pr-4">Days</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id} className="border-b border-white/5">
                  <td className="py-3 pr-4 capitalize">{l.leaveType}</td>
                  <td className="py-3 pr-4">{formatDate(l.startDate)} - {formatDate(l.endDate)}</td>
                  <td className="py-3 pr-4">{l.totalDays}</td>
                  <td className="py-3 pr-4"><span className={statusBadge(l.status)}>{l.status}</span></td>
                  <td className="py-3">
                    {l.status === 'pending' && (
                      <button onClick={() => cancelLeave(l._id)} className="text-sm text-red-400 hover:underline">Cancel</button>
                    )}
                    {l.approvalComment && <p className="text-xs text-white/50 mt-1">{l.approvalComment}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Request Leave">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Leave Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['annual', 'sick', 'casual', 'unpaid'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('leaveType', type, { shouldDirty: true, shouldValidate: true })}
                  className={`rounded-xl border px-3 py-2 text-sm capitalize transition ${
                    selectedLeaveType === type
                      ? 'border-primary bg-primary/20 text-white shadow-[0_0_0_1px_rgba(96,165,250,0.5)]'
                      : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-white/70">Start Date</label>
              <input {...register('startDate')} type="date" className="glass-input" required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">End Date</label>
              <input {...register('endDate')} type="date" className="glass-input" required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Day Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['full', 'half'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('dayType', type, { shouldDirty: true, shouldValidate: true })}
                  className={`rounded-xl border px-3 py-2 text-sm capitalize transition ${
                    selectedDayType === type
                      ? 'border-primary bg-primary/20 text-white shadow-[0_0_0_1px_rgba(96,165,250,0.5)]'
                      : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {type === 'full' ? 'Full Day' : 'Half Day'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Reason</label>
            <textarea {...register('reason')} className="glass-input min-h-[80px]" required />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">Submit Request</button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
