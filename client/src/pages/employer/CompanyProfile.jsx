import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DashboardLayout from '../../components/common/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CompanyProfile = () => {
  const [profile, setProfile] = useState({
    companyName: '',
    industry: '',
    website: '',
    description: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    { label: 'Company Profile', icon: 'C', path: '/employer/profile' }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get('/employer/profile');
        const data = response.data?.data || {};
        setProfile({
          companyName: data.companyName || '',
          industry: data.industry || '',
          website: data.website || '',
          description: data.description || '',
          logoUrl: data.logoUrl || ''
        });
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!profile.companyName.trim()) {
      toast.error('Company Name is required');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/employer/profile', profile);
      const { success, message, data } = response.data;

      if (!success) {
        toast.error(message || 'Something went wrong. Please try again.');
        return;
      }
      setProfile({
        companyName: data.companyName || '',
        industry: data.industry || '',
        website: data.website || '',
        description: data.description || '',
        logoUrl: data.logoUrl || ''
      });
      toast.success(message || 'Company profile updated successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const industrySuggestions = [
    'SaaS',
    'E-commerce',
    'EdTech',
    'FinTech',
    'HealthTech',
    'Agency',
    'Other'
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

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
      <div className="max-w-6xl">
        <h1 className="font-display text-3xl text-slate-900">Company Profile</h1>
        <p className="mt-2 text-slate-500">
          Keep your company information up to date to attract the right candidates.
        </p>

        <div className="mt-8 flex flex-col gap-6 md:flex-row">
          <div className="w-full flex-none md:w-80">
            <div className="card">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt={profile.companyName}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1E1B4B] text-2xl font-semibold text-white">
                    {profile.companyName
                      .split(' ')
                      .filter(Boolean)
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="mt-4 font-display text-xl text-slate-900">
                {profile.companyName || 'Company Name'}
              </h2>
              <p className="mt-1 text-slate-500">
                {profile.industry || 'Industry not specified'}
              </p>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-indigo-600"
                >
                  Visit Website
                </a>
              )}
              <p className="mt-4 text-sm leading-6 text-slate-500">
                {profile.description || 'No description added yet.'}
              </p>
            </div>
          </div>

          <div className="flex-1">
            <div className="card">
              <h2 className="font-display text-2xl text-slate-900">Edit Company Profile</h2>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={profile.companyName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={profile.industry}
                    onChange={handleChange}
                    className="input-field"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {industrySuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({ ...prev, industry: suggestion }))
                        }
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-indigo-500 hover:text-indigo-600"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    Website URL
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    Company Description
                  </label>
                  <textarea
                    rows={5}
                    name="description"
                    value={profile.description}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Tell candidates about your company, culture, and what makes you unique"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    name="logoUrl"
                    value={profile.logoUrl}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Paste image URL for company logo"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary flex w-full items-center justify-center"
                  disabled={saving}
                >
                  {saving ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyProfile;
