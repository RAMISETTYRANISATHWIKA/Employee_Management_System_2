import mongoose from 'mongoose';

const salaryRecordSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    payrollPeriod: { type: String, required: true },
    creditDate: { type: Date },
    grossSalary: { type: Number, required: true, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'credited', 'failed', 'reversed'],
      default: 'draft',
      index: true,
    },
    paymentReference: { type: String },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

salaryRecordSchema.index({ employee: 1, payrollPeriod: 1 }, { unique: true });

export default mongoose.model('SalaryRecord', salaryRecordSchema);
