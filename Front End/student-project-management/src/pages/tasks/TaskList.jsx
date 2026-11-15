import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Eye,
  Edit3,
  Trash2,
  Filter,
  CheckSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderGit2,
  Calendar,
  Award,
  MessageSquare,
  ChevronRight,
  LayoutGrid,
  List,
  Users,
  Layers
} from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Table } from '../../components/tables/Table';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { formatDate, storage, API_BASE_URL, getAuthHeaders, getUserAllocations, extractApiArray, deduplicateArray, normalizeTask, normalizeProject, normalizeAllocation, fetchProjectMastersApi, getFullStatusCssClass, getFullPriorityCssClass } from '../../helpers';

const TaskCard = ({ task, status, priority, onView, onEdit }) => {
  const navigate = useNavigate();
  const role = storage.getAuthRole();
  const taskStatuses = storage.getTaskStatuses();
  const taskPriorities = storage.getTaskPriorities();

  if (!task) return null;

  const taskId = task.TaskID || task.taskID || 1;
  const taskTitle = task.TaskTitle || task.taskTitle || 'Untitled Task';
  const taskDesc = task.TaskDescription || task.taskDescription || 'No description available.';

  const stId = task.TaskStatusID || task.taskStatusID;
  const prId = task.TaskPriorityID || task.taskPriorityID;

  const safeStatuses = Array.isArray(taskStatuses) ? taskStatuses : [];
  const safePriorities = Array.isArray(taskPriorities) ? taskPriorities : [];

  const statusObj = status || safeStatuses.find((s) => Number(s.TaskStatusID || s.taskStatusID) === Number(stId));
  const priorityObj = priority || safePriorities.find((p) => Number(p.TaskPriorityID || p.taskPriorityID) === Number(prId));

  const statusName = statusObj?.TaskStatusName || statusObj?.taskStatusName || (stId === 3 ? 'Completed' : stId === 2 ? 'Ongoing' : 'Pending');
  const priorityName = priorityObj?.TaskPriorityName || priorityObj?.taskPriorityName || (prId === 3 ? 'Critical' : prId === 2 ? 'Moderate' : 'Low');

  const statusCss = getFullStatusCssClass(statusObj?.TaskStatusCssClass || statusObj?.taskStatusCssClass, statusName);
  const priorityCss = getFullPriorityCssClass(priorityObj?.TaskPriorityCssClass || priorityObj?.taskPriorityCssClass, priorityName);
  const priorityDisplayName = priorityName.toLowerCase().includes('priority') ? priorityName : `${priorityName} Priority`;

  const handleView = onView || (() => navigate(`/tasks/${taskId}`));
  const handleEdit = onEdit || (() => navigate(`/tasks/edit/${taskId}`));

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition duration-200 flex flex-col justify-between font-sans antialiased text-gray-800">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3 font-sans">
          <Badge variant={statusCss}>
            {statusName}
          </Badge>
          <Badge variant={priorityCss}>
            {priorityDisplayName}
          </Badge>
        </div>

        <h3
          className="text-base font-bold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 cursor-pointer font-sans leading-snug"
          onClick={handleView}
        >
          {taskTitle}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-4 font-sans leading-relaxed">
          {taskDesc}
        </p>

        {/* Metrics Box */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50/80 p-3 rounded-xl border border-gray-100/80 mb-4 text-xs font-sans">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Score</span>
            <div className="flex items-center gap-1 text-gray-900 font-bold">
              <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{task.EarnedScore || task.earnedScore || 0} / {task.AssignedScore || task.assignedScore || 100}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Due Date</span>
            <div className="flex items-center gap-1 text-gray-700 font-medium">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{formatDate(task.TaskDueDate || task.taskDueDate)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
            <span>Task Progress</span>
            <span className="text-indigo-600">{task.ProgressPercentage || task.progressPercentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${task.ProgressPercentage || task.progressPercentage || 0}%` }}
            />
          </div>
        </div>

        {/* Faculty Remarks */}
        {(task.FacultyRemarks || task.facultyRemarks) && (
          <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/60 mb-4 text-xs font-sans">
            <div className="flex items-center gap-1 text-indigo-900 font-bold mb-0.5">
              <MessageSquare className="w-3 h-3 text-indigo-600" />
              <span>Faculty Feedback:</span>
            </div>
            <p className="text-[11px] text-gray-600 line-clamp-1 italic font-medium">
              "{task.FacultyRemarks || task.facultyRemarks}"
            </p>
          </div>
        )}
      </div>

      {/* Action Footer Button */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between font-sans">
        <button
          onClick={handleView}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition cursor-pointer"
        >
          View Full Deliverable <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {role !== 'Student' && (
          <button
            onClick={handleEdit}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 transition cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export const TaskList = () => {
  const navigate = useNavigate();
  const role = storage.getAuthRole();
  const user = storage.getAuthUser();

  const [tasks, setTasks] = useState(() => storage.getTasks());
  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [taskStatuses, setTaskStatuses] = useState(() => storage.getTaskStatuses());
  const [taskPriorities, setTaskPriorities] = useState(() => storage.getTaskPriorities());

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState('card');

  useEffect(() => {
    // Fetch Tasks
    fetch(`${API_BASE_URL}/Task/GetAllTasks`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data).map(normalizeTask).filter(Boolean);
        if (list.length > 0) {
          const cached = storage.getTasks();
          const merged = deduplicateArray([...cached, ...list]);
          setTasks(merged);
          storage.setTasks(merged);
        }
      })
      .catch(() => {});

    // Fetch Allocations
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

    // Fetch Projects using resilient helper
    fetchProjectMastersApi().then((res) => {
      if (res.ok && res.arr.length > 0) {
        const list = res.arr.map(normalizeProject).filter(Boolean);
        const cached = storage.getProjectMasters();
        const merged = deduplicateArray([...cached, ...list]);
        setProjectMasters(merged);
        storage.setProjectMasters(merged);
      }
    });

    // Fetch Statuses
    fetch(`${API_BASE_URL}/TaskStatus/GetAllTaskStatuses`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data);
        if (list.length > 0) {
          const cached = storage.getTaskStatuses();
          const merged = deduplicateArray([...cached, ...list]);
          setTaskStatuses(merged);
          storage.setTaskStatuses(merged);
        }
      })
      .catch(() => {});

    // Fetch Priorities
    fetch(`${API_BASE_URL}/TaskPriority/GetAllTaskPriorities`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data);
        if (list.length > 0) {
          const cached = storage.getTaskPriorities();
          const merged = deduplicateArray([...cached, ...list]);
          setTaskPriorities(merged);
          storage.setTaskPriorities(merged);
        }
      })
      .catch(() => {});
  }, []);

  const currentUserId = Number(user?.UserID || user?.userID || 0);
  const rawTasks = extractApiArray(tasks).map(normalizeTask).filter(Boolean);
  const rawProjects = extractApiArray(projectMasters).map(normalizeProject).filter(Boolean);
  const rawAllocations = extractApiArray(projectAllocations).map(normalizeAllocation).filter(Boolean);
  const safeStatuses = extractApiArray(taskStatuses);
  const safePriorities = extractApiArray(taskPriorities);

  // Filter allocations by role
  let userAllocations = rawAllocations;
  if (role === 'Faculty' || role === 'Student') {
    userAllocations = getUserAllocations(user, role, rawAllocations);
  }

  const userAllocIds = userAllocations.map((a) => Number(a.ProjectAllocationID || a.projectAllocationID));
  const userProjIds = userAllocations.map((a) => Number(a.ProjectID || a.projectID));

  // Build selectable projects list combining rawProjects and userAllocations
  const projectMap = new Map();

  rawProjects.forEach((p) => {
    const pId = Number(p.ProjectID || p.projectID);
    if (pId) projectMap.set(pId, p);
  });

  userAllocations.forEach((a) => {
    const pId = Number(a.ProjectID || a.projectID) || Number(a.ProjectAllocationID || a.projectAllocationID);
    if (pId && !projectMap.has(pId)) {
      projectMap.set(
        pId,
        normalizeProject({
          ...a,
          ProjectID: pId,
          ProjectTitle: a.ProjectTitle || a.projectTitle || '',
          Description: a.Description || a.description || ''
        })
      );
    }
  });

  const allAvailableProjects = Array.from(projectMap.values());

  let selectableProjects = allAvailableProjects;
  if ((role === 'Faculty' || role === 'Student') && userAllocations.length > 0) {
    const matched = allAvailableProjects.filter((p) => {
      const pId = Number(p.ProjectID || p.projectID);
      return userProjIds.includes(pId) || userAllocIds.includes(pId);
    });
    if (matched.length > 0) selectableProjects = matched;
  }

  const selectedProject = selectedProjectId
    ? allAvailableProjects.find((p) => Number(p.ProjectID || p.projectID) === Number(selectedProjectId))
    : null;

  const userMatchedTasks = rawTasks.filter((t) => {
    const allocId = Number(t.ProjectAllocationID || t.projectAllocationID || 0);
    const taskProjId = Number(t.ProjectID || t.projectID || 0);
    const isAllocated = userAllocIds.includes(allocId) || userProjIds.includes(taskProjId);
    const isUserTask = currentUserId && (Number(t.StudentID || t.studentID || 0) === currentUserId || Number(t.FacultyID || t.facultyID || 0) === currentUserId);
    return isAllocated || isUserTask;
  });

  const baseTasks = role === 'Admin' || userMatchedTasks.length > 0 ? (role === 'Admin' ? rawTasks : userMatchedTasks) : rawTasks;

  const filteredTasks = !selectedProjectId
    ? []
    : baseTasks.filter((t) => {
        if (!t) return false;

        const targetProjId = Number(selectedProjectId);
        const tProjId = Number(t.ProjectID || t.projectID || 0);
        const tAllocId = Number(t.ProjectAllocationID || t.projectAllocationID || 0);

        const matchingAlloc = rawAllocations.find(
          (a) => Number(a.ProjectAllocationID || a.projectAllocationID) === tAllocId
        );
        const allocProjId = Number(matchingAlloc?.ProjectID || matchingAlloc?.projectID || 0);

        const matchesDirectProj = tProjId === targetProjId;
        const matchesAllocProj = allocProjId === targetProjId;
        const matchesAllocId = tAllocId === targetProjId;

        if (!matchesDirectProj && !matchesAllocProj && !matchesAllocId) {
          return false;
        }

        const title = t.TaskTitle || t.taskTitle || '';
        const desc = t.TaskDescription || t.taskDescription || '';

        const matchesSearch =
          title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          desc.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatusFilter ? Number(t.TaskStatusID || t.taskStatusID) === Number(selectedStatusFilter) : true;
        const matchesPriority = selectedPriorityFilter ? Number(t.TaskPriorityID || t.taskPriorityID) === Number(selectedPriorityFilter) : true;

        return matchesSearch && matchesStatus && matchesPriority;
      });

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => Number(t?.TaskStatusID || t?.taskStatusID) === 3).length;
  const inProgressTasks = filteredTasks.filter((t) => Number(t?.TaskStatusID || t?.taskStatusID) === 2).length;
  const pendingTasks = filteredTasks.filter((t) => Number(t?.TaskStatusID || t?.taskStatusID) === 1).length;

  const getStatusVariant = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('hold')) return 'gray';
    if (lower.includes('complete') || lower.includes('done')) return 'success';
    if (lower.includes('ongoing') || lower.includes('progress')) return 'primary';
    if (lower.includes('pending')) return 'warning';
    if (lower.includes('cancel')) return 'danger';
    return 'default';
  };

  const getPriorityVariant = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('critical') || lower.includes('high')) return 'critical';
    if (lower.includes('moderate') || lower.includes('medium')) return 'moderate';
    if (lower.includes('low') || lower.includes('minor')) return 'low';
    return 'low';
  };

  const columns = [
    {
      header: 'Task Title',
      field: 'TaskTitle',
      sortable: true,
      render: (row) => <span className="font-bold text-gray-900">{row?.TaskTitle || row?.taskTitle || 'Untitled Task'}</span>
    },
    {
      header: 'Status',
      field: 'TaskStatusID',
      sortable: true,
      render: (row) => {
        const stId = Number(row?.TaskStatusID || row?.taskStatusID);
        const st = safeStatuses.find((s) => Number(s.TaskStatusID || s.taskStatusID) === stId);
        const name = row?.TaskStatusName || row?.taskStatusName || st?.TaskStatusName || st?.taskStatusName || (stId === 3 ? 'Completed' : stId === 2 ? 'Ongoing' : 'Pending');
        const cssClass = getFullStatusCssClass(row?.TaskStatusCssClass || row?.taskStatusCssClass || st?.TaskStatusCssClass || st?.taskStatusCssClass, name);
        return <Badge variant={cssClass}>{name}</Badge>;
      }
    },
    {
      header: 'Priority',
      field: 'TaskPriorityID',
      sortable: true,
      render: (row) => {
        const prId = Number(row?.TaskPriorityID || row?.taskPriorityID);
        const pr = safePriorities.find((p) => Number(p.TaskPriorityID || p.taskPriorityID) === prId);
        const name = row?.TaskPriorityName || row?.taskPriorityName || pr?.TaskPriorityName || pr?.taskPriorityName || (prId === 3 ? 'Critical' : prId === 2 ? 'Moderate' : 'Low');
        const cssClass = getFullPriorityCssClass(row?.TaskPriorityCssClass || row?.taskPriorityCssClass || pr?.TaskPriorityCssClass || pr?.taskPriorityCssClass, name);
        const displayName = name.toLowerCase().includes('priority') ? name : `${name} Priority`;
        return <Badge variant={cssClass}>{displayName}</Badge>;
      }
    },
    {
      header: 'Score',
      field: 'EarnedScore',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-gray-800 text-xs">
          {row?.EarnedScore || row?.earnedScore || 0} / {row?.AssignedScore || row?.assignedScore || 100}
        </span>
      )
    },
    {
      header: 'Due Date',
      field: 'TaskDueDate',
      sortable: true,
      render: (row) => <span className="text-xs text-gray-600 font-medium">{formatDate(row?.TaskDueDate || row?.taskDueDate)}</span>
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => {
        const id = row?.TaskID || row?.taskID;
        return (
          <div className="flex items-center gap-1.5 font-sans">
            <Link
              to={`/tasks/${id}`}
              title="View Task Details"
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {role !== 'Student' && (
              <>
                <Link
                  to={`/tasks/edit/${id}`}
                  title="Edit Task"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
                <Link
                  to={`/tasks/delete/${id}`}
                  title="Delete Task"
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
        title="Deliverable Tasks"
        subtitle="Manage sprint deliverables, task score weightage, and submission tracking"
        actionButton={
          role !== 'Student' ? (
            <Button variant="primary" icon={Plus} onClick={() => navigate('/tasks/create')}>
              Create Deliverable Task
            </Button>
          ) : null
        }
      />

      {/* Top Project Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Select Project Master</h3>
              <p className="text-xs text-gray-500">Filter deliverable tasks by registered project</p>
            </div>
          </div>

          <div className="w-full md:w-80">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans cursor-pointer"
            >
              <option value="">-- Please Select Project --</option>
              {selectableProjects.map((p) => {
                const pId = p.ProjectID || p.projectID;
                const pTitle = p.ProjectTitle || p.projectTitle;
                return (
                  <option key={pId} value={pId}>
                    {pTitle}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StatCard
          title="Filtered Tasks"
          value={totalTasks}
          icon={CheckSquare}
          color="blue"
          badgeText={selectedProjectId ? 'Project Deliverables' : 'Select Project'}
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon={CheckCircle2}
          color="emerald"
          badgeText="Verified Done"
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks}
          icon={Clock}
          color="indigo"
          badgeText="Ongoing Sprints"
        />
        <StatCard
          title="Pending"
          value={pendingTasks}
          icon={AlertTriangle}
          color="amber"
          badgeText="Awaiting Execution"
        />
      </div>

      {/* 3. FILTERS & VIEW MODE TOGGLE (CARD VIEW VS TABLE VIEW) */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs font-sans">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search by Task Title or Description..."
        />

        <div className="flex flex-wrap items-center gap-3 font-sans w-full lg:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 font-sans">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans cursor-pointer"
            >
              <option value="">All Statuses</option>
              {safeStatuses.map((s) => {
                const sId = s.TaskStatusID || s.taskStatusID;
                const sName = s.TaskStatusName || s.taskStatusName;
                return (
                  <option key={sId} value={sId}>
                    {sName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 font-sans">
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans cursor-pointer"
            >
              <option value="">All Priorities</option>
              {safePriorities.map((p) => {
                const pId = p.TaskPriorityID || p.taskPriorityID;
                const pName = p.TaskPriorityName || p.taskPriorityName;
                return (
                  <option key={pId} value={pId}>
                    {pName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* View Mode Toggle: Card vs Table */}
          <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 shrink-0 font-sans">
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                viewMode === 'card' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Card
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* 4. TASK CONTENT DISPLAY (CARDS VS TABLE) */}
      {!selectedProjectId ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-2xs text-center font-sans space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-gray-900">Please Select a Project</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Please select a project from the dropdown menu above to view its associated deliverable tasks.
          </p>
        </div>
      ) : viewMode === 'card' ? (
        filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
            {filteredTasks.map((t) => (
              <TaskCard key={t.TaskID || t.taskID} task={t} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-2xs text-xs text-gray-500 font-sans">
            No deliverable tasks found for the selected project filter.
          </div>
        )
      ) : (
        <Table columns={columns} data={filteredTasks} keyField="TaskID" itemsPerPage={6} />
      )}
    </div>
  );
};
