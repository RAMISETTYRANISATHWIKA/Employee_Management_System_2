import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, statusBadge } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchAnnouncements = () => {
    api.get('/announcements/all').then(({ data }) => {
      setAnnouncements(data.data.announcements);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/announcements', { ...data, isPublished: true });
      toast.success('Announcement published');
      setModalOpen(false);
      reset();
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <DashboardLayout title="Announcements" role="admin">
      <div className="mb-4 flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Publish</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a._id} className="glass-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{a.title}</h3>
                <span className={statusBadge(a.priority)}>{a.priority}</span>
              </div>
              <p className="mt-2 text-sm text-white/70">{a.content}</p>
              <p className="mt-2 text-xs text-white/50">{formatDate(a.publicationDate)} · {a.isPublished ? 'Published' : 'Draft'}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Publish Announcement">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Title</label>
            <input {...register('title')} className="glass-input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Content</label>
            <textarea {...register('content')} className="glass-input min-h-[100px]" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-white/70">Priority</label>
              <select {...register('priority')} className="glass-input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Audience</label>
              <select {...register('audience')} className="glass-input">
                <option value="all">All</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">Publish</button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
