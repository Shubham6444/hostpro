

const mongoose = require('mongoose');

// Enhanced User Schema for Admin Panel
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['admin', 'user'], 
    default: 'user' 
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  subscription: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  services: [{
    type: String,
    enum: [
      'payment-gateway',
      'whatsapp-api', 
      'otp-service',
      'email-api',
      'sms-gateway',
      'file-storage',
      'analytics',
      'notifications'
    ]
  }],
  apiCalls: {
    type: Number,
    default: 0
  },
  lastIP: {
    type: String,
    default: '0.0.0.0'
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export the model
module.exports = mongoose.model('User', userSchema);
