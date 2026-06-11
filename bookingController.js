const BookingRequest = require('../models/BookingRequest');
const { sendMail } = require('../utils/mailer');
const { validateEmail } = require('../utils/validation');

const ALLOWED_PAYMENT_METHODS = ['pay-later', 'card', 'upi', 'bank-transfer'];
const ALLOWED_BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
const ALLOWED_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

function createBookingReference() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TRIP-${timestamp}-${randomPart}`;
}

async function createBookingRequest(req, res) {
  try {
    const {
      destinationId,
      destinationTitle,
      quotedPrice,
      name,
      email,
      checkIn,
      checkOut,
      guests,
      message,
      paymentMethod,
    } = req.body;

    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedDestinationTitle =
      typeof destinationTitle === 'string' ? destinationTitle.trim() : '';
    const normalizedMessage = typeof message === 'string' ? message.trim() : '';
    const normalizedQuotedPrice = typeof quotedPrice === 'string' ? quotedPrice.trim() : '';
    const normalizedPaymentMethod =
      typeof paymentMethod === 'string' ? paymentMethod.trim() : 'pay-later';
    const guestCount = Number(guests);

    if (
      !destinationId ||
      !normalizedDestinationTitle ||
      !normalizedName ||
      !normalizedEmail ||
      !checkIn ||
      !checkOut ||
      !guestCount ||
      !normalizedMessage
    ) {
      return res.status(400).json({ message: 'All booking fields are required.' });
    }

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return res.status(400).json({ message: 'Guests must be a valid number.' });
    }

    if (normalizedMessage.length < 10) {
      return res.status(400).json({ message: 'Trip notes must be at least 10 characters long.' });
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(normalizedPaymentMethod)) {
      return res.status(400).json({ message: 'Please choose a valid payment method.' });
    }

    const arrivalDate = new Date(checkIn);
    const departureDate = new Date(checkOut);

    if (Number.isNaN(arrivalDate.getTime()) || Number.isNaN(departureDate.getTime())) {
      return res.status(400).json({ message: 'Please provide valid travel dates.' });
    }

    if (departureDate <= arrivalDate) {
      return res.status(400).json({ message: 'Departure date must be after arrival date.' });
    }

    const booking = await BookingRequest.create({
      destinationId,
      userId: req.user?.id || null,
      destinationTitle: normalizedDestinationTitle,
      quotedPrice: normalizedQuotedPrice,
      bookingReference: createBookingReference(),
      name: normalizedName,
      email: normalizedEmail,
      checkIn: arrivalDate,
      checkOut: departureDate,
      guests: guestCount,
      message: normalizedMessage,
      paymentMethod: normalizedPaymentMethod,
    });

    await sendMail({
      to: normalizedEmail,
      subject: `Booking received: ${booking.bookingReference}`,
      text: [
        `Hello ${normalizedName},`,
        '',
        `We received your booking request for ${normalizedDestinationTitle}.`,
        `Reference: ${booking.bookingReference}`,
        `Status: ${booking.status}`,
        `Payment method: ${booking.paymentMethod}`,
        `Payment status: ${booking.paymentStatus}`,
        '',
        'Our team will contact you shortly with the next steps.',
      ].join('\n'),
      html: `
        <p>Hello ${normalizedName},</p>
        <p>We received your booking request for <strong>${normalizedDestinationTitle}</strong>.</p>
        <p><strong>Reference:</strong> ${booking.bookingReference}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
        <p><strong>Payment method:</strong> ${booking.paymentMethod}</p>
        <p><strong>Payment status:</strong> ${booking.paymentStatus}</p>
        <p>Our team will contact you shortly with the next steps.</p>
      `,
    });

    return res.status(201).json({
      message: `Booking request received for ${normalizedDestinationTitle}. Reference: ${booking.bookingReference}.`,
      booking,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 11000) {
      return res.status(409).json({ message: 'A booking reference collision occurred. Please try again.' });
    }

    console.error('Failed to create booking request:', error);
    return res.status(500).json({ message: 'Unable to submit your booking request right now.' });
  }
}

async function listBookingRequests(req, res) {
  try {
    const bookings = await BookingRequest.find().sort({ createdAt: -1 }).lean();
    return res.json(bookings);
  } catch (error) {
    console.error('Failed to load booking requests:', error);
    return res.status(500).json({ message: 'Unable to load booking requests right now.' });
  }
}

async function listMyBookingRequests(req, res) {
  try {
    const bookings = await BookingRequest.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json(bookings);
  } catch (error) {
    console.error('Failed to load customer booking requests:', error);
    return res.status(500).json({ message: 'Unable to load your bookings right now.' });
  }
}

async function updateBookingRequest(req, res) {
  try {
    const { id } = req.params;
    const { status, paymentStatus, paymentMethod, paymentReference, adminNotes } = req.body;
    const updates = {};

    if (status !== undefined) {
      if (!ALLOWED_BOOKING_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid booking status.' });
      }

      updates.status = status;
    }

    if (paymentStatus !== undefined) {
      if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status.' });
      }

      updates.paymentStatus = paymentStatus;
    }

    if (paymentMethod !== undefined) {
      if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
        return res.status(400).json({ message: 'Invalid payment method.' });
      }

      updates.paymentMethod = paymentMethod;
    }

    if (paymentReference !== undefined) {
      updates.paymentReference = String(paymentReference).trim();
    }

    if (adminNotes !== undefined) {
      updates.adminNotes = String(adminNotes).trim();
    }

    const booking = await BookingRequest.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    await sendMail({
      to: booking.email,
      subject: `Booking update: ${booking.bookingReference}`,
      text: [
        `Hello ${booking.name},`,
        '',
        `Your booking ${booking.bookingReference} has been updated.`,
        `Booking status: ${booking.status}`,
        `Payment status: ${booking.paymentStatus}`,
        `Payment method: ${booking.paymentMethod}`,
        booking.paymentReference ? `Payment reference: ${booking.paymentReference}` : '',
        booking.adminNotes ? `Admin notes: ${booking.adminNotes}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      html: `
        <p>Hello ${booking.name},</p>
        <p>Your booking <strong>${booking.bookingReference}</strong> has been updated.</p>
        <p><strong>Booking status:</strong> ${booking.status}</p>
        <p><strong>Payment status:</strong> ${booking.paymentStatus}</p>
        <p><strong>Payment method:</strong> ${booking.paymentMethod}</p>
        ${booking.paymentReference ? `<p><strong>Payment reference:</strong> ${booking.paymentReference}</p>` : ''}
        ${booking.adminNotes ? `<p><strong>Admin notes:</strong> ${booking.adminNotes}</p>` : ''}
      `,
    });

    return res.json({
      message: `Booking ${booking.bookingReference} updated successfully.`,
      booking,
    });
  } catch (error) {
    console.error('Failed to update booking request:', error);
    return res.status(500).json({ message: 'Unable to update booking right now.' });
  }
}

module.exports = {
  createBookingRequest,
  listBookingRequests,
  listMyBookingRequests,
  updateBookingRequest,
};
