const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CompanyProfile = require('../models/CompanyProfile');

const getAdminDashboard = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalCandidates,
      totalEmployers,
      totalJobs,
      totalApplications,
      recentCandidates,
      recentEmployers,
      recentJobs,
      recentApplications
    ] = await Promise.all([
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments(),
      Application.countDocuments(),
      User.countDocuments({
        role: 'candidate',
        createdAt: { $gte: sevenDaysAgo }
      }),
      User.countDocuments({
        role: 'employer',
        createdAt: { $gte: sevenDaysAgo }
      }),
      Job.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Application.countDocuments({ appliedAt: { $gte: sevenDaysAgo } })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard stats fetched successfully',
      data: {
        totalCandidates,
        totalEmployers,
        totalJobs,
        totalApplications,
        candidatesCreatedLast7Days: recentCandidates,
        employersCreatedLast7Days: recentEmployers,
        jobsCreatedLast7Days: recentJobs,
        applicationsCreatedLast7Days: recentApplications
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Job.countDocuments(query);
    const employerIds = jobs.map((job) => String(job.employerId));
    const companyProfiles = await CompanyProfile.find(
      { userId: { $in: employerIds } },
      'userId companyName'
    );

    const companyMap = {};

    companyProfiles.forEach((profile) => {
      companyMap[String(profile.userId)] = profile.companyName;
    });

    const enrichedJobs = jobs.map((job) => {
      const jobObject = job.toObject();
      jobObject.companyName = companyMap[String(job.employerId)] || '';
      return jobObject;
    });

    return res.status(200).json({
      success: true,
      message: 'Admin jobs fetched successfully',
      data: {
        jobs: enrichedJobs,
        totalCount,
        currentPage: page,
        totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const deactivateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job.status = 'inactive';
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job deactivated',
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const reactivateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job.status = 'active';
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job reactivated',
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const query = {};

    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Admin users fetched successfully',
      data: {
        users,
        totalCount,
        currentPage: page,
        totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    if (user.role === 'employer') {
      try {
        await Job.updateMany(
          { employerId: user._id, status: 'active' },
          { status: 'inactive' }
        );
      } catch (error) {
        console.error('Failed to deactivate employer jobs', error.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'User suspended',
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const reactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User reactivated',
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
  getAdminDashboard,
  getAllJobs,
  deactivateJob,
  reactivateJob,
  getAllUsers,
  suspendUser,
  reactivateUser
};
