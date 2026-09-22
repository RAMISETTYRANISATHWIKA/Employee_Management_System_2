import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    relation: String,
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    officialEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    personalEmail: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    department: { type: String, required: true, index: true },
    designation: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern'],
      default: 'full-time',
    },
    reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    profilePhoto: { type: String },
    emergencyContact: emergencyContactSchema,
    employmentStatus: {
      type: String,
      enum: ['active', 'inactive', 'terminated', 'on-leave'],
      default: 'active',
      index: true,
    },
    leaveBalance: {
      annual: { type: Number, default: 20 },
      sick: { type: Number, default: 10 },
      casual: { type: Number, default: 5 },
    },
    baseSalary: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);
