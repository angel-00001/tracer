import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, UserCircle2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAttendance } from './hooks/useAttendance';
import { useCourses } from './hooks/useCourses';
import { TodayView } from './components/TodayView';
import { CalendarView } from './components/CalendarView';
import { TimetableView } from './components/TimetableView';
import { Stats } from './components/Stats';
import { Login } from './components/Login';
import { Landing } from './components/Landing';
import { Profile } from './components/Profile';
import { Onboarding } from './components/Onboarding';
import { useSettings } from './hooks/useSettings';
import { isWeekend } from './utils/calculations';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [showLogin, setShowLogin] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Listen to Supabase auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // Clean up any token hash left in the URL after auth redirect
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowProfile(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const isTodayWeekend = isWeekend(today);

  // Loading state while checking auth
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto mb-4" />
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    if (!showLogin) {
      return <Landing onGetStarted={() => setShowLogin(true)} />;
    }
    return <Login onLoginSuccess={() => setShowLogin(false)} />;
  }

  return (
    <AppShell
      session={session}
      showCalendar={showCalendar}
      setShowCalendar={setShowCalendar}
      showTimetable={showTimetable}
      setShowTimetable={setShowTimetable}
      showProfile={showProfile}
      setShowProfile={setShowProfile}
      handleLogout={handleLogout}
      isTodayWeekend={isTodayWeekend}
    />
  );
}

// Extracted so hooks (which need session) are only mounted when logged in
function AppShell({
  session,
  showCalendar, setShowCalendar,
  showTimetable, setShowTimetable,
  showProfile, setShowProfile,
  handleLogout,
  isTodayWeekend
}) {
  const { attendance, loading, error, syncing, markAttendance } = useAttendance();
  const { data: courses = [], isLoading: coursesLoading, refetch: refetchCourses } = useCourses();
  const { data: settings } = useSettings();

  // Respect user's weekend-classes setting
  const allowWeekends = settings?.allow_weekend_classes ?? false;
  const effectivelyWeekend = !allowWeekends && isWeekend(new Date().toISOString().split('T')[0]);

  if (loading || coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto mb-4" />
          <div className="text-sm text-gray-600">Loading your data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-red-200 p-6 max-w-md">
          <div className="text-red-600 font-semibold mb-2">Connection Error</div>
          <div className="text-sm text-gray-700 mb-4">{error}</div>
          <div className="text-xs text-gray-500">Check your Supabase credentials in .env.local</div>
        </div>
      </div>
    );
  }

  // No courses set up yet — show onboarding
  if (courses.length === 0 && !coursesLoading) {
    return <Onboarding onDone={refetchCourses} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isTodayWeekend ? "It's the weekend! Enjoy your time off." : 'Mark your attendance for today'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowTimetable(!showTimetable); if (!showTimetable) setShowCalendar(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showTimetable
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Clock size={18} />
              Timetable
            </button>
            <button
              onClick={() => { setShowCalendar(!showCalendar); if (!showCalendar) setShowTimetable(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showCalendar
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <CalendarIcon size={18} />
              {showCalendar ? 'Today View' : 'Calendar'}
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Profile & Settings"
            >
              <UserCircle2 size={18} />
              Profile
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {!showTimetable && <Stats courses={courses} attendance={attendance} />}

          {showTimetable ? (
            <TimetableView onClose={() => setShowTimetable(false)} courses={courses} />
          ) : effectivelyWeekend && !showCalendar ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <CalendarIcon className="mx-auto text-gray-400 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Weekend Break</h3>
              <p className="text-sm text-gray-500 mb-4">
                No classes today. Use the calendar to view or edit past attendance.
              </p>
              <button
                onClick={() => setShowCalendar(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <CalendarIcon size={18} />
                Open Calendar
              </button>
            </div>
          ) : (
            <>
              {showCalendar ? (
                <CalendarView
                  courses={courses}
                  attendance={attendance}
                  onMarkAttendance={markAttendance}
                  syncing={syncing}
                />
              ) : (
                <TodayView
                  courses={courses}
                  attendance={attendance}
                  onMarkAttendance={markAttendance}
                  syncing={syncing}
                />
              )}
            </>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          {showTimetable
            ? 'View your weekly class schedule'
            : showCalendar
              ? 'Weekends are automatically hidden • Click any cell to toggle'
              : 'Click to mark: Present → Absent → Clear'}
        </div>
      </div>

      {showProfile && (
        <Profile
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
          user={session.user}
        />
      )}
    </div>
  );
}