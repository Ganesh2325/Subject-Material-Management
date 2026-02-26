import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Bookmark from '../models/Bookmark.js';
import ActivityLog from '../models/ActivityLog.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getTeacherDashboard = async (req, res) => {
  const teacherId = req.user._id;

  const subjects = await Subject.find({ createdBy: teacherId }).lean();

  const totalSubjects = subjects.length;
  const totalUnits = subjects.reduce(
    (sum, subject) => sum + (subject.units ? subject.units.length : 0),
    0
  );
  const totalMaterials = subjects.reduce((sum, subject) => {
    if (!subject.units) return sum;
    return (
      sum +
      subject.units.reduce(
        (inner, unit) =>
          inner + (Array.isArray(unit.materials) ? unit.materials.length : 0),
        0
      )
    );
  }, 0);

  const totalMaterialViews = subjects.reduce((sum, subject) => {
    if (!subject.units) return sum;
    return (
      sum +
      subject.units.reduce((unitSum, unit) => {
        if (!Array.isArray(unit.materials)) return unitSum;
        return (
          unitSum +
          unit.materials.reduce(
            (materialSum, material) => materialSum + (material.viewCount || 0),
            0
          )
        );
      }, 0)
    );
  }, 0);

  const subjectIds = subjects.map((s) => s._id).filter(isValidObjectId);

  const pendingRequests = await MaterialRequest.find({
    subject: { $in: subjectIds },
    status: 'pending'
  })
    .populate('student', 'name email')
    .populate('subject', 'name code')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const activities = await ActivityLog.find({ actor: teacherId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  res.json({
    summary: {
      totalSubjects,
      totalUnits,
      totalMaterials,
      totalMaterialViews
    },
    pendingRequests,
    recentActivities: activities
  });
};

export const getStudentDashboard = async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).lean();
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const subjects = await Subject.find({})
    .select('name code semester units createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const subjectById = new Map(
    subjects.map((subject) => [subject._id.toString(), subject])
  );

  const resolveMaterialDetails = (subjectId, unitId, materialId) => {
    if (!subjectId || !unitId || !materialId) {
      return null;
    }

    const subject = subjectById.get(subjectId.toString());
    if (!subject || !Array.isArray(subject.units)) {
      return null;
    }

    const unit = subject.units.find(
      (u) => u._id.toString() === unitId.toString()
    );
    if (!unit || !Array.isArray(unit.materials)) {
      return {
        subjectName: subject.name,
        unitTitle: null,
        materialTitle: null
      };
    }

    const material = unit.materials.find(
      (m) => m._id.toString() === materialId.toString()
    );

    return {
      subjectName: subject.name,
      unitTitle: unit.title,
      materialTitle: material ? material.title : null
    };
  };

  const completedUnitsBySubject = new Map();
  (user.completedUnits || []).forEach((entry) => {
    const key = entry.subject.toString();
    const current = completedUnitsBySubject.get(key) || 0;
    completedUnitsBySubject.set(key, current + 1);
  });

  const subjectsWithProgress = subjects.map((subject) => {
    const totalUnits = subject.units ? subject.units.length : 0;
    const completedUnits =
      completedUnitsBySubject.get(subject._id.toString()) || 0;
    const progress =
      totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

    return {
      ...subject,
      stats: {
        totalUnits,
        completedUnits,
        progress
      }
    };
  });

  const bookmarks = await Bookmark.find({ student: userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const recentRequests = await MaterialRequest.find({ student: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const rawLastOpened = user.lastOpened || null;
  let lastOpened = null;

  if (
    rawLastOpened &&
    rawLastOpened.subject &&
    rawLastOpened.unitId &&
    rawLastOpened.materialId
  ) {
    const details = resolveMaterialDetails(
      rawLastOpened.subject,
      rawLastOpened.unitId,
      rawLastOpened.materialId
    );

    lastOpened = {
      ...rawLastOpened,
      subjectName: details?.subjectName || null,
      unitTitle: details?.unitTitle || null,
      materialTitle: details?.materialTitle || null
    };
  }

  const enrichedBookmarks = bookmarks.map((bookmark) => {
    const details = resolveMaterialDetails(
      bookmark.subject,
      bookmark.unitId,
      bookmark.materialId
    );

    return {
      ...bookmark,
      subjectName: details?.subjectName || null,
      unitTitle: details?.unitTitle || null,
      materialTitle: details?.materialTitle || null
    };
  });

  res.json({
    lastOpened,
    subjects: subjectsWithProgress,
    bookmarks: enrichedBookmarks,
    recentRequests
  });
};

