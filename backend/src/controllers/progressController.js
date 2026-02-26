import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import User from '../models/User.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const toggleUnitCompletion = async (req, res) => {
  const { subjectId, unitId } = req.body;

  if (!subjectId || !unitId) {
    res.status(400).json({ message: 'subjectId and unitId are required' });
    return;
  }

  if (!isValidObjectId(subjectId) || !isValidObjectId(unitId)) {
    res.status(400).json({ message: 'Invalid subjectId or unitId' });
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

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const existingIndex = (user.completedUnits || []).findIndex(
    (entry) =>
      entry.subject.toString() === subjectId &&
      entry.unitId.toString() === unitId
  );

  if (existingIndex >= 0) {
    user.completedUnits.splice(existingIndex, 1);
  } else {
    user.completedUnits.push({
      subject: subjectId,
      unitId
    });
  }

  await user.save();

  res.json({
    completedUnits: user.completedUnits
  });
};

