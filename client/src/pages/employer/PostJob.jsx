import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DashboardLayout from '../../components/common/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const jobTypeOptions = ['internship', 'full-time', 'part-time'];

const PostJob = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    jobType: '',
    openings: '',
    deadline: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    skillsRequired: [],
    description: ''
  });

  const navItems = [
    { label: 'Dashboard', icon: 'D', path: '/employer/dashboard' },
    {
      label: 'Post a Job',
      icon: '+',
      path: '/employer/jobs/new',
      isButton: true,
      className:
        'mb-4 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700'
    },
    { label: 'My Jobs', icon: 'J', path: '/employer/dashboard' },
    { label: 'Company Profile', icon: 'C', path: '/employer/dashboard#company-profile' },
    { label: 'Logout', icon: 'L', isButton: true, onClick: logout }
  ];

  const descriptionCount = useMemo(() => formData.description.length, [formData.description]);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill || formData.skillsRequired.includes(skill)) {
      setSkillInput('');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      skillsRequired: [...prev.skillsRequired, skill]
    }));
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((skill) => skill !== skillToRemove)
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.title.trim()) nextErrors.title = 'Job title is required';
    if (!formData.jobType) nextErrors.jobType = 'Select a job type';
    if (!formData.openings || Number(formData.openings) < 1) {
      nextErrors.openings = 'Enter at least 1 opening';
    }

    if (!formData.deadline) {
      nextErrors.deadline = 'Deadline is required';
    } else if (new Date(formData.deadline) <= new Date()) {
      nextErrors.deadline = 'Deadline must be a future date';
    }

    if (!formData.location.trim()) nextErrors.location = 'Location is required';
    if (!formData.salaryMin) nextErrors.salaryMin = 'Minimum salary is required';
    if (!formData.salaryMax) nextErrors.salaryMax = 'Maximum salary is required';

    if (!formData.description.trim()) {
      nextErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 100) {
      nextErrors.description = 'Description must be at least 100 characters';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm();

    const salaryMinNumber = Number(formData.salaryMin);
    const salaryMaxNumber = Number(formData.salaryMax);

    if (
      formData.salaryMin &&
      formData.salaryMax &&
      !Number.isNaN(salaryMinNumber) &&
      !Number.isNaN(salaryMaxNumber) &&
      salaryMinNumber > salaryMaxNumber
    ) {
      nextErrors.salary = 'Minimum salary cannot be greater than maximum salary';
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= new Date()) {
        nextErrors.deadline = 'Deadline must be a future date';
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/jobs', {
        ...formData,
        openings: Number(formData.openings),
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax)
      });

      const { success, message } = response.data;

      if (!success) {
        toast.error(message || 'Something went wrong. Please try again.');
        return;
      }

      toast.success(message || 'Job posted successfully');
      navigate('/employer/dashboard');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      sidebarBg=""
      sidebarStyle={{ background: '#1E1B4B' }}
      navItems={navItems}
      roleLabel="Employer"
      roleBadgeClassName="bg-white/10 text-white"
      logoClassName="text-white"
      headerBorderClassName="border-indigo-900"
      navActiveClassName="border-l-4 border-white bg-white/10 text-white"
      navInactiveClassName="text-slate-200 hover:bg-white/10"
      footerBorderClassName="border-indigo-900"
      footerButtonClassName="btn-secondary w-full border-white text-white hover:bg-white/10"
      showFooterLogout={false}
    >
      <div className="mx-auto max-w-2xl">
        <div className="card">
          <h1 className="font-display text-4xl text-slate-900">Post a New Job</h1>
          <p className="mt-2 text-slate-500">Create a clear listing candidates can trust.</p>

          <form onSubmit={handleSubmit} className="mt-8">
            <section className="mb-6 border-b border-slate-200 pb-6">
              <p className="text-xs uppercase tracking-wide text-slate-500">Role Details</p>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-900">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                />
                {errors.title && <p className="mt-2 text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-900">Job Type</label>
                <div className="flex flex-wrap gap-3">
                  {jobTypeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, jobType: option }))}
                      className={`rounded-lg border-2 px-4 py-3 transition-colors ${
                        formData.jobType === option
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {errors.jobType && <p className="mt-2 text-sm text-red-500">{errors.jobType}</p>}
              </div>

              <div className="mt-4 flex flex-col gap-4 md:flex-row">
                <div className="w-32">
                  <label className="mb-2 block text-sm font-medium text-slate-900">Openings</label>
                  <input
                    type="number"
                    name="openings"
                    value={formData.openings}
                    onChange={handleChange}
                    className="input-field"
                  />
                  {errors.openings && <p className="mt-2 text-sm text-red-500">{errors.openings}</p>}
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-slate-900">Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="input-field"
                  />
                  {errors.deadline && <p className="mt-2 text-sm text-red-500">{errors.deadline}</p>}
                </div>
              </div>
            </section>

            <section className="mb-6 border-b border-slate-200 pb-6">
              <p className="text-xs uppercase tracking-wide text-slate-500">Location and Compensation</p>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-900">Location</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, location: 'Remote' }))}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Remote
                  </button>
                </div>
                {errors.location && <p className="mt-2 text-sm text-red-500">{errors.location}</p>}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">Min Salary</label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    className="input-field"
                  />
                  {errors.salaryMin && <p className="mt-2 text-sm text-red-500">{errors.salaryMin}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">Max Salary</label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    className="input-field"
                  />
                  {errors.salaryMax && <p className="mt-2 text-sm text-red-500">{errors.salaryMax}</p>}
                </div>
              </div>
              {errors.salary && <p className="mt-2 text-sm text-red-500">{errors.salary}</p>}
              <p className="mt-3 text-sm italic text-slate-400">
                Salary transparency builds candidate trust
              </p>
            </section>

            <section>
              <p className="text-xs uppercase tracking-wide text-slate-500">Job Description</p>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-900">Skills Required</label>
                <div className="mb-3 flex flex-wrap gap-2">
                  {formData.skillsRequired.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>
                        x
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addSkill();
                    }
                  }}
                  className="input-field"
                  placeholder="Press Enter to add a skill"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-900">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field min-h-32"
                />
                <p className="mt-2 text-right text-sm text-slate-500">{descriptionCount} characters</p>
                {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description}</p>}
              </div>
            </section>

            <button
              type="submit"
              className="btn-primary mt-8 flex w-full items-center justify-center"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Post Job'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PostJob;
