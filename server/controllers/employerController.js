const Job = require('../models/Job');
const Application = require('../models/Application');
const CompanyProfile = require('../models/CompanyProfile');

const getEmployerDashboard = async (req, res) => {
  try {
    const employerId = req.user.userId;
    const jobs = await Job.find({ employerId }, '_id');
    const jobIds = jobs.map((job) => job._id);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalJobs, activeJobs, totalApplications, recentApplications] = await Promise.all([
      Job.countDocuments({ employerId }),
      Job.countDocuments({ employerId, status: 'active' }),
      Application.countDocuments({ jobId: { $in: jobIds } }),
      Application.countDocuments({
        jobId: { $in: jobIds },
        appliedAt: { $gte: sevenDaysAgo }
      })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Employer dashboard stats fetched successfully',
      data: {
        totalJobs,
        activeJobs,
        totalApplications,
        recentApplications
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getEmployerProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ userId: req.user.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company profile fetched successfully',
      data: profile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateEmployerProfile = async (req, res) => {
  try {
    const updates = {};

    if (req.body.companyName !== undefined) {
      updates.companyName = req.body.companyName;
    }

    if (req.body.website !== undefined) {
      updates.website = req.body.website;
    }

    if (req.body.industry !== undefined) {
      updates.industry = req.body.industry;
    }

    if (req.body.description !== undefined) {
      updates.description = req.body.description;
    }

    if (req.body.logoUrl !== undefined) {
      updates.logoUrl = req.body.logoUrl;
    }

    const updatedProfile = await CompanyProfile.findOneAndUpdate(
      { userId: req.user.userId },
      updates,
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getEmployerDashboard,
  getEmployerProfile,
  updateEmployerProfile
};
