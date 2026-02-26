import mongoose from 'mongoose';

const materialRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    requestedTitle: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending'
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

materialRequestSchema.index({ subject: 1, unitId: 1, status: 1 });
materialRequestSchema.index({ student: 1, createdAt: -1 });

const MaterialRequest = mongoose.model('MaterialRequest', materialRequestSchema);

export default MaterialRequest;

