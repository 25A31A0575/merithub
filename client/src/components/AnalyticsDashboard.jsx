import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  PieChart,
  Printer,
  RefreshCw,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Users,
  XCircle
} from 'lucide-react';

// Chart.js imports & registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const CATEGORIES = [
  'All',
  'Hackathon',
  'Research',
  'Sports',
  'Certification',
  'Innovation',
  'Coding',
  'Technical',
  'Non-Technical',
  'Cultural',
  'Entrepreneurship',
  'Leadership'
];

export default function AnalyticsDashboard({
  onBackToShowcase,
  currentUser = null,
  authToken = ''
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');

  // Print Mode State
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // Fetch analytics with current filter queries
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedYear !== 'All') params.append('year', selectedYear);
      if (selectedDepartment !== 'All') params.append('department', selectedDepartment);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedRole !== 'All') params.append('role', selectedRole);

      const url = `${API_BASE_URL}/analytics?${params.toString()}`;
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const res = await fetch(url, { headers });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch analytics data.');
      }
      setData(json);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Unable to load institutional analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear, selectedDepartment, selectedCategory, selectedRole, authToken]);

  // Extract unique departments from loaded records or standard list
  const departmentsList = useMemo(() => {
    const defaultDepts = [
      'Computer Science & Engineering',
      'Electronics & Communication',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Academic Affairs'
    ];
    if (!data?.records) return defaultDepts;
    const set = new Set(defaultDepts);
    data.records.forEach((r) => {
      if (r.submitter_department) set.add(r.submitter_department);
    });
    return Array.from(set).sort();
  }, [data]);

  // Extract available years
  const yearsList = useMemo(() => {
    const years = ['2026', '2025', '2024'];
    if (data?.byYear) {
      data.byYear.forEach((y) => {
        if (y.year && !years.includes(y.year)) years.push(y.year);
      });
    }
    return years.sort().reverse();
  }, [data]);

  const handleResetFilters = () => {
    setSelectedYear('All');
    setSelectedDepartment('All');
    setSelectedCategory('All');
    setSelectedRole('All');
  };

  const hasActiveFilters =
    selectedYear !== 'All' ||
    selectedDepartment !== 'All' ||
    selectedCategory !== 'All' ||
    selectedRole !== 'All';

  // Trigger CSV Export via authenticated blob download
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedYear !== 'All') params.append('year', selectedYear);
      if (selectedDepartment !== 'All') params.append('department', selectedDepartment);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedRole !== 'All') params.append('role', selectedRole);

      const downloadUrl = `${API_BASE_URL}/reports/export-csv?${params.toString()}`;
      const res = await fetch(downloadUrl, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      if (!res.ok) {
        throw new Error('Failed to export CSV. Permission denied or server error.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pragati_university_achievements_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('CSV Export Error: ' + err.message);
    }
  };

  // Trigger native print
  const handlePrint = () => {
    setIsPrintPreview(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // -------------------------------------------------------------
  // Chart.js Data Configurations
  // -------------------------------------------------------------

  // Common chart theme options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
          font: { size: 11, family: 'sans-serif' }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 10 } },
        grid: { color: 'rgba(51, 65, 85, 0.3)' }
      },
      y: {
        ticks: { color: '#94a3b8', stepSize: 1, font: { size: 10 } },
        grid: { color: 'rgba(51, 65, 85, 0.3)' }
      }
    }
  };

  // 1. Category Chart Data
  const categoryChartData = useMemo(() => {
    const labels = data?.byCategory?.map((c) => c.category) || [];
    const counts = data?.byCategory?.map((c) => c.count) || [];
    return {
      labels,
      datasets: [
        {
          label: 'Achievements',
          data: counts,
          backgroundColor: [
            'rgba(99, 102, 241, 0.85)',
            'rgba(168, 85, 247, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(6, 182, 212, 0.85)',
            'rgba(236, 72, 153, 0.85)'
          ],
          borderColor: '#1e293b',
          borderWidth: 1.5,
          borderRadius: 8
        }
      ]
    };
  }, [data]);

  // 2. Department Chart Data
  const departmentChartData = useMemo(() => {
    const labels =
      data?.byDepartment?.map((d) => {
        // Shorten long department names for mobile readability
        return d.department
          .replace('Computer Science & Engineering', 'CSE')
          .replace('Electronics & Communication', 'ECE')
          .replace('Mechanical Engineering', 'Mech')
          .replace('Electrical Engineering', 'EE')
          .replace('Academic Affairs', 'Academics');
      }) || [];
    const counts = data?.byDepartment?.map((d) => d.count) || [];
    return {
      labels,
      datasets: [
        {
          label: 'Department Records',
          data: counts,
          backgroundColor: 'rgba(59, 130, 246, 0.85)',
          borderRadius: 8,
          borderColor: '#1d4ed8',
          borderWidth: 1
        }
      ]
    };
  }, [data]);

  // 3. Status Distribution (Doughnut)
  const statusDoughnutData = useMemo(() => {
    const s = data?.byStatus || { approved: 0, pending: 0, rejected: 0 };
    return {
      labels: ['Approved / Live', 'Pending Review', 'Rejected'],
      datasets: [
        {
          data: [s.approved, s.pending, s.rejected],
          backgroundColor: [
            'rgba(16, 185, 129, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(244, 63, 94, 0.85)'
          ],
          borderColor: '#0f172a',
          borderWidth: 3,
          hoverOffset: 4
        }
      ]
    };
  }, [data]);

  // 4. Yearly Trend Chart
  const yearlyChartData = useMemo(() => {
    const labels = data?.byYear?.map((y) => `Year ${y.year}`) || [];
    const counts = data?.byYear?.map((y) => y.count) || [];
    return {
      labels,
      datasets: [
        {
          label: 'Total Milestone Records',
          data: counts,
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
          borderColor: 'rgba(192, 132, 252, 1)',
          borderWidth: 2,
          borderRadius: 8
        }
      ]
    };
  }, [data]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in print:bg-white print:text-black print:p-0">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <button
          onClick={onBackToShowcase}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Showcase
        </button>

        {/* Action Buttons: Export CSV & Print PDF */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export to CSV
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF Report
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl mb-8 print:bg-transparent print:border-none print:p-0 print:mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 print:hidden">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black">
                Institutional Achievement Analytics & Reports
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 print:text-slate-600">
              Pragati University • NAAC Criteria 3 & 5 Accreditation & NIRF Institutional Reporting Portal
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800 print:border-slate-300 print:bg-slate-100 print:text-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Dynamic Filters Bar */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 mb-8 shadow-xl print:hidden">
        <div className="flex items-center justify-between gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Filter Institutional Reports & Analytics:</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 normal-case font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Year Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Academic / Event Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="All">All Years</option>
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Student vs Faculty Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Achiever Type</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="All">All Achievers (Students & Faculty)</option>
              <option value="student">Students Only</option>
              <option value="faculty">Faculty & Researchers Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-xs text-rose-200 text-center mb-6">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. Summary Cards (6 Metrics from SQLite) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 print:grid-cols-3 print:gap-3">
        {/* Total */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl print:bg-slate-50 print:border-slate-300">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider mb-1">
            Total Records
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white print:text-black">
            {loading ? '-' : data?.summary?.total ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Repository records</span>
        </div>

        {/* Approved */}
        <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/20 p-4 shadow-xl print:bg-emerald-50 print:border-emerald-300">
          <span className="text-[11px] font-semibold text-emerald-400 block uppercase tracking-wider mb-1">
            Approved
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 print:text-emerald-700">
            {loading ? '-' : data?.summary?.approved ?? 0}
          </div>
          <span className="text-[10px] text-emerald-500 mt-1 block">Live on showcase</span>
        </div>

        {/* Pending */}
        <div className="rounded-2xl bg-slate-900/90 border border-amber-500/20 p-4 shadow-xl print:bg-amber-50 print:border-amber-300">
          <span className="text-[11px] font-semibold text-amber-400 block uppercase tracking-wider mb-1">
            Pending
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 print:text-amber-700">
            {loading ? '-' : data?.summary?.pending ?? 0}
          </div>
          <span className="text-[10px] text-amber-500 mt-1 block">In review queue</span>
        </div>

        {/* Rejected */}
        <div className="rounded-2xl bg-slate-900/90 border border-rose-500/20 p-4 shadow-xl print:bg-rose-50 print:border-rose-300">
          <span className="text-[11px] font-semibold text-rose-400 block uppercase tracking-wider mb-1">
            Rejected
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 print:text-rose-700">
            {loading ? '-' : data?.summary?.rejected ?? 0}
          </div>
          <span className="text-[10px] text-rose-500 mt-1 block">Feedback provided</span>
        </div>

        {/* Student Achievements */}
        <div className="rounded-2xl bg-slate-900/90 border border-purple-500/20 p-4 shadow-xl print:bg-purple-50 print:border-purple-300">
          <span className="text-[11px] font-semibold text-purple-400 block uppercase tracking-wider mb-1">
            Student Works
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 print:text-purple-700">
            {loading ? '-' : data?.summary?.studentAchievements ?? 0}
          </div>
          <span className="text-[10px] text-purple-500 mt-1 block">Hackathons & awards</span>
        </div>

        {/* Faculty Achievements */}
        <div className="rounded-2xl bg-slate-900/90 border border-blue-500/20 p-4 shadow-xl print:bg-blue-50 print:border-blue-300">
          <span className="text-[11px] font-semibold text-blue-400 block uppercase tracking-wider mb-1">
            Faculty Works
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-300 print:text-blue-700">
            {loading ? '-' : data?.summary?.facultyAchievements ?? 0}
          </div>
          <span className="text-[10px] text-blue-500 mt-1 block">Research & patents</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Visual Charts Section (4 Charts from Database) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 print:hidden">
        {/* Chart 1: Categories */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Achievements by Category
            </h3>
            <span className="text-[11px] text-slate-400">Total Categories: {data?.byCategory?.length || 0}</span>
          </div>
          <div className="h-64 w-full">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Departments */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              Department Distribution
            </h3>
            <span className="text-[11px] text-slate-400">Comparing Department Output</span>
          </div>
          <div className="h-64 w-full">
            <Bar data={departmentChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 3: Verification Status Doughnut */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Verification Status Ratio
            </h3>
            <span className="text-[11px] text-slate-400">Approved vs Pending vs Rejected</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <Doughnut
              data={statusDoughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#cbd5e1', font: { size: 11 } }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Chart 4: Academic Year Trajectory */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Yearly Milestone Trajectory
            </h3>
            <span className="text-[11px] text-slate-400">Records by Academic Year</span>
          </div>
          <div className="h-64 w-full">
            <Bar data={yearlyChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Detailed Institutional Report Records Table */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl print:bg-transparent print:border-none print:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white print:text-black">
              Institutional Records Table ({data?.records?.length || 0})
            </h3>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Official records meeting current filter criteria for NIRF & NAAC documentation
            </p>
          </div>

          <div className="text-xs font-medium text-slate-400 print:hidden">
            Showing <strong className="text-slate-200">{data?.records?.length || 0}</strong> achievements
          </div>
        </div>

        {/* The Records Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-slate-300">
          <table className="w-full text-left text-xs text-slate-300 print:text-black">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider print:bg-slate-100 print:text-slate-700 print:border-slate-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title & Category</th>
                <th className="px-4 py-3">Achiever & Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Event / Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
              {data?.records?.length > 0 ? (
                data.records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400 font-bold">#{r.id}</td>
                    <td className="px-4 py-3 font-semibold text-white print:text-black max-w-xs">
                      <div className="truncate">{r.title}</div>
                      <span className="text-[10px] text-blue-400 font-normal">{r.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-200 print:text-black">{r.submitter_name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{r.submitter_role}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 print:text-black">{r.submitter_department}</td>
                    <td className="px-4 py-3">
                      <div className="truncate max-w-[150px]">{r.event_name}</div>
                      <div className="text-[10px] text-slate-400">{r.event_date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          r.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 print:border-emerald-500 print:text-emerald-700'
                            : r.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 print:border-rose-500 print:text-rose-700'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30 print:border-amber-500 print:text-amber-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-400 print:text-slate-700">
                      {r.verifier_name || 'Pending Review'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    No achievements match the current filter selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
