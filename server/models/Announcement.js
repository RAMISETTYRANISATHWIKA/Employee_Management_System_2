import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    audience: { type: String, enum: ['all', 'staff', 'admin', 'department'], default: 'all' },
    targetDepartment: { type: String },
    publicationDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    attachment: { type: String },
    isPublished: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
