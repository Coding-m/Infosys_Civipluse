// hooks/useAuth.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Optional: Verify token validity
    const verifyToken = async () => {
      try {
        // Add token validation API call if needed
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return { isAuthenticated, loading, logout };
};