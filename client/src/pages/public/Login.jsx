import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  useEffect(() => {
    if (!location.state?.message) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setSuccessMessage('');
      navigate(location.pathname, { replace: true, state: null });
    }, 5000);

    return () => clearTimeout(timer);
  }, [location.pathname, location.state, navigate]);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const getRolePath = (role) => {
    if (role === 'candidate') {
      return '/candidate/dashboard';
    }

    if (role === 'employer') {
      return '/employer/dashboard';
    }

    if (role === 'admin') {
      return '/admin/dashboard';
    }

    return '/';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { success, message, data } = response.data;

      if (!success || !data) {
        setLoginError(message || 'Invalid email or password');
        return;
      }

      login(data);

      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');

      if (redirectAfterLogin) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectAfterLogin);
      } else {
        navigate(getRolePath(data.user.role));
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-145px)] bg-slate-50">
      <div className="flex min-h-[inherit] flex-col md:flex-row">
        <div className="hidden w-1/2 flex-col justify-between p-10 text-white md:flex" style={{ background: '#1E1B4B' }}>
          <div className="font-display text-2xl">HireBridge</div>

          <div className="mx-auto max-w-md">
            <h1 className="font-display text-5xl leading-tight">Welcome back to a cleaner hiring workflow.</h1>
            <p className="mt-5 text-lg text-indigo-100">
              Sign in to continue with jobs, applications, dashboards, and moderation tasks.
            </p>
            <div className="mt-8 space-y-4">
              {[
                'Secure login with JWT sessions',
                'Fast redirects by user role',
                'Simple UI built only with Tailwind CSS'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-indigo-100">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-indigo-900 pt-8">
            <div>
              <p className="font-display text-3xl">3</p>
              <p className="mt-2 text-sm text-indigo-100">Protected dashboards</p>
            </div>
            <div>
              <p className="font-display text-3xl">100%</p>
              <p className="mt-2 text-sm text-indigo-100">Role-based redirects</p>
            </div>
            <div>
              <p className="font-display text-3xl">1</p>
              <p className="mt-2 text-sm text-indigo-100">Shared login flow</p>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-white px-4 py-12 md:w-1/2">
          <div className="w-full max-w-md">
            <h2 className="font-display text-4xl text-slate-900">Welcome back</h2>
            <p className="mt-3 text-slate-500">Log in to access your HireBridge workspace.</p>

            {successMessage && (
              <div className="mt-6 mb-4 flex justify-between rounded border-l-4 border-emerald-500 bg-emerald-50 p-4">
                <span className="text-sm text-emerald-700">{successMessage}</span>
                <button type="button" onClick={() => setSuccessMessage('')}>
                  x
                </button>
              </div>
            )}

            {loginError && (
              <div className="mt-6 mb-4 flex justify-between rounded border-l-4 border-red-500 bg-red-50 p-4">
                <span className="text-sm text-red-700">{loginError}</span>
                <button type="button" onClick={() => setLoginError('')}>
                  x
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-900">Password</label>
                  <a href="#" className="text-sm text-indigo-600">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-20"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary flex w-full items-center justify-center" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : 'Log In'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              New to HireBridge?{' '}
              <Link to="/signup" className="font-medium text-indigo-600">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
