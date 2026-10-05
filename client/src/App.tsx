import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { DashboardPage } from './pages/DashboardPage';
import { SlipUploadPage } from './pages/SlipUploadPage';
import { GuestListPage } from './pages/GuestListPage';
import { PreviewPage } from './pages/PreviewPage';
import { ThemeCustomizePage } from './pages/ThemeCustomizePage';
import { AdminPage } from './pages/AdminPage';
import { ProtectedRoute } from './components/ProtectedRoute';

// Automatically scrolls window to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  const location = useLocation();

  // Hide Navbar in whole-page preview or guest invitation mode
  const isFullScreenPreview =
    location.pathname.startsWith('/preview/') ||
    location.pathname.startsWith('/i/');

  return (
    <div className="min-h-screen-dvh flex flex-col bg-sand-50">
      <ScrollToTop />
      {!isFullScreenPreview && <Navbar />}

      <div className="flex-1 flex flex-col">
        <Routes>
          {/* Public Visitor Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<LoginPage initialForgotMode={true} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />

          {/* Theme Customizer & Whole-Page Invitation Previews */}
          <Route path="/customize/:templateKey" element={<ThemeCustomizePage />} />
          <Route path="/preview/:templateKey" element={<PreviewPage />} />
          <Route path="/i/:token" element={<PreviewPage />} />

          {/* Authenticated Couple Portal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-slip/:templateId"
            element={
              <ProtectedRoute>
                <SlipUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guests"
            element={
              <ProtectedRoute>
                <GuestListPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Management Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to catalog */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
