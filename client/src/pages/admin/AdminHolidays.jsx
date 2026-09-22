import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchHolidays = () => {
    api.get('/holidays/all').then(({ data }) => setHolidays(data.data.holidays)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchHolidays(); }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/holidays', data);
      toast.success('Holiday created');
      setModalOpen(false);
      reset();
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deleteHoliday = async (id) => {
    if (!confirm('Delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      toast.success('Holiday deleted');
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <DashboardLayout title="Holiday Management" role="admin">
      <div className="mb-4 flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Holiday</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {holidays.map((h) => (
            <div key={h._id} className="glass-card">
              <div className="flex justify-between">
                <h3 className="font-semibold">{h.name}</h3>
                <button onClick={() => deleteHoliday(h._id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>
              <p className="mt-1 text-primary">{formatDate(h.date)}</p>
              <p className="text-sm capitalize text-white/60">{h.type}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Holiday">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Name</label>
            <input {...register('name')} className="glass-input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Date</label>
            <input {...register('date')} type="date" className="glass-input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Type</label>
            <select {...register('type')} className="glass-input">
              <option value="public">Public</option>
              <option value="optional">Optional</option>
              <option value="company">Company</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Description</label>
            <textarea {...register('description')} className="glass-input" />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">Create</button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
