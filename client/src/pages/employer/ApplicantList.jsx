import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DashboardLayout from '../../components/common/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import ApplicantDrawer from '../../components/employer/ApplicantDrawer';
import { useAuth } from '../../context/AuthContext';
import {
  calculateCompleteness,
  formatDate,
  getInitials
} from '../../utils/helpers';

const ApplicantList = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingApplicantId, setUpdatingApplicantId] = useState('');

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [jobResponse, applicantsResponse] = await Promise.all([
          api.get(`/employer/jobs/${jobId}`),
          api.get(`/employer/jobs/${jobId}/applicants`)
        ]);

        setJob(jobResponse.data?.data || null);
        setApplicants(applicantsResponse.data?.data || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const filteredApplicants = useMemo(() => {
    if (statusFilter === 'all') {
      return applicants;
    }

    return applicants.filter((applicant) => applicant.status === statusFilter);
  }, [applicants, statusFilter]);

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      setUpdatingApplicantId(applicationId);
      const response = await api.patch(`/employer/applications/${applicationId}/status`, { status });
      const { success, message } = response.data;

      if (!success) {
        toast.error(message || 'Something went wrong. Please try again.');
        return;
      }
      const updatedTime = new Date().toISOString();

      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant._id === applicationId
            ? { ...applicant, status, updatedAt: updatedTime }
            : applicant
        )
      );

      setSelectedApplicant((prev) =>
        prev && prev._id === applicationId
          ? { ...prev, status, updatedAt: updatedTime }
          : prev
      );

      toast.success(message || 'Applicant status updated');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setUpdatingApplicantId('');
    }
  };

  const renderActions = (applicant) => {
    if (applicant.status === 'applied') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusUpdate(applicant._id, 'shortlisted')}
            disabled={updatingApplicantId === applicant._id}
            className="rounded border border-amber-500 px-3 py-1 text-sm text-amber-600 hover:bg-amber-50"
            type="button"
          >
            {updatingApplicantId === applicant._id ? 'Updating...' : 'Shortlist'}
          </button>
          <button
            onClick={() => handleStatusUpdate(applicant._id, 'rejected')}
            disabled={updatingApplicantId === applicant._id}
            className="rounded border border-red-500 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
            type="button"
          >
            Reject
          </button>
        </div>
      );
    }

    if (applicant.status === 'shortlisted') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-600">Shortlisted</span>
          <button
            onClick={() => handleStatusUpdate(applicant._id, 'rejected')}
            disabled={updatingApplicantId === applicant._id}
            className="rounded border border-red-500 px-3 py-1 text-sm text-red-600"
            type="button"
          >
            Reject
          </button>
        </div>
      );
    }

    if (applicant.status === 'rejected') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-red-500">Rejected</span>
          <button
            onClick={() => handleStatusUpdate(applicant._id, 'shortlisted')}
            disabled={updatingApplicantId === applicant._id}
            className="rounded border border-amber-500 px-3 py-1 text-sm text-amber-600"
            type="button"
          >
            Shortlist
          </button>
        </div>
      );
    }

    return null;
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
      <div className="max-w-7xl">
        <button type="button" onClick={() => navigate(-1)} className="text-sm font-medium text-indigo-600">
          Back
        </button>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-4xl text-slate-900">{job?.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{job?.location}</span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">{job?.jobType}</span>
            </div>
          </div>
          <p className="font-bold text-indigo-600">{applicants.length} Applicants</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {['all', 'applied', 'shortlisted', 'rejected'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {filteredApplicants.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-3 text-lg text-slate-500">No applications yet</p>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(`${window.location.origin}/jobs/${jobId}`);
                toast.success('Link copied!');
              }}
              className="btn-secondary"
            >
              Copy Job Link
            </button>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Candidate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Top Skills</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Profile Strength</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Applied</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((applicant) => {
                  const completeness =
                    typeof applicant.candidate?.completenessScore === 'number'
                      ? applicant.candidate.completenessScore
                      : calculateCompleteness({
                          phone: applicant.candidate?.phone || '',
                          location: applicant.candidate?.location || '',
                          bio: applicant.candidate?.bio || '',
                          resumeLink: applicant.candidate?.resumeLink || '',
                          education: applicant.candidate?.education || {},
                          skills: applicant.candidate?.skills || []
                        });
                  const topSkills = applicant.candidate?.skills || [];

                  return (
                    <tr key={applicant._id} className="border-b border-slate-200 last:border-b-0">
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedApplicant(applicant)}
                          className="flex items-start gap-3 text-left"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                            {getInitials(applicant.candidate?.name || 'C')}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{applicant.candidate?.name}</p>
                            <p className="text-sm text-slate-500">{applicant.candidate?.location || 'No location'}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {topSkills.slice(0, 3).map((skill) => (
                            <span key={skill} className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
                              {skill}
                            </span>
                          ))}
                          {topSkills.length > 3 && (
                            <span className="text-xs text-slate-500">+{topSkills.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-slate-200">
                            <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${completeness}%` }} />
                          </div>
                          <span className="text-sm text-slate-500">{completeness}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">{formatDate(applicant.appliedAt)}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={applicant.status} />
                      </td>
                      <td className="px-4 py-4">{renderActions(applicant)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedApplicant && (
        <ApplicantDrawer
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </DashboardLayout>
  );
};

export default ApplicantList;
