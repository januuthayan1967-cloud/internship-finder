import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Calendar,
  Clock3,
  Target,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  AlarmClock,
} from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

// A modern, data-rich internship dashboard inspired by the reference UI
// Uses TailwindCSS already configured in the project
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);
function StudentInternships() {
  const [isRunning, setIsRunning] = useState(true);
  const [secondsWorked, setSecondsWorked] = useState(155); // 2:35 default like mock
  const [profile, setProfile] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch profile + interviews from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, interviewsRes] = await Promise.all([
          axios.get('/api/students/profile'),
          axios.get('/api/students/interviews'),
        ]);

        setProfile(profileRes.data);

        // Filter expired scheduled interviews similar to dashboard
        const now = new Date();
        const nowTime = now.toTimeString().split(' ')[0];
        const valid = interviewsRes.data.filter((iv) => {
          if (iv.status !== 'scheduled') return true;
          const ivDate = new Date(iv.scheduledDate);
          const isExpired =
            ivDate < now ||
            (ivDate.toDateString() === now.toDateString() && iv.scheduledTime < nowTime);
          return !isExpired || iv.joined;
        });
        setInterviews(valid);
      } catch (err) {
        console.error('Failed to fetch internships data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived UI values
  const upcoming = useMemo(
    () => interviews.filter((i) => i.status === 'scheduled'),
    [interviews]
  );
  const completed = useMemo(
    () => interviews.filter((i) => i.status === 'completed'),
    [interviews]
  );
  const cancelled = useMemo(
    () => interviews.filter((i) => i.status === 'cancelled'),
    [interviews]
  );

  const headlineStats = useMemo(
    () => [
      { label: 'Employe', value: interviews.length, icon: Users },
      { label: 'Hirings', value: completed.length, icon: Briefcase },
      { label: 'Projects', value: upcoming.length, icon: Target },
    ],
    [interviews.length, completed.length, upcoming.length]
  );

  const progress = 61; // 6.1h visual (placeholder)
  const projectTime = 60; // 60%
  const output = 10; // 10%

  const weekBars = [35, 52, 45, 40, 38, 80, 20]; // Sun..Sat

  const tasks = useMemo(() => {
    const list = upcoming
      .slice(0, 5)
      .map((iv, idx) => ({
        id: iv._id || idx,
        title: `${iv.companyName} • Round ${iv.round}`,
        time: `${new Date(iv.scheduledDate).toLocaleDateString()} ${iv.scheduledTime}`,
        done: iv.joined || iv.status === 'completed',
        interview: iv,
      }));
    // If not enough tasks, pad visually
    while (list.length < 5) {
      list.push({
        id: `p${list.length}`,
        title: 'No task',
        time: '—',
        done: false,
      });
    }
    return list;
  }, [upcoming]);

  // Chart data
  const pieData = useMemo(() => ({
    labels: ['Scheduled', 'Completed', 'Cancelled'],
    datasets: [
      {
        label: 'Interviews',
        data: [upcoming.length, completed.length, cancelled.length],
        backgroundColor: ['#60a5fa', '#34d399', '#f87171'],
        borderColor: ['#3b82f6', '#10b981', '#ef4444'],
        borderWidth: 1
      }
    ]
  }), [upcoming.length, completed.length, cancelled.length]);

  const cvViews = profile?.cvViews ?? Math.max(0, Math.round((completed.length + upcoming.length) * 3));
  const barData = useMemo(() => ({
    labels: ['CV Views', 'Scheduled', 'Completed'],
    datasets: [
      {
        label: 'Count',
        data: [cvViews, upcoming.length, completed.length],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981']
      }
    ]
  }), [cvViews, upcoming.length, completed.length]);

  // Simple time tracker
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSecondsWorked((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = String(Math.floor(secondsWorked / 60)).padStart(2, '0');
  const seconds = String(secondsWorked % 60).padStart(2, '0');

  const ringProgress = (secondsWorked % 3600) / 36; // 0..100 for conic ring

  const StatPill = ({ label, percent, color }) => (
    <div className="flex items-center space-x-3">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-gray-700 bg-white/70 px-2 py-0.5 rounded-md border">{percent}%</span>
    </div>
  );

  // Onboarding progress derived from profile completion fields
  const onboardingPercent = useMemo(() => {
    if (!profile) return 0;
    const items = [
      profile.experienceLevel !== undefined,
      Array.isArray(profile.programmingLanguages) && profile.programmingLanguages.length > 0,
      Array.isArray(profile.preferredDomains) && profile.preferredDomains.length > 0,
      Boolean(profile.cvPath),
      Boolean(profile.profilePicturePath),
    ];
    return Math.round((items.filter(Boolean).length / items.length) * 100);
  }, [profile]);

  const handleJoin = async (interview) => {
    try {
      await axios.put(`/api/students/interview/${interview._id}/join`);
    } catch (e) {
      // non-blocking
    } finally {
      navigate(`/student/zehoNew/${interview._id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6 lg:px-8 grid place-items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pt-24 pb-10 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Top welcome and mini progress */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left hero card */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 flex items-center space-x-4">
            {profile?.profilePicturePath ? (
              <img
                src={`/uploads${profile.profilePicturePath.startsWith('/') ? profile.profilePicturePath : `/${profile.profilePicturePath}`}`}
                alt="avatar"
                className="w-24 h-24 rounded-xl object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white grid place-items-center text-3xl font-bold">
                {profile?.name?.charAt(0) || 'S'}
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs text-gray-500">Welcome in,</p>
              <h2 className="text-2xl font-bold tracking-tight">{profile?.name || 'Student'}</h2>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-100 dark:bg-gray-700/60 rounded-lg py-2">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Interviews</p>
                  <p className="text-xs font-semibold">15%</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded-lg py-2">
                  <p className="text-[10px] text-gray-700 dark:text-yellow-300">Hired</p>
                  <p className="text-xs font-semibold">{completed.length}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700/60 rounded-lg py-2">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Output</p>
                  <p className="text-xs font-semibold">{output}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress + stats strip */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <p className="text-sm font-medium">Project time</p>
                <StatPill label="Work" percent={projectTime} color="bg-yellow-400" />
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock3 className="w-4 h-4" />
                  <span>6.1h this week</span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">Progress</p>
                <StatPill label="Completed" percent={progress} color="bg-gray-900" />
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Target className="w-4 h-4" />
                  <span>Goal: 8h/week</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-end">
                {headlineStats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-bold">{value}</p>
                    <div className="flex items-center justify-center space-x-1 text-[11px] text-gray-500">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle widgets */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Progress card with bars */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">Progress</p>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-bold">6.1h</p>
            <p className="text-xs text-gray-500 -mt-1">Work Time this week</p>
            <div className="mt-5 grid grid-cols-7 gap-2 items-end h-28">
              {weekBars.map((h, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-3 rounded-full ${idx === 5 ? 'bg-yellow-400' : 'bg-gray-900/80'}`}
                    style={{ height: `${Math.max(10, h)}%` }}
                  />
                  <span className="mt-2 text-[10px] text-gray-500">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][idx]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Time tracker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">Time tracker</p>
              <AlarmClock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-center py-4">
              <div
                className="relative w-40 h-40 rounded-full grid place-items-center"
                style={{
                  background:
                    `conic-gradient(#facc15 ${ringProgress}%, #e5e7eb ${ringProgress}%)`,
                }}
              >
                <div className="absolute inset-2 bg-white rounded-full grid place-items-center">
                  <div className="text-center">
                    <p className="text-3xl font-semibold">{minutes}:{seconds}</p>
                    <p className="text-xs text-gray-500">Work Time</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setIsRunning(true)}
                className="px-3 py-2 rounded-full bg-gray-900 text-white text-xs flex items-center space-x-1"
              >
                <Play className="w-3.5 h-3.5" /> <span>Play</span>
              </button>
              <button
                onClick={() => setIsRunning(false)}
                className="px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-xs flex items-center space-x-1 border"
              >
                <Pause className="w-3.5 h-3.5" /> <span>Pause</span>
              </button>
            </div>
          </motion.div>

          {/* Onboarding meter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">Onboarding</p>
              <span className="text-sm font-medium">{onboardingPercent}%</span>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <div className="flex-1 h-3 bg-yellow-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${onboardingPercent}%` }} />
              </div>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-[25%] bg-gray-500" />
              </div>
              <div className="w-10 h-3 bg-gray-200 rounded-full" />
            </div>
            <div className="mt-6 border rounded-2xl p-4 bg-gray-50">
              <p className="text-sm font-medium">Task</p>
              <p className="text-xs text-gray-500">Continue your onboarding checklist</p>
            </div>
          </motion.div>

          {/* Onboarding task list */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-100 rounded-2xl shadow-sm border border-yellow-200 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">Onboarding Task</p>
              <span className="text-sm font-semibold">2/8</span>
            </div>
            <div className="mt-4 space-y-3">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => task.interview && handleJoin(task.interview)}
                  className="w-full text-left flex items-center justify-between bg-white rounded-xl border p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Circle className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-[11px] text-gray-500">{task.time}</p>
                    </div>
                  </div>
                  {task.done ? (
                    <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Clock3 className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Student details and analytics */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5"
          >
            <p className="font-semibold mb-3">Your Details</p>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div><span className="text-gray-500 dark:text-gray-400">Name:</span> {profile?.name || '-'}</div>
              <div><span className="text-gray-500 dark:text-gray-400">Email:</span> {profile?.email || '-'}</div>
              <div><span className="text-gray-500 dark:text-gray-400">University:</span> {profile?.university || '-'}</div>
              <div><span className="text-gray-500 dark:text-gray-400">Experience Level:</span> {profile?.experienceLevel ?? '-'}</div>
              <div><span className="text-gray-500 dark:text-gray-400">Preferred Domains:</span> {(profile?.preferredDomains || []).join(', ') || '-'}</div>
              <div><span className="text-gray-500 dark:text-gray-400">Programming Languages:</span> {(profile?.programmingLanguages || []).join(', ') || '-'}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5"
          >
            <p className="font-semibold mb-3">Interview Distribution</p>
            <div className="h-64">
              <Pie data={pieData} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5"
          >
            <p className="font-semibold mb-3">Engagement</p>
            <div className="h-64">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false }, title: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Upcoming Interviews list */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold">Upcoming Interviews</p>
              <span className="text-xs text-gray-500">{upcoming.length} scheduled</span>
            </div>
            {upcoming.length ? (
              <div className="space-y-3">
                {upcoming.map((iv) => (
                  <div key={iv._id} className="flex items-center justify-between border rounded-xl p-3 bg-gray-50">
                    <div>
                      <p className="font-medium">{iv.companyName}</p>
                      <p className="text-[11px] text-gray-600">Round {iv.round} • {new Date(iv.scheduledDate).toLocaleDateString()} at {iv.scheduledTime}</p>
                    </div>
                    <button
                      onClick={() => handleJoin(iv)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white hover:bg-black"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 py-8">No interviews scheduled.</div>
            )}
          </motion.div>

          {/* Simple calendar strip (mock) */}
          <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5">
            <div className="flex items-center justify-between">
              <button className="text-xs px-3 py-1 rounded-md border bg-gray-50">August</button>
              <p className="text-sm font-semibold">September 2024</p>
              <button className="text-xs px-3 py-1 rounded-md border bg-gray-50">October</button>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-4 text-xs text-gray-600">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="text-center font-medium">
                  {d}
                </div>
              ))}
            </div>
            <div className="mt-2 h-32 rounded-xl bg-gray-50 border grid place-items-center text-gray-500 text-sm">
              Weekly Team Sync • Discuss progress on projects
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentInternships;


