import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function StaffNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    api.get('/notifications').then(({ data }) => setNotifications(data.data.notifications)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    toast.success('All marked as read');
    fetchNotifications();
  };

  return (
    <DashboardLayout title="Notifications" role="staff">
      <div className="mb-4 flex justify-end">
        <button onClick={markAllRead} className="btn-secondary text-sm">Mark all read</button>
      </div>

      {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
        <EmptyState title="No notifications" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className={`glass-card ${!n.isRead ? 'border-l-4 border-l-blue-400' : ''}`}>
              <div className="flex justify-between">
                <h4 className="font-medium">{n.title}</h4>
                <span className="text-xs text-white/50">{formatDate(n.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-white/70">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
