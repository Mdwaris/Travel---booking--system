import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import DestinationDetail from './pages/DestinationDetail.jsx';
import Contact from './pages/Contact.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Account from './pages/Account.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import { getAdminProfile, getDestinations, getUserProfile } from './lib/api.js';

export default function App() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [adminProfile, setAdminProfile] = useState(() => {
    const storedProfile = localStorage.getItem('adminProfile');
    return storedProfile ? JSON.parse(storedProfile) : null;
  });
  const [userToken, setUserToken] = useState(() => localStorage.getItem('userToken') || '');
  const [userProfile, setUserProfile] = useState(() => {
    const storedProfile = localStorage.getItem('userProfile');
    return storedProfile ? JSON.parse(storedProfile) : null;
  });

  useEffect(() => {
    let isMounted = true;

    async function loadDestinations() {
      try {
        setLoading(true);
        const data = await getDestinations();

        if (isMounted) {
          setDestinations(data);
          setError('');
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Unable to load destinations right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!adminToken) {
      return;
    }

    let isMounted = true;

    async function loadAdminProfile() {
      try {
        const response = await getAdminProfile(adminToken);

        if (isMounted) {
          setAdminProfile(response.admin);
          localStorage.setItem('adminProfile', JSON.stringify(response.admin));
        }
      } catch {
        if (isMounted) {
          setAdminToken('');
          setAdminProfile(null);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminProfile');
        }
      }
    }

    loadAdminProfile();

    return () => {
      isMounted = false;
    };
  }, [adminToken]);

  useEffect(() => {
    if (!userToken) {
      return;
    }

    let isMounted = true;

    async function loadUserProfile() {
      try {
        const response = await getUserProfile(userToken);

        if (isMounted) {
          setUserProfile(response.user);
          localStorage.setItem('userProfile', JSON.stringify(response.user));
        }
      } catch {
        if (isMounted) {
          setUserToken('');
          setUserProfile(null);
          localStorage.removeItem('userToken');
          localStorage.removeItem('userProfile');
        }
      }
    }

    loadUserProfile();

    return () => {
      isMounted = false;
    };
  }, [userToken]);

  const handleAdminLogin = (response) => {
    setAdminToken(response.token);
    setAdminProfile(response.admin);
    localStorage.setItem('adminToken', response.token);
    localStorage.setItem('adminProfile', JSON.stringify(response.admin));
  };

  const handleAdminLogout = () => {
    setAdminToken('');
    setAdminProfile(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminProfile');
  };

  const handleUserAuth = (response) => {
    setUserToken(response.token);
    setUserProfile(response.user);
    localStorage.setItem('userToken', response.token);
    localStorage.setItem('userProfile', JSON.stringify(response.user));
  };

  const handleUserLogout = () => {
    setUserToken('');
    setUserProfile(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userProfile');
  };

  return (
    <BrowserRouter>
      <Header adminToken={adminToken} userToken={userToken} userProfile={userProfile} />
      <Routes>
        <Route
          path="/"
          element={<Home destinations={destinations} loading={loading} error={error} />}
        />
        <Route
          path="/destinations/:id"
          element={
            <DestinationDetail
              destinations={destinations}
              loading={loading}
              error={error}
              userToken={userToken}
              userProfile={userProfile}
            />
          }
        />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/login"
          element={<AuthPage mode="login" userToken={userToken} onAuth={handleUserAuth} />}
        />
        <Route
          path="/register"
          element={<AuthPage mode="register" userToken={userToken} onAuth={handleUserAuth} />}
        />
        <Route
          path="/account"
          element={
            <Account
              userToken={userToken}
              userProfile={userProfile}
              onLogout={handleUserLogout}
            />
          }
        />
        <Route
          path="/admin/login"
          element={<AdminLogin adminToken={adminToken} onLogin={handleAdminLogin} />}
        />
        <Route
          path="/admin"
          element={
            <AdminDashboard
              adminToken={adminToken}
              adminProfile={adminProfile}
              onLogout={handleAdminLogout}
            />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
