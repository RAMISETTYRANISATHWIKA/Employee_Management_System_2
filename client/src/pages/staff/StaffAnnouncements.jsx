import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate, statusBadge } from '../../utils/formatters';
import api from '../../services/api';

export default function StaffAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get(`/announcements?search=${search}`).then(({ data }) => {
      setAnnouncements(data.data.announcements);
    }).finally(() => setLoading(false));
  }, [search]);

  const markRead = async (id) => {
    await api.patch(`/announcements/${id}/read`);
    setAnnouncements((prev) => prev.map((a) => (a._id === id ? { ...a, isRead: true } : a)));
  };

  return (
    <DashboardLayout title="Announcements" role="staff">
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search announcements..."
          className="glass-input max-w-sm"
        />
      </div>

      {loading ? <LoadingSpinner /> : announcements.length === 0 ? (
        <EmptyState title="No announcements" />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a._id} className={`glass-card ${!a.isRead ? 'border-l-4 border-l-primary' : ''}`}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">{a.title}</h3>
                <span className={statusBadge(a.priority)}>{a.priority}</span>
              </div>
              <p className="text-sm text-white/70">{a.content}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                <span>{formatDate(a.publicationDate)}</span>
                {!a.isRead && (
                  <button onClick={() => markRead(a._id)} className="text-primary hover:underline">Mark as read</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
