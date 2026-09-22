import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    leaveType: {
      type: String,
      enum: ['annual', 'sick', 'casual', 'unpaid', 'maternity', 'paternity'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    dayType: { type: String, enum: ['full', 'half'], default: 'full' },
    reason: { type: String, required: true, trim: true },
    attachment: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    approvalComment: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    totalDays: { type: Number, default: 1 },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ employee: 1, startDate: 1, endDate: 1 });

export default mongoose.model('LeaveRequest', leaveRequestSchema);
