import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  CheckSquare,
  GraduationCap,
  Award,
  Plus,
  FileText,
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
  Line
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageTitle } from '../../layouts/PageTitle';
import { storage, API_BASE_URL, getAuthHeaders, getUserAllocations, extractApiArray } from '../../helpers';

const FacultyQuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs font-sans">
      <h3 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Button
          variant="outline"
          size="sm"
          icon={CheckSquare}
          className="w-full justify-start text-xs font-semibold py-2.5 cursor-pointer"
          onClick={() => navigate('/tasks/create')}
        >
          Create Task
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={Plus}
          className="w-full justify-start text-xs font-semibold py-2.5 cursor-pointer"
          onClick={() => navigate('/project-allocations/create')}
        >
          Allocate Student
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={FileText}
          className="w-full justify-start text-xs font-semibold py-2.5 cursor-pointer"
          onClick={() => navigate('/reports')}
        >
          Student Reports
        </Button>
      </div>
    </div>
  );
};

const FacultyActivityCard = ({ activities = [] }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs font-sans">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-bold text-gray-900">Recent Mentorship Activity</h3>
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
        <p className="text-xs text-gray-400">No recent mentorship activity recorded.</p>
      )}
    </div>
  </div>
);

const FacultyAnnouncementCard = ({ announcements = [] }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs font-sans">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
        <Bell className="w-4 h-4" />
      </div>
      <h3 className="text-base font-bold text-gray-900">Faculty Notices</h3>
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
        <p className="text-xs text-gray-400">No new departmental announcements.</p>
      )}
    </div>
  </div>
);

export const FacultyDashboard = () => {
  const activeUser = storage.getAuthUser() || {};
  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [tasks, setTasks] = useState(() => storage.getTasks());
  const [users, setUsers] = useState(() => storage.getUsers());
  const [taskStatuses, setTaskStatuses] = useState(() => storage.getTaskStatuses());

  useEffect(() => {
    const headers = getAuthHeaders();
    Promise.all([
      fetch(`${API_BASE_URL}/ProjectAllocation/GetAllProjectAllocations`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_BASE_URL}/Task/GetAllTasks`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_BASE_URL}/User/GetAllUsers`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${API_BASE_URL}/TaskStatus/GetAllTaskStatuses`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
    ]).then(([paRes, tRes, uRes, tsRes]) => {
      const paList = extractApiArray(paRes);
      if (paList.length) { setProjectAllocations(paList); storage.setProjectAllocations(paList); }

      const tList = extractApiArray(tRes);
      if (tList.length) { setTasks(tList); storage.setTasks(tList); }

      const uList = extractApiArray(uRes);
      if (uList.length) { setUsers(uList); storage.setUsers(uList); }

      const tsList = extractApiArray(tsRes);
      if (tsList.length) { setTaskStatuses(tsList); storage.setTaskStatuses(tsList); }
    });
  }, []);

  const currentUserId = Number(activeUser?.UserID || activeUser?.userID || 0);

  // Filter allocations guided by current faculty user
  const facultyAllocations = getUserAllocations(activeUser, 'Faculty', projectAllocations);

  const totalAllocatedProjects = facultyAllocations.length;
  const guidedStudentsCount = new Set(facultyAllocations.map((a) => a.StudentID || a.studentID)).size;

  const facultyAllocIds = facultyAllocations.map((a) => Number(a.ProjectAllocationID || a.projectAllocationID));
  const facultyProjIds = facultyAllocations.map((a) => Number(a.ProjectID || a.projectID));

  const safeTasks = extractApiArray(tasks);
  const facultyTasks = safeTasks.filter((t) => {
    const allocId = Number(t.ProjectAllocationID || t.projectAllocationID || 0);
    const projId = Number(t.ProjectID || t.projectID || 0);
    const facId = Number(t.FacultyID || t.facultyID || 0);
    return facultyAllocIds.includes(allocId) || facultyProjIds.includes(projId) || (currentUserId && facId === currentUserId);
  });

  const totalAssignedTasks = facultyTasks.length;
  const completedFacultyTasks = facultyTasks.filter((t) => Number(t.TaskStatusID || t.taskStatusID) === 3).length;

  const avgFacultyProgress = totalAllocatedProjects
    ? Math.round(facultyAllocations.reduce((acc, p) => acc + Number(p.ProgressPercentage || p.progressPercentage || 0), 0) / totalAllocatedProjects)
    : 0;

  // Chart 1: Guided Projects Progress (Bar)
  const guidedProjectsBar = facultyAllocations.map((a) => ({
    name: (a.ProjectTitle || a.projectTitle || 'Project').slice(0, 14) + '...',
    value: Number(a.ProgressPercentage || a.progressPercentage || 0)
  }));

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

  // Chart 2: Faculty Tasks Status Distribution (Pie/Donut)
  const facultyTaskStatusPie = (taskStatuses || []).map((st, idx) => {
    const stId = Number(st.TaskStatusID || st.taskStatusID);
    const count = facultyTasks.filter((t) => Number(t.TaskStatusID || t.taskStatusID) === stId).length;
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

  const evaluationTrendLine = [];

  // Chart 4: Tasks Assigned Per Student (Bar)
  const studentAllocationBar = facultyAllocations.map((a) => {
    const studentObj = users.find((u) => Number(u.UserID || u.userID) === Number(a.StudentID || a.studentID));
    const studentTasksCount = tasks.filter((t) => Number(t.ProjectAllocationID || t.projectAllocationID) === Number(a.ProjectAllocationID || a.projectAllocationID)).length;
    return {
      name: (studentObj?.FullName || studentObj?.fullName || 'Student').split(' ')[0],
      value: studentTasksCount
    };
  });

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800">
      <PageTitle
        title="Faculty Workspace"
        subtitle={`Welcome back, ${activeUser?.FullName || 'Prof. Faculty Guide'}. Supervisor overview of assigned project candidates.`}
        showDate={true}
      />

      <FacultyQuickActions />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StatCard
          title="Supervised Projects"
          value={totalAllocatedProjects}
          icon={FolderGit2}
          color="blue"
          badgeText="Active Allocations"
        />
        <StatCard
          title="Guided Students"
          value={guidedStudentsCount}
          icon={GraduationCap}
          color="purple"
          badgeText="Project Candidates"
        />
        <StatCard
          title="Tasks Created"
          value={totalAssignedTasks}
          icon={CheckSquare}
          color="amber"
          badgeText={`${completedFacultyTasks} Completed`}
        />
        <StatCard
          title="Average Progress"
          value={`${avgFacultyProgress}%`}
          icon={Award}
          color="emerald"
          badgeText="Completion Rate"
        />
      </div>

      {/* 4 Dashboard Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        {/* Chart 1: Guided Projects Progress */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Supervised Projects Completion %</h3>
          <p className="text-xs text-gray-500 mb-4">Milestone execution progress by assigned candidate</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={guidedProjectsBar.length ? guidedProjectsBar : [{ name: 'No Data', value: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="value" name="Progress %" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Task Status Distribution */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Supervised Tasks Status Breakdown</h3>
          <p className="text-xs text-gray-500 mb-4">Deliverable state distribution (Pending vs Completed)</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              {(() => {
                const activeFacultyTaskStatusPie = facultyTaskStatusPie.filter((s) => s.value > 0);
                const chartData = activeFacultyTaskStatusPie.length > 0 ? activeFacultyTaskStatusPie : [{ name: 'No Tasks', value: 1, color: '#cbd5e1' }];
                return (
                  <RePieChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={activeFacultyTaskStatusPie.length > 1 ? 3 : 0}
                      dataKey="value"
                      nameKey="name"
                      label={({ percent }) => (percent && !isNaN(percent) && percent > 0.05 && activeFacultyTaskStatusPie.length > 0 ? `${(percent * 100).toFixed(0)}%` : '')}
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
                      formatter={(value, name) => [activeFacultyTaskStatusPie.length > 0 ? `${value} Tasks` : 'No Data', name]}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        {/* Chart 3: Weekly Evaluation Velocity */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Weekly Task Evaluation Rate</h3>
          <p className="text-xs text-gray-500 mb-4">Total deliverables reviewed over time</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={evaluationTrendLine} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" dataKey="value" name="Evaluations" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 7 }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Student Allocation Bar Chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Tasks Assigned Per Student</h3>
          <p className="text-xs text-gray-500 mb-4">Workload distribution per candidate</p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={studentAllocationBar.length ? studentAllocationBar : [{ name: 'No Data', value: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="value" name="Total Tasks" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        <FacultyActivityCard activities={[]} />
        <FacultyAnnouncementCard announcements={[]} />
      </div>
    </div>
  );
};
