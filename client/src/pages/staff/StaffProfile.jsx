import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StaffProfile() {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (user?.employee?._id) {
      api.get(`/employees/${user.employee._id}`).then(({ data }) => {
        reset(data.data.employee);
      }).finally(() => setLoading(false));
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      await api.put(`/employees/${user.employee._id}`, {
        phone: data.phone,
        personalEmail: data.personalEmail,
        emergencyContact: data.emergencyContact,
      });
      toast.success('Profile updated');
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <DashboardLayout title="Profile" role="staff"><LoadingSpinner /></DashboardLayout>;

  const emp = user?.employee;

  return (
    <DashboardLayout title="My Profile" role="staff">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card">
          <h3 className="mb-4 font-semibold">Personal Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-white/60">Employee ID</dt><dd>{emp?.employeeId}</dd></div>
            <div className="flex justify-between"><dt className="text-white/60">Full Name</dt><dd>{emp?.fullName}</dd></div>
            <div className="flex justify-between"><dt className="text-white/60">Email</dt><dd>{emp?.officialEmail}</dd></div>
            <div className="flex justify-between"><dt className="text-white/60">Department</dt><dd>{emp?.department}</dd></div>
            <div className="flex justify-between"><dt className="text-white/60">Designation</dt><dd>{emp?.designation}</dd></div>
            <div className="flex justify-between"><dt className="text-white/60">Joining Date</dt><dd>{formatDate(emp?.joiningDate)}</dd></div>
          </dl>
        </div>

        <div className="glass-card">
          <h3 className="mb-4 font-semibold">Editable Fields</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-white/70">Phone</label>
              <input {...register('phone')} className="glass-input" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Personal Email</label>
              <input {...register('personalEmail')} type="email" className="glass-input" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Emergency Contact Name</label>
              <input {...register('emergencyContact.name')} className="glass-input" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Emergency Contact Phone</label>
              <input {...register('emergencyContact.phone')} className="glass-input" />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
