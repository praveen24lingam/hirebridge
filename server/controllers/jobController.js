const Job = require('../models/Job');
const Application = require('../models/Application');
const CompanyProfile = require('../models/CompanyProfile');

const buildCompanyMap = async (employerIds) => {
  const uniqueEmployerIds = [...new Set(employerIds.map((id) => String(id)))];
  const companyProfiles = await CompanyProfile.find(
    { userId: { $in: uniqueEmployerIds } },
    'userId companyName logoUrl'
  );

  const companyMap = {};

  companyProfiles.forEach((profile) => {
    companyMap[String(profile.userId)] = {
      companyName: profile.companyName,
      logoUrl: profile.logoUrl
    };
  });

  return companyMap;
};

const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      jobType,
      salaryMin,
      salaryMax,
      openings,
      deadline,
      skillsRequired
    } = req.body;

    if (!title || !description || !location || !jobType || salaryMin === undefined || salaryMax === undefined || openings === undefined || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    if (Number(req.body.salaryMin) > Number(req.body.salaryMax)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum salary cannot be greater than maximum salary'
      });
    }

    if (new Date(req.body.deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Deadline must be a future date'
      });
    }

    const deadlineDate = new Date(deadline);

    if (Number.isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deadline date'
      });
    }

    const job = await Job.create({
      employerId: req.user.userId,
      title: title.trim(),
      description,
      location,
      jobType,
      salaryMin,
      salaryMax,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [],
      openings,
      deadline: deadlineDate,
      status: 'active',
      applicantCount: 0
    });

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getPublicJobs = async (req, res) => {
  try {
    const query = {};

    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }

    if (req.query.location) {
      query.location = req.query.location;
    }

    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    if (req.query.salaryMin) {
      query.salaryMin = { $gte: Number(req.query.salaryMin) };
    }

    if (req.query.salaryMax) {
      query.salaryMax = { $lte: Number(req.query.salaryMax) };
    }

    query.status = 'active';
    query.deadline = { $gt: new Date() };

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let sortOptions = { createdAt: -1 };

    if (req.query.sort === 'salary') {
      sortOptions = { salaryMax: -1 };
    } else if (req.query.sort === 'latest') {
      sortOptions = { createdAt: -1 };
    }

    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalCount = await Job.countDocuments(query);
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / limit);
    const companyMap = await buildCompanyMap(jobs.map((job) => job.employerId));

    const jobsWithCompany = jobs.map((job) => {
      const jobObject = job.toObject();
      jobObject.companyProfile = companyMap[String(job.employerId)] || {
        companyName: '',
        logoUrl: ''
      };

      return jobObject;
    });

    return res.status(200).json({
      success: true,
      message: 'Jobs fetched successfully',
      data: {
        jobs: jobsWithCompany,
        totalCount,
        currentPage: page,
        totalPages
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getSingleJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const companyProfile = await CompanyProfile.findOne(
      { userId: job.employerId },
      'companyName website industry description logoUrl'
    );

    const jobObject = job.toObject();
    jobObject.companyProfile = companyProfile || null;

    return res.status(200).json({
      success: true,
      message: 'Job fetched successfully',
      data: jobObject
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Employer jobs fetched successfully',
      data: jobs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getSingleJobForEmployer = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      message: 'Job fetched successfully',
      data: job
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const closeJob = async (req, res) => {
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

    job.status = 'closed';
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job closed successfully',
      data: job
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const deleteJob = async (req, res) => {
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

    const applicationCount = await Application.countDocuments({ jobId: job._id });

    if (applicationCount > 0) {
      job.status = 'deleted';
      await job.save();
    } else {
      await Job.findByIdAndDelete(job._id);
    }

    return res.status(200).json({
      success: true,
      message: 'Job removed',
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
  createJob,
  getPublicJobs,
  getSingleJob,
  getEmployerJobs,
  getSingleJobForEmployer,
  closeJob,
  deleteJob
};
