import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({
  sidebarBg = 'bg-white border-r border-slate-200',
  sidebarStyle,
  navItems,
  children,
  roleLabel = 'Dashboard',
  roleBadgeClassName = 'bg-indigo-100 text-indigo-700',
  logoClassName = 'text-slate-900',
  headerBorderClassName = 'border-slate-200',
  navActiveClassName = 'border-l-4 border-indigo-600 bg-indigo-50 text-indigo-700',
  navInactiveClassName = 'text-slate-600 hover:bg-slate-100',
  footerBorderClassName = 'border-slate-200',
  footerButtonClassName = 'btn-secondary w-full',
  showFooterLogout = true
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const renderItem = (item) => {
    const isActive = item.path ? location.pathname === item.path : false;
    const baseClassName = `mb-2 flex items-center gap-3 rounded-r-lg px-4 py-3 ${
      isActive ? navActiveClassName : navInactiveClassName
    }`;

    if (item.isButton && item.onClick) {
      return (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={item.className || baseClassName}
        >
          <span>{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </button>
      );
    }

    if (item.isButton && item.path) {
      return (
        <button
          key={item.label}
          type="button"
          onClick={() => navigate(item.path)}
          className={item.className || baseClassName}
        >
          <span>{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </button>
      );
    }

    return (
      <Link key={item.label} to={item.path} className={item.className || baseClassName}>
        <span>{item.icon}</span>
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className={`fixed left-0 top-0 hidden h-screen w-60 flex-col justify-between md:flex ${sidebarBg}`}
        style={sidebarStyle}
      >
        <div>
          <div className={`border-b px-6 py-6 ${headerBorderClassName}`}>
            <Link to="/" className={`font-display text-2xl ${logoClassName}`}>
              HireBridge
            </Link>
            <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${roleBadgeClassName}`}>
              {roleLabel}
            </div>
          </div>

          <nav className="px-4 py-6">
            {navItems.map((item) => renderItem(item))}
          </nav>
        </div>

        {showFooterLogout && (
          <div className={`border-t p-4 ${footerBorderClassName}`}>
            <button type="button" onClick={logout} className={footerButtonClassName}>
              Logout
            </button>
          </div>
        )}
      </aside>

      <main className="min-h-screen bg-slate-50 px-4 py-8 md:ml-60 md:px-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
