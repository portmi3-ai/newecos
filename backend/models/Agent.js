import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['meta', 'integration', 'chat'],
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'deployed', 'error'],
    default: 'inactive',
  },
  capabilities: [{
    type: String,
    required: true,
  }],
  model: {
    type: String,
    required: true,
    enum: ['gemini-pro', 'claude-3', 'gpt-4'],
  },
  configuration: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map(),
  },
  metrics: {
    successRate: {
      type: Number,
      default: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
  },
  relationships: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
agentSchema.index({ name: 1, type: 1 }, { unique: true });
agentSchema.index({ status: 1 });
agentSchema.index({ createdBy: 1 });

// Methods
agentSchema.methods.updateMetrics = async function(success) {
  this.metrics.usageCount += 1;
  this.metrics.lastUsed = new Date();
  
  if (this.metrics.usageCount > 0) {
    this.metrics.successRate = ((this.metrics.successRate * (this.metrics.usageCount - 1)) + (success ? 1 : 0)) / this.metrics.usageCount;
  }
  
  await this.save();
};

agentSchema.methods.addRelationship = async function(agentId) {
  if (!this.relationships.includes(agentId)) {
    this.relationships.push(agentId);
    await this.save();
  }
};

agentSchema.methods.removeRelationship = async function(agentId) {
  this.relationships = this.relationships.filter(id => id.toString() !== agentId.toString());
  await this.save();
};

// Static methods
agentSchema.statics.findByType = function(type) {
  return this.find({ type });
};

agentSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Pre-save middleware
agentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Agent = mongoose.model('Agent', agentSchema);

export default Agent; 