const express = require('express');
const {
  getCandidateProfile,
  updateCandidateProfile
} = require('../controllers/candidateController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

router.get('/profile', authenticate, authorizeRole('candidate'), getCandidateProfile);
router.put('/profile', authenticate, authorizeRole('candidate'), updateCandidateProfile);

module.exports = router;
