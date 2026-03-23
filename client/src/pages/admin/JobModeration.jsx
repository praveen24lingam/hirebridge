import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DashboardLayout from '../../components/common/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const JobModeration = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [confirming, setConfirming] = useState({ jobId: '', action: '' });
  const [updatingJobId, setUpdatingJobId] = useState('');

  const navItems = [
    { label: 'Dashboard', icon: 'D', path: '/admin/dashboard' },
    { label: 'Manage Jobs', icon: 'J', path: '/admin/jobs' },
    { label: 'Manage Users', icon: 'U', path: '/admin/users' },
    { label: 'Logout', icon: 'L', isButton: true, onClick: logout }
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/jobs', {
          params: { page: 1, limit: 100 }
        });
        const { success, message, data } = response.data;

        if (!success) {
          toast.error(message || 'Something went wrong. Please try again.');
          return;
        }

        setJobs(data?.jobs || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    if (activeTab === 'all') {
      return jobs;
    }

    return jobs.filter((job) => job.status === activeTab);
  }, [activeTab, jobs]);

  const counts = useMemo(() => {
    return {
      all: jobs.length,
      active: jobs.filter((job) => job.status === 'active').length,
      closed: jobs.filter((job) => job.status === 'closed').length,
      inactive: jobs.filter((job) => job.status === 'inactive').length
    };
  }, [jobs]);

  const updateJobStatus = async (jobId, action) => {
    try {
      setUpdatingJobId(jobId);
      const response = await api.patch(`/admin/jobs/${jobId}/${action}`);
      const { success, message } = response.data;

      if (!success) {
        toast.error(message || 'Something went wrong. Please try again.');
        return;
      }
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId
            ? { ...job, status: action === 'deactivate' ? 'inactive' : 'active' }
            : job
        )
      );
      setConfirming({ jobId: '', action: '' });
      toast.success(
        message || `Job ${action === 'deactivate' ? 'deactivated' : 'reactivated'} successfully`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setUpdatingJobId('');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

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
        <h1 className="font-display text-4xl text-slate-900">Job Moderation</h1>
        <p className="mt-2 text-slate-500">Review job activity and change visibility without leaving the page.</p>

        <div className="mt-8 flex flex-wrap gap-6 border-b border-slate-200">
          {[
            ['all', `All (${counts.all})`],
            ['active', `Active (${counts.active})`],
            ['closed', `Closed (${counts.closed})`],
            ['inactive', `Inactive (${counts.inactive})`]
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium ${
                activeTab === key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white py-20 text-center">
            <p className="text-lg text-slate-500">No jobs here</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Employer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Applicants</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Posted</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="border-b border-slate-200 last:border-b-0">
                    <td className="px-4 py-4 text-sm text-slate-900">{job.title}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{job.companyName || 'Employer'}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{job.jobType}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{job.applicantCount}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{formatDate(job.createdAt)}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-4">
                      {confirming.jobId === job._id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">Confirm?</span>
                          <button
                            type="button"
                            onClick={() => updateJobStatus(job._id, confirming.action)}
                            disabled={updatingJobId === job._id}
                            className="rounded border border-red-500 px-3 py-1 text-sm text-red-600"
                          >
                            {updatingJobId === job._id ? 'Updating...' : 'Yes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirming({ jobId: '', action: '' })}
                            className="rounded px-3 py-1 text-sm text-slate-500"
                          >
                            No
                          </button>
                        </div>
                      ) : job.status === 'inactive' ? (
                        <button
                          type="button"
                          onClick={() => setConfirming({ jobId: job._id, action: 'reactivate' })}
                          className="rounded border border-emerald-500 px-3 py-1 text-sm text-emerald-600"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirming({ jobId: job._id, action: 'deactivate' })}
                          className="rounded border border-red-500 px-3 py-1 text-sm text-red-600"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobModeration;
