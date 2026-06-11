import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { confirmPayment, submitBookingRequest } from '../lib/api.js';

export default function DestinationDetail({ destinations, loading, error, userToken, userProfile }) {
  const { id } = useParams();
  const bookingRef = useRef(null);
  const galleryMainRef = useRef(null);
  const destination = destinations.find((item) => item.id === Number(id));
  const [activeIndex, setActiveIndex] = useState(0);
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
    paymentMethod: 'pay-later',
    cardLast4: '',
    upiId: '',
    bankTransactionId: '',
    message: '',
  });

  useEffect(() => {
    setActiveIndex(0);
    setBookingStatus('');
    setBookingError('');
    setBookingData({
      name: '',
      email: '',
      checkIn: '',
      checkOut: '',
      guests: '2',
      paymentMethod: 'pay-later',
      cardLast4: '',
      upiId: '',
      bankTransactionId: '',
      message: '',
    });
  }, [id]);

  useEffect(() => {
    if (userProfile) {
      setBookingData((current) => ({
        ...current,
        name: current.name || userProfile.name || '',
        email: current.email || userProfile.email || '',
      }));
    }
  }, [userProfile]);

  if (loading) {
    return (
      <main className="notfound">
        <div className="container">
          <h2>Loading destination...</h2>
          <p>We are preparing your luxury travel details now.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="notfound">
        <div className="container">
          <h2>Destination unavailable</h2>
          <p>{error}</p>
          <Link className="submit-btn" to="/">Return Home</Link>
        </div>
      </main>
    );
  }

  if (!destination) {
    return (
      <main className="notfound">
        <div className="container">
          <h2>Destination not found</h2>
          <p>We couldn't locate that destination. Please try another one.</p>
          <Link className="submit-btn" to="/">Return Home</Link>
        </div>
      </main>
    );
  }

  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/1200x800?text=Luxury+Destination';
  const galleryImages = destination.gallery && destination.gallery.length > 0
    ? destination.gallery
    : [destination.image];
  const today = new Date().toISOString().split('T')[0];

  const handleBookingChange = (event) => {
    const { name, value } = event.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
    setBookingError('');
    setBookingStatus('');
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    const {
      name,
      email,
      checkIn,
      checkOut,
      guests,
      message,
      paymentMethod,
      cardLast4,
      upiId,
      bankTransactionId,
    } = bookingData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !checkIn || !checkOut || !guests || !message) {
      setBookingError('Please complete all required fields.');
      setBookingStatus('');
      return;
    }

    if (!emailRegex.test(email)) {
      setBookingError('Please enter a valid email address.');
      setBookingStatus('');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setBookingError('Departure date must be after arrival date.');
      setBookingStatus('');
      return;
    }

    if (message.trim().length < 10) {
      setBookingError('Trip notes must be at least 10 characters long.');
      setBookingStatus('');
      return;
    }

    if (paymentMethod === 'card' && !/^\d{4}$/.test(cardLast4)) {
      setBookingError('Enter the last 4 digits of your card.');
      setBookingStatus('');
      return;
    }

    if (paymentMethod === 'upi' && !/^[^\s@]+@[^\s@]+$/.test(upiId)) {
      setBookingError('Enter a valid UPI ID.');
      setBookingStatus('');
      return;
    }

    if (paymentMethod === 'bank-transfer' && bankTransactionId.trim().length < 6) {
      setBookingError('Enter your bank transfer transaction reference.');
      setBookingStatus('');
      return;
    }

    try {
      setBookingSubmitting(true);
      const response = await submitBookingRequest({
        token: userToken,
        data: {
          destinationId: destination.id,
          destinationTitle: destination.title,
          quotedPrice: destination.price,
          name,
          email,
          checkIn,
          checkOut,
          guests,
          paymentMethod,
          message,
        },
      });

      let statusMessage = response.message;

      if (paymentMethod !== 'pay-later') {
        const paymentResponse = await confirmPayment(
          {
            bookingReference: response.booking.bookingReference,
            paymentMethod,
            payerEmail: email,
            cardLast4,
            upiId,
            bankTransactionId,
          },
          userToken
        );
        statusMessage = `${response.message} ${paymentResponse.message}`;
      }

      setBookingStatus(statusMessage);
      setBookingError('');
      setBookingData({
        name: userProfile?.name || '',
        email: userProfile?.email || '',
        checkIn: '',
        checkOut: '',
        guests: '2',
        paymentMethod: 'pay-later',
        cardLast4: '',
        upiId: '',
        bankTransactionId: '',
        message: '',
      });
    } catch (submitError) {
      setBookingError(submitError.message || 'Unable to submit your booking request right now.');
      setBookingStatus('');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const prevSlide = () => {
    setActiveIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
  };

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % galleryImages.length);
  };

  const handleGalleryKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      prevSlide();
    } else if (event.key === 'ArrowRight') {
      nextSlide();
    }
  };

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="destination-detail">
      <div className="container">
        <div className="detail-header">
          <img
            src={galleryImages[activeIndex]}
            alt={`${destination.title} view`}
            onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
          />
          <div className="detail-copy">
            <span className="price">{destination.price}</span>
            <h2>{destination.title}</h2>
            <p>{destination.description}</p>
            <ul className="destination-meta">
              <li><strong>Country:</strong> {destination.country}</li>
              <li><strong>Region:</strong> {destination.region}</li>
              <li><strong>Duration:</strong> {destination.duration}</li>
              <li><strong>Stay:</strong> {destination.accommodation}</li>
            </ul>
            <button type="button" className="submit-btn detail-booking-btn" onClick={scrollToBooking}>
              Request Booking
            </button>
          </div>
        </div>

        <section className="detail-gallery">
          <div
            className="gallery-main"
            ref={galleryMainRef}
            tabIndex={0}
            onKeyDown={handleGalleryKeyDown}
            aria-label="Destination gallery"
          >
            <img
              src={galleryImages[activeIndex]}
              alt={`${destination.title} gallery ${activeIndex + 1}`}
              onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
            />
            <div className="gallery-controls">
              <button type="button" onClick={prevSlide}>Previous</button>
              <button type="button" onClick={nextSlide}>Next</button>
            </div>
          </div>
          <div className="gallery-thumbnails">
            {galleryImages.map((image, index) => (
              <button
                key={image}
                type="button"
                className={index === activeIndex ? 'active' : ''}
                onClick={() => setActiveIndex(index)}
                aria-label={`View photo ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1} for ${destination.title}`}
                  onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
                />
              </button>
            ))}
          </div>
        </section>

        <section className="detail-highlights">
          <h3>Signature Highlights</h3>
          <ul>
            {destination.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </section>

        <section className="booking-section" id="booking" ref={bookingRef}>
          <div className="booking-card">
            <h2>Book Your Luxury Experience</h2>
            <p>Complete the form below to request a tailored itinerary, premium ground transfers, and private concierge service.</p>
            {!userToken && (
              <p className="booking-auth-note">
                <Link to="/login">Log in</Link> or <Link to="/register">create an account</Link> to track this booking later.
              </p>
            )}
            <form className="booking-form" onSubmit={handleBookingSubmit}>
              <label htmlFor="bookingName">Full Name</label>
              <input
                id="bookingName"
                name="name"
                type="text"
                value={bookingData.name}
                onChange={handleBookingChange}
                placeholder="Your name"
                required
              />

              <label htmlFor="bookingEmail">Email Address</label>
              <input
                id="bookingEmail"
                name="email"
                type="email"
                value={bookingData.email}
                onChange={handleBookingChange}
                placeholder="Your email"
                required
              />

              <div className="booking-row">
                <div>
                  <label htmlFor="bookingCheckIn">Arrival Date</label>
                  <input
                    id="bookingCheckIn"
                    name="checkIn"
                    type="date"
                    value={bookingData.checkIn}
                    onChange={handleBookingChange}
                    min={today}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="bookingCheckOut">Departure Date</label>
                  <input
                    id="bookingCheckOut"
                    name="checkOut"
                    type="date"
                    value={bookingData.checkOut}
                    onChange={handleBookingChange}
                    min={bookingData.checkIn || today}
                    required
                  />
                </div>
              </div>

              <label htmlFor="bookingGuests">Guests</label>
              <select
                id="bookingGuests"
                name="guests"
                value={bookingData.guests}
                onChange={handleBookingChange}
                required
              >
                <option value="1">1 guest</option>
                <option value="2">2 guests</option>
                <option value="3">3 guests</option>
                <option value="4">4 guests</option>
                <option value="5">5+ guests</option>
              </select>

              <label htmlFor="bookingPaymentMethod">Payment Preference</label>
              <select
                id="bookingPaymentMethod"
                name="paymentMethod"
                value={bookingData.paymentMethod}
                onChange={handleBookingChange}
                required
              >
                <option value="pay-later">Pay Later</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank-transfer">Bank Transfer</option>
              </select>

              {bookingData.paymentMethod === 'card' && (
                <>
                  <label htmlFor="bookingCardLast4">Card Last 4 Digits</label>
                  <input
                    id="bookingCardLast4"
                    name="cardLast4"
                    type="text"
                    inputMode="numeric"
                    maxLength="4"
                    value={bookingData.cardLast4}
                    onChange={handleBookingChange}
                    placeholder="1234"
                    required
                  />
                </>
              )}

              {bookingData.paymentMethod === 'upi' && (
                <>
                  <label htmlFor="bookingUpiId">UPI ID</label>
                  <input
                    id="bookingUpiId"
                    name="upiId"
                    type="text"
                    value={bookingData.upiId}
                    onChange={handleBookingChange}
                    placeholder="name@bank"
                    required
                  />
                </>
              )}

              {bookingData.paymentMethod === 'bank-transfer' && (
                <>
                  <label htmlFor="bookingBankReference">Bank Transfer Reference</label>
                  <input
                    id="bookingBankReference"
                    name="bankTransactionId"
                    type="text"
                    value={bookingData.bankTransactionId}
                    onChange={handleBookingChange}
                    placeholder="Transaction reference"
                    required
                  />
                </>
              )}

              <label htmlFor="bookingMessage">Trip Notes</label>
              <textarea
                id="bookingMessage"
                name="message"
                rows="5"
                value={bookingData.message}
                onChange={handleBookingChange}
                placeholder="Tell us your travel goals and preferences"
                minLength={10}
                required
              />

              <button type="submit" className="submit-btn" disabled={bookingSubmitting}>
                {bookingSubmitting ? 'Submitting...' : 'Submit Booking Request'}
              </button>
            </form>
            {bookingError && <p className="booking-feedback error-message">{bookingError}</p>}
            {bookingStatus && <p className="booking-feedback success-message">{bookingStatus}</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
