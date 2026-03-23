import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (fieldName, value, currentForm) => {
    if (fieldName === 'name' && !value.trim()) {
      return 'This field is required';
    }

    if (fieldName === 'email' && (!value.includes('@') || !value.includes('.'))) {
      return 'Enter a valid email address';
    }

    if (fieldName === 'password' && value.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (fieldName === 'confirmPassword' && value !== currentForm.password) {
      return 'Passwords do not match';
    }

    return '';
  };

  const strength = useMemo(() => {
    const { password } = formData;
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    const segmentClasses = [
      hasLength ? 'bg-red-500' : 'bg-slate-200',
      hasUppercase ? 'bg-orange-400' : 'bg-slate-200',
      hasNumber ? 'bg-amber-400' : 'bg-slate-200',
      hasLength && hasUppercase && hasNumber ? 'bg-emerald-500' : 'bg-slate-200'
    ];

    let label = 'Weak';

    if ((hasLength && hasUppercase) || (hasLength && hasNumber) || (hasUppercase && hasNumber)) {
      label = 'Fair';
    }

    if (hasLength && hasUppercase && hasNumber) {
      label = 'Strong';
    }

    return { segmentClasses, label };
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, { ...formData, [name]: value })
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {
      name: validateField('name', formData.name, formData),
      email: validateField('email', formData.email, formData),
      password: validateField('password', formData.password, formData),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword, formData)
    };

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role
      });

      if (data?.success) {
        navigate('/login', {
          state: {
            message: 'Account created successfully. Please log in.'
          }
        });
        return;
      }

      toast.error(data?.message || 'Something went wrong. Please try again.');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    !role ||
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.password.trim() ||
    !formData.confirmPassword.trim() ||
    Object.values(errors).some(Boolean);

  return (
    <div className="min-h-[calc(100vh-145px)] bg-slate-50">
      <div className="flex min-h-[inherit] flex-col md:flex-row">
        <div className="hidden w-1/2 flex-col justify-between p-10 text-white md:flex" style={{ background: '#1E1B4B' }}>
          <div className="font-display text-2xl">HireBridge</div>

          <div className="mx-auto max-w-md">
            <h1 className="font-display text-5xl leading-tight">Create an account that fits your hiring role.</h1>
            <p className="mt-5 text-lg text-indigo-100">
              Join a platform designed to stay simple in code and clear in user flow.
            </p>
            <div className="mt-8 space-y-4">
              {[
                'Quick sign-up for candidates and employers',
                'Role-based access with clear permissions',
                'Simple dashboards that match backend logic'
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
              <p className="font-display text-3xl">10K+</p>
              <p className="mt-2 text-sm text-indigo-100">Applications reviewed</p>
            </div>
            <div>
              <p className="font-display text-3xl">2.4K</p>
              <p className="mt-2 text-sm text-indigo-100">Jobs posted</p>
            </div>
            <div>
              <p className="font-display text-3xl">91%</p>
              <p className="mt-2 text-sm text-indigo-100">Teams returning weekly</p>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-white px-4 py-12 md:w-1/2">
          <div className="w-full max-w-md">
            <h2 className="font-display text-4xl text-slate-900">Create your account</h2>
            <p className="mt-3 text-slate-500">Select your role first, then complete the form.</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div
                onClick={() => setRole('candidate')}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  role === 'candidate' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'
                }`}
              >
                <p className="text-lg font-semibold text-slate-900">I&apos;m a Candidate</p>
                <p className="mt-2 text-sm text-slate-500">Apply for roles and track your hiring progress.</p>
              </div>
              <div
                onClick={() => setRole('employer')}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                  role === 'employer' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'
                }`}
              >
                <p className="text-lg font-semibold text-slate-900">I&apos;m an Employer</p>
                <p className="mt-2 text-sm text-slate-500">Post jobs and review candidate applications.</p>
              </div>
            </div>

            {role && (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    {role === 'candidate' ? 'Full Name' : 'Company Name'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="input-field"
                    placeholder={role === 'candidate' ? 'Enter your full name' : 'Enter your company name'}
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="input-field"
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="input-field"
                    placeholder="Create a password"
                  />
                  <div className="mt-3 flex gap-2">
                    {strength.segmentClasses.map((segmentClass, index) => (
                      <div key={index} className={`h-2 flex-1 rounded-full ${segmentClass}`} />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Strength: {strength.label}</p>
                  {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="input-field"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                <button type="submit" className="btn-primary flex w-full items-center justify-center" disabled={isDisabled}>
                  {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
