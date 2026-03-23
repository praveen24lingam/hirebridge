const LoadingSpinner = ({ size = 'lg' }) => {
  const spinnerSize = size === 'sm' ? 'h-4 w-4 border-2' : 'h-12 w-12 border-4';

  if (size === 'sm') {
    return (
      <div
        className={`animate-spin rounded-full border-slate-200 border-t-white ${spinnerSize}`}
      />
    );
  }

  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div
        className={`animate-spin rounded-full border-slate-200 border-t-indigo-600 ${spinnerSize}`}
      />
    </div>
  );
};

export default LoadingSpinner;
