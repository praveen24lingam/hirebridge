import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DashboardLayout from '../../components/common/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', icon: 'D', path: '/admin/dashboard' },
      { label: 'Manage Jobs', icon: 'J', path: '/admin/jobs' },
      { label: 'Manage Users', icon: 'U', path: '/admin/users' },
      { label: 'Logout', icon: 'L', isButton: true, onClick: logout }
    ],
    [logout]
  );

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      try {
        const response = await api.get('/admin/dashboard');
        const { success, message, data } = response.data;

        if (!success) {
          toast.error(message || 'Something went wrong. Please try again.');
          return;
        }

        setStats(data || null);
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const weeklyCandidates = stats?.candidatesCreatedLast7Days || 0;
  const weeklyEmployers = stats?.employersCreatedLast7Days || 0;
  const weeklyJobs = stats?.jobsCreatedLast7Days || 0;
  const weeklyApplications = stats?.applicationsCreatedLast7Days || 0;

  return (
    <DashboardLayout
      sidebarBg="bg-slate-900"
      navItems={navItems}
      roleLabel="Admin"
      roleBadgeClassName="bg-white/10 text-white"
      logoClassName="text-white"
      headerBorderClassName="border-slate-800"
      navActiveClassName="border-l-4 border-white bg-white/10 text-white"
      navInactiveClassName="text-slate-200 hover:bg-white/10"
      footerBorderClassName="border-slate-800"
      footerButtonClassName="btn-secondary w-full border-white text-white hover:bg-white/10"
      showFooterLogout={false}
    >
      <div className="max-w-7xl">
        <h1 className="font-display text-4xl text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-slate-500">Watch platform activity and jump into moderation tasks quickly.</p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">Platform Overview</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-slate-200 border-t-4 border-t-slate-900 bg-white p-6">
              <p className="text-sm text-slate-500">Total Candidates</p>
              <p className="mt-3 font-display text-3xl text-slate-900">{stats?.totalCandidates || 0}</p>
            </div>
            <div className="rounded-lg border border-slate-200 border-t-4 border-t-slate-900 bg-white p-6">
              <p className="text-sm text-slate-500">Total Employers</p>
              <p className="mt-3 font-display text-3xl text-slate-900">{stats?.totalEmployers || 0}</p>
            </div>
            <div className="rounded-lg border border-slate-200 border-t-4 border-t-slate-900 bg-white p-6">
              <p className="text-sm text-slate-500">Total Jobs</p>
              <p className="mt-3 font-display text-3xl text-slate-900">{stats?.totalJobs || 0}</p>
            </div>
            <div className="rounded-lg border border-slate-200 border-t-4 border-t-slate-900 bg-white p-6">
              <p className="text-sm text-slate-500">Total Applications</p>
              <p className="mt-3 font-display text-3xl text-slate-900">{stats?.totalApplications || 0}</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">This Week</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-indigo-50 p-6">
              <p className="text-sm text-slate-500">New Candidates</p>
              <p className="mt-3 font-display text-3xl text-indigo-600">{weeklyCandidates}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-indigo-50 p-6">
              <p className="text-sm text-slate-500">New Employers</p>
              <p className="mt-3 font-display text-3xl text-indigo-600">{weeklyEmployers}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-indigo-50 p-6">
              <p className="text-sm text-slate-500">New Jobs</p>
              <p className="mt-3 font-display text-3xl text-indigo-600">{weeklyJobs}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-indigo-50 p-6">
              <p className="text-sm text-slate-500">New Applications</p>
              <p className="mt-3 font-display text-3xl text-indigo-600">{weeklyApplications}</p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/admin/jobs')}
            className="rounded-xl border border-slate-200 bg-white p-8 text-left"
          >
            <h3 className="text-xl font-semibold text-slate-900">Manage Jobs</h3>
            <p className="mt-2 text-slate-500">Review and moderate all job listings</p>
            <p className="mt-6 font-medium text-indigo-600">Open jobs panel -&gt;</p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="rounded-xl border border-slate-200 bg-white p-8 text-left"
          >
            <h3 className="text-xl font-semibold text-slate-900">Manage Users</h3>
            <p className="mt-2 text-slate-500">Manage candidate and employer accounts</p>
            <p className="mt-6 font-medium text-indigo-600">Open users panel -&gt;</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
