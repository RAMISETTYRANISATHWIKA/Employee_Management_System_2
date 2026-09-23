import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Building2, Shield, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';

const schema = z.object({
  identifier: z.string().min(1, 'Email or Employee ID required'),
  password: z.string().min(1, 'Password required'),
});

export default function Login() {
  const [role, setRole] = useState('staff');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data.identifier, data.password, role);
      toast.success('Login successful!');
      if (result.user.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate(role === 'admin' ? '/admin' : '/staff');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 glass">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">EMPLOYEE MANAGEMENT SYSTEM 1</h1>
          <p className="mt-2 text-white/60">Sign in to your EMp portal</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="mb-6 flex rounded-xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setRole('staff')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                role === 'staff' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" /> Staff
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                role === 'admin' ? 'bg-primary text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Shield className="h-4 w-4" /> Admin  Portal
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Email or Employee ID</label>
              <input {...register('identifier')} className="glass-input" placeholder="staff@example.com" />
              {errors.identifier && <p className="mt-1 text-xs text-red-400">{errors.identifier.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Password</label>
              <PasswordInput register={register} name="password" placeholder="••••••••" />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Signing in...' : `Sign in as ${role}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
