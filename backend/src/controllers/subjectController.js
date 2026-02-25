import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import { indexSubject, indexMaterial } from '../services/searchService.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getSubjects = async (_req, res) => {
  const subjects = await Subject.find()
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 });

  res.json(subjects);
};

export const createSubject = async (req, res) => {
  const { name, code, semester } = req.body;

  if (!name || !code || !semester) {
    res.status(400).json({ message: 'name, code and semester are required' });
    return;
  }

  const existing = await Subject.findOne({ code });
  if (existing) {
    res.status(400).json({ message: 'Subject with this code already exists' });
    return;
  }

  const subject = await Subject.create({
    name,
    code,
    semester,
    createdBy: req.user._id,
    units: []
  });

  await indexSubject(subject);

  res.status(201).json(subject);
};

export const addUnit = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid subject id' });
    return;
  }

  if (!title) {
    res.status(400).json({ message: 'Unit title is required' });
    return;
  }

  const subject = await Subject.findById(id);
  if (!subject) {
    res.status(404).json({ message: 'Subject not found' });
    return;
  }

  subject.units.push({ title, materials: [] });
  await subject.save();

  res.status(201).json(subject);
};

export const addMaterial = async (req, res) => {
  const { id, unitId } = req.params;
  const { title, fileUrl } = req.body;

  if (!isValidObjectId(id) || !isValidObjectId(unitId)) {
    res.status(400).json({ message: 'Invalid subject or unit id' });
    return;
  }

  if (!title || !fileUrl) {
    res.status(400).json({ message: 'Material title and fileUrl are required' });
    return;
  }

  const subject = await Subject.findById(id);
  if (!subject) {
    res.status(404).json({ message: 'Subject not found' });
    return;
  }

  const unit = subject.units.id(unitId);
  if (!unit) {
    res.status(404).json({ message: 'Unit not found' });
    return;
  }

  const material = {
    title,
    fileUrl,
    uploadedBy: req.user._id,
    createdAt: new Date()
  };

  unit.materials.push(material);
  await subject.save();

  const savedMaterial = unit.materials[unit.materials.length - 1];
  await indexMaterial(subject, unit, savedMaterial);

  res.status(201).json(subject);
};

export const deleteMaterial = async (req, res) => {
  const { id, unitId, materialId } = req.params;

  if (
    !isValidObjectId(id) ||
    !isValidObjectId(unitId) ||
    !isValidObjectId(materialId)
  ) {
    res.status(400).json({ message: 'Invalid id parameter' });
    return;
  }

  const subject = await Subject.findById(id);
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

  material.deleteOne();
  await subject.save();

  res.json({ message: 'Material deleted' });
};

