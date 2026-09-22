import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency, statusBadge } from '../../utils/formatters';
import api from '../../services/api';

export default function AdminSalaries() {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchData = () => {
    Promise.all([
      api.get('/salaries'),
      api.get('/employees?limit=100'),
    ]).then(([salRes, empRes]) => {
      setSalaries(salRes.data.data.salaries);
      setEmployees(empRes.data.data.employees);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/salaries', { ...data, grossSalary: +data.grossSalary, deductions: +data.deductions || 0, bonus: +data.bonus || 0 });
      toast.success('Salary record created');
      setModalOpen(false);
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const payload = { status };
      if (status === 'credited') payload.creditDate = new Date().toISOString();
      await api.patch(`/salaries/${id}/status`, payload);
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <DashboardLayout title="Salary Management" role="admin">
      <div className="mb-4 flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> New Record</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="pb-3 pr-4">Employee</th>
                <th className="pb-3 pr-4">Period</th>
                <th className="pb-3 pr-4">Net</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((s) => (
                <tr key={s._id} className="border-b border-white/5">
                  <td className="py-3 pr-4">{s.employee?.fullName}</td>
                  <td className="py-3 pr-4">{s.payrollPeriod}</td>
                  <td className="py-3 pr-4">{formatCurrency(s.netSalary)}</td>
                  <td className="py-3 pr-4"><span className={statusBadge(s.status)}>{s.status}</span></td>
                  <td className="py-3 space-x-2">
                    {s.status === 'draft' && <button onClick={() => updateStatus(s._id, 'pending_review')} className="text-xs text-primary">Review</button>}
                    {s.status === 'pending_review' && <button onClick={() => updateStatus(s._id, 'approved')} className="text-xs text-primary">Approve</button>}
                    {s.status === 'approved' && <button onClick={() => updateStatus(s._id, 'credited')} className="text-xs text-emerald-400">Credit</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Salary Record">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Employee</label>
            <select {...register('employee')} className="glass-input" required>
              <option value="">Select employee</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.fullName} ({e.employeeId})</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Payroll Period</label>
            <input {...register('payrollPeriod')} placeholder="2026-01" className="glass-input" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm text-white/70">Gross</label>
              <input {...register('grossSalary')} type="number" className="glass-input" required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Deductions</label>
              <input {...register('deductions')} type="number" className="glass-input" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Bonus</label>
              <input {...register('bonus')} type="number" className="glass-input" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">Create</button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
