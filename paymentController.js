const BookingRequest = require('../models/BookingRequest');
const { sendMail } = require('../utils/mailer');
const { validateEmail } = require('../utils/validation');

const ALLOWED_PAYMENT_METHODS = ['card', 'upi', 'bank-transfer'];

function createPaymentReference(method) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${method.toUpperCase().replace('-', '')}-${timestamp}-${randomPart}`;
}

function getProvidedReference(paymentMethod, payload) {
  if (paymentMethod === 'card') {
    const last4 = String(payload.cardLast4 || '').trim();

    if (!/^\d{4}$/.test(last4)) {
      return { error: 'Card payments require the last 4 digits of the card.' };
    }

    return { reference: `CARD-${last4}-${createPaymentReference(paymentMethod)}` };
  }

  if (paymentMethod === 'upi') {
    const upiId = String(payload.upiId || '').trim();

    if (!/^[^\s@]+@[^\s@]+$/.test(upiId)) {
      return { error: 'Please provide a valid UPI ID.' };
    }

    return { reference: `UPI-${upiId}-${createPaymentReference(paymentMethod)}` };
  }

  const bankTransactionId = String(payload.bankTransactionId || payload.paymentReference || '').trim();

  if (bankTransactionId.length < 6) {
    return { error: 'Bank transfer payments require a transaction reference.' };
  }

  return { reference: bankTransactionId };
}

async function confirmPayment(req, res) {
  try {
    const { bookingReference, paymentMethod, payerEmail } = req.body;
    const normalizedBookingReference =
      typeof bookingReference === 'string' ? bookingReference.trim().toUpperCase() : '';
    const normalizedMethod = typeof paymentMethod === 'string' ? paymentMethod.trim() : '';
    const normalizedPayerEmail = typeof payerEmail === 'string' ? payerEmail.trim().toLowerCase() : '';

    if (!normalizedBookingReference || !normalizedMethod) {
      return res.status(400).json({ message: 'Booking reference and payment method are required.' });
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(normalizedMethod)) {
      return res.status(400).json({ message: 'Please choose card, UPI, or bank transfer.' });
    }

    const booking = await BookingRequest.findOne({ bookingReference: normalizedBookingReference });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const ownsBooking = req.user && booking.userId && booking.userId.toString() === req.user.id;
    const emailMatches = normalizedPayerEmail && validateEmail(normalizedPayerEmail) && normalizedPayerEmail === booking.email;

    if (!ownsBooking && !emailMatches) {
      return res.status(403).json({ message: 'Please use the booking email to confirm this payment.' });
    }

    const { reference, error } = getProvidedReference(normalizedMethod, req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    booking.paymentMethod = normalizedMethod;
    booking.paymentStatus = 'paid';
    booking.paymentReference = reference || createPaymentReference(normalizedMethod);

    if (booking.status === 'pending') {
      booking.status = 'confirmed';
    }

    await booking.save();

    await sendMail({
      to: booking.email,
      subject: `Payment confirmed: ${booking.bookingReference}`,
      text: [
        `Hello ${booking.name},`,
        '',
        `Your payment for ${booking.destinationTitle} has been confirmed.`,
        `Booking reference: ${booking.bookingReference}`,
        `Payment method: ${booking.paymentMethod}`,
        `Payment reference: ${booking.paymentReference}`,
      ].join('\n'),
      html: `
        <p>Hello ${booking.name},</p>
        <p>Your payment for <strong>${booking.destinationTitle}</strong> has been confirmed.</p>
        <p><strong>Booking reference:</strong> ${booking.bookingReference}</p>
        <p><strong>Payment method:</strong> ${booking.paymentMethod}</p>
        <p><strong>Payment reference:</strong> ${booking.paymentReference}</p>
      `,
    });

    return res.json({
      message: `Payment confirmed for booking ${booking.bookingReference}.`,
      booking,
    });
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    return res.status(500).json({ message: 'Unable to confirm payment right now.' });
  }
}

module.exports = {
  confirmPayment,
};
