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

export default function StaffEOD() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { workDate: new Date().toISOString().split('T')[0], taskStatus: 'on-track' },
  });

  const fetchReports = () => {
    api.get('/eod/my').then(({ data }) => setReports(data.data.reports)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const onSubmit = async (data, status = 'submitted') => {
    try {
      await api.post('/eod', { ...data, status });
      toast.success(status === 'draft' ? 'Draft saved' : 'EOD submitted');
      setModalOpen(false);
      reset();
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <DashboardLayout title="EOD Reports" role="staff">
      <div className="mb-4 flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> New EOD</button>
      </div>

      {loading ? <LoadingSpinner /> : reports.length === 0 ? (
        <EmptyState title="No EOD reports" description="Submit your daily work report" />
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r._id} className="glass-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{formatDate(r.workDate)}</span>
                <span className={statusBadge(r.status)}>{r.status}</span>
              </div>
              <p className="text-sm text-white/70">{r.workSummary}</p>
              {r.adminFeedback && <p className="mt-2 text-sm text-amber-300">Feedback: {r.adminFeedback}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Daily EOD Report" size="lg">
        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Work Date</label>
            <input {...register('workDate')} type="date" className="glass-input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Work Summary</label>
            <textarea {...register('workSummary')} className="glass-input min-h-[60px]" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Tasks Completed</label>
            <textarea {...register('tasksCompleted')} className="glass-input min-h-[60px]" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Tasks In Progress</label>
            <textarea {...register('tasksInProgress')} className="glass-input min-h-[60px]" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Blockers</label>
            <textarea {...register('blockers')} className="glass-input min-h-[60px]" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Tomorrow's Plan</label>
            <textarea {...register('tomorrowPlan')} className="glass-input min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-white/70">Total Hours</label>
              <input {...register('totalHours')} type="number" step="0.5" className="glass-input" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Task Status</label>
              <select {...register('taskStatus')} className="glass-input">
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handleSubmit((d) => onSubmit(d, 'draft'))} disabled={isSubmitting} className="btn-secondary flex-1">Save Draft</button>
            <button type="button" onClick={handleSubmit((d) => onSubmit(d, 'submitted'))} disabled={isSubmitting} className="btn-primary flex-1">Submit</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
