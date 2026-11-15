import React, { useState, useEffect } from 'react';
import { PageTitle } from '../../layouts/PageTitle';
import { StudentReportPage } from './StudentReportPage';
import { FacultyReportPage } from './FacultyReportPage';
import { ProjectReportPage } from './ProjectReportPage';
import { GraduationCap, Users, FolderGit2, Download, Printer, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { exportToCSV, printReport, storage, API_BASE_URL, getAuthHeaders, extractApiArray, fetchProjectMastersApi, fetchProjectAllocationsApi, normalizeProject, normalizeAllocation } from '../../helpers';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('student');
  const role = storage.getAuthRole();
  const user = storage.getAuthUser();

  const [users, setUsers] = useState(() => storage.getUsers());
  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [tasks, setTasks] = useState(() => storage.getTasks());

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

  const handleExportCSV = () => {
    const currentUserId = Number(user?.UserID || user?.userID);
    if (activeTab === 'student') {
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

      const data = studentUsers.map((stu) => {
        const alloc = projectAllocations.find(
          (a) =>
            Number(a.StudentID || a.studentID) === Number(stu.UserID || stu.userID) ||
            (a.StudentName && stu.FullName && a.StudentName.toLowerCase() === stu.FullName.toLowerCase())
        );
        const proj = projectMasters.find((p) => Number(p.ProjectID || p.projectID) === Number(alloc?.ProjectID || alloc?.projectID));
        const stuTasks = alloc
          ? tasks.filter((t) => Number(t.ProjectAllocationID || t.projectAllocationID) === Number(alloc.ProjectAllocationID || alloc.projectAllocationID))
          : [];
        return {
          UserID: stu.UserID || stu.userID,
          FullName: stu.FullName || stu.fullName,
          UserCode: stu.UserCode || stu.userCode || 'N/A',
          Email: stu.Email || stu.email,
          ProjectTitle: proj ? (proj.ProjectTitle || proj.projectTitle) : 'Unallocated',
          ProgressPercentage: alloc ? (alloc.ProgressPercentage || 0) : 0,
          TotalTasks: stuTasks.length,
          CompletedTasks: stuTasks.filter((t) => Number(t.TaskStatusID || t.taskStatusID) === 3).length,
          Grade: alloc ? (alloc.OverAllGrade || 'N/A') : 'N/A'
        };
      });
      exportToCSV('Student_Performance_Report', data, {
        FullName: 'Full Name',
        UserCode: 'Enrollment Code',
        Email: 'Email',
        ProjectTitle: 'Assigned Project',
        ProgressPercentage: 'Progress %',
        TotalTasks: 'Total Tasks',
        CompletedTasks: 'Completed Tasks',
        Grade: 'Overall Grade'
      });
    } else if (activeTab === 'faculty') {
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
      const data = facultyUsers.map((fac) => {
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
      exportToCSV('Faculty_Mentorship_Report', data, {
        FullName: 'Full Name',
        UserCode: 'Faculty Code',
        Email: 'Email',
        AssignedStudents: 'Allocated Students',
        TotalTasksGiven: 'Tasks Assigned',
        CompletedTasks: 'Tasks Completed'
      });
    } else {
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

      const data = projs.map((proj) => {
        const alloc = projectAllocations.find((a) => Number(a.ProjectID || a.projectID) === Number(proj.ProjectID || proj.projectID));
        const stu = users.find((u) => Number(u.UserID || u.userID) === Number(alloc?.StudentID || alloc?.studentID));
        const fac = users.find((u) => Number(u.UserID || u.userID) === Number(alloc?.FacultyID || alloc?.facultyID));
        const projTasks = alloc
          ? tasks.filter((t) => Number(t.ProjectAllocationID || t.projectAllocationID) === Number(alloc.ProjectAllocationID || alloc.projectAllocationID))
          : [];
        return {
          ProjectID: proj.ProjectID || proj.projectID,
          ProjectTitle: proj.ProjectTitle || proj.projectTitle,
          StudentName: stu ? (stu.FullName || stu.fullName) : (alloc?.StudentName || 'Unallocated'),
          FacultyGuide: fac ? (fac.FullName || fac.fullName) : (alloc?.FacultyName || 'Unassigned'),
          ProgressPercentage: alloc ? (alloc.ProgressPercentage || 0) : 0,
          TotalTasks: projTasks.length,
          Grade: alloc ? (alloc.OverAllGrade || 'N/A') : 'N/A'
        };
      });
      exportToCSV('Project_Status_Report', data, {
        ProjectTitle: 'Project Title',
        StudentName: 'Assigned Student',
        FacultyGuide: 'Faculty Mentor',
        ProgressPercentage: 'Progress %',
        TotalTasks: 'Total Tasks',
        Grade: 'Evaluation Grade'
      });
    }
  };

  const getUserCategory = (u) => {
    const rawTypeName = (u?.UserTypeName || u?.userTypeName || '').toLowerCase();
    const code = (u?.UserCode || u?.userCode || '').toUpperCase();
    const typeId = Number(u?.UserTypeID || u?.userTypeID || 0);
    const resolvedTypeName = rawTypeName.toLowerCase();

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
    return 'student';
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const totalStudents = safeUsers.filter((u) => getUserCategory(u) === 'student').length;
  const totalFaculty = safeUsers.filter((u) => getUserCategory(u) === 'faculty').length;
  const totalProjects = Array.isArray(projectMasters) ? projectMasters.length : 0;
  const completedTasksCount = Array.isArray(tasks) ? tasks.filter((t) => Number(t.TaskStatusID || t.taskStatusID) === 3).length : 0;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Reports & Analytics Dashboard"
        subtitle="Comprehensive exportable audits for Students, Faculty Mentors, and Technical Projects"
        actionButton={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Printer} onClick={() => printReport('printable-report-area')}>
              Print Summary
            </Button>
            <Button variant="primary" icon={Download} onClick={handleExportCSV}>
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Top StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Candidates"
          value={totalStudents}
          icon={GraduationCap}
          color="emerald"
          badgeText="Student Roster"
        />
        <StatCard
          title="Faculty Advisors"
          value={totalFaculty}
          icon={Users}
          color="purple"
          badgeText="Academic Mentors"
        />
        <StatCard
          title="Technical Projects"
          value={totalProjects}
          icon={FolderGit2}
          color="blue"
          badgeText="Master Catalog"
        />
        <StatCard
          title="Completed Milestones"
          value={completedTasksCount}
          icon={CheckCircle2}
          color="amber"
          badgeText="Evaluated Sprint Tasks"
        />
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('student')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-xs transition cursor-pointer ${
            activeTab === 'student'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Student Performance Report
        </button>

        {role !== 'Student' && (
          <button
            onClick={() => setActiveTab('faculty')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-xs transition cursor-pointer ${
              activeTab === 'faculty'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Faculty Mentorship Audit
          </button>
        )}

        <button
          onClick={() => setActiveTab('project')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-xs transition cursor-pointer ${
            activeTab === 'project'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          Project Status Summary
        </button>
      </div>

      <div id="printable-report-area" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
        {activeTab === 'student' && <StudentReportPage />}
        {activeTab === 'faculty' && role !== 'Student' && <FacultyReportPage />}
        {activeTab === 'project' && <ProjectReportPage />}
      </div>
    </div>
  );
};
