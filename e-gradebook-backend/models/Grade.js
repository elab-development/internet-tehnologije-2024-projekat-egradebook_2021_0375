import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    value: { type: Number, required: true, min: 1, max: 5 },
    type: {
      type: String,
      enum: ['written', 'oral', 'test', 'final', 'other'],
      default: 'other',
    },
    date: { type: Date, default: Date.now },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

// brz pregled ocena po učeniku/predmetu
gradeSchema.index({ student: 1, subject: 1, date: -1 });

export const Grade = mongoose.model('Grade', gradeSchema);