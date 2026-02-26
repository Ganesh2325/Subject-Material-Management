import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import MaterialRequest from '../models/MaterialRequest.js';
import ActivityLog from '../models/ActivityLog.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createMaterialRequest = async (req, res) => {
  const { subjectId, unitId, requestedTitle, description } = req.body;

  if (!subjectId || !unitId || !requestedTitle) {
    res.status(400).json({
      message: 'subjectId, unitId and requestedTitle are required'
    });
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

  const request = await MaterialRequest.create({
    student: req.user._id,
    subject: subject._id,
    unitId,
    requestedTitle,
    description
  });

  await ActivityLog.create({
    actor: req.user._id,
    type: 'material_requested',
    subject: subject._id,
    unitId,
    metadata: {
      requestedTitle
    }
  });

  res.status(201).json(request);
};

export const listPendingMaterialRequestsForTeacher = async (req, res) => {
  const teacherId = req.user._id;

  const subjects = await Subject.find({ createdBy: teacherId })
    .select('_id')
    .lean();

  const subjectIds = subjects
    .map((s) => s._id)
    .filter((id) => isValidObjectId(id));

  if (subjectIds.length === 0) {
    res.json([]);
    return;
  }

  const requests = await MaterialRequest.find({
    subject: { $in: subjectIds },
    status: 'pending'
  })
    .populate('student', 'name email')
    .populate('subject', 'name code')
    .sort({ createdAt: -1 })
    .lean();

  res.json(requests);
};

export const resolveMaterialRequest = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid request id' });
    return;
  }

  const request = await MaterialRequest.findById(id).populate('subject');
  if (!request) {
    res.status(404).json({ message: 'Material request not found' });
    return;
  }

  if (
    !request.subject ||
    request.subject.createdBy.toString() !== req.user._id.toString()
  ) {
    res
      .status(403)
      .json({ message: 'You are not allowed to modify this request' });
    return;
  }

  if (request.status === 'resolved') {
    res.json(request);
    return;
  }

  request.status = 'resolved';
  request.resolvedAt = new Date();
  await request.save();

  res.json(request);
};

