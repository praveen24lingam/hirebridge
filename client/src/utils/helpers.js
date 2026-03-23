export const formatDate = (dateString) => {
  if (!dateString) {
    return 'N/A';
  }

  const date = new Date(dateString);

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatSalary = (min, max) => {
  if (min === undefined || max === undefined || min === null || max === null) {
    return 'N/A';
  }

  return `₹${(min / 1000).toFixed(0)}k - ₹${(max / 1000).toFixed(0)}k/month`;
};

export const getInitials = (name) => {
  if (!name) {
    return '';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export const getDaysUntilDeadline = (deadline) => {
  const diff = new Date(deadline) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return 'Deadline passed';
  }

  if (days === 0) {
    return 'Closes today';
  }

  if (days === 1) {
    return 'Closes tomorrow';
  }

  return `Closes in ${days} days`;
};

export const calculateCompleteness = (profile) => {
  if (!profile) {
    return 0;
  }

  const checks = [
    profile.phone,
    profile.location,
    profile.bio,
    profile.resumeLink,
    profile.education?.degree,
    profile.education?.college
  ];
  const arrayChecks = [profile.skills?.length > 0];

  const filled =
    checks.filter((value) => value && value.trim() !== '').length +
    arrayChecks.filter(Boolean).length;

  return Math.round((filled / 7) * 100);
};

export const capitalizeText = (value = '') => {
  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getDashboardPath = (role) => {
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
