import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import SkeletonLoader from './components/SkeletonLoader';
import FloatingChatbot from './components/FloatingChatbot';

// Eager-load critical pages
import HomePage from './pages/HomePage';
import SetupPage from './pages/SetupPage';

// Lazy-load dashboard pages for performance
const RepositoryOverview = lazy(() => import('./pages/RepositoryOverview'));
const DeveloperImpact = lazy(() => import('./pages/DeveloperImpact'));
const SkillIntelligence = lazy(() => import('./pages/SkillIntelligence'));
const RequirementMapping = lazy(() => import('./pages/RequirementMapping'));
const KnowledgeRisk = lazy(() => import('./pages/KnowledgeRisk'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const PlanVsReality = lazy(() => import('./pages/PlanVsReality'));

function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState(location.pathname);

  if (location.pathname !== previousPath) {
    setLoading(true);
    setPreviousPath(location.pathname);
  }

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Active page for sidebar
  const activePage = location.pathname.split('/').pop();

  return (
    <div className="min-h-screen bg-page transition-colors duration-300">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => navigate(`/dashboard/${page}`)}
        onSetup={() => navigate('/setup')}
      />
      <Navbar
        repoName={localStorage.getItem('codepulse_repo_name') || ''}
        onSetup={() => navigate('/setup')}
      />
      <main className="ml-[72px] pt-16 lg:pt-[72px] min-h-screen">
        <div className="p-6 lg:p-8">
          {loading ? (
            <SkeletonLoader />
          ) : (
            <Suspense fallback={<SkeletonLoader />}>
              <Routes>
                <Route path="overview" element={<RepositoryOverview />} />
                <Route path="impact" element={<DeveloperImpact />} />
                <Route path="skills" element={<SkillIntelligence />} />
                <Route path="mapping" element={<RequirementMapping />} />
                <Route path="risk" element={<KnowledgeRisk />} />
                <Route path="recommendations" element={<Recommendations />} />
                <Route path="plan-reality" element={<PlanVsReality />} />
                <Route path="*" element={<Navigate to="overview" replace />} />
              </Routes>
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle direct access to root — redirect to dashboard if repo is connected
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '') {
      const hasRepo = !!localStorage.getItem('codepulse_repo_id');
      if (hasRepo) {
        navigate('/dashboard/overview', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const handleNavigate = (view) => {
    if (view === 'setup') {
      navigate('/setup');
    } else if (view === 'landing') {
      navigate('/');
    } else if (view === 'dashboard') {
      navigate('/dashboard/overview');
    }
  };

  const handleSetupComplete = () => {
    navigate('/dashboard/overview');
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
      <Route path="/setup" element={<SetupPage onComplete={handleSetupComplete} />} />
      <Route path="/dashboard/*" element={<DashboardLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppLayout />
        <FloatingChatbot />
      </BrowserRouter>
    </ThemeProvider>
  );
}
