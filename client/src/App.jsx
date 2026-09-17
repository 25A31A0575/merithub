import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import SearchFilters from './components/SearchFilters';
import AchievementCard from './components/AchievementCard';
import AchievementModal from './components/AchievementModal';
import SubmitForm from './components/SubmitForm';
import MySubmissions from './components/MySubmissions';
import VerifierDesk from './components/VerifierDesk';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LoginPage from './components/LoginPage';
import JudgeDemoBanner from './components/JudgeDemoBanner';
import JudgeTourModal from './components/JudgeTourModal';
import AccessDenied from './components/AccessDenied';
import Footer from './components/Footer';
import { AlertCircle, CheckSquare, PlusCircle, RefreshCw, Trophy } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function App() {
  // Navigation View State: 'showcase' | 'submit' | 'my-submissions' | 'verifier' | 'analytics' | 'login'
  const [currentView, setCurrentView] = useState('showcase');

  // Authentication & Demo Session States
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pragati_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('pragati_token') || '';
  });

  const [switchingRole, setSwitchingRole] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Data States
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  // Modal State
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  // Auto-seed demo student session on fresh boot if no session exists
  useEffect(() => {
    if (!currentUser || !authToken) {
      handleSwitchRole('student');
    }
  }, []);

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch live statistics
      const statsRes = await fetch(`${API_BASE_URL}/stats`);
      if (!statsRes.ok) throw new Error('Failed to load portal statistics.');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // 2. Fetch approved achievements ONLY (for the public gallery)
      const achRes = await fetch(`${API_BASE_URL}/achievements?status=approved`);
      if (!achRes.ok) throw new Error('Failed to load verified achievements.');
      const achData = await achRes.json();
      if (achData.success) {
        setAchievements(achData.achievements);
      }
    } catch (err) {
      console.error('Error fetching showcase data:', err);
      setError(
        'Unable to connect to the backend server. Please make sure the backend is running on http://localhost:5000'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending count for verifier badge
  const fetchPendingCount = async () => {
    if (!authToken || (currentUser?.role !== 'verifier' && currentUser?.role !== 'admin')) {
      setPendingCount(0);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/achievements/pending`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setPendingCount(data.count);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentView]);

  useEffect(() => {
    fetchPendingCount();
  }, [authToken, currentUser, currentView]);

  // Handle Judge Quick Demo Role Switching
  const handleSwitchRole = async (role) => {
    setSwitchingRole(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/demo-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('pragati_user', JSON.stringify(data.user));
        localStorage.setItem('pragati_token', data.token);

        // If user was on login page, send to showcase
        if (currentView === 'login') {
          setCurrentView('showcase');
        }
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setSwitchingRole(false);
    }
  };

  // Handle Manual Login Success
  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('pragati_user', JSON.stringify(user));
    localStorage.setItem('pragati_token', token);

    // Route dynamically based on role
    if (user.role === 'verifier') {
      setCurrentView('verifier');
    } else if (user.role === 'admin') {
      setCurrentView('analytics');
    } else {
      setCurrentView('showcase');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken('');
    localStorage.removeItem('pragati_user');
    localStorage.removeItem('pragati_token');
    setCurrentView('login');
  };

  // Compute available departments from loaded data
  const departments = useMemo(() => {
    const set = new Set();
    achievements.forEach((a) => {
      if (a.submitter_department) set.add(a.submitter_department);
    });
    return Array.from(set).sort();
  }, [achievements]);

  // Compute available years from loaded data
  const years = useMemo(() => {
    const set = new Set();
    achievements.forEach((a) => {
      if (a.event_date) {
        const yr = new Date(a.event_date).getFullYear();
        if (!isNaN(yr)) set.add(yr.toString());
      }
    });
    return Array.from(set).sort().reverse();
  }, [achievements]);

  // Filter logic
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      // Search matching
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesEvent = item.event_name?.toLowerCase().includes(query);
        const matchesName = item.submitter_name?.toLowerCase().includes(query);
        const matchesDept = item.submitter_department?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesEvent && !matchesName && !matchesDept && !matchesDesc) {
          return false;
        }
      }

      // Category matching
      if (selectedCategory !== 'All') {
        if (item.category !== selectedCategory) return false;
      }

      // Department matching
      if (selectedDepartment !== 'All') {
        if (item.submitter_department !== selectedDepartment) return false;
      }

      // Year matching
      if (selectedYear !== 'All') {
        const itemYear = new Date(item.event_date).getFullYear().toString();
        if (itemYear !== selectedYear) return false;
      }

      return true;
    });
  }, [achievements, searchTerm, selectedCategory, selectedDepartment, selectedYear]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedDepartment('All');
    setSelectedYear('All');
  };

  const scrollToGallery = () => {
    if (currentView !== 'showcase') {
      setCurrentView('showcase');
      setTimeout(() => {
        const el = document.getElementById('gallery');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('gallery');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If on Login Page
  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onExploreShowcase={() => setCurrentView('showcase')}
      />
    );
  }

  // Check RBAC Permissions for Protected Views
  const isVerifierOrAdmin = currentUser?.role === 'verifier' || currentUser?.role === 'admin';
  const isAdminOrVerifier = currentUser?.role === 'admin' || currentUser?.role === 'verifier';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-40 right-10 w-[500px] h-[400px] bg-gradient-to-tr from-emerald-600/10 to-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Judge Demo Mode Switcher Ribbon */}
      <JudgeDemoBanner
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        switching={switchingRole}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        pendingCount={pendingCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area with View Routing and Role Protection */}
      <main className="flex-grow">
        {/* VIEW 1: Submit Achievement Form */}
        {currentView === 'submit' && (
          <SubmitForm
            currentUser={currentUser}
            authToken={authToken}
            onBackToShowcase={() => {
              setCurrentView('showcase');
              fetchData();
            }}
            onViewSubmissions={() => setCurrentView('my-submissions')}
          />
        )}

        {/* VIEW 2: My Submissions Tracker */}
        {currentView === 'my-submissions' && (
          <MySubmissions
            currentUser={currentUser}
            authToken={authToken}
            onBackToShowcase={() => setCurrentView('showcase')}
            onNewSubmission={() => setCurrentView('submit')}
          />
        )}

        {/* VIEW 3: Faculty Verification Desk (Protected: Verifier or Admin) */}
        {currentView === 'verifier' && (
          isVerifierOrAdmin ? (
            <VerifierDesk
              currentUser={currentUser}
              authToken={authToken}
              onBackToShowcase={() => {
                setCurrentView('showcase');
                fetchData();
              }}
            />
          ) : (
            <AccessDenied
              currentUser={currentUser}
              requiredRoleLabel="Faculty Verifier"
              targetViewName="Faculty Verifier Desk"
              onBackToShowcase={() => setCurrentView('showcase')}
              onSwitchRole={handleSwitchRole}
            />
          )
        )}

        {/* VIEW 4: Analytics & Reports Dashboard (Protected: Admin or Verifier) */}
        {currentView === 'analytics' && (
          isAdminOrVerifier ? (
            <AnalyticsDashboard
              currentUser={currentUser}
              authToken={authToken}
              onBackToShowcase={() => {
                setCurrentView('showcase');
                fetchData();
              }}
            />
          ) : (
            <AccessDenied
              currentUser={currentUser}
              requiredRoleLabel="Institutional Admin"
              targetViewName="Achievement Analytics & Reports Dashboard"
              onBackToShowcase={() => setCurrentView('showcase')}
              onSwitchRole={handleSwitchRole}
            />
          )
        )}

        {/* VIEW 5: Public Showcase Gallery (Default) */}
        {currentView === 'showcase' && (
          <>
            {/* Hero Section */}
            <Hero onExploreClick={scrollToGallery} />

            {/* Live Statistics */}
            <Stats stats={stats} loading={loading} />

            {/* Showcase Gallery Section */}
            <section id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Verified Public Repository</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Institutional Achievement Gallery
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {isVerifierOrAdmin && (
                    <button
                      onClick={() => setCurrentView('verifier')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Verifier Review Desk</span>
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentView('submit')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Submit Achievement</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <SearchFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                departments={departments}
                years={years}
                totalResults={filteredAchievements.length}
                onReset={handleResetFilters}
              />

              {/* Error Banner */}
              {error && (
                <div className="rounded-2xl bg-rose-950/40 border border-rose-800/80 p-6 text-center max-w-xl mx-auto mb-10">
                  <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-white mb-1">Connection Notice</h3>
                  <p className="text-xs text-rose-200 mb-4">{error}</p>
                  <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Loading Skeleton */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4 animate-pulse"
                    >
                      <div className="flex justify-between">
                        <div className="h-5 w-20 bg-slate-800 rounded-full" />
                        <div className="h-5 w-16 bg-slate-800 rounded-full" />
                      </div>
                      <div className="h-6 w-3/4 bg-slate-800 rounded" />
                      <div className="h-4 w-full bg-slate-800 rounded" />
                      <div className="h-4 w-2/3 bg-slate-800 rounded" />
                      <div className="pt-4 border-t border-slate-800/60 flex justify-between">
                        <div className="h-4 w-28 bg-slate-800 rounded" />
                        <div className="h-4 w-16 bg-slate-800 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements Grid */}
              {!loading && !error && filteredAchievements.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      onClick={(ach) => setSelectedAchievement(ach)}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredAchievements.length === 0 && (
                <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl max-w-lg mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">No matching achievements found</h3>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    We couldn't find any verified achievements matching your active search or filters.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedAchievement && (
        <AchievementModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}

      {/* Judge Evaluation Tour Guide Modal */}
      <JudgeTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectRole={handleSwitchRole}
      />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
