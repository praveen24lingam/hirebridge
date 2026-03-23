import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DashboardLayout from '../../components/common/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const CandidateProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    resumeLink: '',
    education: {
      degree: '',
      college: '',
      yearOfGraduation: ''
    }
  });

  const navItems = [
    { label: 'Dashboard', icon: 'D', path: '/candidate/dashboard' },
    { label: 'Browse Jobs', icon: 'J', path: '/jobs' },
    { label: 'My Applications', icon: 'A', path: '/candidate/dashboard' },
    { label: 'My Profile', icon: 'P', path: '/candidate/profile' }
  ];

  const calculateCompleteness = (data) => {
    const checks = [
      data.phone,
      data.location,
      data.bio,
      data.resumeLink,
      data.education?.degree,
      data.education?.college
    ];
    const arrayChecks = [data.skills && data.skills.length > 0];

    const filled =
      checks.filter((value) => typeof value === 'string' && value.trim() !== '').length +
      arrayChecks.filter(Boolean).length;

    return Math.round((filled / 7) * 100);
  };

  const fetchProfile = async () => {
    setLoading(true);

    try {
      const response = await api.get('/candidate/profile');
      const payload = response.data;
      const data = payload?.data || {};
      setProfile(data);
      setFormData({
        name: user?.name || '',
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        skills: data.skills || [],
        resumeLink: data.resumeLink || '',
        education: {
          degree: data.education?.degree || '',
          college: data.education?.college || '',
          yearOfGraduation: data.education?.yearOfGraduation || ''
        }
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const completenessScore = useMemo(() => calculateCompleteness(formData), [formData]);

  const missingItems = useMemo(() => {
    const items = [];

    if (!formData.phone.trim()) items.push('Add your phone number');
    if (!formData.location.trim()) items.push('Add your location');
    if (!formData.bio.trim()) items.push('Write a short bio');
    if (!formData.resumeLink.trim()) items.push('Add your resume link');
    if (!formData.education.degree.trim()) items.push('Add your degree');
    if (!formData.education.college.trim()) items.push('Add your college');
    if (formData.skills.length === 0) items.push('Add at least one skill');

    return items;
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'degree' || name === 'college' || name === 'yearOfGraduation') {
      setFormData((prev) => ({
        ...prev,
        education: {
          ...prev.education,
          [name]: value
        }
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    const nextSkill = skillInput.trim();

    if (!nextSkill) {
      return;
    }

    if (formData.skills.includes(nextSkill)) {
      setSkillInput('');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, nextSkill]
    }));
    setSkillInput('');
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = await api.put('/candidate/profile', {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        skills: formData.skills,
        resumeLink: formData.resumeLink,
        education: {
          degree: formData.education.degree,
          college: formData.education.college,
          yearOfGraduation: formData.education.yearOfGraduation
            ? Number(formData.education.yearOfGraduation)
            : ''
        }
      });

      const { success, message, data } = response.data;

      if (!success) {
        const errorMessage = message || 'Something went wrong. Please try again.';
        setErrors({ submit: errorMessage });
        toast.error(errorMessage);
        return;
      }

      setProfile(data.profile);
      setFormData({
        name: data.user?.name || formData.name,
        phone: data.profile?.phone || '',
        location: data.profile?.location || '',
        bio: data.profile?.bio || '',
        skills: data.profile?.skills || [],
        resumeLink: data.profile?.resumeLink || '',
        education: {
          degree: data.profile?.education?.degree || '',
          college: data.profile?.education?.college || '',
          yearOfGraduation: data.profile?.education?.yearOfGraduation || ''
        }
      });
      updateUser({ name: data.user?.name || formData.name });
      toast.success('Profile updated successfully');
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Something went wrong. Please try again.'
      });
      toast.error(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout
      sidebarBg="bg-white border-r border-slate-200"
      navItems={navItems}
      roleLabel="Candidate"
    >
      <div className="max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="w-full flex-none md:w-80">
            <div className="card">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-2xl font-semibold text-white">
                {getInitials(formData.name || user?.name)}
              </div>
              <h2 className="mt-4 font-display text-xl text-slate-900">{formData.name || user?.name}</h2>
              <p className="mt-1 text-slate-500">{formData.location || 'Location not added'}</p>
              <p className="mt-4 text-sm leading-6 text-slate-500">{formData.bio || 'No bio added yet'}</p>

              <div className="mt-8">
                <p className="text-sm font-medium text-slate-900">Profile Strength</p>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-amber-500 transition-all"
                    style={{ width: `${completenessScore}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">{completenessScore}% complete</p>
                <div className="mt-4 space-y-2 text-sm text-slate-500">
                  {missingItems.length === 0 ? (
                    <p>All key profile fields are complete.</p>
                  ) : (
                    missingItems.map((item) => <p key={item}>- {item}</p>)
                  )}
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm font-medium text-slate-900">Skills</p>
                <div className="mt-3">
                  {formData.skills.length ? (
                    formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="m-1 inline-block rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400">No skills added</p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                {formData.resumeLink ? (
                  <a href={formData.resumeLink} target="_blank" rel="noreferrer" className="font-medium text-indigo-600">
                    View Resume →
                  </a>
                ) : (
                  <p className="text-slate-400">No resume link added</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="card">
              <h1 className="font-display text-3xl text-slate-900">Edit Your Profile</h1>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900">Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900">Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">Bio</label>
                  <textarea
                    rows="3"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">Skills</label>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
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
                    onKeyDown={handleSkillKeyDown}
                    className="input-field"
                    placeholder="Press Enter to add a skill"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900">Degree</label>
                    <input
                      type="text"
                      name="degree"
                      value={formData.education.degree}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900">College</label>
                    <input
                      type="text"
                      name="college"
                      value={formData.education.college}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900">Year</label>
                    <input
                      type="number"
                      name="yearOfGraduation"
                      value={formData.education.yearOfGraduation}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">Resume Link</label>
                  <input
                    type="text"
                    name="resumeLink"
                    value={formData.resumeLink}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

                <button type="submit" className="btn-primary flex w-full items-center justify-center" disabled={saving}>
                  {saving ? <LoadingSpinner size="sm" /> : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateProfile;
