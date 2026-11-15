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
import { SearchBar } from '../../components/common/SearchBar';
import { storage, API_BASE_URL, getAuthHeaders, extractApiArray, fetchProjectAllocationsApi, normalizeAllocation } from '../../helpers';

const FacultyBarChart = ({
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

export const FacultyReportPage = () => {
  const role = storage.getAuthRole();
  const user = storage.getAuthUser();

  const [users, setUsers] = useState(() => storage.getUsers());
  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
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
  let facultyUsers = users.filter((u) => {
    const typeId = Number(u.UserTypeID || u.userTypeID || 0);
    const code = (u.UserCode || u.userCode || '').toLowerCase();
    const name = (u.UserTypeName || u.userTypeName || '').toLowerCase();
    return typeId === 2 || code.startsWith('fac') || name.includes('faculty') || name.includes('guide');
  });
  if (role === 'Faculty') {
    facultyUsers = facultyUsers.filter(
      (u) =>
        (currentUserId && Number(u.UserID || u.userID) === currentUserId) ||
        ((u.Email || u.email || '').toLowerCase() === (user?.Email || user?.email || '').toLowerCase())
    );
  }

  const reportData = facultyUsers.map((fac) => {
    const allocs = projectAllocations.filter(
      (a) =>
        Number(a.FacultyID || a.facultyID) === Number(fac.UserID || fac.userID) ||
        (a.FacultyName && fac.FullName && a.FacultyName.toLowerCase() === fac.FullName.toLowerCase())
    );
    const allocIds = allocs.map((a) => Number(a.ProjectAllocationID || a.projectAllocationID));
    const guidedTasks = tasks.filter((t) => allocIds.includes(Number(t.ProjectAllocationID || t.projectAllocationID)));

    return {
      UserID: fac.UserID || fac.userID,
      FullName: fac.FullName || fac.fullName,
      UserCode: fac.UserCode || fac.userCode || 'N/A',
      Email: fac.Email || fac.email,
      AssignedStudents: allocs.length,
      TotalTasksGiven: guidedTasks.length,
      CompletedTasks: guidedTasks.filter((t) => Number(t.TaskStatusID || t.taskStatusID) === 3).length
    };
  });

  const filteredData = reportData.filter((r) =>
    (r.FullName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = filteredData.map((r) => ({
    name: (r.FullName || 'Faculty').replace('Prof. ', '').replace('Dr. ', ''),
    value: r.AssignedStudents
  }));

  const columns = [
    { header: 'Faculty Name', field: 'FullName', sortable: true, render: (row) => <strong>{row.FullName}</strong> },
    { header: 'Faculty Code', field: 'UserCode', sortable: true, render: (row) => <span className="text-blue-600 font-semibold">{row.UserCode}</span> },
    { header: 'Email', field: 'Email', render: (row) => row.Email },
    { header: 'Allocated Students', field: 'AssignedStudents', sortable: true, render: (row) => <span className="font-extrabold text-purple-600">{row.AssignedStudents}</span> },
    { header: 'Tasks Evaluated', field: 'CompletedTasks', render: (row) => `${row.CompletedTasks} / ${row.TotalTasksGiven}` }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title={role === 'Faculty' ? 'My Mentorship Profile' : 'Total Faculty Guides'} value={facultyUsers.length} color="purple" />
        <StatCard title="Total Allocations" value={projectAllocations.length} color="blue" />
        <StatCard title="Tasks Reviewed" value={reportData.reduce((acc, r) => acc + r.CompletedTasks, 0)} color="emerald" />
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-1">Student Allocations Per Faculty Guide</h3>
        <FacultyBarChart data={chartData} color="#8b5cf6" height={260} barName="Allocated Students" />
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Filter faculty members..." />
        <span className="text-xs text-gray-500 font-semibold">{filteredData.length} Faculty Mentors</span>
      </div>

      <Table columns={columns} data={filteredData} keyField="UserID" itemsPerPage={6} />
    </div>
  );
};
