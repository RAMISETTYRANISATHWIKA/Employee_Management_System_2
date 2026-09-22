import mongoose from 'mongoose';

const eodReportSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    workDate: { type: Date, required: true, index: true },
    workSummary: { type: String, required: true, trim: true },
    tasksCompleted: { type: String, default: '' },
    tasksInProgress: { type: String, default: '' },
    blockers: { type: String, default: '' },
    tomorrowPlan: { type: String, default: '' },
    totalHours: { type: Number, min: 0, max: 24 },
    taskStatus: { type: String, enum: ['on-track', 'at-risk', 'blocked'], default: 'on-track' },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed', 'returned'],
      default: 'draft',
      index: true,
    },
    adminFeedback: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

eodReportSchema.index({ employee: 1, workDate: 1 }, { unique: true });

export default mongoose.model('EODReport', eodReportSchema);
