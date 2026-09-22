import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, DollarSign, FileText, Megaphone, BarChart3, ClipboardList, UserCircle, Bell } from 'lucide-react';

const staffLinks = [
  { to: '/staff', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/staff/profile', icon: UserCircle, label: 'Profile' },
  { to: '/staff/leaves', icon: Calendar, label: 'Leaves' },
  { to: '/staff/salary', icon: DollarSign, label: 'Salary' },
  { to: '/staff/eod', icon: ClipboardList, label: 'EOD Reports' },
  { to: '/staff/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/staff/holidays', icon: Calendar, label: 'Holidays' },
  { to: '/staff/notifications', icon: Bell, label: 'Notifications' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/employees', icon: Users, label: 'Employees' },
  { to: '/admin/leaves', icon: Calendar, label: 'Leave Approval' },
  { to: '/admin/salaries', icon: DollarSign, label: 'Salaries' },
  { to: '/admin/eod', icon: FileText, label: 'EOD Reports' },
  { to: '/admin/holidays', icon: Calendar, label: 'Holidays' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
];

export default function Sidebar({ role = 'staff' }) {
  const links = role === 'admin' ? adminLinks : staffLinks;

  return (
    <aside className="glass hidden w-64 shrink-0 flex-col rounded-2xl p-4 lg:flex">
      <div className="mb-8 px-2">
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          EMS Portal
        </h2>
        <p className="text-xs text-white/50 capitalize">{role} Portal</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-primary/30 text-white font-medium border border-primary/40'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
