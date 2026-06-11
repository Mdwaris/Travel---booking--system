import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { loginAdmin } from '../lib/api.js';

export default function AdminLogin({ adminToken, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (adminToken) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setStatus('');
      const response = await loginAdmin({ email, password });
      onLogin(response);
    } catch (error) {
      setStatus(error.message || 'Unable to log in right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-auth-page">
      <div className="container">
        <div className="admin-auth-card">
          <h1>Admin Login</h1>
          <p>Sign in to manage bookings, payment states, and guest updates.</p>
          <form className="admin-auth-form" onSubmit={handleSubmit}>
            <label htmlFor="adminEmail">Email</label>
            <input
              id="adminEmail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
            />

            <label htmlFor="adminPassword">Password</label>
            <input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              required
            />

            <button className="submit-btn" type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          {status && <p className="status-message">{status}</p>}
        </div>
      </div>
    </main>
  );
}
