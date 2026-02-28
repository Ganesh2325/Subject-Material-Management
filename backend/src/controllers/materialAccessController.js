import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const findEmbeddedMaterial = (subject, materialId) => {
  for (const unit of subject.units || []) {
    const material = unit.materials?.id(materialId);
    if (material) {
      return { unit, material };
    }
  }
  return null;
};

export const getMaterialById = async (req, res) => {
  const { materialId } = req.params;

  if (!isValidObjectId(materialId)) {
    res.status(400).json({ message: 'Invalid material id' });
    return;
  }

  const subject = await Subject.findOne({ 'units.materials._id': materialId });
  if (!subject) {
    res.status(404).json({ message: 'Material not found' });
    return;
  }

  const found = findEmbeddedMaterial(subject, materialId);
  if (!found) {
    res.status(404).json({ message: 'Material not found' });
    return;
  }

  const { unit, material } = found;

  if (req.user?.role === 'student') {
    material.viewCount = (material.viewCount || 0) + 1;
    await subject.save();

    const user = await User.findById(req.user._id);
    if (user) {
      user.lastOpened = {
        subject: subject._id,
        unitId: unit._id,
        materialId: material._id,
        openedAt: new Date()
      };
      await user.save();
    }

    await ActivityLog.create({
      actor: req.user._id,
      type: 'material_viewed',
      subject: subject._id,
      unitId: unit._id,
      materialId: material._id,
      metadata: {
        title: material.title
      }
    });
  }

  res.json({
    subjectId: subject._id,
    unitId: unit._id,
    material: {
      _id: material._id,
      title: material.title,
      fileUrl: material.fileUrl,
      fileName: material.fileName,
      fileSize: material.fileSize,
      viewCount: material.viewCount || 0,
      createdAt: material.createdAt,
      uploadedBy: material.uploadedBy
    }
  });
};

