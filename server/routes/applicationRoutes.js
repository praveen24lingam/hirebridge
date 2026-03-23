const express = require('express');
const {
  applyToJob,
  getMyApplications,
  checkApplication,
  withdrawApplication
} = require('../controllers/applicationController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

router.post('/', authenticate, authorizeRole('candidate'), applyToJob);
router.get('/my', authenticate, authorizeRole('candidate'), getMyApplications);
router.get('/check/:jobId', authenticate, authorizeRole('candidate'), checkApplication);
router.patch('/:id/withdraw', authenticate, authorizeRole('candidate'), withdrawApplication);

module.exports = router;
