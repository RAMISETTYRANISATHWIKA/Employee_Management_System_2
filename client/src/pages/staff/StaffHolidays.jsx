import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function StaffHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/holidays').then(({ data }) => setHolidays(data.data.holidays)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Company Holidays" role="staff">
      {loading ? <LoadingSpinner /> : holidays.length === 0 ? (
        <EmptyState title="No holidays scheduled" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {holidays.map((h) => (
            <div key={h._id} className="glass-card">
              <h3 className="font-semibold">{h.name}</h3>
              <p className="mt-1 text-primary">{formatDate(h.date)}</p>
              <p className="mt-2 text-sm capitalize text-white/60">{h.type} holiday</p>
              {h.description && <p className="mt-2 text-sm text-white/50">{h.description}</p>}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
