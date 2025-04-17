const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  title: {
    type: String,
    required: [true, 'Interview title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'archived'],
    default: 'draft'
  },
  questions: [{
    questionId: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['open', 'multiple-choice', 'rating', 'yes-no'],
      default: 'open'
    },
    options: [String],
    order: {
      type: Number,
      required: true
    }
  }],
  responseCount: {
    type: Number,
    default: 0
  },
  voiceformId: {
    type: String
  },
  publicAccessCode: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Generate a unique public access code before saving
interviewSchema.pre('save', function(next) {
  if (!this.publicAccessCode) {
    // Generate a random 8-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.publicAccessCode = code;
  }
  next();
});

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
