import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SubjectsPage from './pages/SubjectsPage.jsx';
import SubjectDetailsPage from './pages/SubjectDetailsPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import BookmarksPage from './pages/BookmarksPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import ActivityPage from './pages/ActivityPage.jsx';
import RequestsPage from './pages/RequestsPage.jsx';
import AnnouncementsPage from './pages/AnnouncementsPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import MainLayout from './components/MainLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 }
};

const PageWrapper = ({ children }) => (
  <motion.div
    className="h-full"
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.22, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <PageWrapper>
              <LoginPage />
            </PageWrapper>
          }
        />
        <Route
          path="/register"
          element={
            <PageWrapper>
              <RegisterPage />
            </PageWrapper>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <PageWrapper>
                <DashboardPage />
              </PageWrapper>
            }
          />
          <Route
            path="/subjects"
            element={
              <PageWrapper>
                <SubjectsPage />
              </PageWrapper>
            }
          />
          <Route
            path="/subjects/:subjectId"
            element={
              <PageWrapper>
                <SubjectDetailsPage />
              </PageWrapper>
            }
          />
          <Route
            path="/search"
            element={
              <PageWrapper>
                <SearchPage />
              </PageWrapper>
            }
          />
          <Route
            path="/calendar"
            element={
              <PageWrapper>
                <CalendarPage />
              </PageWrapper>
            }
          />
          <Route
            path="/settings"
            element={
              <PageWrapper>
                <SettingsPage />
              </PageWrapper>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <PageWrapper>
                <BookmarksPage />
              </PageWrapper>
            }
          />
          <Route
            path="/analytics"
            element={
              <PageWrapper>
                <AnalyticsPage />
              </PageWrapper>
            }
          />
          <Route
            path="/activity"
            element={
              <PageWrapper>
                <ActivityPage />
              </PageWrapper>
            }
          />
          <Route
            path="/requests"
            element={
              <PageWrapper>
                <RequestsPage />
              </PageWrapper>
            }
          />
          <Route
            path="/announcements"
            element={
              <PageWrapper>
                <AnnouncementsPage />
              </PageWrapper>
            }
          />
          <Route
            path="/progress"
            element={
              <PageWrapper>
                <ProgressPage />
              </PageWrapper>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return <AppRoutes />;
}

export default App;

