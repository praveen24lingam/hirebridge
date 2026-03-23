const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Profile = require('../models/Profile');
const CompanyProfile = require('../models/CompanyProfile');
const sendEmail = require('../utils/sendEmail');

const applyToJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resumeLink } = req.body;
    const candidateId = req.user.userId;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is not accepting applications'
      });
    }

    if (job.deadline < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'The application deadline has passed'
      });
    }

    const existingApplication = await Application.findOne({ jobId, candidateId });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    await Application.create({
      jobId,
      candidateId,
      coverLetter: coverLetter || '',
      resumeLink: resumeLink || '',
      status: 'applied'
    });

    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicantCount: 1 }
    });

    const [candidate, employer, companyProfile] = await Promise.all([
      User.findById(candidateId, 'name email'),
      User.findById(job.employerId, 'name email'),
      CompanyProfile.findOne({ userId: job.employerId }, 'companyName')
    ]);

    const companyName = companyProfile && companyProfile.companyName
      ? companyProfile.companyName
      : employer && employer.name
        ? employer.name
        : 'the company';

    const candidateSubject = `Application received for ${job.title}`;
    const candidateHtml = `
      <p>Hello ${candidate ? candidate.name : 'Candidate'},</p>
      <p>Your application for <strong>${job.title}</strong> has been received.</p>
      <p>Company: ${companyName}</p>
    `;

    const employerSubject = `New application for ${job.title}`;
    const employerHtml = `
      <p>Hello ${employer ? employer.name : 'Employer'},</p>
      <p>A new candidate has applied for <strong>${job.title}</strong>.</p>
      <p>Candidate: ${candidate ? candidate.name : 'Unknown Candidate'}</p>
    `;

    if (candidate && candidate.email) {
      sendEmail(candidate.email, candidateSubject, candidateHtml).catch(() => null);
    }

    if (employer && employer.email) {
      sendEmail(employer.email, employerSubject, employerHtml).catch(() => null);
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user.userId })
      .populate('jobId', 'title location jobType status employerId')
      .sort({ appliedAt: -1 });

    const employerIds = applications
      .filter((application) => application.jobId && application.jobId.employerId)
      .map((application) => String(application.jobId.employerId));

    const companyProfiles = await CompanyProfile.find(
      { userId: { $in: employerIds } },
      'userId companyName'
    );

    const companyMap = {};

    companyProfiles.forEach((profile) => {
      companyMap[String(profile.userId)] = profile.companyName;
    });

    const enrichedApplications = applications.map((application) => {
      const applicationObject = application.toObject();

      if (applicationObject.jobId && applicationObject.jobId.employerId) {
        applicationObject.jobId.companyName =
          companyMap[String(applicationObject.jobId.employerId)] || '';
      }

      return applicationObject;
    });

    return res.status(200).json({
      success: true,
      message: 'Applications fetched successfully',
      data: enrichedApplications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const checkApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      candidateId: req.user.userId,
      jobId: req.params.jobId
    });

    if (!application) {
      return res.status(200).json({
        success: true,
        message: 'Application status fetched successfully',
        data: { hasApplied: false }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application status fetched successfully',
      data: {
        hasApplied: true,
        status: application.status
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.candidateId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient role'
      });
    }

    if (application.status !== 'applied') {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw after being shortlisted'
      });
    }

    application.status = 'withdrawn';
    application.updatedAt = new Date();
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn',
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.employerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient role'
      });
    }

    const applicationQuery = { jobId: req.params.jobId };

    if (req.query.status) {
      applicationQuery.status = req.query.status;
    }

    const applications = await Application.find(applicationQuery).sort({ appliedAt: -1 });

    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        const candidate = await User.findById(app.candidateId).select('-password');
        const profile = await Profile.findOne({ userId: app.candidateId });

        return {
          _id: app._id,
          status: app.status,
          coverLetter: app.coverLetter,
          resumeLink: app.resumeLink,
          appliedAt: app.appliedAt,
          updatedAt: app.updatedAt,
          candidate: {
            _id: candidate?._id,
            name: candidate?.name || '',
            email: candidate?.email || '',
            phone: profile?.phone || '',
            location: profile?.location || '',
            bio: profile?.bio || '',
            skills: profile?.skills || [],
            education: profile?.education || {},
            resumeLink: profile?.resumeLink || '',
            completenessScore: profile?.completenessScore || 0
          }
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Job applicants fetched successfully',
      data: enrichedApplications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const job = await Job.findById(application.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.employerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient role'
      });
    }

    if (status !== 'shortlisted' && status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Invalid application status'
      });
    }

    application.status = status;
    application.updatedAt = new Date();
    await application.save();

    const [candidate, companyProfile] = await Promise.all([
      User.findById(application.candidateId, 'name email'),
      CompanyProfile.findOne({ userId: job.employerId }, 'companyName')
    ]);

    const companyName = companyProfile && companyProfile.companyName
      ? companyProfile.companyName
      : 'the company';

    if (candidate && candidate.email) {
      if (status === 'shortlisted') {
        const subject = `Great news - you have been shortlisted for ${job.title} at ${companyName}`;
        const html = `
          <p>Hello ${candidate.name},</p>
          <p>You have been shortlisted for <strong>${job.title}</strong> at ${companyName}.</p>
        `;

        try {
          sendEmail(candidate.email, subject, html).catch(() => null);
        } catch (error) {
          console.error('Shortlist email scheduling failed', error.message);
        }
      }

      if (status === 'rejected') {
        const subject = `Update on your application to ${job.title} at ${companyName}`;
        const html = `
          <p>Hello ${candidate.name},</p>
          <p>There is an update on your application for <strong>${job.title}</strong> at ${companyName}.</p>
        `;

        try {
          sendEmail(candidate.email, subject, html).catch(() => null);
        } catch (error) {
          console.error('Rejection email scheduling failed', error.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Applicant status updated',
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  checkApplication,
  withdrawApplication,
  getJobApplicants,
  updateApplicantStatus
};
