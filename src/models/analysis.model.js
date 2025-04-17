const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: [true, 'Interview is required']
  },
  title: {
    type: String,
    required: [true, 'Analysis title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  responseCount: {
    type: Number,
    default: 0
  },
  aggregatedEmotions: {
    // Overall emotion distribution across all responses
    type: Map,
    of: Number
  },
  dominantEmotions: [{
    emotion: String,
    score: Number,
    percentage: Number
  }],
  emotionalJourney: {
    // Emotional progression across interview questions
    type: Map,
    of: [Number]
  },
  sentimentDistribution: {
    positive: Number,
    negative: Number,
    neutral: Number,
    mixed: Number
  },
  keyThemes: [{
    theme: String,
    relevance: Number,
    sentiment: String,
    relatedEmotions: [String],
    frequency: Number
  }],
  keyInsights: [{
    insight: String,
    confidence: Number,
    supportingResponses: [String]
  }],
  recommendations: [{
    recommendation: String,
    rationale: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    }
  }],
  visualizationData: {
    // Data prepared for visualization
    type: mongoose.Schema.Types.Mixed
  },
  insight7Id: {
    // ID for Insight7 integration
    type: String
  },
  processingError: {
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

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
