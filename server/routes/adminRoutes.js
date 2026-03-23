const express = require('express');
const {
  getAdminDashboard,
  getAllJobs,
  deactivateJob,
  reactivateJob,
  getAllUsers,
  suspendUser,
  reactivateUser
} = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

router.get('/dashboard', authenticate, authorizeRole('admin'), getAdminDashboard);
router.get('/jobs', authenticate, authorizeRole('admin'), getAllJobs);
router.patch('/jobs/:jobId/deactivate', authenticate, authorizeRole('admin'), deactivateJob);
router.patch('/jobs/:jobId/reactivate', authenticate, authorizeRole('admin'), reactivateJob);
router.get('/users', authenticate, authorizeRole('admin'), getAllUsers);
router.patch('/users/:userId/suspend', authenticate, authorizeRole('admin'), suspendUser);
router.patch('/users/:userId/reactivate', authenticate, authorizeRole('admin'), reactivateUser);

module.exports = router;
