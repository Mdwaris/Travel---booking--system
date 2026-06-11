const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema(
  {
    destinationId: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    destinationTitle: {
      type: String,
      required: true,
      trim: true,
    },
    quotedPrice: {
      type: String,
      trim: true,
      default: '',
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['pay-later', 'card', 'upi', 'bank-transfer'],
      default: 'pay-later',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentReference: {
      type: String,
      trim: true,
      default: '',
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

bookingRequestSchema.index({ email: 1, createdAt: -1 });
bookingRequestSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
