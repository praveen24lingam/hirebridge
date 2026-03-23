const Profile = require('../models/Profile');
const User = require('../models/User');

const calculateCompletenessScore = (profileData) => {
  const fields = [
    profileData.phone,
    profileData.location,
    profileData.bio,
    profileData.resumeLink,
    profileData.education && profileData.education.degree,
    profileData.education && profileData.education.college
  ];
  const arrayFields = [profileData.skills];

  let filledCount = 0;

  fields.forEach((field) => {
    if (typeof field === 'string' && field.trim() !== '') {
      filledCount += 1;
    }
  });

  arrayFields.forEach((field) => {
    if (Array.isArray(field) && field.length > 0) {
      filledCount += 1;
    }
  });

  return Math.round((filledCount / 7) * 100);
};

const getCandidateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: profile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateCandidateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (req.body.phone !== undefined) {
      profile.phone = req.body.phone;
    }

    if (req.body.location !== undefined) {
      profile.location = req.body.location;
    }

    if (req.body.bio !== undefined) {
      profile.bio = req.body.bio;
    }

    if (req.body.skills !== undefined && Array.isArray(req.body.skills)) {
      profile.skills = req.body.skills;
    }

    if (req.body.resumeLink !== undefined) {
      profile.resumeLink = req.body.resumeLink;
    }

    if (req.body.education !== undefined) {
      profile.education = {
        degree: req.body.education.degree || '',
        college: req.body.education.college || '',
        yearOfGraduation: req.body.education.yearOfGraduation || null
      };
    }

    profile.completenessScore = calculateCompletenessScore(profile);
    await profile.save();

    let updatedName;

    if (req.body.name) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        { name: req.body.name.trim() },
        { new: true }
      );
      updatedName = updatedUser ? updatedUser.name : req.user.name;
    } else {
      const user = await User.findById(req.user.userId, 'name');
      updatedName = user ? user.name : req.user.name;
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile,
        user: {
          name: updatedName
        }
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
  getCandidateProfile,
  updateCandidateProfile
};
