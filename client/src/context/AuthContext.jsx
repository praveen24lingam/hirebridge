import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('authUser');

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    return null;
  }
};

const parseTokenPayload = (token) => {
  try {
    const base64 = token.split('.')[1];
    const normalizedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(window.atob(normalizedBase64));
    return decoded;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decoded = parseTokenPayload(token);

      if (decoded && decoded.exp * 1000 > Date.now()) {
        const storedUser = getStoredUser();
        const storedUserId = storedUser?.userId || storedUser?.id;

        setUser({
          id: decoded.userId,
          userId: decoded.userId,
          role: decoded.role,
          name:
            storedUserId === decoded.userId && storedUser?.name
              ? storedUser.name
              : decoded.name || '',
          exp: decoded.exp
        });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
      }
    }

    setLoading(false);
  }, []);

  const login = (data) => {
    const normalizedUser = {
      ...data.user,
      userId: data.user.userId || data.user.id
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('authUser', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const updateUser = (nextUser) => {
    setUser((prev) => {
      const updatedUser = {
        ...prev,
        ...nextUser
      };

      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
    localStorage.removeItem('redirectAfterLogin');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
