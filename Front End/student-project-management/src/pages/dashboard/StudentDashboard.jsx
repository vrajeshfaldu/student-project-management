import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Award,
  Clock,
  FileText,
  Bell,
  Calendar
} from 'lucide-react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageTitle } from '../../layouts/PageTitle';
import { formatDate, storage, API_BASE_URL, getAuthHeaders, getUserAllocations, extractApiArray, fetchProjectMastersApi, normalizeProject } from '../../helpers';

const StudentQuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs font-sans">
      <h3 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="sm"
          icon={CheckSquare}
          className="w-full justify-start text-xs font-semibold py-2.5 cursor-pointer"
          onClick={() => navigate('/tasks')}
        >
          View My Tasks
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={FileText}
          className="w-full justify-start text-xs font-semibold py-2.5 cursor-pointer"
          onClick={() => navigate('/projects')}
        >
          View My Projects
        </Button>
      </div>
    </div>
  );
};

const StudentProgressCard = ({
  title,
  subtitle,
  percentage = 0,
  completedTasks = 0,
  totalTasks = 0,
  grade
}) => {
  const getBarColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-blue-500';
    if (pct >= 25) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs hover:border-blue-200 transition font-sans">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{title}</h4>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {grade && (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            Grade: {grade}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className="text-gray-600">Completion Progress</span>
          <span className="text-gray-900">{percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(percentage)} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-[11px] text-gray-400">
          <span>{completedTasks} of {totalTasks} Tasks Completed</span>
          <span>{totalTasks - completedTasks} Remaining</span>
        </div>
      </div>
    </div>
  );
};

const StudentAnnouncementCard = ({ announcements = [] }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs font-sans">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
        <Bell className="w-4 h-4" />
      </div>
      <h3 className="text-base font-bold text-gray-900">Student Notices & Deadlines</h3>
    </div>
    <div className="space-y-3">
      {announcements.length > 0 ? (
        announcements.map((ann) => (
          <div key={ann.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-xs font-bold text-gray-900 truncate">{ann.title}</h4>
              <Badge variant="primary" size="sm">
                {ann.category}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{ann.content}</p>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{ann.date}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-xs text-gray-400">No active student notices posted.</p>
      )}
    </div>
  </div>
);

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const activeUser = storage.getAuthUser() || {};
  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [tasks, setTasks] = useState(() => storage.getTasks());
  const [users, setUsers] = useState(() => storage.getUsers());
  const [taskStatuses, setTaskStatuses] = useState(() => storage.getTaskStatuses());

  useEffect(() => {
    const headers = getAuthHeaders();
    Promise.all([
      fetch(`${API_BASE_URL}/ProjectAllocation/GetAllProjectAllocations`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetchProjectMastersApi(),
      fetch(`${API_BASE_URL}/Task/GetAllTasks`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_BASE_URL}/User/GetAllUsers`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_BASE_URL}/TaskStatus/GetAllTaskStatuses`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
    ]).then(([paRes, pmRes, tRes, uRes, tsRes]) => {
      const paList = extractApiArray(paRes);
      if (paList.length) { setProjectAllocations(paList); storage.setProjectAllocations(paList); }

      if (pmRes && pmRes.ok && pmRes.arr.length) {
        const pList = pmRes.arr.map(normalizeProject).filter(Boolean);
        setProjectMasters(pList);
        storage.setProjectMasters(pList);
      }

      const tList = extractApiArray(tRes);
      if (tList.length) { setTasks(tList); storage.setTasks(tList); }

      const uList = extractApiArray(uRes);
      if (uList.length) { setUsers(uList); storage.setUsers(uList); }

      const tsList = extractApiArray(tsRes);
      if (tsList.length) { setTaskStatuses(tsList); storage.setTaskStatuses(tsList); }
    });
  }, []);

  const currentUserId = Number(activeUser?.UserID || activeUser?.userID || 0);
  const myAllocations = getUserAllocations(activeUser, 'Student', projectAllocations);

  const myAllocIds = myAllocations.map((a) => Number(a.ProjectAllocationID || a.projectAllocationID));
  const myProjIds = myAllocations.map((a) => Number(a.ProjectID || a.projectID));

  const safeTasks = extractApiArray(tasks);
  const myTasks = safeTasks.filter((t) => {
    const allocId = Number(t.ProjectAllocationID || t.projectAllocationID || 0);
    const projId = Number(t.ProjectID || t.projectID || 0);
    const stuId = Number(t.StudentID || t.studentID || 0);
    return myAllocIds.includes(allocId) || myProjIds.includes(projId) || (currentUserId && stuId === currentUserId);
  });

  const completedTasks = myTasks.filter((t) => Number(t.TaskStatusID || t.taskStatusID) === 3).length;
  const inProgressTasks = myTasks.filter((t) => Number(t.TaskStatusID || t.taskStatusID) === 2).length;

  const totalAssignedScore = myTasks.reduce((sum, t) => sum + Number(t.AssignedScore || t.assignedScore || 0), 0);
  const totalEarnedScore = myTasks.reduce((sum, t) => sum + Number(t.EarnedScore || t.earnedScore || 0), 0);

  const overallProgressPct = myAllocations.length > 0
    ? Math.round(myAllocations.reduce((sum, a) => sum + Number(a.ProgressPercentage ?? a.progressPercentage ?? 0), 0) / myAllocations.length)
    : 0;

  const STATUS_COLOR_MAP = {
    completed: '#10b981',
    ongoing: '#3b82f6',
    'in progress': '#3b82f6',
    pending: '#f59e0b',
    cancelled: '#ef4444',
    'on hold': '#ec4899',
    review: '#8b5cf6',
    'under review': '#8b5cf6'
  };

  const DISTINCT_PIE_COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#f97316',
    '#14b8a6'
  ];

  // Chart 2: Task Score Trend Line
  const taskScoreTrend = myTasks.map((t, idx) => ({
    name: `Task ${idx + 1}`,
    value: Number(t.EarnedScore || t.earnedScore || 0)
  }));

  // Chart 3: Task Status Distribution (Pie)
  const taskStatusPie = (taskStatuses || []).map((st, idx) => {
    const stId = Number(st.TaskStatusID || st.taskStatusID);
    const count = myTasks.filter((t) => Number(t.TaskStatusID || t.taskStatusID) === stId).length;
    const name = st.TaskStatusName || st.taskStatusName || `Status ${idx + 1}`;
    const normName = name.toLowerCase().trim();

    let color = STATUS_COLOR_MAP[normName];
    if (!color) {
      if (normName.includes('complete')) color = '#10b981';
      else if (normName.includes('ongoing') || normName.includes('progress')) color = '#3b82f6';
      else if (normName.includes('pending')) color = '#f59e0b';
      else if (normName.includes('cancel')) color = '#ef4444';
      else if (normName.includes('hold')) color = '#ec4899';
      else color = DISTINCT_PIE_COLORS[idx % DISTINCT_PIE_COLORS.length];
    }

    return {
      name,
      value: count,
      color
    };
  });

  const weeklyProgressLine = [];

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800">
      <PageTitle
        title="Student Deliverables Portal"
        subtitle={`Welcome back, ${activeUser?.FullName || 'Student Candidate'}. Deliverables and sprint evaluation breakdown.`}
        showDate={true}
      />

      <StudentQuickActions />



      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StudentProgressCard
          title="Overall Progress"
          percentage={overallProgressPct}
          totalTasks={myTasks.length}
          completedTasks={completedTasks}
        />

        <StatCard
          title="Completed Deliverables"
          value={completedTasks}
          icon={CheckSquare}
          color="emerald"
          badgeText="Verified Sprints"
        />

        <StatCard
          title="Tasks In Progress"
          value={inProgressTasks}
          icon={Clock}
          color="blue"
          badgeText="Ongoing Sprints"
        />

        <StatCard
          title="Score Weightage"
          value={`${totalEarnedScore} / ${totalAssignedScore || 100}`}
          icon={Award}
          color="amber"
          badgeText="Earned Marks"
        />
      </div>

      {/* 4 Dashboard Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        {/* Chart 1: Donut Gauge for Project Completion */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Overall Project Completion Gauge</h3>
          <p className="text-xs text-gray-500 mb-4">Completed percentage vs remaining project scope</p>
          <div style={{ width: '100%', height: 260 }} className="relative">
            <ResponsiveContainer width="100%" height="100%">
              {(() => {
                const completedPct = Math.max(0, Math.min(100, Number(overallProgressPct || 0)));
                const gaugeList = [
                  { name: 'Completed', value: completedPct, color: '#10b981' },
                  { name: 'Remaining Scope', value: 100 - completedPct, color: '#e2e8f0' }
                ];
                const validGaugeData = gaugeList.filter((d) => d.value > 0);
                const displayGaugeData = validGaugeData.length > 0 ? validGaugeData : [{ name: 'Pending', value: 100, color: '#e2e8f0' }];
                return (
                  <RePieChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <Pie
                      data={displayGaugeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={85}
                      paddingAngle={validGaugeData.length > 1 ? 3 : 0}
                      dataKey="value"
                      nameKey="name"
                    >
                      {displayGaugeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          cornerRadius={validGaugeData.length > 1 ? 4 : 0}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  </RePieChart>
                );
              })()}
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <span className="text-base font-extrabold text-gray-800">{Number(overallProgressPct || 0)}%</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Task Score Trend Line Chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Earned Score Weightage Trend</h3>
          <p className="text-xs text-gray-500 mb-4">Evaluation score marks scored per deliverable task</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={taskScoreTrend.length ? taskScoreTrend : [{ name: 'T1', value: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" dataKey="value" name="Earned Score" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 7 }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        {/* Chart 3: Deliverable Status Breakdown (Pie Chart) */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Personal Tasks Status Breakdown</h3>
          <p className="text-xs text-gray-500 mb-4">Ratio of Completed vs Ongoing and Pending tasks</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              {(() => {
                const activeStudentTaskStatusPie = taskStatusPie.filter((s) => s.value > 0);
                const chartData = activeStudentTaskStatusPie.length > 0 ? activeStudentTaskStatusPie : [{ name: 'No Tasks', value: 1, color: '#cbd5e1' }];
                return (
                  <RePieChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={activeStudentTaskStatusPie.length > 1 ? 3 : 0}
                      dataKey="value"
                      nameKey="name"
                      label={({ percent }) => (percent && !isNaN(percent) && percent > 0.05 && activeStudentTaskStatusPie.length > 0 ? `${(percent * 100).toFixed(0)}%` : '')}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || DISTINCT_PIE_COLORS[index % DISTINCT_PIE_COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [activeStudentTaskStatusPie.length > 0 ? `${value} Tasks` : 'No Data', name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  </RePieChart>
                );
              })()}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Weekly Progress Line Chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Weekly Learning Curve</h3>
          <p className="text-xs text-gray-500 mb-4">Weekly progress growth trajectory</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={weeklyProgressLine} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" dataKey="value" name="Weekly %" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 7 }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <StudentAnnouncementCard announcements={[]} />
    </div>
  );
};
