import React, { useState, useEffect } from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { Table } from '../../components/tables/Table';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/common/SearchBar';
import { storage, API_BASE_URL, getAuthHeaders, extractApiArray, fetchProjectMastersApi, fetchProjectAllocationsApi, normalizeProject, normalizeAllocation } from '../../helpers';

const StudentBarChart = ({
  data = [],
  dataKey = 'value',
  xAxisKey = 'name',
  color = '#2563eb',
  height = 300,
  barName = 'Count'
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey={xAxisKey} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          <Bar dataKey={dataKey} name={barName} fill={color} radius={[6, 6, 0, 0]} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const StudentReportPage = () => {
  const role = storage.getAuthRole();
  const user = storage.getAuthUser();

  const [users, setUsers] = useState(() => storage.getUsers());
  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [tasks, setTasks] = useState(() => storage.getTasks());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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

    // Resilient Fetch Allocations
    fetchProjectAllocationsApi().then((res) => {
      if (res.ok && res.arr.length > 0) {
        const list = res.arr.map(normalizeAllocation).filter(Boolean);
        setProjectAllocations(list);
        storage.setProjectAllocations(list);
      }
    });

    // Resilient Fetch Project Masters
    fetchProjectMastersApi().then((res) => {
      if (res.ok && res.arr.length > 0) {
        const list = res.arr.map(normalizeProject).filter(Boolean);
        setProjectMasters(list);
        storage.setProjectMasters(list);
      }
    });

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
  let studentUsers = users.filter((u) => {
    const typeId = Number(u.UserTypeID || u.userTypeID || 0);
    const code = (u.UserCode || u.userCode || '').toLowerCase();
    const name = (u.UserTypeName || u.userTypeName || '').toLowerCase();
    return typeId === 1 || typeId === 3 || code.startsWith('stu') || name.includes('student');
  });

  if (role === 'Faculty') {
    const facultyAllocStudentIds = projectAllocations
      .filter(
        (a) =>
          (currentUserId && Number(a.FacultyID || a.facultyID) === currentUserId) ||
          (a.FacultyName && user?.FullName && a.FacultyName.toLowerCase() === user.FullName.toLowerCase())
      )
      .map((a) => Number(a.StudentID || a.studentID));
    studentUsers = studentUsers.filter((u) => facultyAllocStudentIds.includes(Number(u.UserID || u.userID)));
  } else if (role === 'Student') {
    studentUsers = studentUsers.filter(
      (u) =>
        (currentUserId && Number(u.UserID || u.userID) === currentUserId) ||
        ((u.Email || u.email || '').toLowerCase() === (user?.Email || user?.email || '').toLowerCase())
    );
  }

  const reportData = studentUsers.map((stu) => {
    const alloc = projectAllocations.find(
      (a) =>
        Number(a.StudentID || a.studentID) === Number(stu.UserID || stu.userID) ||
        (a.StudentName && stu.FullName && a.StudentName.toLowerCase() === stu.FullName.toLowerCase())
    );
    const proj = projectMasters.find((p) => Number(p.ProjectID || p.projectID) === Number(alloc?.ProjectID || alloc?.projectID));
    const stuTasks = alloc
      ? tasks.filter((t) => Number(t.ProjectAllocationID || t.projectAllocationID) === Number(alloc.ProjectAllocationID || alloc.projectAllocationID))
      : [];
    const completedTasks = stuTasks.filter((t) => Number(t.TaskStatusID || t.taskStatusID) === 3).length;

    return {
      UserID: stu.UserID || stu.userID,
      FullName: stu.FullName || stu.fullName,
      UserCode: stu.UserCode || stu.userCode || 'N/A',
      Email: stu.Email || stu.email,
      ProjectTitle: proj ? (proj.ProjectTitle || proj.projectTitle) : 'Unallocated',
      ProgressPercentage: alloc ? (alloc.ProgressPercentage || 0) : 0,
      TotalTasks: stuTasks.length,
      CompletedTasks: completedTasks,
      Grade: alloc ? (alloc.OverAllGrade || 'N/A') : 'N/A'
    };
  });

  const filteredData = reportData.filter(
    (row) =>
      row.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.UserCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.ProjectTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = filteredData.map((row) => ({
    name: (row.FullName || 'Student').split(' ')[0],
    value: row.ProgressPercentage
  }));

  const columns = [
    { header: 'Student Name', field: 'FullName', sortable: true, render: (row) => <strong>{row.FullName}</strong> },
    { header: 'Enrollment Code', field: 'UserCode', sortable: true, render: (row) => <span className="text-blue-600 font-semibold">{row.UserCode}</span> },
    { header: 'Assigned Project', field: 'ProjectTitle', render: (row) => <span className="line-clamp-1">{row.ProjectTitle}</span> },
    { header: 'Tasks Completed', field: 'CompletedTasks', render: (row) => `${row.CompletedTasks} / ${row.TotalTasks}` },
    { header: 'Progress', field: 'ProgressPercentage', sortable: true, render: (row) => <span className="font-extrabold text-blue-600">{row.ProgressPercentage}%</span> },
    { header: 'Grade', field: 'Grade', sortable: true, render: (row) => <Badge variant="success">{row.Grade}</Badge> }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={studentUsers.length} color="blue" />
        <StatCard title="Average Progress" value={`${(reportData.reduce((acc, r) => acc + r.ProgressPercentage, 0) / (reportData.length || 1)).toFixed(1)}%`} color="emerald" />
        <StatCard title="Completed Submissions" value={reportData.reduce((acc, r) => acc + r.CompletedTasks, 0)} color="purple" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          {role === 'Student' ? 'My Progress Breakdown (%)' : 'Student Progress Breakdown (%)'}
        </h3>
        <StudentBarChart data={chartData} color="#2563eb" height={260} barName="Completion %" />
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Filter student reports..." />
        <span className="text-xs text-gray-500 font-semibold">{filteredData.length} Students Included</span>
      </div>

      <Table columns={columns} data={filteredData} keyField="UserID" itemsPerPage={6} />
    </div>
  );
};
