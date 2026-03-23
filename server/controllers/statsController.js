const Job = require('../models/Job');
const User = require('../models/User');

const getPublicStats = async (req, res) => {
  try {
    const [totalJobs, totalCandidates, totalEmployers] = await Promise.all([
      Job.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'employer' })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Public stats fetched successfully',
      data: {
        totalJobs,
        totalCandidates,
        totalEmployers
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getPublicStats
};
