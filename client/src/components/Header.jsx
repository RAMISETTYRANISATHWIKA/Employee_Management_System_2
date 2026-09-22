import { Bell, LogOut, User, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Header({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    api.get('/notifications?unreadOnly=true&limit=1').then(({ data }) => {
      setUnread(data.data.unreadCount || 0);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="glass mb-6 flex items-center justify-between rounded-2xl px-6 py-4">
      <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDark(!dark)}
          className="rounded-xl p-2 hover:bg-white/10"
          title="Toggle theme"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          onClick={() => navigate(user?.role === 'admin' ? '/admin/notifications' : '/staff/notifications')}
          className="relative rounded-xl p-2 hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs">
              {unread}
            </span>
          )}
        </button>
        <div className="hidden items-center gap-2 rounded-xl bg-white/10 px-3 py-2 sm:flex">
          <User className="h-4 w-4" />
          <span className="text-sm">{user?.employee?.fullName || user?.email}</span>
        </div>
        <button onClick={handleLogout} className="rounded-xl p-2 hover:bg-red-500/20" title="Logout">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
