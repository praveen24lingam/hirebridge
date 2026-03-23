import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const publicLinks = [
  { label: 'Browse Jobs', to: '/jobs' }
];

const candidateLinks = [
  { label: 'Browse Jobs', to: '/jobs' },
  { label: 'My Applications', to: '/candidate/dashboard#applications' }
];

const employerLinks = [
  { label: 'Dashboard', to: '/employer/dashboard' },
  { label: 'Post a Job', to: '/employer/jobs/new' },
  { label: 'My Jobs', to: '/employer/dashboard#jobs' }
];

const adminLinks = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Jobs', to: '/admin/jobs' },
  { label: 'Users', to: '/admin/users' }
];

const linkClassName = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
  }`;

const roleBadge = {
  candidate: 'bg-indigo-100 text-indigo-700',
  admin: 'bg-slate-900 text-white'
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isDropdownOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  let centerLinks = publicLinks;

  if (user?.role === 'candidate') {
    centerLinks = candidateLinks;
  }

  if (user?.role === 'employer') {
    centerLinks = employerLinks;
  }

  if (user?.role === 'admin') {
    centerLinks = adminLinks;
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="font-display text-2xl text-slate-900">
            HireBridge
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {centerLinks.map((link) => (
              <NavLink key={link.label} to={link.to} className={linkClassName}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!user ? (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${
                    user.role === 'candidate'
                      ? 'bg-indigo-600'
                      : user.role === 'employer'
                        ? 'bg-slate-800'
                        : 'bg-red-600'
                  }`}
                >
                  {getInitials(user.name || '')}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-lg border border-slate-200 bg-white shadow-lg">
                    {user.role === 'candidate' && (
                      <>
                        <div className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">{user.name}</p>
                          {user.email && (
                            <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                          )}
                        </div>
                        <div className="border-t border-slate-200" />
                        <button
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/candidate/profile');
                          }}
                        >
                          My Profile
                        </button>
                        <button
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/candidate/dashboard');
                          }}
                        >
                          My Applications
                        </button>
                        <div className="border-t border-slate-200" />
                        <button
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                        >
                          Logout
                        </button>
                      </>
                    )}

                    {user.role === 'employer' && (
                      <>
                        <div className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">{user.name}</p>
                          {user.email && (
                            <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                          )}
                        </div>
                        <div className="border-t border-slate-200" />
                        <button
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/employer/dashboard');
                          }}
                        >
                          Dashboard
                        </button>
                        <button
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/employer/profile');
                          }}
                        >
                          Company Profile
                        </button>
                        <button
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/employer/jobs/new');
                          }}
                        >
                          Post a Job
                        </button>
                        <div className="border-t border-slate-200" />
                        <button
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                        >
                          Logout
                        </button>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <>
                        <div className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">Admin</p>
                          {user.email && (
                            <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                          )}
                        </div>
                        <div className="border-t border-slate-200" />
                        <button
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/admin/dashboard');
                          }}
                        >
                          Dashboard
                        </button>
                        <div className="border-t border-slate-200" />
                        <button
                          type="button"
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                        >
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 text-slate-900 md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            Menu
          </button>
        </div>

        {isOpen && (
          <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 md:hidden">
            {centerLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={linkClassName}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            {!user ? (
              <div className="flex flex-col gap-3">
                <Link to="/login" className="btn-secondary text-center" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-center" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
                <button
                  type="button"
                  className="btn-secondary text-left"
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
