import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import {
  CANONICAL_DOMAIN_MASTERY,
  calculatePercentagePointAdvantage,
  computeOverallDomainAdvantage,
  CANONICAL_STUDENT_METRICS,
} from '../../lib/metrics';
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Lightbulb,
  GraduationCap,
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const PerformanceAnalytics: React.FC = () => {
  const { currentStudentProfile } = useAuth();
  const { semesterResults } = useERP();

  const studentId = currentStudentProfile?.id || 'stu-1';
  const isLeadStudent = studentId === 'stu-1';

  // Navigation tab states
  const [activeTab, setActiveTab] = useState<'COURSES' | 'PROGRESSION' | 'DOMAINS'>('COURSES');
  const [selectedTerm, setSelectedTerm] = useState<'SEM4' | 'SEM5'>('SEM4');

  // GPA Progression vs Cohort Batch
  const gpaProgressionData = [
    {
      semester: 'Sem 1',
      studentGpa: isLeadStudent ? 9.1 : 6.8,
      courseAverage: 7.82,
      topDecile: 9.35,
    },
    {
      semester: 'Sem 2',
      studentGpa: isLeadStudent ? 9.25 : 7.1,
      courseAverage: 7.94,
      topDecile: 9.42,
    },
    {
      semester: 'Sem 3',
      studentGpa: isLeadStudent ? 9.38 : 7.05,
      courseAverage: 8.02,
      topDecile: 9.48,
    },
    {
      semester: 'Sem 4',
      studentGpa: isLeadStudent ? 9.5 : 7.2,
      courseAverage: 8.1,
      topDecile: 9.55,
    },
    {
      semester: 'Sem 5 (Current)',
      studentGpa: isLeadStudent ? 9.45 : 6.9,
      courseAverage: 7.98,
      topDecile: 9.5,
    },
  ];

  // Semester 4 Course-wise comparative benchmarks (N=64 peers in Section A)
  const sem4ComparativeData = [
    {
      code: 'CS401',
      name: 'Theory of Computation',
      credits: 4,
      studentScore: isLeadStudent ? 94 : 65,
      courseAverage: 74.5,
      highestScore: 96,
      studentGrade: isLeadStudent ? 'O' : 'B+',
      percentile: isLeadStudent ? 98 : 45,
      domain: 'Theory & Logic',
    },
    {
      code: 'CS402',
      name: 'Microprocessors & Microcontrollers',
      credits: 3,
      studentScore: isLeadStudent ? 86 : 68,
      courseAverage: 72.8,
      highestScore: 92,
      studentGrade: isLeadStudent ? 'A+' : 'B+',
      percentile: isLeadStudent ? 89 : 48,
      domain: 'Systems Programming',
    },
    {
      code: 'CS403',
      name: 'Software Engineering',
      credits: 3,
      studentScore: isLeadStudent ? 90 : 70,
      courseAverage: 76.2,
      highestScore: 94,
      studentGrade: isLeadStudent ? 'O' : 'A',
      percentile: isLeadStudent ? 94 : 52,
      domain: 'Software Engineering',
    },
    {
      code: 'CS404',
      name: 'Probability & Queueing Theory',
      credits: 4,
      studentScore: isLeadStudent ? 88 : 62,
      courseAverage: 71.0,
      highestScore: 93,
      studentGrade: isLeadStudent ? 'A+' : 'B',
      percentile: isLeadStudent ? 91 : 40,
      domain: 'Theory & Logic',
    },
  ];

  // Semester 5 Midterm Assessment comparison
  const sem5ComparativeData = [
    {
      code: 'CS501',
      name: 'Operating Systems',
      credits: 4,
      studentScore: isLeadStudent ? 92 : 55,
      courseAverage: 75.4,
      highestScore: 95,
      studentGrade: isLeadStudent ? 'O' : 'B',
      percentile: isLeadStudent ? 96 : 38,
      domain: 'Systems Programming',
    },
    {
      code: 'CS502',
      name: 'Database Management Systems',
      credits: 4,
      studentScore: isLeadStudent ? 88 : 48,
      courseAverage: 73.6,
      highestScore: 92,
      studentGrade: isLeadStudent ? 'A+' : 'C',
      percentile: isLeadStudent ? 92 : 28,
      domain: 'Data & Networking',
    },
    {
      code: 'CS503',
      name: 'Computer Networks',
      credits: 3,
      studentScore: isLeadStudent ? 84 : 46,
      courseAverage: 72.0,
      highestScore: 90,
      studentGrade: isLeadStudent ? 'A+' : 'C',
      percentile: isLeadStudent ? 88 : 25,
      domain: 'Data & Networking',
    },
    {
      code: 'CS504',
      name: 'Design & Analysis of Algorithms',
      credits: 4,
      studentScore: isLeadStudent ? 91 : 58,
      courseAverage: 70.8,
      highestScore: 94,
      studentGrade: isLeadStudent ? 'O' : 'B',
      percentile: isLeadStudent ? 95 : 42,
      domain: 'Theory & Logic',
    },
    {
      code: 'CS505',
      name: 'Operating Systems Laboratory',
      credits: 2,
      studentScore: isLeadStudent ? 96 : 60,
      courseAverage: 81.5,
      highestScore: 98,
      studentGrade: isLeadStudent ? 'O' : 'B+',
      percentile: isLeadStudent ? 97 : 46,
      domain: 'Software Engineering',
    },
  ];

  const activeCourseData = selectedTerm === 'SEM4' ? sem4ComparativeData : sem5ComparativeData;

  // Single-source derived domain advantage calculation from metrics.ts
  const overallAdvantage = computeOverallDomainAdvantage();

  // Active dataset calculations
  const avgStudentScore = Number(
    (activeCourseData.reduce((acc, curr) => acc + curr.studentScore, 0) / activeCourseData.length).toFixed(1)
  );
  const avgCourseBenchmark = Number(
    (activeCourseData.reduce((acc, curr) => acc + curr.courseAverage, 0) / activeCourseData.length).toFixed(1)
  );
  const activeAdvantage = calculatePercentagePointAdvantage(avgStudentScore, avgCourseBenchmark);

  const coursesAboveAvgCount = activeCourseData.filter(
    (c) => c.studentScore >= c.courseAverage
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header (Canonical Title & Single Heading) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Analytics</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Comparative performance analytics plotting student achievements against course averages and batch benchmarks.
          </p>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            Benchmark Source: Department of CSE · Cohort Size: N=64 students (Section A)
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs shrink-0">
          <button
            onClick={() => setActiveTab('COURSES')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'COURSES'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Course Benchmarks
          </button>
          <button
            onClick={() => setActiveTab('PROGRESSION')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'PROGRESSION'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GPA Progression
          </button>
          <button
            onClick={() => setActiveTab('DOMAINS')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'DOMAINS'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Competency Domains
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 font-medium block">Cohort Relative Standing</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {isLeadStudent ? 'Top 3.5%' : 'Top 58%'}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {isLeadStudent ? 'Percentile 96.5' : 'Percentile 42.0'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Ranked against N=64 cohort peers
          </span>
        </div>

        {/* Section 1.5 & 2.1: Advantage figures comparing two percentages must read '+19.9 pts' (percentage points) */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 font-medium block">Average Score Advantage</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                activeAdvantage.pointsDiffNumber >= 0 ? 'text-indigo-600' : 'text-rose-600'
              }`}
            >
              {activeAdvantage.pointsDiffString}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              vs {avgCourseBenchmark}% avg
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {activeAdvantage.relativeChangePercentString} vs cohort average
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 font-medium block">Courses Above Benchmark</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {coursesAboveAvgCount} / {activeCourseData.length}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 font-mono">
              {Math.round((coursesAboveAvgCount / activeCourseData.length) * 100)}% Clearance
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {coursesAboveAvgCount === activeCourseData.length
              ? 'Exceeds all course averages'
              : 'Targeted support in 1 course'}
          </span>
        </div>

        {/* Section 2.2: Single canonical metric name 'Cumulative CGPA' */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
          <span className="text-slate-500 font-medium block">Cumulative CGPA</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {isLeadStudent ? CANONICAL_STUDENT_METRICS.cumulativeCGPA.toFixed(2) : '7.05'}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 font-mono">
              Standing: First Class
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Scale: 10.0 UGC Framework
          </span>
        </div>
      </div>

      {/* TAB 1: COURSE BENCHMARKS */}
      {activeTab === 'COURSES' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Course-by-Course Benchmark Analysis
                </h3>
                <p className="text-xs text-slate-600">
                  Plotting student marks against course batch averages and top scores (Cohort size: N=64)
                </p>
              </div>

              {/* Term Selector */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
                <button
                  onClick={() => setSelectedTerm('SEM4')}
                  className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                    selectedTerm === 'SEM4'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semester 4 (Published)
                </button>
                <button
                  onClick={() => setSelectedTerm('SEM5')}
                  className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                    selectedTerm === 'SEM5'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semester 5 (Midterm)
                </button>
              </div>
            </div>

            {/* Recharts Grouped Comparative Visualization */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeCourseData}
                  margin={{ top: 20, right: 20, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="code"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    domain={[40, 100]}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                      padding: '10px 14px',
                    }}
                    formatter={(val: any, name?: any) => [
                      `${val} / 100`,
                      name === 'studentScore'
                        ? 'Your Score'
                        : name === 'courseAverage'
                        ? 'Course Average'
                        : 'Cohort Top Score',
                    ]}
                    labelFormatter={(label) => {
                      const item = activeCourseData.find((d) => d.code === label);
                      return `${label}: ${item?.name || ''}`;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(val) =>
                      val === 'studentScore'
                        ? 'Your Score'
                        : val === 'courseAverage'
                        ? 'Course Average (Batch)'
                        : 'Highest Recorded Score'
                    }
                  />
                  <Bar
                    dataKey="studentScore"
                    fill="#4f46e5"
                    name="studentScore"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="courseAverage"
                    fill="#94a3b8"
                    name="courseAverage"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="highestScore"
                    fill="#cbd5e1"
                    name="highestScore"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" />
                  <span>Your Score</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 inline-block" />
                  <span>Course Batch Average</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block" />
                  <span>Batch Top Score</span>
                </span>
              </div>
              <span className="font-mono text-slate-400">
                Scale: Percentage Marks (Pass Mark: 40)
              </span>
            </div>
          </div>

          {/* Granular Breakdown Table */}
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Detailed Course Score Differentials &amp; Percentiles
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-3 py-3">Credits</th>
                    <th className="px-3 py-3">Your Score</th>
                    <th className="px-3 py-3">Batch Mean</th>
                    <th className="px-3 py-3">Advantage (pts)</th>
                    <th className="px-3 py-3">Batch Top</th>
                    <th className="px-3 py-3">Cohort Percentile</th>
                    <th className="px-4 py-3 text-right">Domain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeCourseData.map((item) => {
                    const diff = calculatePercentagePointAdvantage(item.studentScore, item.courseAverage);
                    return (
                      <tr key={item.code} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-slate-900">{item.code}</span>
                          <span className="text-slate-600 block text-[11px]">{item.name}</span>
                        </td>
                        <td className="px-3 py-3 font-mono">{item.credits}</td>
                        <td className="px-3 py-3 font-bold font-mono text-slate-900">{item.studentScore}%</td>
                        <td className="px-3 py-3 font-mono text-slate-600">{item.courseAverage}%</td>
                        <td className="px-3 py-3 font-mono font-bold">
                          <span className={diff.pointsDiffNumber >= 0 ? 'text-indigo-600' : 'text-rose-600'}>
                            {diff.pointsDiffString}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-600">{item.highestScore}%</td>
                        <td className="px-3 py-3 font-mono font-medium text-slate-800">
                          Top {(100 - item.percentile).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 font-medium">
                          {item.domain}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROGRESSION */}
      {activeTab === 'PROGRESSION' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Semester GPA Trajectory vs. Batch Average &amp; Top Decile
              </h3>
              <p className="text-xs text-slate-600">
                Longitudinal progression across semesters against N=64 cohort average and 90th percentile top decile
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={gpaProgressionData}
                margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="semester"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={[6.0, 10.0]}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name?: any) => [
                    `${val}`,
                    name === 'studentGpa'
                      ? 'Your Semester GPA'
                      : name === 'courseAverage'
                      ? 'Batch Cohort Average'
                      : 'Top Decile Threshold',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(val) =>
                    val === 'studentGpa'
                      ? 'Your Semester GPA'
                      : val === 'courseAverage'
                      ? 'Batch Average GPA'
                      : 'Top Decile Threshold'
                  }
                />
                <Line
                  type="monotone"
                  dataKey="studentGpa"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4f46e5' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="courseAverage"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#94a3b8' }}
                />
                <Line
                  type="monotone"
                  dataKey="topDecile"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: COMPETENCY DOMAINS (Computed dynamically from lib/metrics.ts) */}
      {activeTab === 'DOMAINS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CANONICAL_DOMAIN_MASTERY.map((dom) => {
              const diff = calculatePercentagePointAdvantage(dom.studentScore, dom.cohortAverage);
              return (
                <div
                  key={dom.domain}
                  className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-900">{dom.domain}</h4>
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          diff.pointsDiffNumber >= 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {diff.pointsDiffString}
                      </span>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-slate-600">Your Mastery</span>
                          <span className="font-bold text-indigo-700 tabular-nums">{dom.studentScore}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${dom.studentScore}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-slate-600">Cohort Benchmark Average</span>
                          <span className="font-semibold text-slate-600 tabular-nums">{dom.cohortAverage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-slate-400 h-full rounded-full"
                            style={{ width: `${dom.cohortAverage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Highest Cohort Score: <strong>{dom.highestScore}%</strong></span>
                    <span className="text-emerald-700 font-semibold">{diff.relativeChangePercentString}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actionable Strategic Insights */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs text-xs space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Actionable Academic Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>Teaching Assistantship Readiness:</strong> Exceeds course benchmark by {overallAdvantage.advantageString} in Theory &amp; Logic. Recommended for CS401 tutoring roles.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>Elective Recommendation:</strong> Strong systems profile indicates high readiness for Distributed Systems (CS601) in Semester 6.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
