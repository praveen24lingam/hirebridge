import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DashboardLayout from '../../components/common/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDaysUntilDeadline } from '../../utils/helpers';

import { useAuth } from '../../context/AuthContext';

const EmployerDashboard = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [confirmingJobId, setConfirmingJobId] = useState('');
  const [closingJobId, setClosingJobId] = useState('');

  const navItems = [
    { label: 'Dashboard', icon: 'D', path: '/employer/dashboard' },
    {
      label: 'Post a Job',
      icon: '+',
      path: '/employer/jobs/new',
      isButton: true,
      className: 'mb-4 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700'
    },
    { label: 'My Jobs', icon: 'J', path: '/employer/dashboard' },
    { label: 'Company Profile', icon: 'C', path: '/employer/profile' },
    { label: 'Logout', icon: 'L', isButton: true, onClick: logout }
  ];

  const visibleJobs = useMemo(() => {
    return jobs.filter((job) => job.status === 'active' || job.status === 'closed');
  }, [jobs]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);

      try {
        const [dashboardResponse, jobsResponse, profileResponse] = await Promise.all([
          api.get('/employer/dashboard'),
          api.get('/employer/jobs'),
          api.get('/employer/profile')
        ]);

        const dashboardData = dashboardResponse.data;
        const jobsData = jobsResponse.data;
        const profileData = profileResponse.data;

        setDashboard(dashboardData?.data || null);
        setJobs(jobsData?.data || []);
        setProfile(profileData?.data || null);
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleCloseJob = async (jobId) => {
    try {
      setClosingJobId(jobId);
      const response = await api.patch(`/employer/jobs/${jobId}/close`);
      const { success, message } = response.data;

      if (!success) {
        toast.error(message || 'Something went wrong. Please try again.');
        return;
      }
      setJobs((prev) =>
        prev.map((job) => (job._id === jobId ? { ...job, status: 'closed' } : job))
      );
      setDashboard((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          activeJobs: Math.max((prev.activeJobs || 0) - 1, 0)
        };
      });
      setConfirmingJobId('');
      toast.success(message || 'Job closed successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setClosingJobId('');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout
      sidebarBg=""
      sidebarStyle={{ background: '#1E1B4B' }}
      navItems={navItems}
      roleLabel="Employer"
      roleBadgeClassName="bg-white/10 text-white"
      logoClassName="text-white"
      headerBorderClassName="border-indigo-900"
      navActiveClassName="border-l-4 border-white bg-white/10 text-white"
      navInactiveClassName="text-slate-200 hover:bg-white/10"
      footerBorderClassName="border-indigo-900"
      footerButtonClassName="btn-secondary w-full border-white text-white hover:bg-white/10"
      showFooterLogout={false}
    >
      <div className="max-w-6xl">
        <h1 className="font-display text-4xl text-slate-900">Employer Dashboard</h1>
        <p className="mt-2 text-slate-500">Track hiring progress and keep your listings moving.</p>

        {(dashboard?.totalJobs || 0) === 0 && (
          <div className="mt-8 rounded-xl bg-indigo-600 p-6 text-white">
            <p className="text-lg font-semibold">Post your first job and start hiring today</p>
            <Link
              to="/employer/jobs/new"
              className="mt-4 inline-block rounded-lg border border-white px-5 py-3 font-semibold text-white"
            >
              Post a Job -&gt;
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="card">
            <p className="text-sm text-slate-500">Total Jobs</p>
            <p className="mt-3 font-display text-3xl text-indigo-600">{dashboard?.totalJobs || 0}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Active Listings</p>
            <p className="mt-3 font-display text-3xl text-indigo-600">{dashboard?.activeJobs || 0}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Total Applications</p>
            <p className="mt-3 font-display text-3xl text-indigo-600">{dashboard?.totalApplications || 0}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">This Week</p>
            <p className="mt-3 font-display text-3xl text-indigo-600">{dashboard?.recentApplications || 0}</p>
          </div>
        </div>

        <div id="company-profile" className="mt-8 card">
          <h2 className="text-xl font-semibold text-slate-900">Company Profile</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-2">
            <p>Company: {profile?.companyName || 'Not added yet'}</p>
            <p>Website: {profile?.website || 'Not added yet'}</p>
            <p>Industry: {profile?.industry || 'Not added yet'}</p>
            <p>Description: {profile?.description || 'Not added yet'}</p>
          </div>
        </div>

        <div id="jobs" className="mt-8">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">My Jobs</h2>
            <Link to="/employer/jobs/new" className="btn-primary text-center">
              Post New Job
            </Link>
          </div>

          {visibleJobs.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mb-3 text-lg text-slate-500">You have not posted any jobs yet.</p>
              <Link to="/employer/jobs/new" className="btn-primary inline-block">
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleJobs.map((job) => (
                <div key={job._id} className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{job.location}</span>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">{job.jobType}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-sm text-indigo-700">
                        {job.applicantCount} applicants
                      </span>
                      <p className="mt-3 text-sm text-slate-500">{getDaysUntilDeadline(job.deadline)}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    {confirmingJobId === job._id ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-slate-600">Confirm Close?</span>
                        <button
                          type="button"
                          onClick={() => handleCloseJob(job._id)}
                          disabled={closingJobId === job._id}
                          className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          {closingJobId === job._id ? 'Closing...' : 'Yes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingJobId('')}
                          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <Link to={`/employer/jobs/${job._id}/applicants`} className="btn-primary text-center">
                          View Applicants
                        </Link>
                        {job.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => setConfirmingJobId(job._id)}
                            className="rounded-lg border border-red-500 px-6 py-3 font-semibold text-red-600 hover:bg-red-50"
                          >
                            Close Job
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
