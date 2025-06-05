import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant', 'system'],
  },
  mode: {
    type: String,
    enum: ['chat', 'command', 'task'],
    default: 'chat',
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map(),
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending',
  },
  error: {
    message: String,
    code: String,
    stack: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
messageSchema.index({ agentId: 1, sessionId: 1 });
messageSchema.index({ createdAt: 1 });
messageSchema.index({ status: 1 });

// Methods
messageSchema.methods.markAsProcessing = async function() {
  this.status = 'processing';
  await this.save();
};

messageSchema.methods.markAsCompleted = async function() {
  this.status = 'completed';
  await this.save();
};

messageSchema.methods.markAsError = async function(error) {
  this.status = 'error';
  this.error = {
    message: error.message,
    code: error.code,
    stack: error.stack,
  };
  await this.save();
};

// Static methods
messageSchema.statics.findBySession = function(agentId, sessionId) {
  return this.find({ agentId, sessionId }).sort({ createdAt: 1 });
};

messageSchema.statics.findPending = function() {
  return this.find({ status: 'pending' });
};

// Pre-save middleware
messageSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.metadata.set('lastStatusChange', new Date());
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);

export default Message; 