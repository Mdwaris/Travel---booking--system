import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getBookingRequests, updateBookingRequest } from '../lib/api.js';

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString();
}

export default function AdminDashboard({ adminToken, adminProfile, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageStatus, setPageStatus] = useState('');
  const [savingId, setSavingId] = useState('');

  useEffect(() => {
    if (!adminToken) {
      return;
    }

    let isMounted = true;

    async function loadBookings() {
      try {
        setLoading(true);
        const data = await getBookingRequests(adminToken);

        if (isMounted) {
          setBookings(data);
          setPageStatus('');
        }
      } catch (error) {
        if (isMounted) {
          setPageStatus(error.message || 'Unable to load bookings right now.');
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
  }, [adminToken]);

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleFieldChange = (bookingId, field, value) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking._id === bookingId ? { ...booking, [field]: value } : booking
      )
    );
  };

  const handleSave = async (booking) => {
    try {
      setSavingId(booking._id);
      setPageStatus('');
      const response = await updateBookingRequest(
        booking._id,
        {
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentMethod: booking.paymentMethod,
          paymentReference: booking.paymentReference || '',
          adminNotes: booking.adminNotes || '',
        },
        adminToken
      );

      setBookings((currentBookings) =>
        currentBookings.map((item) => (item._id === booking._id ? response.booking : item))
      );
      setPageStatus(response.message);
    } catch (error) {
      setPageStatus(error.message || 'Unable to save booking changes right now.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <main className="admin-dashboard-page">
      <div className="container">
        <div className="admin-dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>
              Signed in as {adminProfile?.email || 'admin'}.
              Manage booking status, payment state, and customer updates.
            </p>
          </div>
          <button type="button" className="submit-btn admin-logout-btn" onClick={onLogout}>
            Log Out
          </button>
        </div>

        {pageStatus && <p className="status-message">{pageStatus}</p>}
        {loading && <p className="section-message">Loading bookings...</p>}

        {!loading && bookings.length === 0 && (
          <p className="section-message">No bookings have been submitted yet.</p>
        )}

        {!loading && bookings.length > 0 && (
          <div className="admin-booking-grid">
            {bookings.map((booking) => (
              <article className="admin-booking-card" key={booking._id}>
                <div className="admin-booking-top">
                  <div>
                    <span className="admin-badge">{booking.bookingReference}</span>
                    <h2>{booking.destinationTitle}</h2>
                    <p>{booking.quotedPrice || 'Custom pricing on request'}</p>
                  </div>
                  <div className="admin-booking-meta">
                    <p>{booking.name}</p>
                    <p>{booking.email}</p>
                  </div>
                </div>

                <div className="admin-booking-info">
                  <p>Travel dates: {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}</p>
                  <p>Guests: {booking.guests}</p>
                  <p>Requested payment: {booking.paymentMethod}</p>
                </div>

                <label htmlFor={`status-${booking._id}`}>Booking Status</label>
                <select
                  id={`status-${booking._id}`}
                  value={booking.status}
                  onChange={(event) => handleFieldChange(booking._id, 'status', event.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <label htmlFor={`payment-status-${booking._id}`}>Payment Status</label>
                <select
                  id={`payment-status-${booking._id}`}
                  value={booking.paymentStatus}
                  onChange={(event) => handleFieldChange(booking._id, 'paymentStatus', event.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>

                <label htmlFor={`payment-method-${booking._id}`}>Payment Method</label>
                <select
                  id={`payment-method-${booking._id}`}
                  value={booking.paymentMethod}
                  onChange={(event) => handleFieldChange(booking._id, 'paymentMethod', event.target.value)}
                >
                  <option value="pay-later">Pay Later</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>

                <label htmlFor={`payment-reference-${booking._id}`}>Payment Reference</label>
                <input
                  id={`payment-reference-${booking._id}`}
                  type="text"
                  value={booking.paymentReference || ''}
                  onChange={(event) => handleFieldChange(booking._id, 'paymentReference', event.target.value)}
                  placeholder="Transaction or gateway reference"
                />

                <label htmlFor={`admin-notes-${booking._id}`}>Admin Notes</label>
                <textarea
                  id={`admin-notes-${booking._id}`}
                  rows="4"
                  value={booking.adminNotes || ''}
                  onChange={(event) => handleFieldChange(booking._id, 'adminNotes', event.target.value)}
                  placeholder="Optional internal or customer-facing note"
                />

                <p className="admin-booking-message">{booking.message}</p>

                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => handleSave(booking)}
                  disabled={savingId === booking._id}
                >
                  {savingId === booking._id ? 'Saving...' : 'Save Changes'}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
