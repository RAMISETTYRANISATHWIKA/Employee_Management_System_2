import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function DashboardLayout({ children, title, role }) {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto flex max-w-[1600px] gap-6">
        <Sidebar role={role} />
        <main className="flex-1 min-w-0">
          <Header title={title} />
          {children}
        </main>
      </div>
    </div>
  );
}
