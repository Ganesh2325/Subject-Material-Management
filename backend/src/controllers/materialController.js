const Material = require('../models/Material');
const Subject = require('../../models/Subject');

exports.createMaterial = async (req, res) => {
  try {
    const { title, type, unitNumber, subjectId, description, fileUrl } =
      req.body;

    if (!title || !type) {
      return res.status(400).json({ message: 'Title and type are required' });
    }

    let subject = null;
    if (subjectId) {
      subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
    }

    const material = await Material.create({
      title,
      type,
      unitNumber,
      subject: subject ? subject._id : undefined,
      description,
      fileUrl,
      createdBy: req.user._id
    });

    res.status(201).json(material);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Create material failed', error: err.message });
  }
};

exports.listMaterialsForStudent = async (req, res) => {
  try {
    const { type, unitNumber } = req.query;

    const query = {};
    if (type) query.type = type;
    if (unitNumber) query.unitNumber = Number(unitNumber);

    const materials = await Material.find(query)
      .populate('subject')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Fetch materials failed', error: err.message });
  }
};

exports.listMaterialsForTeacher = async (req, res) => {
  try {
    const materials = await Material.find({ createdBy: req.user._id })
      .populate('subject')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Fetch teacher materials failed', error: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    await material.deleteOne();
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

