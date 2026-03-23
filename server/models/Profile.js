const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  education: {
    degree: {
      type: String,
      default: ''
    },
    college: {
      type: String,
      default: ''
    },
    yearOfGraduation: {
      type: Number,
      default: null
    }
  },
  resumeLink: {
    type: String,
    default: ''
  },
  completenessScore: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Profile', profileSchema);
