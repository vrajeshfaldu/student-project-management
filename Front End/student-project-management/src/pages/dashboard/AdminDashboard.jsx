import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  CheckSquare,
  GraduationCap,
  Plus,
  UserPlus,
  FileText,
  Shield,
  Bell,
  Calendar,
  Clock
} from 'lucide-react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart as ReLineChart,
  Line,
  AreaChart as ReAreaChart,
  Area
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageTitle } from '../../layouts/PageTitle';
import { storage, API_BASE_URL, getAuthHeaders, fetchProjectMastersApi, normalizeProject, extractApiArray } from '../../helpers';

const AdminQuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs font-sans">
      <h3 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button
          variant="outline"
          size="sm"
          icon={UserPlus}
          className="w-full justify-start text-xs font-semibold py-2.5 cursor-pointer"
          onClick={() => navigate('/users/create')}
        >
          Add New User
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={Plus}
          className="w-full justify-start text-xs font-semibold py-2.5 cursor-pointer"
          onClick={() => navigate('/projects/create')}
        >
          Create Project
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={Shield}
          className="w-full justify-start text-xs font-semibold py-2.5 cursor-pointer"
          onClick={() => navigate('/role-user/create')}
        >
          Assign User Role
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={FileText}
          className="w-full justify-start text-xs font-semibold py-2.5 cursor-pointer"
          onClick={() => navigate('/reports')}
        >
          View System Reports
        </Button>
      </div>
    </div>
  );
};

const AdminActivityCard = ({ activities = [] }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs font-sans">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-bold text-gray-900">Recent System Activity</h3>
      <span className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">View All</span>
    </div>
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.map((act) => (
          <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition">
            <Avatar src={act.avatar} name={act.user} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-800">
                <span className="font-bold text-gray-900">{act.user}</span> {act.action}{' '}
                <span className="font-semibold text-blue-600">"{act.target}"</span>
              </p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{act.time}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-xs text-gray-400">No recent system activity recorded.</p>
      )}
    </div>
  </div>
);

const AdminAnnouncementCard = ({ announcements = [] }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs font-sans">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
        <Bell className="w-4 h-4" />
      </div>
      <h3 className="text-base font-bold text-gray-900">Department Announcements</h3>
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
        <p className="text-xs text-gray-400">No departmental announcements at this time.</p>
      )}
    </div>
  </div>
);

export const AdminDashboard = () => {
  const activeUser = storage.getAuthUser() || {};
  const [users, setUsers] = useState(() => storage.getUsers());
  const [userTypes, setUserTypes] = useState(() => storage.getUserTypes());
  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [tasks, setTasks] = useState(() => storage.getTasks());
  const [taskStatuses, setTaskStatuses] = useState(() => storage.getTaskStatuses());
  const [taskPriorities, setTaskPriorities] = useState(() => storage.getTaskPriorities());

  useEffect(() => {
    const headers = getAuthHeaders();
    Promise.all([
      fetch(`${API_BASE_URL}/User/GetAllUsers`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_BASE_URL}/UserType/GetAllUserTypes`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetchProjectMastersApi(),
      fetch(`${API_BASE_URL}/ProjectAllocation/GetAllProjectAllocations`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_BASE_URL}/Task/GetAllTasks`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_BASE_URL}/TaskStatus/GetAllTaskStatuses`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_BASE_URL}/TaskPriority/GetAllTaskPriorities`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
    ]).then(([uRes, utRes, pmRes, paRes, tRes, tsRes, tpRes]) => {
      const uList = uRes?.data || uRes?.Data || uRes;
      if (Array.isArray(uList) && uList.length) { setUsers(uList); storage.setUsers(uList); }

      const utList = utRes?.data || utRes?.Data || utRes;
      if (Array.isArray(utList) && utList.length) { setUserTypes(utList); storage.setUserTypes(utList); }

      if (pmRes && pmRes.ok && pmRes.arr.length) {
        const pList = pmRes.arr.map(normalizeProject).filter(Boolean);
        setProjectMasters(pList);
        storage.setProjectMasters(pList);
      }

      const paList = paRes?.data || paRes?.Data || paRes;
      if (Array.isArray(paList) && paList.length) { setProjectAllocations(paList); storage.setProjectAllocations(paList); }

      const tList = tRes?.data || tRes?.Data || tRes;
      if (Array.isArray(tList) && tList.length) { setTasks(tList); storage.setTasks(tList); }

      const tsList = tsRes?.data || tsRes?.Data || tsRes;
      if (Array.isArray(tsList) && tsList.length) { setTaskStatuses(tsList); storage.setTaskStatuses(tsList); }

      const tpList = tpRes?.data || tpRes?.Data || tpRes;
      if (Array.isArray(tpList) && tpList.length) { setTaskPriorities(tpList); storage.setTaskPriorities(tpList); }
    });
  }, []);

  const getUserCategory = (u) => {
    const rawTypeName = (u?.UserTypeName || u?.userTypeName || '').toLowerCase();
    const code = (u?.UserCode || u?.userCode || '').toUpperCase();
    const typeId = Number(u?.UserTypeID || u?.userTypeID || 0);
    const typeObj = (userTypes || []).find((ut) => Number(ut?.UserTypeID || ut?.userTypeID) === typeId);
    const resolvedTypeName = (rawTypeName || typeObj?.UserTypeName || typeObj?.userTypeName || '').toLowerCase();

    if (resolvedTypeName.includes('admin') || code.startsWith('ADM') || typeId === 1) {
      if (!resolvedTypeName.includes('student') && !resolvedTypeName.includes('faculty') && !code.startsWith('STU') && !code.startsWith('FAC')) {
        return 'admin';
      }
    }
    if (resolvedTypeName.includes('faculty') || resolvedTypeName.includes('guide') || code.startsWith('FAC') || typeId === 2) {
      if (!resolvedTypeName.includes('student') && !code.startsWith('STU')) {
        return 'faculty';
      }
    }
    if (resolvedTypeName.includes('student') || resolvedTypeName.includes('candidate') || code.startsWith('STU') || typeId === 3) {
      return 'student';
    }

    if (typeId === 1) return 'admin';
    if (typeId === 2) return 'faculty';
    return 'student';
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const totalStudents = safeUsers.filter((u) => getUserCategory(u) === 'student').length;
  const totalFaculty = safeUsers.filter((u) => getUserCategory(u) === 'faculty').length;
  const totalProjects = Array.isArray(projectMasters) ? projectMasters.length : 0;
  const totalTasks = Array.isArray(tasks) ? tasks.length : 0;

  const safeAllocations = Array.isArray(projectAllocations) ? projectAllocations : [];
  const avgProgress = safeAllocations.length
    ? Math.round(safeAllocations.reduce((acc, p) => acc + (p.ProgressPercentage || p.progressPercentage || 0), 0) / safeAllocations.length)
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

  // Real Task Status Distribution for Donut/Pie Chart
  const statusCounts = taskStatuses.map((st, idx) => {
    const count = tasks.filter((t) => Number(t.TaskStatusID || t.taskStatusID) === Number(st.TaskStatusID || st.taskStatusID)).length;
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

  // Real Task Priority Distribution for Bar Chart
  const priorityCounts = taskPriorities.map((pr) => {
    const count = tasks.filter((t) => Number(t.TaskPriorityID || t.taskPriorityID) === Number(pr.TaskPriorityID || pr.taskPriorityID)).length;
    let color = '#2563eb';
    if (pr.TaskPriorityName === 'Critical') color = '#ef4444';
    if (pr.TaskPriorityName === 'Moderate') color = '#f59e0b';
    return {
      name: pr.TaskPriorityName || pr.taskPriorityName,
      value: count,
      color
    };
  });

  const progressTrendLine = [];
  const taskCompletionArea = [];

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800">
      {/* Title Header with Modern Breadcrumb */}
      <PageTitle
        title="Administrator Control Center"
        subtitle={`Welcome back, ${activeUser?.FullName || 'System Administrator'} (${activeUser?.Email || 'admin@gmail.com'}). Full institutional oversight and project allocations.`}
        showDate={true}
      />

      {/* Top Quick Actions Bar */}
      <AdminQuickActions />

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          icon={FolderGit2}
          color="blue"
          badgeText="Active Masters"
        />
        <StatCard
          title="Allocated Candidates"
          value={totalStudents}
          icon={Users}
          color="emerald"
          badgeText="Students Enrolled"
        />
        <StatCard
          title="Faculty Mentors"
          value={totalFaculty}
          icon={GraduationCap}
          color="purple"
          badgeText="Academic Supervisors"
        />
        <StatCard
          title="Deliverable Tasks"
          value={totalTasks}
          icon={CheckSquare}
          color="amber"
          badgeText={`${avgProgress}% Avg Completion`}
        />
      </div>

      {/* Analytics Grid Row 1: Status Distribution & Priority Weightage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        {/* Pie/Donut Chart for Task Status */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Task Status Breakdown</h3>
          <p className="text-xs text-gray-500 mb-4">Distribution across Pending, Ongoing, and Completed deliverables</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              {(() => {
                const activeStatusCounts = statusCounts.filter((s) => s.value > 0);
                const chartData = activeStatusCounts.length > 0 ? activeStatusCounts : [{ name: 'No Tasks', value: 1, color: '#cbd5e1' }];
                return (
                  <RePieChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={activeStatusCounts.length > 1 ? 3 : 0}
                      dataKey="value"
                      nameKey="name"
                      label={({ percent }) => (percent && !isNaN(percent) && percent > 0.05 && activeStatusCounts.length > 0 ? `${(percent * 100).toFixed(0)}%` : '')}
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
                      formatter={(value, name) => [activeStatusCounts.length > 0 ? `${value} Tasks` : 'No Data', name]}
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

        {/* Bar Chart for Priority Weightage */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Task Priority Distribution</h3>
          <p className="text-xs text-gray-500 mb-4">Task counts categorized by Low, Moderate, and Critical weightage</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={priorityCounts.length ? priorityCounts : [{ name: 'Empty', value: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="value" name="Tasks" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Grid Row 2: Progress Trends & Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        {/* Line Chart for Project Milestones */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Overall Sprint Progress Trend</h3>
          <p className="text-xs text-gray-500 mb-4">Average percentage completion across active project sprints</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={progressTrendLine} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" dataKey="value" name="Progress %" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 7 }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion Area Chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Task Completion Velocity</h3>
          <p className="text-xs text-gray-500 mb-4">Cumulative weekly submissions rate</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReAreaChart data={taskCompletionArea} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Area type="monotone" dataKey="value" name="Velocity" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#areaGradient)" />
              </ReAreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        <AdminActivityCard activities={[]} />
        <AdminAnnouncementCard announcements={[]} />
      </div>
    </div>
  );
};
