import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, GraduationCap, Calendar, CheckSquare, FolderGit2, User, UserCheck, Award } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate, storage, API_BASE_URL, getAuthHeaders } from '../../helpers';

export const AllocationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [users, setUsers] = useState(() => storage.getUsers());
  const [tasks, setTasks] = useState(() => storage.getTasks());
  const [allocObj, setAllocObj] = useState(() => {
    const cached = storage.getProjectAllocations();
    return cached.find((a) => Number(a.ProjectAllocationID || a.projectAllocationID) === Number(id)) || null;
  });

  useEffect(() => {
    // Fetch Allocation by ID
    fetch(`${API_BASE_URL}/ProjectAllocation/GetProjectAllocationById/${id}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.ProjectAllocationID || item.projectAllocationID)) {
          setAllocObj(item);
        }
      })
      .catch(() => {});

    // Fetch Project Masters
    fetch(`${API_BASE_URL}/ProjectMaster/GetAllProjectMasters`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setProjectMasters(list);
          storage.setProjectMasters(list);
        }
      })
      .catch(() => {});

    // Fetch Users
    fetch(`${API_BASE_URL}/User/GetAllUsers`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setUsers(list);
          storage.setUsers(list);
        }
      })
      .catch(() => {});

    // Fetch Tasks
    fetch(`${API_BASE_URL}/Task/GetAllTasks`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setTasks(list);
          storage.setTasks(list);
        }
      })
      .catch(() => {});
  }, [id]);

  const allocId = Number(id);
  const safeAllocations = Array.isArray(projectAllocations) ? projectAllocations : [];
  const safeProjects = Array.isArray(projectMasters) ? projectMasters : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const alloc = allocObj || safeAllocations.find((a) => Number(a?.ProjectAllocationID || a?.projectAllocationID) === allocId);

  if (!alloc) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-2xs font-sans">
        <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-gray-900 mb-1 font-sans">Allocation Record Not Found</h3>
        <p className="text-xs text-gray-500 mb-4 font-sans font-medium">The requested project allocation mapping could not be found.</p>
        <Button variant="outline" onClick={() => navigate('/project-allocations')}>
          Back to Allocations List
        </Button>
      </div>
    );
  }

  const projId = Number(alloc.ProjectID || alloc.projectID || 0);
  const stuId = Number(alloc.StudentID || alloc.studentID || 0);
  const facId = Number(alloc.FacultyID || alloc.facultyID || 0);

  const proj = safeProjects.find((p) => Number(p?.ProjectID || p?.projectID) === projId);
  const student = safeUsers.find((u) => Number(u?.UserID || u?.userID) === stuId);
  const faculty = safeUsers.find((u) => Number(u?.UserID || u?.userID) === facId);

  const projectTitle = alloc.ProjectTitle || alloc.projectTitle || proj?.ProjectTitle || proj?.projectTitle || 'Project Assignment';
  const studentName = alloc.StudentName || alloc.studentName || student?.FullName || student?.fullName || 'Student Candidate';
  const studentCode = student?.UserCode || student?.userCode || '';
  const facultyName = alloc.FacultyName || alloc.facultyName || faculty?.FullName || faculty?.fullName || 'Faculty Guide';

  const assignedDate = alloc.AssignedDate || alloc.assignedDate;
  const startDate = alloc.ProjectStartDate || alloc.projectStartDate;
  const endDate = alloc.ProjectEndDate || alloc.projectEndDate;
  const progressPct = Number(alloc.ProgressPercentage ?? alloc.progressPercentage ?? 0);
  const tasksGiven = Number(alloc.TotalTasksGiven ?? alloc.totalTasksGiven ?? 0);
  const tasksCompleted = Number(alloc.TotalCompletedTasks ?? alloc.totalCompletedTasks ?? 0);
  const grade = alloc.OverAllGrade || alloc.overAllGrade || 'Pending';

  const allocTasks = safeTasks.filter((t) => Number(t?.ProjectAllocationID || t?.projectAllocationID) === allocId);

  return (
    <div className="space-y-6 w-full font-sans antialiased text-gray-800">
      <PageTitle
        title="Project Allocation Details"
        subtitle="Individual student and faculty guide project assignment overview"
        actionButton={
          <div className="flex items-center gap-2 font-sans">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/project-allocations')}>
              Back to List
            </Button>
            <Button variant="primary" icon={Edit3} onClick={() => navigate(`/project-allocations/edit/${allocId}`)}>
              Edit Allocation
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-6 font-sans">
        {/* Top Header Card */}
        <div className="flex items-center gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 font-sans">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-sans">{projectTitle}</h2>
            <div className="flex items-center gap-2 mt-1 font-sans">
              <Badge variant="primary">Overall Grade: {grade}</Badge>
              <span className="text-xs font-semibold text-indigo-600">{progressPct}% Overall Progress</span>
            </div>
          </div>
        </div>

        {/* All Necessary Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
          {/* Project Master */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10.5px]">
              <FolderGit2 className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Project Master</span>
            </div>
            <div className="font-bold text-gray-900 text-sm line-clamp-1">{projectTitle}</div>
            <p className="text-gray-500 text-[11px] line-clamp-2">{proj?.Description || 'Assigned technical student project.'}</p>
          </div>

          {/* Student Candidate */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10.5px]">
              <User className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Student Candidate</span>
            </div>
            <div className="font-bold text-gray-900 text-sm">{studentName}</div>
            {studentCode && <div className="text-indigo-600 font-semibold">{studentCode}</div>}
          </div>

          {/* Faculty Guide */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10.5px]">
              <UserCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Faculty Guide</span>
            </div>
            <div className="font-bold text-gray-900 text-sm">{facultyName}</div>
            <div className="text-gray-500">{faculty?.Email || 'Academic Mentor'}</div>
          </div>

          {/* Assigned Date */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10.5px]">
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Assigned Date</span>
            </div>
            <div className="font-bold text-gray-900 text-sm">{formatDate(assignedDate)}</div>
          </div>

          {/* Project Start Date */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold uppercase tracking-wider text-[10.5px]">
              <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Project Start Date</span>
            </div>
            <div className="font-bold text-emerald-800 text-sm">{formatDate(startDate)}</div>
          </div>

          {/* Project End Date */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans space-y-1">
            <div className="flex items-center gap-1.5 text-amber-600 font-bold uppercase tracking-wider text-[10.5px]">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Project End Date</span>
            </div>
            <div className="font-bold text-amber-800 text-sm">{formatDate(endDate)}</div>
          </div>

          {/* Total Tasks Given & Completed */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10.5px]">
              <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Total Tasks (Given / Done)</span>
            </div>
            <div className="font-bold text-gray-900 text-sm">{tasksCompleted} / {tasksGiven} Completed</div>
          </div>

          {/* Progress Percentage */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans space-y-1">
            <div className="flex justify-between items-center text-gray-400 font-bold uppercase tracking-wider text-[10.5px]">
              <span>Progress Percentage</span>
              <span className="text-indigo-600 font-bold">{progressPct}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Overall Grade */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10.5px]">
              <Award className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Overall Grade</span>
            </div>
            <span className="inline-block px-3 py-1 rounded-md text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              Grade: {grade}
            </span>
          </div>
        </div>

        {/* Associated Deliverable Tasks List */}
        {allocTasks.length > 0 && (
          <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 text-xs font-sans">
            <h4 className="font-bold text-gray-900 mb-2 font-sans">Associated Tasks ({allocTasks.length})</h4>
            <ul className="space-y-1.5 font-sans">
              {allocTasks.map((t) => (
                <li key={t.TaskID || t.taskID} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 font-sans">
                  <span className="font-semibold text-gray-800">{t.TaskTitle || t.taskTitle}</span>
                  <span className="text-indigo-600 font-bold">{t.ProgressPercentage || t.progressPercentage || 0}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
