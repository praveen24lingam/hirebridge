import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  formatDate,
  formatSalary,
  getDaysUntilDeadline,
  getInitials
} from '../../utils/helpers';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [resumeLink, setResumeLink] = useState('');
  const [resumePrefilled, setResumePrefilled] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/jobs/${jobId}`);
        const { success, message, data } = response.data;

        if (!success) {
          toast.error(message || 'Something went wrong. Please try again.');
          setJob(null);
          return;
        }

        setJob(data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Please try again.'
        );
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      if (!user || user.role !== 'candidate') {
        setHasApplied(false);
        setApplicationStatus('');
        return;
      }

      try {
        setApplying(true);
        const response = await api.get(`/applications/check/${jobId}`);
        const { success, message, data } = response.data;

        if (!success) {
          toast.error(message || 'Something went wrong. Please try again.');
          setHasApplied(false);
          setApplicationStatus('');
          return;
        }

        setHasApplied(data?.hasApplied);
        setApplicationStatus(data?.status || '');
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Please try again.'
        );
        setHasApplied(false);
        setApplicationStatus('');
      } finally {
        setApplying(false);
      }
    };

    fetchApplicationStatus();
  }, [jobId, user]);

  const saveAndRedirect = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };

  const submitApplication = async () => {
    try {
      setApplying(true);
      const response = await api.post('/applications', { jobId, coverLetter, resumeLink });
      const { success, message } = response.data;

      if (!success) {
        toast.error(message || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
      setApplicationStatus('applied');
      toast.success(message || 'Application submitted successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setApplying(false);
    }
  };

  const openApplyModal = async () => {
    setShowModal(true);

    if (user && user.role === 'candidate') {
      try {
        const response = await api.get('/candidate/profile');
        const profileData = response.data?.data;
        if (profileData?.resumeLink) {
          setResumeLink(profileData.resumeLink);
          setResumePrefilled(true);
        } else {
          setResumePrefilled(false);
        }
      } catch (error) {
        setResumePrefilled(false);
      }
    }
  };

  const deadlineLabel = useMemo(() => {
    if (!job) {
      return '';
    }

    return getDaysUntilDeadline(job.deadline);
  }, [job]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <LoadingSpinner />
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
          <div className="card text-center">
            <p className="text-lg text-slate-500">This job could not be found.</p>
            <Link to="/jobs" className="mt-6 inline-block text-indigo-600 underline">
              Back to job listings
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const companyName = job.companyProfile?.companyName || 'Employer';
  const industry = job.companyProfile?.industry || 'Industry not specified';
  const deadlineColor =
    deadlineLabel === 'Deadline passed'
      ? 'text-red-500'
      : deadlineLabel === 'Closes today' || deadlineLabel === 'Closes tomorrow'
        ? 'text-amber-500'
        : 'text-slate-500';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex-1">
            <p className="text-sm text-slate-500">
              <Link to="/jobs" className="hover:text-slate-900">
                Jobs
              </Link>{' '}
              &gt; {job.title}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
                {getInitials(companyName)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{companyName}</p>
                <p className="text-sm text-slate-500">{industry}</p>
              </div>
            </div>

            <h1 className="mt-6 font-display text-3xl text-slate-900">{job.title}</h1>

            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge status={job.jobType} />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{job.location}</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-600">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                {job.openings} openings
              </span>
            </div>

            <div className="my-8 border-t border-slate-200" />

            <section>
              <h2 className="text-xl font-semibold text-slate-900">About This Role</h2>
              <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-500">{job.description}</p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">Skills Required</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skillsRequired?.length ? (
                  job.skillsRequired.map((skill) => (
                    <span key={skill} className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400">No skills provided</p>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">About the Company</h2>
              <p className="mt-4 text-slate-500">
                {job.companyProfile?.description || 'No description provided'}
              </p>
            </section>
          </div>

          <div className="w-full flex-none md:w-80">
            <div className="card sticky top-6">
              <p className="text-2xl font-bold text-amber-500">{formatSalary(job.salaryMin, job.salaryMax)}</p>
              <div className="mt-5 space-y-3 text-sm text-slate-500">
                <p>Apply by {formatDate(job.deadline)}</p>
                <p className={deadlineColor}>{deadlineLabel}</p>
                <p>{job.openings} openings available</p>
              </div>

              <div className="mt-6">
                {!user ? (
                  <button type="button" onClick={saveAndRedirect} className="btn-primary w-full">
                    Login to Apply
                  </button>
                ) : user.role === 'candidate' && hasApplied ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <span className="font-medium text-emerald-700">Applied</span>
                    <div className="mt-3 flex justify-center">
                      <StatusBadge status={applicationStatus} />
                    </div>
                  </div>
                ) : user.role === 'candidate' && job.status === 'active' ? (
                  <button type="button" onClick={openApplyModal} className="btn-primary w-full">
                    Apply Now
                  </button>
                ) : user.role !== 'candidate' ? (
                  <p className="text-center text-sm text-slate-400">Sign in as a candidate to apply</p>
                ) : (
                  <p className="text-center text-sm text-slate-400">Applications Closed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            {!submitted ? (
              <>
                <h2 className="font-display text-2xl text-slate-900">Apply to {job.title}</h2>
                <p className="mt-2 text-slate-500">at {companyName}</p>

                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  Complete your profile before applying for the best chance of getting noticed.
                  <Link to="/candidate/profile" className="ml-1 font-medium underline">
                    Update profile
                  </Link>
                </div>

                <div className="mt-5">
                  <label className="mb-1 block text-sm font-medium text-slate-900">Resume Link</label>
                  <p className="mb-2 text-xs text-slate-500">
                    Google Drive or PDF URL (make sure link is set to Anyone can view)
                  </p>
                  <input
                    type="text"
                    value={resumeLink}
                    onChange={(event) => setResumeLink(event.target.value)}
                    className="input-field"
                  />
                  {resumePrefilled && resumeLink && (
                    <p className="mt-1 text-xs text-emerald-600">Auto-filled from your profile</p>
                  )}
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-slate-900">Cover Letter</label>
                  <textarea
                    value={coverLetter}
                    onChange={(event) => {
                      if (event.target.value.length <= 800) {
                        setCoverLetter(event.target.value);
                      }
                    }}
                    className="input-field min-h-36"
                    placeholder="Write an optional cover letter"
                  />
                  <p className="mt-2 text-right text-sm text-slate-500">{coverLetter.length}/800</p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary w-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitApplication}
                    className="btn-primary flex w-full items-center justify-center"
                    disabled={applying}
                  >
                    {applying ? <LoadingSpinner size="sm" /> : 'Submit'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <svg viewBox="0 0 52 52" className="mx-auto h-16 w-16">
                  <circle cx="26" cy="26" r="25" fill="#10B981" />
                  <path d="M14 27l8 8 16-18" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <h2 className="mt-5 font-display text-3xl text-slate-900">Application Submitted!</h2>
                <p className="mt-3 text-slate-500">Check your email for confirmation</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setHasApplied(true);
                    setSubmitted(false);
                    setCoverLetter('');
                  }}
                  className="btn-primary mt-6 w-full"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobDetail;
