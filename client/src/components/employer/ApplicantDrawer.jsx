import { useMemo, useState } from 'react';
import { formatDate, getInitials } from '../../utils/helpers';

const ApplicantDrawer = ({ applicant, onClose, onStatusUpdate }) => {
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  const renderActions = (currentApplicant) => {
    if (currentApplicant.status === 'applied') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onStatusUpdate(currentApplicant._id, 'shortlisted')}
            className="rounded border border-amber-500 px-3 py-1 text-sm text-amber-600 hover:bg-amber-50"
            type="button"
          >
            Shortlist
          </button>
          <button
            onClick={() => onStatusUpdate(currentApplicant._id, 'rejected')}
            className="rounded border border-red-500 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
            type="button"
          >
            Reject
          </button>
        </div>
      );
    }

    if (currentApplicant.status === 'shortlisted') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-emerald-600">Shortlisted</span>
          <button
            onClick={() => onStatusUpdate(currentApplicant._id, 'rejected')}
            className="rounded border border-red-500 px-3 py-1 text-sm text-red-600"
            type="button"
          >
            Reject
          </button>
        </div>
      );
    }

    if (currentApplicant.status === 'rejected') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-red-500">Rejected</span>
          <button
            onClick={() => onStatusUpdate(currentApplicant._id, 'shortlisted')}
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

  const completeness = useMemo(() => {
    return applicant.profile?.completenessScore || 0;
  }, [applicant]);

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={onClose} className="absolute inset-0 bg-black bg-opacity-40" />
      <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl transition-transform">
        <div className="relative p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-2xl text-slate-400"
          >
            x
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
              {getInitials(applicant.candidate?.name || 'C')}
            </div>
            <div>
              <h2 className="font-display text-2xl text-slate-900">{applicant.candidate?.name}</h2>
              <p className="text-sm text-slate-500">{applicant.profile?.location || 'Location not provided'}</p>
              <span className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                {completeness}% complete
              </span>
            </div>
          </div>

          <div className="mt-6">{renderActions(applicant)}</div>

          <div className="my-6 border-t border-slate-200" />

          <section className="mb-6">
            <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-500">Bio</h3>
            <p className="text-sm text-slate-600">{applicant.profile?.bio || 'No bio added'}</p>
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-500">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {applicant.profile?.skills?.length ? (
                applicant.profile.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No skills added</p>
              )}
            </div>
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-500">Education</h3>
            {applicant.profile?.education?.degree || applicant.profile?.education?.college ? (
              <p className="text-sm text-slate-600">
                {applicant.profile?.education?.degree || 'Degree not provided'}
                {' - '}
                {applicant.profile?.education?.college || 'College not provided'}
                {applicant.profile?.education?.yearOfGraduation
                  ? ` - ${applicant.profile.education.yearOfGraduation}`
                  : ''}
              </p>
            ) : (
              <p className="text-sm text-slate-500">Not provided</p>
            )}
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-500">Resume</h3>
            {applicant.profile?.resumeLink ? (
              <a
                href={applicant.profile.resumeLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-indigo-600"
              >
                View Resume
              </a>
            ) : (
              <p className="text-sm text-slate-500">No resume provided</p>
            )}
          </section>

          <section className="mb-6">
            <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-500">Cover Letter</h3>
            {applicant.coverLetter ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowCoverLetter((prev) => !prev)}
                  className="text-sm font-medium text-indigo-600"
                >
                  {showCoverLetter ? 'Hide Cover Letter' : 'Show Cover Letter'}
                </button>
                {showCoverLetter && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{applicant.coverLetter}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">No cover letter submitted</p>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-xs uppercase tracking-wide text-slate-500">Application Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600" />
                <p className="text-sm text-slate-600">Applied on {formatDate(applicant.appliedAt)}</p>
              </div>
              {applicant.updatedAt && applicant.updatedAt !== applicant.appliedAt && (
                <div className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <p className="text-sm text-slate-600">Status updated on {formatDate(applicant.updatedAt)}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDrawer;
