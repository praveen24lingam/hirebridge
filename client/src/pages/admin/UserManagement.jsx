import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import DashboardLayout from '../../components/common/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roleTab, setRoleTab] = useState('all');
  const [statusFilters, setStatusFilters] = useState([]);
  const [confirming, setConfirming] = useState({ userId: '', action: '' });
  const [updatingUserId, setUpdatingUserId] = useState('');

  const navItems = [
    { label: 'Dashboard', icon: 'D', path: '/admin/dashboard' },
    { label: 'Manage Jobs', icon: 'J', path: '/admin/jobs' },
    { label: 'Manage Users', icon: 'U', path: '/admin/users' },
    { label: 'Logout', icon: 'L', isButton: true, onClick: logout }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/users', {
          params: { page: 1, limit: 100 }
        });
        const { success, message, data } = response.data;

        if (!success) {
          toast.error(message || 'Something went wrong. Please try again.');
          return;
        }

        setUsers(data?.users || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const roleMatch =
        roleTab === 'all' ||
        (roleTab === 'candidates' && user.role === 'candidate') ||
        (roleTab === 'employers' && user.role === 'employer');

      const statusMatch =
        statusFilters.length === 0 ||
        statusFilters.some((status) => {
          if (status === 'active') {
            return user.isActive;
          }

          if (status === 'suspended') {
            return !user.isActive;
          }

          return true;
        });

      return roleMatch && statusMatch;
    });
  }, [roleTab, statusFilters, users]);

  const toggleStatusFilter = (status) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]
    );
  };

  const updateUserStatus = async (userId, action) => {
    try {
      setUpdatingUserId(userId);
      const response = await api.patch(`/admin/users/${userId}/${action}`);
      const { success, message } = response.data;

      if (!success) {
        toast.error(message || 'Something went wrong. Please try again.');
        return;
      }
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isActive: action === 'reactivate' }
            : user
        )
      );
      setConfirming({ userId: '', action: '' });
      toast.success(
        message || `User ${action === 'suspend' ? 'suspended' : 'reactivated'} successfully`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setUpdatingUserId('');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout
      sidebarBg="bg-slate-900"
      navItems={navItems}
      roleLabel="Admin"
      roleBadgeClassName="bg-white/10 text-white"
      logoClassName="text-white"
      headerBorderClassName="border-slate-800"
      navActiveClassName="border-l-4 border-white bg-white/10 text-white"
      navInactiveClassName="text-slate-200 hover:bg-white/10"
      footerBorderClassName="border-slate-800"
      footerButtonClassName="btn-secondary w-full border-white text-white hover:bg-white/10"
      showFooterLogout={false}
    >
      <div className="max-w-7xl">
        <h1 className="font-display text-4xl text-slate-900">User Management</h1>
        <p className="mt-2 text-slate-500">Filter accounts client-side and moderate access quickly.</p>

        <div className="mt-8 flex flex-wrap gap-6 border-b border-slate-200">
          {[
            ['all', 'All'],
            ['candidates', 'Candidates'],
            ['employers', 'Employers']
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setRoleTab(key)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium ${
                roleTab === key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          {['active', 'suspended'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatusFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                statusFilters.includes(status)
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600'
              }`}
            >
              {status === 'active' ? 'Active' : 'Suspended'}
            </button>
          ))}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white py-20 text-center">
            <p className="text-lg text-slate-500">No users found</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-slate-200 last:border-b-0">
                    <td className="px-4 py-4 text-sm text-slate-900">{user.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{user.email}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {confirming.userId === user._id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">Confirm?</span>
                          <button
                            type="button"
                            onClick={() => updateUserStatus(user._id, confirming.action)}
                            disabled={updatingUserId === user._id}
                            className={`rounded px-3 py-1 text-sm ${
                              confirming.action === 'suspend'
                                ? 'border border-red-500 text-red-600'
                                : 'border border-emerald-500 text-emerald-600'
                            }`}
                          >
                            {updatingUserId === user._id ? 'Updating...' : 'Yes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirming({ userId: '', action: '' })}
                            className="rounded px-3 py-1 text-sm text-slate-500"
                          >
                            No
                          </button>
                        </div>
                      ) : user.isActive ? (
                        <button
                          type="button"
                          onClick={() => setConfirming({ userId: user._id, action: 'suspend' })}
                          className="rounded border border-red-500 px-3 py-1 text-sm text-red-600"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirming({ userId: user._id, action: 'reactivate' })}
                          className="rounded border border-emerald-500 px-3 py-1 text-sm text-emerald-600"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
