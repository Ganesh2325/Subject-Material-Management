import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'subject_created',
        'unit_added',
        'material_added',
        'material_viewed',
        'material_requested'
      ],
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({ type: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;

