import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getMyBookingRequests } from '../lib/api.js';

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString();
}

export default function Account({ userToken, userProfile, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!userToken) {
      return;
    }

    let isMounted = true;

    async function loadBookings() {
      try {
        setLoading(true);
        const data = await getMyBookingRequests(userToken);

        if (isMounted) {
          setBookings(data);
          setStatus('');
        }
      } catch (error) {
        if (isMounted) {
          setStatus(error.message || 'Unable to load your bookings right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      isMounted = false;
    };
  }, [userToken]);

  if (!userToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="account-page">
      <div className="container">
        <div className="account-header">
          <div>
            <h1>My Account</h1>
            <p>Welcome back, {userProfile?.name || 'traveler'}.</p>
          </div>
          <button type="button" className="submit-btn" onClick={onLogout}>
            Log Out
          </button>
        </div>

        {status && <p className="status-message error-message">{status}</p>}
        {loading && <p className="section-message">Loading your bookings...</p>}

        {!loading && bookings.length === 0 && (
          <section className="empty-state">
            <h2>No bookings yet</h2>
            <p>Your future trips will appear here after you request a booking.</p>
            <Link className="submit-btn" to="/#destinations">Browse Destinations</Link>
          </section>
        )}

        {!loading && bookings.length > 0 && (
          <div className="account-booking-grid">
            {bookings.map((booking) => (
              <article className="account-booking-card" key={booking._id}>
                <div>
                  <span className="admin-badge">{booking.bookingReference}</span>
                  <h2>{booking.destinationTitle}</h2>
                  <p>{booking.quotedPrice || 'Custom pricing on request'}</p>
                </div>
                <div className="account-booking-meta">
                  <p>{formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}</p>
                  <p>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</p>
                  <p>Booking: {booking.status}</p>
                  <p>Payment: {booking.paymentStatus}</p>
                  {booking.paymentReference && <p>Reference: {booking.paymentReference}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
