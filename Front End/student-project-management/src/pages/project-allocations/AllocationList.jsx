import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit3, Trash2, FolderGit2, Users, GraduationCap, Award } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Table } from '../../components/tables/Table';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { StatCard } from '../../components/common/StatCard';
import { formatDate, storage, API_BASE_URL, getAuthHeaders, getUserAllocations, extractApiArray, normalizeAllocation, normalizeProject, fetchProjectMastersApi } from '../../helpers';

export const AllocationList = () => {
  const navigate = useNavigate();
  const role = storage.getAuthRole();
  const user = storage.getAuthUser();

  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [users, setUsers] = useState(() => storage.getUsers());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch Project Allocations
    fetch(`${API_BASE_URL}/ProjectAllocation/GetAllProjectAllocations`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data).map(normalizeAllocation).filter(Boolean);
        if (list.length > 0) {
          const cached = storage.getProjectAllocations();
          const merged = deduplicateArray([...cached, ...list]);
          setProjectAllocations(merged);
          storage.setProjectAllocations(merged);
        }
      })
      .catch(() => {});

    // Fetch Project Masters
    fetchProjectMastersApi().then((res) => {
      if (res.ok && res.arr.length > 0) {
        const list = res.arr.map(normalizeProject).filter(Boolean);
        const cached = storage.getProjectMasters();
        const merged = deduplicateArray([...cached, ...list]);
        setProjectMasters(merged);
        storage.setProjectMasters(merged);
      }
    });

    // Fetch Users
    fetch(`${API_BASE_URL}/User/GetAllUsers`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data);
        if (list.length > 0) {
          const cached = storage.getUsers();
          const merged = deduplicateArray([...cached, ...list]);
          setUsers(merged);
          storage.setUsers(merged);
        }
      })
      .catch(() => {});
  }, []);

  const safeAllocations = extractApiArray(projectAllocations).map(normalizeAllocation).filter(Boolean);
  const roleFilteredAllocations = getUserAllocations(user, role, safeAllocations);

  const mappedAllocations = roleFilteredAllocations.map((a) => {
    const projId = Number(a.ProjectID || a.projectID);
    const stuId = Number(a.StudentID || a.studentID);
    const facId = Number(a.FacultyID || a.facultyID);

    const proj = projectMasters.find((p) => Number(p.ProjectID || p.projectID) === projId);
    const stu = users.find((u) => Number(u.UserID || u.userID) === stuId);
    const fac = users.find((u) => Number(u.UserID || u.userID) === facId);

    const pTitle = a.ProjectTitle || a.projectTitle || proj?.ProjectTitle || proj?.projectTitle || `Project #${projId || 'N/A'}`;
    const sName = a.StudentName || a.studentName || stu?.FullName || stu?.fullName || `Student #${stuId || 'N/A'}`;
    const sCode = stu?.UserCode || stu?.userCode || '';
    const fName = a.FacultyName || a.facultyName || fac?.FullName || fac?.fullName || `Faculty #${facId || 'N/A'}`;

    return {
      ...a,
      ProjectAllocationID: a.ProjectAllocationID || a.projectAllocationID,
      ProjectID: projId,
      StudentID: stuId,
      FacultyID: facId,
      projectTitle: pTitle,
      studentName: sName,
      studentCode: sCode,
      facultyName: fName,
      AssignedDate: a.AssignedDate || a.assignedDate,
      ProjectStartDate: a.ProjectStartDate || a.projectStartDate,
      ProjectEndDate: a.ProjectEndDate || a.projectEndDate,
      ProgressPercentage: Number(a.ProgressPercentage ?? a.progressPercentage ?? 0),
      TotalTasksGiven: Number(a.TotalTasksGiven ?? a.totalTasksGiven ?? 0),
      TotalCompletedTasks: Number(a.TotalCompletedTasks ?? a.totalCompletedTasks ?? 0),
      OverAllGrade: a.OverAllGrade || a.overAllGrade || 'Pending'
    };
  });

  const filteredAllocations = mappedAllocations.filter(
    (a) =>
      a.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(a.ProjectAllocationID).includes(searchTerm)
  );

  const totalAllocations = mappedAllocations.length;
  const uniqueStudents = new Set(mappedAllocations.map(a => a.StudentID)).size;
  const uniqueFaculties = new Set(mappedAllocations.map(a => a.FacultyID)).size;
  const gradedAllocations = mappedAllocations.filter(a => a.OverAllGrade && a.OverAllGrade !== 'Pending').length;

  const columns = [
    {
      header: 'Project Master',
      field: 'projectTitle',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-gray-900 line-clamp-1">{row.projectTitle}</div>
        </div>
      )
    },
    {
      header: 'Student Candidate',
      field: 'studentName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-gray-800">{row.studentName}</div>
          {row.studentCode && <div className="text-[11px] text-gray-400">{row.studentCode}</div>}
        </div>
      )
    },
    {
      header: 'Faculty Guide',
      field: 'facultyName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-700">{row.facultyName}</div>
        </div>
      )
    },
    {
      header: 'Assigned Date',
      field: 'AssignedDate',
      sortable: true,
      render: (row) => <span className="text-xs text-gray-600 font-medium">{formatDate(row.AssignedDate)}</span>
    },
    {
      header: 'Timeline (Start - End)',
      field: 'ProjectStartDate',
      sortable: true,
      render: (row) => (
        <div className="text-[11px] text-gray-600 font-medium leading-tight">
          <div><strong className="text-emerald-700">Start:</strong> {formatDate(row.ProjectStartDate)}</div>
          <div><strong className="text-amber-700">End:</strong> {formatDate(row.ProjectEndDate)}</div>
        </div>
      )
    },
    {
      header: 'Tasks (Given / Done)',
      field: 'TotalTasksGiven',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-gray-800 text-xs">
          {row.TotalCompletedTasks} / {row.TotalTasksGiven} Tasks
        </span>
      )
    },
    {
      header: 'Progress %',
      field: 'ProgressPercentage',
      sortable: true,
      render: (row) => (
        <div className="w-24">
          <div className="flex justify-between text-[10px] font-bold text-gray-600 mb-0.5">
            <span>{row.ProgressPercentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${row.ProgressPercentage || 0}%` }} />
          </div>
        </div>
      )
    },
    {
      header: 'Overall Grade',
      field: 'OverAllGrade',
      sortable: true,
      render: (row) => (
        <span className="px-2.5 py-1 rounded-md text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          {row.OverAllGrade || 'Pending'}
        </span>
      )
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => {
        const id = row.ProjectAllocationID;
        return (
          <div className="flex items-center gap-1.5 font-sans">
            <Link
              to={`/project-allocations/${id}`}
              title="View Details"
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {role !== 'Student' && (
              <>
                <Link
                  to={`/project-allocations/edit/${id}`}
                  title="Edit Allocation"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
                <Link
                  to={`/project-allocations/delete/${id}`}
                  title="Delete Allocation"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800">
      <PageTitle
        title="Project Allocations"
        subtitle="Manage student and faculty guide assignments per project"
        actionButton={
          role !== 'Student' ? (
            <Button variant="primary" icon={Plus} onClick={() => navigate('/project-allocations/create')}>
              Allocate Project
            </Button>
          ) : null
        }
      />

      {/* Top StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StatCard
          title="Total Allocations"
          value={totalAllocations}
          icon={FolderGit2}
          color="blue"
          badgeText="Active Assignments"
        />
        <StatCard
          title="Allocated Students"
          value={uniqueStudents}
          icon={Users}
          color="purple"
          badgeText="Project Candidates"
        />
        <StatCard
          title="Faculty Mentors"
          value={uniqueFaculties}
          icon={GraduationCap}
          color="emerald"
          badgeText="Guide Assignees"
        />
        <StatCard
          title="Evaluated Grades"
          value={gradedAllocations}
          icon={Award}
          color="amber"
          badgeText="Performance Scores"
        />
      </div>

      {/* Toolbar SearchBar Div */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs font-sans">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search by Project Title, Student, or Faculty..."
        />
      </div>

      {/* Table Display */}
      <Table columns={columns} data={filteredAllocations} keyField="ProjectAllocationID" itemsPerPage={6} />
    </div>
  );
};
