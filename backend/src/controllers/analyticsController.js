import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import ActivityLog from '../models/ActivityLog.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Bookmark from '../models/Bookmark.js';

export const getFacultyAnalytics = async (req, res) => {
  const facultyId = req.user._id;

  // 1) Teaching Overview Cards
  const subjects = await Subject.find({ createdBy: facultyId }).lean();
  const totalSubjects = subjects.length;
  let totalUnits = 0;
  let totalMaterials = 0;
  let totalStudentViews = 0;

  let allMaterials = [];

  subjects.forEach(subject => {
    totalUnits += subject.units.length;
    subject.units.forEach(unit => {
      totalMaterials += unit.materials.length;
      unit.materials.forEach(material => {
        totalStudentViews += (material.viewCount || 0);
        allMaterials.push({
          title: material.title,
          views: material.viewCount || 0,
          subjectName: subject.name
        });
      });
    });
  });

  // 2) Engagement Insights
  allMaterials.sort((a, b) => b.views - a.views);
  const mostViewed = allMaterials.length > 0 ? allMaterials[0] : null;
  const leastViewed = allMaterials.length > 0 ? allMaterials[allMaterials.length - 1] : null;

  // 3) Request Statistics
  const subjectIds = subjects.map(s => s._id);
  const pendingRequests = await MaterialRequest.countDocuments({ subject: { $in: subjectIds }, status: 'pending' });
  const resolvedRequests = await MaterialRequest.countDocuments({ subject: { $in: subjectIds }, status: { $in: ['resolved', 'rejected'] } });

  // 4) Trends (simplistic array for last 7 days of uploads and views)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentUploads = await ActivityLog.aggregate([
    { $match: { actor: facultyId, type: 'material_added', createdAt: { $gte: sevenDaysAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    overview: {
      totalSubjects,
      totalUnits,
      totalMaterials,
      totalStudentViews
    },
    engagement: {
      mostViewed,
      leastViewed
    },
    requests: {
      pending: pendingRequests,
      resolved: resolvedRequests
    },
    trends: {
      recentUploads
    }
  });
};

export const getStudentAnalytics = async (req, res) => {
  const studentId = req.user._id;

  // 1) Learning Progress & Activity Stats
  // Since we don't have explicit enrollment, we count unique subjects interacted with.
  const uniqueSubjectsInteracted = await ActivityLog.distinct('subject', { actor: studentId });
  const subjectsEnrolled = uniqueSubjectsInteracted.length;

  const materialsViewed = await ActivityLog.countDocuments({ actor: studentId, type: 'material_viewed' });
  const bookmarksCount = await Bookmark.countDocuments({ student: studentId });

  const recentActivity = await ActivityLog.find({ actor: studentId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('subject', 'name')
    .lean();

  // Return a computed structure matching typical dashboard metrics
  res.json({
    progress: {
      subjectsEnrolled,
      unitsCompleted: Math.floor(materialsViewed / 5), // Placeholder heuristic
      completionPercentage: subjectsEnrolled > 0 ? Math.min(100, Math.round((materialsViewed / (subjectsEnrolled * 10)) * 100)) : 0
    },
    activity: {
      materialsViewed,
      bookmarksCount,
      recentActivity
    },
    weakAreas: [
      { subject: 'Data Structures', completion: 45 },
      { subject: 'Operating Systems', completion: 60 }
    ] // Placeholder for UI since explicit grading doesn't exist in schema
  });
};
