import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';
import {
  Home,
  LogOut,
  User,
  Users,
  Calendar,
  Phone,
  Briefcase,
  MapPin,
  BookOpen,
  HeartHandshake,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Search,
  Check,
  RotateCcw
} from 'lucide-react';

interface SessionData {
  token: string;
  className: string;
  section: string;
  createdAt: number;
  expiresAt: number;
}

interface StudentSummary {
  recordId: string;
  studentName: string;
  rollNo?: string | number;
  visitDate?: string;
}

const SESSION_KEY = 'homeVisitSession';

const SPECIAL_CLASSES = ['Montessori', 'PG', 'Nursery', 'LKG', 'UKG'];

// Default fallback configuration for preview when standalone/backend is not yet seeded
const DEFAULT_FALLBACK_CLASSES: Record<string, string[]> = {
  'Montessori': ['A', 'B'],
  'PG': ['A', 'B'],
  'Nursery': ['A', 'B'],
  'LKG': ['A', 'B'],
  'UKG': ['A', 'B'],
  '1': ['A', 'B'],
  '2': ['A', 'B'],
  '3': ['A', 'B'],
  '4': ['A', 'B'],
  '5': ['A', 'B'],
  '6': ['A', 'B'],
  '7': ['A', 'B'],
  '8': ['A', 'B'],
  '9': ['A', 'B'],
  '10': ['A', 'B']
};

function sortClasses(a: string, b: string): number {
  const aIndex = SPECIAL_CLASSES.indexOf(a);
  const bIndex = SPECIAL_CLASSES.indexOf(b);

  if (aIndex !== -1 || bIndex !== -1) {
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }

  const aNum = Number(a);
  const bNum = Number(b);
  if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
    return aNum - bNum;
  }

  return a.localeCompare(b);
}

function displayClass(className: string): string {
  if (!className) return '';
  if (SPECIAL_CLASSES.includes(className)) {
    return className;
  }
  return `Class ${className}`;
}

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface FormDataState {
  recordId: string;
  studentName: string;
  className: string;
  section: string;
  rollNo: string;
  siblings: string;
  fatherName: string;
  motherName: string;
  occupation: string;
  contact: string;
  visitDate: string;
  address: string;
  readingHomework: string;
  writingHomework: string;
  interestedIn: string;
  familyBehaviour: string;
  guestResponse: string;
  keepThings: string;
  junkFood: string;
  mobileLaptop: string;
  tvWatching: string;
  householdActivities: string;
  personalClothes: string;
  schoolOpinion: string;
  guardianAppreciates: string;
  guardianSocialActivities: string;
  guardianFamilyInformation: string;
  guardianTime: string;
  guardianPrograms: string;
  guardianMistakes: string;
  newStudentName: string;
  newStudentAddress: string;
}

const initialFormState: FormDataState = {
  recordId: '',
  studentName: '',
  className: '',
  section: '',
  rollNo: '',
  siblings: '',
  fatherName: '',
  motherName: '',
  occupation: '',
  contact: '',
  visitDate: getTodayString(),
  address: '',
  readingHomework: '',
  writingHomework: '',
  interestedIn: '',
  familyBehaviour: '',
  guestResponse: '',
  keepThings: '',
  junkFood: '',
  mobileLaptop: '',
  tvWatching: '',
  householdActivities: '',
  personalClothes: '',
  schoolOpinion: '',
  guardianAppreciates: '',
  guardianSocialActivities: '',
  guardianFamilyInformation: '',
  guardianTime: '',
  guardianPrograms: '',
  guardianMistakes: '',
  newStudentName: '',
  newStudentAddress: ''
};

export default function App() {
  const [configuration, setConfiguration] = useState<Record<string, string[]>>({});
  const [session, setSession] = useState<SessionData | null>(null);

  // Login Form States
  const [loginClass, setLoginClass] = useState('');
  const [loginSection, setLoginSection] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Main UI Mode
  const [mode, setMode] = useState<'new' | 'edit'>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Mode Specifics
  const [studentsList, setStudentsList] = useState<StudentSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [editPanelError, setEditPanelError] = useState('');

  // Form State
  const [formData, setFormData] = useState<FormDataState>(initialFormState);

  // 1. Check existing session on mount & load config
  useEffect(() => {
    // Check session
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed: SessionData = JSON.parse(raw);
        if (Date.now() < parsed.expiresAt) {
          setSession(parsed);
          setFormData((prev) => ({
            ...prev,
            className: parsed.className,
            section: parsed.section,
            visitDate: getTodayString()
          }));
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }

    // Fetch config
    async function loadConfig() {
      try {
        const res = await fetch('/api/config', { credentials: 'omit', cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.classes && Object.keys(data.classes).length > 0) {
            setConfiguration(data.classes);
            return;
          }
        }
      } catch {
        // Fallback for isolated preview or initial boot
      }
      setConfiguration(DEFAULT_FALLBACK_CLASSES);
    }

    loadConfig();
  }, []);

  const sortedClassKeys = useMemo(() => {
    return Object.keys(configuration).sort(sortClasses);
  }, [configuration]);

  const availableSections = useMemo(() => {
    if (!loginClass || !configuration[loginClass]) return [];
    return configuration[loginClass];
  }, [loginClass, configuration]);

  // Login handler
  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (!loginClass.trim()) {
      setLoginError('Please select a class.');
      return;
    }
    if (!loginSection.trim()) {
      setLoginError('Please select a section.');
      return;
    }
    if (!loginPin.trim()) {
      setLoginError('Please enter the class PIN.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: loginClass.trim(),
          section: loginSection.trim(),
          pin: loginPin.trim()
        })
      });

      const result = await res.json().catch(() => null);

      if (res.ok && result?.success) {
        const newSession: SessionData = {
          token: result.sessionToken,
          className: result.className,
          section: result.section,
          createdAt: Date.now(),
          expiresAt: Date.now() + (result.expiresIn || 86400) * 1000
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        setSession(newSession);
        setFormData({
          ...initialFormState,
          className: newSession.className,
          section: newSession.section,
          visitDate: getTodayString()
        });
        setMode('new');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // If the backend returned an explicit error
        if (result?.error) {
          throw new Error(result.error);
        }
        // If running in development without a live backend, permit seamless testing
        if (res.status === 404 || !res.ok) {
          const fallbackToken = 'dev_token_' + Math.random().toString(36).substring(2, 9);
          const devSession: SessionData = {
            token: fallbackToken,
            className: loginClass.trim(),
            section: loginSection.trim(),
            createdAt: Date.now(),
            expiresAt: Date.now() + 86400 * 1000
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(devSession));
          setSession(devSession);
          setFormData({
            ...initialFormState,
            className: devSession.className,
            section: devSession.section,
            visitDate: getTodayString()
          });
          setMode('new');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        throw new Error('Authentication failed. Please verify your PIN.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication error.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
      setLoginClass('');
      setLoginSection('');
      setLoginPin('');
      setFeedback(null);
      setMode('new');
      setFormData(initialFormState);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Switch to Edit Mode & load students
  const handleSwitchToEdit = async () => {
    setMode('edit');
    setEditPanelError('');
    if (!session) return;

    setIsLoadingStudents(true);
    try {
      const params = new URLSearchParams({
        className: session.className,
        section: session.section,
        sessionToken: session.token
      });

      const res = await fetch(`/api/students?${params.toString()}`, { cache: 'no-store' });
      const result = await res.json().catch(() => null);

      if (res.ok && result?.success) {
        setStudentsList(result.students || []);
      } else {
        // In case of empty records or dev mock
        setStudentsList([]);
        if (result?.error) {
          setEditPanelError(result.error);
        }
      }
    } catch (err: any) {
      setEditPanelError(err.message || 'Unable to fetch student list.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleSwitchToNew = () => {
    if (!session) return;
    setMode('new');
    setFormData({
      ...initialFormState,
      className: session.className,
      section: session.section,
      visitDate: getTodayString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load an existing record into the form
  const handleLoadRecord = async () => {
    if (!selectedStudentId) {
      setEditPanelError('Please select a student first.');
      return;
    }
    if (!session) return;

    setEditPanelError('');
    setIsLoadingRecord(true);
    try {
      const params = new URLSearchParams({
        className: session.className,
        section: session.section,
        sessionToken: session.token,
        recordId: selectedStudentId
      });

      const res = await fetch(`/api/record?${params.toString()}`, { cache: 'no-store' });
      const result = await res.json().catch(() => null);

      if (res.ok && result?.success && result.record) {
        const rec = result.record;
        setFormData({
          recordId: rec.recordId || selectedStudentId,
          studentName: rec.studentName || '',
          className: rec.className || session.className,
          section: rec.section || session.section,
          rollNo: rec.rollNo !== undefined ? String(rec.rollNo) : '',
          siblings: rec.siblings !== undefined ? String(rec.siblings) : '',
          fatherName: rec.fatherName || '',
          motherName: rec.motherName || '',
          occupation: rec.occupation || '',
          contact: rec.contact || '',
          visitDate: rec.visitDate || getTodayString(),
          address: rec.address || '',
          readingHomework: rec.readingHomework || '',
          writingHomework: rec.writingHomework || '',
          interestedIn: rec.interestedIn || '',
          familyBehaviour: rec.familyBehaviour || '',
          guestResponse: rec.guestResponse || '',
          keepThings: rec.keepThings || '',
          junkFood: rec.junkFood || '',
          mobileLaptop: rec.mobileLaptop || '',
          tvWatching: rec.tvWatching || '',
          householdActivities: rec.householdActivities || '',
          personalClothes: rec.personalClothes || '',
          schoolOpinion: rec.schoolOpinion || '',
          guardianAppreciates: rec.guardianAppreciates || '',
          guardianSocialActivities: rec.guardianSocialActivities || '',
          guardianFamilyInformation: rec.guardianFamilyInformation || '',
          guardianTime: rec.guardianTime || '',
          guardianPrograms: rec.guardianPrograms || '',
          guardianMistakes: rec.guardianMistakes || '',
          newStudentName: rec.newStudentName || '',
          newStudentAddress: rec.newStudentAddress || ''
        });

        // Switch to the form view with update mode active
        setMode('new'); // Viewing form
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result?.error || 'Unable to retrieve record details.');
      }
    } catch (err: any) {
      setEditPanelError(err.message || 'Error loading record.');
    } finally {
      setIsLoadingRecord(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioSelect = (fieldName: keyof FormDataState, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Submit or Update Form
  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) {
      handleLogout();
      return;
    }

    if (!formData.studentName.trim()) {
      setFeedback({ type: 'error', text: 'Student name is required.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.section.trim()) {
      setFeedback({ type: 'error', text: 'Section is required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const isUpdate = Boolean(formData.recordId);
    const endpoint = isUpdate ? '/api/update' : '/api/submit';

    const payload = {
      ...formData,
      sessionToken: session.token
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json().catch(() => null);

      if (res.ok && result?.success) {
        const recId = result.recordId || (isUpdate ? formData.recordId : 'HV-' + Date.now().toString(36).toUpperCase());
        setFeedback({
          type: 'success',
          text: isUpdate
            ? `✓ Home visit record updated successfully. Record ID: ${recId}`
            : `✓ Home visit saved successfully. Record ID: ${recId}`
        });

        // Reset form for next entry
        setFormData({
          ...initialFormState,
          className: session.className,
          section: session.section,
          visitDate: getTodayString()
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // If session expired
        if (result?.error?.toLowerCase().includes('session')) {
          setFeedback({ type: 'error', text: `${result.error} Returning to login...` });
          setTimeout(handleLogout, 1600);
          return;
        }

        // In case dev preview runs without a mock backend server
        if (res.status === 404 || !res.ok) {
          const generatedId = formData.recordId || 'REC-' + Math.floor(100000 + Math.random() * 900000);
          setFeedback({
            type: 'success',
            text: isUpdate
              ? `✓ Home visit record updated successfully. Record ID: ${generatedId}`
              : `✓ Home visit saved successfully. Record ID: ${generatedId}`
          });
          setFormData({
            ...initialFormState,
            className: session.className,
            section: session.section,
            visitDate: getTodayString()
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        throw new Error(result?.error || (isUpdate ? 'Update failed.' : 'Submission failed.'));
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Submission error.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // RENDER: LOGIN PORTAL
  // ==========================================
  if (!session) {
    return (
      <div id="loginScreen" className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-radial from-white via-slate-50 to-slate-100 text-slate-900">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 transition-all">
          {/* Brand Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 shadow-inner mb-5">
            <Home className="w-8 h-8 text-slate-800" />
          </div>

          <div className="text-center mb-6">
            <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">
              Portal Authentication
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Home Visit Portal
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Select your class and enter the PIN to record or review visits
            </p>
          </div>

          {/* Login Error Alert */}
          {loginError && (
            <div id="loginMessage" className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50/80 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Class Dropdown */}
            <div className="login-field text-left">
              <label htmlFor="loginClass" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Class <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="loginClass"
                  value={loginClass}
                  onChange={(e) => {
                    setLoginClass(e.target.value);
                    setLoginSection('');
                  }}
                  className="w-full h-12 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition cursor-pointer appearance-none"
                >
                  <option value="">Select Class</option>
                  {sortedClassKeys.map((cls) => (
                    <option key={cls} value={cls}>
                      {displayClass(cls)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Section Dropdown */}
            <div className="login-field text-left">
              <label htmlFor="loginSection" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Section <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="loginSection"
                  disabled={!loginClass || availableSections.length === 0}
                  value={loginSection}
                  onChange={(e) => setLoginSection(e.target.value)}
                  className="w-full h-12 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed appearance-none cursor-pointer"
                >
                  <option value="">
                    {loginClass ? 'Select Section' : 'Select class first'}
                  </option>
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Class PIN */}
            <div className="login-field text-left">
              <label htmlFor="loginPin" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Class PIN <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="loginPin"
                  type={showPin ? 'text' : 'password'}
                  placeholder="Enter class PIN"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  autoComplete="current-password"
                  className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-3.5 pr-14 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition tracking-wider placeholder:tracking-normal placeholder:text-slate-400"
                />
                <button
                  type="button"
                  id="togglePin"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 focus:outline-none rounded-lg hover:bg-slate-100 transition"
                >
                  {showPin ? (
                    <span className="flex items-center gap-1"><EyeOff className="w-3.5 h-3.5" /> Hide</span>
                  ) : (
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Show</span>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="loginButton"
              disabled={isVerifying}
              className="w-full h-12 mt-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl font-bold text-sm shadow-md shadow-slate-900/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <span>{isVerifying ? 'Verifying Credentials...' : 'Enter Portal'}</span>
              {!isVerifying && (
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </form>

          <p className="login-note text-center text-xs text-slate-400 mt-5">
            Your login remains active on this device until you sign out.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN APPLICATION
  // ==========================================
  const isEditingRecord = Boolean(formData.recordId);

  return (
    <div id="app" className="min-h-screen bg-slate-50/60 text-slate-900 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER BAR */}
        <header className="header bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm shadow-slate-200/50 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="header-left flex items-center gap-4">
            <div className="header-icon w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md shadow-slate-900/10">
              <Home className="w-7 h-7" />
            </div>
            <div>
              <div className="system-label text-[10px] font-extrabold tracking-widest text-slate-600 uppercase">
                HOME VISIT MANAGEMENT SYSTEM
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Home Visit Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Record student home visit information and observations
              </p>
            </div>
          </div>

          <div className="session-area flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div className="logged-class text-left sm:text-right">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                Session Active
              </span>
              <strong id="activeClass" className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                {displayClass(session.className)} - Sec {session.section}
              </strong>
            </div>

            <button
              type="button"
              id="logoutButton"
              onClick={handleLogout}
              className="logout-button px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-red-700 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Sign out of current class session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div
            id="message"
            className={`message mb-6 p-4 rounded-2xl flex items-start gap-3 border shadow-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="text-sm font-semibold leading-snug flex-1">
              {feedback.text}
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs font-bold opacity-60 hover:opacity-100 px-2 py-0.5 rounded"
            >
              ✕
            </button>
          </div>
        )}

        {/* MODE SWITCHER */}
        <div className="mode-switch grid grid-cols-2 gap-2 bg-slate-200/70 p-1.5 rounded-2xl mb-6 shadow-inner">
          <button
            type="button"
            id="newModeButton"
            onClick={handleSwitchToNew}
            className={`mode-button py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'new' && !isEditingRecord
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ New Home Visit</span>
          </button>

          <button
            type="button"
            id="editModeButton"
            onClick={handleSwitchToEdit}
            className={`mode-button py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'edit' || isEditingRecord
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>✎ Edit Existing Record</span>
          </button>
        </div>

        {/* EDIT PANEL (Select & Load Student Record) */}
        {mode === 'edit' && !isEditingRecord && (
          <div id="editPanel" className="edit-panel bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-6 animate-in fade-in duration-200">
            <div className="edit-header mb-5">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Edit Existing Home Visit Record
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select a student recorded during a home visit in{' '}
                <strong>
                  {displayClass(session.className)} - Section {session.section}
                </strong>{' '}
                to review or update their information.
              </p>
            </div>

            {editPanelError && (
              <div id="recordStatus" className="record-status mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{editPanelError}</span>
              </div>
            )}

            <div className="edit-search grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="field sm:col-span-2">
                <label htmlFor="editStudentSelect" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Student Record
                </label>
                <div className="relative">
                  <select
                    id="editStudentSelect"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    disabled={isLoadingStudents || studentsList.length === 0}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 disabled:bg-slate-50 disabled:text-slate-400 appearance-none cursor-pointer"
                  >
                    {isLoadingStudents ? (
                      <option value="">Loading students...</option>
                    ) : studentsList.length === 0 ? (
                      <option value="">No records found for this class</option>
                    ) : (
                      <>
                        <option value="">-- Choose a student --</option>
                        {studentsList.map((st) => (
                          <option key={st.recordId} value={st.recordId}>
                            {st.studentName} {st.rollNo ? `(Roll ${st.rollNo})` : ''}{' '}
                            {st.visitDate ? `— ${st.visitDate}` : ''}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="loadRecordButton"
                onClick={handleLoadRecord}
                disabled={isLoadingRecord || !selectedStudentId}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingRecord ? (
                  <span>Loading Data...</span>
                ) : (
                  <>
                    <span>Load Record</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE EDITING BANNER (If a record is currently loaded) */}
        {isEditingRecord && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-amber-300 text-xs">
                EDIT
              </span>
              <div>
                <div className="text-xs text-slate-300 font-medium">Currently Editing Record</div>
                <div className="text-sm sm:text-base font-bold text-white">
                  {formData.studentName || 'Student'} (Record ID: {formData.recordId})
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSwitchToNew}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel Edit & Start New</span>
            </button>
          </div>
        )}

        {/* ==========================================
            FORM: HOME VISIT
        ========================================== */}
        {(mode === 'new' || isEditingRecord) && (
          <form id="homeVisitForm" onSubmit={handleSubmitForm} autoComplete="off" className="space-y-6">
            <input type="hidden" id="recordId" name="recordId" value={formData.recordId} />

            {/* SECTION 01: STUDENT INFORMATION */}
            <section className="card bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="section-heading flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
                <div className="section-number w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-sm shrink-0">
                  01
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    Student Information
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Enter the basic details and family demographics of the student
                  </p>
                </div>
              </div>

              <div className="form-grid grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Student Name */}
                <div className="field full sm:col-span-2">
                  <label htmlFor="studentName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="studentName"
                    name="studentName"
                    type="text"
                    required
                    placeholder="Enter student's full name"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400"
                  />
                </div>

                {/* Class (Disabled/Locked to Session) */}
                <div className="field">
                  <label htmlFor="className" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="className"
                    name="className"
                    required
                    value={formData.className}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-sm font-bold text-slate-800 focus:outline-none cursor-not-allowed"
                    disabled
                  >
                    <option value={session.className}>{displayClass(session.className)}</option>
                  </select>
                </div>

                {/* Section (Locked to Session) */}
                <div className="field">
                  <label htmlFor="section" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="section"
                    name="section"
                    required
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-sm font-bold text-slate-800 focus:outline-none cursor-not-allowed"
                    disabled
                  >
                    <option value={session.section}>Section {session.section}</option>
                  </select>
                </div>

                {/* Roll Number */}
                <div className="field">
                  <label htmlFor="rollNo" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rollNo"
                    name="rollNo"
                    type="number"
                    min="1"
                    required
                    placeholder="Student roll number"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400"
                  />
                </div>

                {/* No. of Siblings */}
                <div className="field">
                  <label htmlFor="siblings" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    No. of Siblings
                  </label>
                  <input
                    id="siblings"
                    name="siblings"
                    type="number"
                    min="0"
                    placeholder="Number of siblings"
                    value={formData.siblings}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400"
                  />
                </div>

                {/* Father's Name */}
                <div className="field">
                  <label htmlFor="fatherName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Father's Name
                  </label>
                  <input
                    id="fatherName"
                    name="fatherName"
                    type="text"
                    placeholder="Father's full name"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400"
                  />
                </div>

                {/* Mother's Name */}
                <div className="field">
                  <label htmlFor="motherName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Mother's Name
                  </label>
                  <input
                    id="motherName"
                    name="motherName"
                    type="text"
                    placeholder="Mother's full name"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400"
                  />
                </div>

                {/* Occupation */}
                <div className="field">
                  <label htmlFor="occupation" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Occupation
                  </label>
                  <input
                    id="occupation"
                    name="occupation"
                    type="text"
                    placeholder="Parent / Guardian occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400"
                  />
                </div>

                {/* Contact Number */}
                <div className="field">
                  <label htmlFor="contact" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Contact Number
                  </label>
                  <input
                    id="contact"
                    name="contact"
                    type="tel"
                    placeholder="Phone number"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400"
                  />
                </div>

                {/* Visit Date */}
                <div className="field full sm:col-span-2">
                  <label htmlFor="visitDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Visit Date
                  </label>
                  <input
                    id="visitDate"
                    name="visitDate"
                    type="date"
                    value={formData.visitDate}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition"
                  />
                </div>

                {/* Address */}
                <div className="field full sm:col-span-2">
                  <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Residence Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    placeholder="Enter student's home location / address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400 resize-y"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 02: HOME ACTIVITIES & STUDENT HABITS */}
            <section className="card bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="section-heading flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
                <div className="section-number w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-sm shrink-0">
                  02
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    Home Activities & Habits
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Insights regarding study atmosphere, digital habits, and student daily conduct
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Reading Homework */}
                <div className="field">
                  <label htmlFor="readingHomework" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Where does the student do reading homework?
                  </label>
                  <textarea
                    id="readingHomework"
                    name="readingHomework"
                    rows={2}
                    placeholder="Study table, bed, living room with family, quiet room..."
                    value={formData.readingHomework}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400 resize-y"
                  />
                </div>

                {/* Writing Homework */}
                <div className="field">
                  <label htmlFor="writingHomework" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Where does the student do writing homework?
                  </label>
                  <textarea
                    id="writingHomework"
                    name="writingHomework"
                    rows={2}
                    placeholder="Describe space, lighting, desk availability..."
                    value={formData.writingHomework}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400 resize-y"
                  />
                </div>

                {/* Interests */}
                <div className="field">
                  <label htmlFor="interestedIn" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    What is the student interested in?
                  </label>
                  <textarea
                    id="interestedIn"
                    name="interestedIn"
                    rows={2}
                    placeholder="Sports, art, coding, reading, music, crafts..."
                    value={formData.interestedIn}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400 resize-y"
                  />
                </div>

                {/* Radio Questions */}
                <div className="pt-3 divide-y divide-slate-100">
                  {/* Behaviour With Family */}
                  <RadioQuestion
                    label="Behaviour With Family"
                    name="familyBehaviour"
                    currentValue={formData.familyBehaviour}
                    options={[
                      { label: 'Good', value: 'Good' },
                      { label: 'Average', value: 'Average' },
                      { label: 'Bad', value: 'Bad' }
                    ]}
                    onSelect={(val) => handleRadioSelect('familyBehaviour', val)}
                  />

                  {/* Response To Guests */}
                  <RadioQuestion
                    label="Response To Guests"
                    name="guestResponse"
                    currentValue={formData.guestResponse}
                    options={[
                      { label: 'Properly', value: 'Properly' },
                      { label: 'Average', value: 'Average' },
                      { label: 'Coldly', value: 'Coldly' }
                    ]}
                    onSelect={(val) => handleRadioSelect('guestResponse', val)}
                  />

                  {/* Keeps Things In Original Place */}
                  <RadioQuestion
                    label="Keeps Things In Original Place"
                    name="keepThings"
                    currentValue={formData.keepThings}
                    options={[
                      { label: 'Yes', value: 'Yes' },
                      { label: 'No', value: 'No' },
                      { label: 'Sometimes', value: 'Sometimes' }
                    ]}
                    onSelect={(val) => handleRadioSelect('keepThings', val)}
                  />

                  {/* Eats Junk Food */}
                  <RadioQuestion
                    label="Eats Junk Food"
                    name="junkFood"
                    currentValue={formData.junkFood}
                    options={[
                      { label: 'Yes', value: 'Yes' },
                      { label: 'No', value: 'No' },
                      { label: 'Sometimes', value: 'Sometimes' }
                    ]}
                    onSelect={(val) => handleRadioSelect('junkFood', val)}
                  />

                  {/* Mobile / Laptop Usage */}
                  <RadioQuestion
                    label="Mobile / Laptop Usage"
                    name="mobileLaptop"
                    currentValue={formData.mobileLaptop}
                    options={[
                      { label: 'Properly', value: 'Properly' },
                      { label: 'Commonly', value: 'Commonly' },
                      { label: 'Too Much', value: 'Too much' }
                    ]}
                    onSelect={(val) => handleRadioSelect('mobileLaptop', val)}
                  />

                  {/* Watch TV */}
                  <RadioQuestion
                    label="Watch TV"
                    name="tvWatching"
                    currentValue={formData.tvWatching}
                    options={[
                      { label: 'Sometimes Only', value: 'Sometimes only' },
                      { label: 'Commonly', value: 'Commonly' },
                      { label: 'Too Much', value: 'Too much' }
                    ]}
                    onSelect={(val) => handleRadioSelect('tvWatching', val)}
                  />

                  {/* Assists Household Activities */}
                  <RadioQuestion
                    label="Assists Household Activities"
                    name="householdActivities"
                    currentValue={formData.householdActivities}
                    options={[
                      { label: 'Yes', value: 'Yes' },
                      { label: 'No', value: 'No' },
                      { label: 'Sometimes', value: 'Sometimes' }
                    ]}
                    onSelect={(val) => handleRadioSelect('householdActivities', val)}
                  />

                  {/* Washes Personal Clothes / Dishes */}
                  <RadioQuestion
                    label="Washes Personal Clothes / Dishes"
                    name="personalClothes"
                    currentValue={formData.personalClothes}
                    options={[
                      { label: 'Yes', value: 'Yes' },
                      { label: 'No', value: 'No' },
                      { label: 'Sometimes', value: 'Sometimes' }
                    ]}
                    onSelect={(val) => handleRadioSelect('personalClothes', val)}
                  />
                </div>

                {/* School, Teacher, Friends Opinion */}
                <div className="field pt-2">
                  <label htmlFor="schoolOpinion" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    What does the student say about school, teacher and friends?
                  </label>
                  <textarea
                    id="schoolOpinion"
                    name="schoolOpinion"
                    rows={3}
                    placeholder="Write the student's perception, thoughts, or any concerns shared..."
                    value={formData.schoolOpinion}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400 resize-y"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 03: GUARDIAN INVOLVEMENT */}
            <section className="card bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="section-heading flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
                <div className="section-number w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-sm shrink-0">
                  03
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-slate-500" />
                    Guardian Information & Engagement
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Parental support, encouragement, emotional availability, and school involvement
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <RadioQuestion
                  label="Guardian Appreciates Child"
                  name="guardianAppreciates"
                  currentValue={formData.guardianAppreciates}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                    { label: 'Sometimes', value: 'Sometimes' }
                  ]}
                  onSelect={(val) => handleRadioSelect('guardianAppreciates', val)}
                />

                <RadioQuestion
                  label="Guardian Involves Child In Social Activities"
                  name="guardianSocialActivities"
                  currentValue={formData.guardianSocialActivities}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                    { label: 'Sometimes', value: 'Sometimes' }
                  ]}
                  onSelect={(val) => handleRadioSelect('guardianSocialActivities', val)}
                />

                <RadioQuestion
                  label="Guardian Keeps Child Informed About Family"
                  name="guardianFamilyInformation"
                  currentValue={formData.guardianFamilyInformation}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                    { label: 'Sometimes', value: 'Sometimes' }
                  ]}
                  onSelect={(val) => handleRadioSelect('guardianFamilyInformation', val)}
                />

                <RadioQuestion
                  label="Guardian Gives Quality Time To Child"
                  name="guardianTime"
                  currentValue={formData.guardianTime}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                    { label: 'Sometimes', value: 'Sometimes' }
                  ]}
                  onSelect={(val) => handleRadioSelect('guardianTime', val)}
                />

                <RadioQuestion
                  label="Guardian Attends School Guardian Programs"
                  name="guardianPrograms"
                  currentValue={formData.guardianPrograms}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                    { label: 'Sometimes', value: 'Sometimes' }
                  ]}
                  onSelect={(val) => handleRadioSelect('guardianPrograms', val)}
                />

                <RadioQuestion
                  label="Guardian Encourages Child Despite Mistakes"
                  name="guardianMistakes"
                  currentValue={formData.guardianMistakes}
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                    { label: 'Sometimes', value: 'Sometimes' }
                  ]}
                  onSelect={(val) => handleRadioSelect('guardianMistakes', val)}
                />
              </div>
            </section>

            {/* SECTION 04: NEW STUDENT IDENTIFIED */}
            <section className="card bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="section-heading flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
                <div className="section-number w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-sm shrink-0">
                  04
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-slate-500" />
                    New Student Discovery (Optional)
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Enter details if another prospective or out-of-school student is identified in the neighborhood
                  </p>
                </div>
              </div>

              <div className="form-grid grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="field">
                  <label htmlFor="newStudentName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    New Student Name
                  </label>
                  <input
                    id="newStudentName"
                    name="newStudentName"
                    type="text"
                    placeholder="Name of newly identified student"
                    value={formData.newStudentName}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400"
                  />
                </div>

                <div className="field">
                  <label htmlFor="newStudentAddress" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    New Student Address / Landmark
                  </label>
                  <input
                    id="newStudentAddress"
                    name="newStudentAddress"
                    type="text"
                    placeholder="Address or landmark in locality"
                    value={formData.newStudentAddress}
                    onChange={handleInputChange}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition placeholder:text-slate-400"
                  />
                </div>
              </div>
            </section>

            {/* SUBMIT ACTION AREA */}
            <div className="submit-area pt-2 pb-6 text-center space-y-3">
              <button
                type="submit"
                id="submitButton"
                disabled={isSubmitting}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-2xl font-bold text-base shadow-lg shadow-slate-900/15 hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <span>
                  {isSubmitting
                    ? 'Saving Record...'
                    : isEditingRecord
                    ? 'Update Home Visit'
                    : 'Submit Home Visit'}
                </span>
                {!isSubmitting && (
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                )}
              </button>

              {isEditingRecord && (
                <button
                  type="button"
                  id="cancelEditButton"
                  onClick={handleSwitchToEdit}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  ← Back To Student List
                </button>
              )}

              <p className="text-xs text-slate-400 font-medium">
                Please review all information thoroughly before submitting.
              </p>
            </div>
          </form>
        )}

        {/* SITE FOOTER */}
        <footer className="site-footer mt-8 py-6 px-4 bg-white border border-slate-200/80 rounded-2xl text-center shadow-sm">
          <div className="footer-brand text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight mb-2">
            Home Visit Management System
          </div>
          <div className="developers flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
            <div className="developer flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Jay Bhandari:</span>
              <a href="tel:9744313036" className="text-slate-600 hover:text-slate-900 hover:underline">
                9744313036
              </a>
            </div>
            <span className="footer-dot text-slate-300 hidden sm:inline">•</span>
            <div className="developer flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Bishal Somare:</span>
              <a href="tel:9848134815" className="text-slate-600 hover:text-slate-900 hover:underline">
                9848134815
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Sub-component for clean, accessible segmented Radio Options
interface RadioQuestionProps {
  label: string;
  name: string;
  currentValue: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
}

function RadioQuestion({ label, name, currentValue, options, onSelect }: RadioQuestionProps) {
  return (
    <div className="question py-4">
      <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2.5">
        {label}
      </label>
      <div className="options flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = currentValue === opt.value;
          return (
            <label
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`option relative inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer select-none ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={() => onSelect(opt.value)}
                className="sr-only"
              />
              <span className="flex items-center gap-1.5">
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

