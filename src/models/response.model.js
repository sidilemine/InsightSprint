const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: [true, 'Interview is required']
  },
  question: {
    questionId: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  respondent: {
    id: {
      type: String,
      required: true
    },
    demographics: {
      age: Number,
      gender: String,
      location: String,
      // Additional demographic fields can be added as needed
    }
  },
  audioUrl: {
    type: String
  },
  audioFilePath: {
    type: String
  },
  transcription: {
    type: String
  },
  textResponse: {
    type: String
  },
  emotionAnalysis: {
    // Hume AI emotion analysis results
    emotions: [{
      startTime: Number,
      endTime: Number,
      emotions: {
        type: Map,
        of: Number
      }
    }],
    dominantEmotions: [{
      emotion: String,
      score: Number
    }],
    emotionalJourney: {
      type: String
    }
  },
  languageAnalysis: {
    // Gemini API language analysis results
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'mixed']
    },
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1
    },
    keyThemes: [{
      theme: String,
      relevance: Number
    }],
    entities: [{
      name: String,
      type: String,
      sentiment: String
    }]
  },
  aiResponse: {
    type: String
  },
  followUpQuestion: {
    type: String
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: {
    type: String
  },
  duration: {
    type: Number // Duration in seconds
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

// Index for efficient querying
responseSchema.index({ interview: 1, 'question.questionId': 1, 'respondent.id': 1 });

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;
