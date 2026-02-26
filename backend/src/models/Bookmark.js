import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
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
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  { timestamps: true }
);

bookmarkSchema.index(
  { student: 1, subject: 1, unitId: 1, materialId: 1 },
  { unique: true }
);

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;

