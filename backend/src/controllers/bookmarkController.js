import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import Bookmark from '../models/Bookmark.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const addBookmark = async (req, res) => {
  const { subjectId, unitId, materialId } = req.body;

  if (!subjectId || !unitId || !materialId) {
    res
      .status(400)
      .json({ message: 'subjectId, unitId and materialId are required' });
    return;
  }

  if (
    !isValidObjectId(subjectId) ||
    !isValidObjectId(unitId) ||
    !isValidObjectId(materialId)
  ) {
    res.status(400).json({ message: 'Invalid subjectId, unitId or materialId' });
    return;
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    res.status(404).json({ message: 'Subject not found' });
    return;
  }

  const unit = subject.units.id(unitId);
  if (!unit) {
    res.status(404).json({ message: 'Unit not found' });
    return;
  }

  const material = unit.materials.id(materialId);
  if (!material) {
    res.status(404).json({ message: 'Material not found' });
    return;
  }

  const bookmark = await Bookmark.findOneAndUpdate(
    {
      student: req.user._id,
      subject: subjectId,
      unitId,
      materialId
    },
    {},
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  res.status(201).json(bookmark);
};

export const removeBookmark = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid bookmark id' });
    return;
  }

  const deleted = await Bookmark.findOneAndDelete({
    _id: id,
    student: req.user._id
  });

  if (!deleted) {
    res.status(404).json({ message: 'Bookmark not found' });
    return;
  }

  res.json({ message: 'Bookmark removed' });
};

