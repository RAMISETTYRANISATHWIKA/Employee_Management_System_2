import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { KeyRound } from 'lucide-react';
import PasswordInput from '../../components/PasswordInput';

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function ChangePassword() {
  const { changePassword, user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully');
      navigate(user?.role === 'admin' ? '/admin' : '/staff');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <div className="mb-6 flex items-center gap-3">
          <KeyRound className="h-8 w-8 text-amber-400" />
          <div>
            <h1 className="text-xl font-bold">Change Password</h1>
            <p className="text-sm text-white/60">Required on first login</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/70">Current Password</label>
            <PasswordInput register={register} name="currentPassword" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">New Password</label>
            <PasswordInput register={register} name="newPassword" />
            {errors.newPassword && <p className="mt-1 text-xs text-red-400">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Confirm Password</label>
            <PasswordInput register={register} name="confirmPassword" />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
