import React, { useState, useEffect } from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { Table } from '../../components/tables/Table';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/common/SearchBar';
import { storage, API_BASE_URL, getAuthHeaders, extractApiArray, fetchProjectMastersApi, fetchProjectAllocationsApi, normalizeProject, normalizeAllocation } from '../../helpers';

const DEFAULT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const ProjectPieChart = ({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  colors = DEFAULT_COLORS
}) => {
  const validData = data.filter((d) => (d[dataKey] || d.value) > 0);
  const displayData = validData.length > 0 ? validData : [{ name: 'No Data', value: 1, color: '#cbd5e1' }];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={validData.length > 1 ? 3 : 0}
            dataKey={dataKey}
            nameKey={nameKey}
            label={({ percent }) => (percent && !isNaN(percent) && percent > 0.05 && validData.length > 0 ? `${(percent * 100).toFixed(0)}%` : '')}
            labelLine={false}
          >
            {displayData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [validData.length > 0 ? `${value} Projects` : 'No Data', name]}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ProjectReportPage = () => {
  const role = storage.getAuthRole();
  const user = storage.getAuthUser();

  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [users, setUsers] = useState(() => storage.getUsers());
  const [tasks, setTasks] = useState(() => storage.getTasks());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Resilient Fetch Projects
    fetchProjectMastersApi().then((res) => {
      if (res.ok && res.arr.length > 0) {
        const list = res.arr.map(normalizeProject).filter(Boolean);
        setProjectMasters(list);
        storage.setProjectMasters(list);
      }
    });

    // Resilient Fetch Allocations
    fetchProjectAllocationsApi().then((res) => {
      if (res.ok && res.arr.length > 0) {
        const list = res.arr.map(normalizeAllocation).filter(Boolean);
        setProjectAllocations(list);
        storage.setProjectAllocations(list);
      }
    });

    // Fetch Users
    fetch(`${API_BASE_URL}/User/GetAllUsers`, { headers: getAuthHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = extractApiArray(data);
        if (list.length > 0) {
          setUsers(list);
          storage.setUsers(list);
        }
      })
      .catch(() => {});

    // Fetch Tasks
    fetch(`${API_BASE_URL}/Task/GetAllTasks`, { headers: getAuthHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = extractApiArray(data);
        if (list.length > 0) {
          setTasks(list);
          storage.setTasks(list);
        }
      })
      .catch(() => {});
  }, []);

  const currentUserId = Number(user?.UserID || user?.userID);
  let projs = projectMasters;
  if (role === 'Faculty') {
    const facultyProjIds = projectAllocations
      .filter(
        (a) =>
          (currentUserId && Number(a.FacultyID || a.facultyID) === currentUserId) ||
          (a.FacultyName && user?.FullName && a.FacultyName.toLowerCase() === user.FullName.toLowerCase())
      )
      .map((a) => Number(a.ProjectID || a.projectID));
    projs = projs.filter((p) => facultyProjIds.includes(Number(p.ProjectID || p.projectID)));
  } else if (role === 'Student') {
    const studentProjIds = projectAllocations
      .filter(
        (a) =>
          (currentUserId && Number(a.StudentID || a.studentID) === currentUserId) ||
          (a.StudentName && user?.FullName && a.StudentName.toLowerCase() === user.FullName.toLowerCase())
      )
      .map((a) => Number(a.ProjectID || a.projectID));
    projs = projs.filter((p) => studentProjIds.includes(Number(p.ProjectID || p.projectID)));
  }

  const reportData = projs.map((proj) => {
    const alloc = projectAllocations.find((a) => Number(a.ProjectID || a.projectID) === Number(proj.ProjectID || proj.projectID));
    const stu = users.find((u) => Number(u.UserID || u.userID) === Number(alloc?.StudentID || alloc?.studentID));
    const fac = users.find((u) => Number(u.UserID || u.userID) === Number(alloc?.FacultyID || alloc?.facultyID));
    const projTasks = alloc
      ? tasks.filter((t) => Number(t.ProjectAllocationID || t.projectAllocationID) === Number(alloc.ProjectAllocationID || alloc.projectAllocationID))
      : [];

    return {
      ProjectID: proj.ProjectID || proj.projectID,
      ProjectTitle: proj.ProjectTitle || proj.projectTitle,
      StudentName: stu ? (stu.FullName || stu.fullName) : (alloc?.StudentName || 'Unassigned'),
      FacultyName: fac ? (fac.FullName || fac.fullName) : (alloc?.FacultyName || 'Unassigned'),
      ProgressPercentage: alloc ? (alloc.ProgressPercentage || 0) : 0,
      TotalTasks: projTasks.length,
      CompletedTasks: projTasks.filter((t) => Number(t.TaskStatusID || t.taskStatusID) === 3).length,
      OverAllGrade: alloc ? (alloc.OverAllGrade || 'N/A') : 'N/A'
    };
  });

  const filteredData = reportData.filter((r) =>
    (r.ProjectTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const gradeDistribution = [
    { name: 'Grade A / A+', value: reportData.filter((r) => String(r.OverAllGrade).includes('A')).length, color: '#10b981' },
    { name: 'Grade B / B+', value: reportData.filter((r) => String(r.OverAllGrade).includes('B')).length, color: '#3b82f6' },
    { name: 'Grade C / Pending', value: reportData.filter((r) => !String(r.OverAllGrade).includes('A') && !String(r.OverAllGrade).includes('B')).length, color: '#f59e0b' }
  ];

  const columns = [
    { header: 'Project Title', field: 'ProjectTitle', sortable: true, render: (row) => <strong>{row.ProjectTitle}</strong> },
    { header: 'Assigned Student', field: 'StudentName', render: (row) => row.StudentName },
    { header: 'Faculty Mentor', field: 'FacultyName', render: (row) => row.FacultyName },
    { header: 'Progress', field: 'ProgressPercentage', sortable: true, render: (row) => <span className="font-bold text-blue-600">{row.ProgressPercentage}%</span> },
    { header: 'Grade', field: 'OverAllGrade', sortable: true, render: (row) => <Badge variant="success">{row.OverAllGrade}</Badge> }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title={role === 'Admin' ? 'Master Projects' : 'Assigned Projects'} value={projs.length} color="blue" />
        <StatCard title="Allocated Projects" value={reportData.filter((r) => r.StudentName !== 'Unassigned').length} color="emerald" />
        <StatCard title="Avg Completion" value={`${(reportData.reduce((acc, r) => acc + r.ProgressPercentage, 0) / (reportData.length || 1)).toFixed(1)}%`} color="amber" />
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-1">Overall Semester Grade Distribution</h3>
        <ProjectPieChart data={gradeDistribution} height={260} />
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Filter projects..." />
        <span className="text-xs text-gray-500 font-semibold">{filteredData.length} Projects Listed</span>
      </div>

      <Table columns={columns} data={filteredData} keyField="ProjectID" itemsPerPage={6} />
    </div>
  );
};
