import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DashboardLayout from '../../components/common/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const filters = ['All', 'Applied', 'Shortlisted', 'Rejected', 'Withdrawn'];

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const navItems = [
    { label: 'Dashboard', icon: 'D', path: '/candidate/dashboard' },
    { label: 'Browse Jobs', icon: 'J', path: '/jobs' },
    { label: 'My Applications', icon: 'A', path: '/candidate/dashboard' },
    { label: 'My Profile', icon: 'P', path: '/candidate/profile' }
  ];

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);

      try {
        const response = await api.get('/applications/my');
        const { success, message, data } = response.data;

        if (!success) {
          toast.error(message || 'Something went wrong. Please try again.');
          setApplications([]);
          return;
        }

        setApplications(data || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Please try again.'
        );
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const stats = useMemo(() => {
    const total = applications.length;
    const shortlisted = applications.filter((item) => item.status === 'shortlisted').length;
    const underReview = applications.filter((item) => item.status === 'applied').length;
    const rejected = applications.filter((item) => item.status === 'rejected').length;

    return { total, shortlisted, underReview, rejected };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (activeFilter === 'All') {
      return applications;
    }

    return applications.filter(
      (application) => application.status.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [activeFilter, applications]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout
      sidebarBg="bg-white border-r border-slate-200"
      navItems={navItems}
      roleLabel="Candidate"
    >
      <div className="max-w-6xl">
        <h1 className="font-display text-4xl text-slate-900">Welcome back, {user?.name}</h1>
        <p className="mt-2 text-slate-500">Track your applications and keep your profile interview-ready.</p>

        {applications.length === 0 && (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
            <p className="font-medium text-amber-700">Complete your profile and start applying</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link to="/candidate/profile" className="text-sm font-medium text-indigo-600 underline">
                Go to profile
              </Link>
              <Link to="/jobs" className="text-sm font-medium text-indigo-600 underline">
                Browse jobs
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="card">
            <p className="font-display text-3xl text-indigo-600">{stats.total}</p>
            <p className="mt-2 text-sm text-slate-500">Total Applications</p>
          </div>
          <div className="card">
            <p className="font-display text-3xl text-indigo-600">{stats.shortlisted}</p>
            <p className="mt-2 text-sm text-slate-500">Shortlisted</p>
          </div>
          <div className="card">
            <p className="font-display text-3xl text-indigo-600">{stats.underReview}</p>
            <p className="mt-2 text-sm text-slate-500">Under Review</p>
          </div>
          <div className="card">
            <p className="font-display text-3xl text-indigo-600">{stats.rejected}</p>
            <p className="mt-2 text-sm text-slate-500">Rejected</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {filteredApplications.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mb-2 text-lg text-slate-500">No applications found for this filter.</p>
              <Link to="/jobs" className="btn-primary inline-block">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {filteredApplications.map((application) => (
                <div
                  key={application._id}
                  className="flex flex-col gap-4 border-b border-slate-200 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link to={`/jobs/${application.jobId?._id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                        {application.jobId?.title || 'Job removed'}
                      </Link>
                      {application.jobId?.status !== 'active' && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                          Position Closed
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{application.jobId?.companyName || 'Employer'}</p>
                    <p className="mt-2 text-sm text-slate-500">Date applied: {formatDate(application.appliedAt)}</p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;
