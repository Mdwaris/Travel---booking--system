import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../lib/api.js';

export default function AuthPage({ mode, userToken, onAuth }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (userToken) {
    return <Navigate to="/account" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setStatus('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const action = isRegister ? registerUser : loginUser;

    try {
      setSubmitting(true);
      const response = await action(formData);
      onAuth(response);
      navigate(location.state?.from || '/account', { replace: true });
    } catch (error) {
      setStatus(error.message || 'Unable to continue right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="container">
        <section className="auth-card">
          <h1>{isRegister ? 'Create Your Account' : 'Customer Login'}</h1>
          <p>
            {isRegister
              ? 'Save your booking details and track payment status from one place.'
              : 'Sign in to review your bookings and complete payments.'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <label htmlFor="authName">Full Name</label>
                <input
                  id="authName"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            <label htmlFor="authEmail">Email Address</label>
            <input
              id="authEmail"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="authPassword">Password</label>
            <input
              id="authPassword"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
            />

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Log In'}
            </button>
          </form>

          {status && <p className="status-message error-message">{status}</p>}

          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : 'New to Luxury Travels?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Log in' : 'Create an account'}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
