const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required']
  },
  productCategory: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  targetAudience: {
    type: String,
    required: [true, 'Target audience is required'],
    trim: true
  },
  objectives: {
    type: String,
    required: [true, 'Project objectives are required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'archived'],
    default: 'draft'
  },
  targetResponseCount: {
    type: Number,
    required: [true, 'Target response count is required'],
    min: [1, 'Target response count must be at least 1']
  },
  currentResponseCount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
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

// Virtual for completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  if (this.targetResponseCount === 0) return 0;
  return Math.min(100, Math.round((this.currentResponseCount / this.targetResponseCount) * 100));
});

// Set toJSON option to include virtuals
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
