import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true },
    type: { type: String, enum: ['public', 'optional', 'company'], default: 'public' },
    description: { type: String },
    applicableDepartment: { type: String },
    isPublished: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

holidaySchema.index({ name: 1, date: 1 }, { unique: true });

export default mongoose.model('Holiday', holidaySchema);
