import { capitalizeText } from '../../utils/helpers';

const statusClasses = {
  applied: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-600',
  active: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-600',
  inactive: 'bg-red-100 text-red-700',
  internship: 'bg-indigo-100 text-indigo-700',
  'full-time': 'bg-emerald-100 text-emerald-700',
  'part-time': 'bg-amber-100 text-amber-700'
};

const StatusBadge = ({ status }) => {
  const classes = statusClasses[status] || 'bg-slate-100 text-slate-600';

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${classes}`}>
      {capitalizeText(status)}
    </span>
  );
};

export default StatusBadge;
