import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const recordMaterialView = async (req, res) => {
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

  material.viewCount = (material.viewCount || 0) + 1;
  await subject.save();

  const user = await User.findById(req.user._id);
  if (user) {
    user.lastOpened = {
      subject: subjectId,
      unitId,
      materialId,
      openedAt: new Date()
    };
    await user.save();
  }

  await ActivityLog.create({
    actor: req.user._id,
    type: 'material_viewed',
    subject: subject._id,
    unitId,
    materialId,
    metadata: {
      title: material.title
    }
  });

  res.json({
    viewCount: material.viewCount
  });
};

