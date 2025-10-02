import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    text: { type: String, default: '' },
    visibility: {
      type: String,
      enum: ['staff', 'parent', 'student', 'all'],
      default: 'all',
    },
  },
  { timestamps: true }
);

noteSchema.index({ student: 1, createdAt: -1 });
noteSchema.index({ createdAt: -1 });
noteSchema.index({ visibility: 1, createdAt: -1 });
export const Note = mongoose.model('Note', noteSchema);