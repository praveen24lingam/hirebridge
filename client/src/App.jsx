import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/public/LandingPage';
import JobListings from './pages/public/JobListings';
import JobDetail from './pages/public/JobDetail';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfile from './pages/candidate/CandidateProfile';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import PostJob from './pages/employer/PostJob';
import ApplicantList from './pages/employer/ApplicantList';
import CompanyProfile from './pages/employer/CompanyProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import JobModeration from './pages/admin/JobModeration';
import UserManagement from './pages/admin/UserManagement';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/jobs" element={<JobListings />} />
      <Route path="/jobs/:jobId" element={<JobDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute allowedRole="candidate">
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/profile"
        element={
          <ProtectedRoute allowedRole="candidate">
            <CandidateProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/dashboard"
        element={
          <ProtectedRoute allowedRole="employer">
            <EmployerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/profile"
        element={
          <ProtectedRoute allowedRole="employer">
            <CompanyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/jobs/new"
        element={
          <ProtectedRoute allowedRole="employer">
            <PostJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/jobs/:jobId/applicants"
        element={
          <ProtectedRoute allowedRole="employer">
            <ApplicantList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute allowedRole="admin">
            <JobModeration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRole="admin">
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
