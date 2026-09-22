import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import PasswordInput from '../../components/PasswordInput';
import { formatDate, statusBadge } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchEmployees = () => {
    api.get(`/employees?search=${search}`).then(({ data }) => {
      setEmployees(data.data.employees);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, [search]);

  const onSubmit = async (data) => {
    try {
      const { data: responseData } = await api.post('/employees', data);
      const tempPassword = responseData?.data?.temporaryPassword;

      toast.success(
        tempPassword
          ? `Employee created. Temporary password: ${tempPassword}`
          : 'Employee created'
      );

      setModalOpen(false);
      reset();
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/employees/${id}/toggle-status`);
      toast.success('Status updated');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <DashboardLayout title="Employee Management" role="admin">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="glass-input pl-10" />
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Employee</button>
      </div>

      {loading ? <LoadingSpinner /> : employees.length === 0 ? (
        <EmptyState title="No employees found" />
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Department</th>
                <th className="pb-3 pr-4">Designation</th>
                <th className="pb-3 pr-4">Joined</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e._id} className="border-b border-white/5">
                  <td className="py-3 pr-4">{e.employeeId}</td>
                  <td className="py-3 pr-4">{e.fullName}</td>
                  <td className="py-3 pr-4">{e.officialEmail}</td>
                  <td className="py-3 pr-4">{e.department}</td>
                  <td className="py-3 pr-4">{e.designation}</td>
                  <td className="py-3 pr-4">{formatDate(e.joiningDate)}</td>
                  <td className="py-3 pr-4"><span className={statusBadge(e.employmentStatus)}>{e.employmentStatus}</span></td>
                  <td className="py-3">
                    <button onClick={() => toggleStatus(e._id)} className="text-sm text-primary hover:underline">
                      {e.employmentStatus === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Employee" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-white/70">Full Name</label>
            <input {...register('fullName')} className="glass-input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Official Email</label>
            <input {...register('officialEmail')} type="email" className="glass-input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Phone</label>
            <input {...register('phone')} className="glass-input" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Department</label>
            <input {...register('department')} className="glass-input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Designation</label>
            <input {...register('designation')} className="glass-input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Joining Date</label>
            <input {...register('joiningDate')} type="date" className="glass-input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Role</label>
            <select {...register('role')} className="glass-input">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Base Salary</label>
            <input {...register('baseSalary')} type="number" className="glass-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-white/70">Password</label>
            <PasswordInput register={register} name="password" placeholder="Leave blank for auto-generated password" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">Create Employee</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
