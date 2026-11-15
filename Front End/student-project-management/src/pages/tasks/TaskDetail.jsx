import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, ClipboardList, Calendar, Award, CheckCircle2, UserCheck, MessageSquare, Loader2 } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate, storage, API_BASE_URL, getAuthHeaders, getFullStatusCssClass, getFullPriorityCssClass } from '../../helpers';

export const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = storage.getAuthRole();

  const [tasks, setTasks] = useState(() => storage.getTasks());
  const [taskStatuses, setTaskStatuses] = useState(() => storage.getTaskStatuses());
  const [taskPriorities, setTaskPriorities] = useState(() => storage.getTaskPriorities());
  const [taskObj, setTaskObj] = useState(() => {
    const cached = storage.getTasks();
    return cached.find((t) => Number(t.TaskID || t.taskID) === Number(id)) || null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch Task by ID
    setLoading(true);
    fetch(`${API_BASE_URL}/Task/GetTaskById/${id}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.TaskID || item.taskID)) {
          setTaskObj(item);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch Statuses
    fetch(`${API_BASE_URL}/TaskStatus/GetAllTaskStatuses`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setTaskStatuses(list);
          storage.setTaskStatuses(list);
        }
      })
      .catch(() => {});

    // Fetch Priorities
    fetch(`${API_BASE_URL}/TaskPriority/GetAllTaskPriorities`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setTaskPriorities(list);
          storage.setTaskPriorities(list);
        }
      })
      .catch(() => {});
  }, [id]);

  const resolvedTask = taskObj || tasks.find((t) => Number(t.TaskID || t.taskID) === Number(id));

  if (loading && !resolvedTask) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-2xs font-sans space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <h3 className="text-sm font-bold text-gray-900 font-sans">Loading Task Details...</h3>
      </div>
    );
  }

  if (!resolvedTask) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-2xs font-sans text-center space-y-4">
        <h3 className="text-lg font-bold text-gray-900 font-sans">Task Record Not Found</h3>
        <p className="text-xs text-gray-500 font-sans">The requested deliverable task could not be loaded from API.</p>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/tasks')}>
          Back to Deliverable Tasks
        </Button>
      </div>
    );
  }

  const stId = resolvedTask.TaskStatusID || resolvedTask.taskStatusID;
  const prId = resolvedTask.TaskPriorityID || resolvedTask.taskPriorityID;

  const st = taskStatuses.find((s) => Number(s.TaskStatusID || s.taskStatusID) === Number(stId));
  const pr = taskPriorities.find((p) => Number(p.TaskPriorityID || p.taskPriorityID) === Number(prId));

  const statusName = resolvedTask.TaskStatusName || resolvedTask.taskStatusName || st?.TaskStatusName || st?.taskStatusName || 'Pending';
  const priorityName = resolvedTask.TaskPriorityName || resolvedTask.taskPriorityName || pr?.TaskPriorityName || pr?.taskPriorityName || 'Low';

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800">
      <PageTitle
        title={`Task Details: ${resolvedTask.TaskTitle || resolvedTask.taskTitle || 'Untitled Task'}`}
        subtitle="Full task deliverable evaluation, score weighting, and submission tracking"
        actionButton={
          <div className="flex items-center gap-2 font-sans">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/tasks')}>
              Back to List
            </Button>
            {role !== 'Student' && (
              <Button variant="primary" icon={Edit3} onClick={() => navigate(`/tasks/edit/${id}`)}>
                Edit Task
              </Button>
            )}
          </div>
        }
      />

      {/* Main Task Information Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs font-sans space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-1 font-sans">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{resolvedTask.TaskTitle || resolvedTask.taskTitle}</h2>
            </div>
            <p className="text-xs text-gray-500 font-sans">{resolvedTask.ProjectTitle || resolvedTask.projectTitle || 'Associated Project Deliverable'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getFullStatusCssClass(resolvedTask?.TaskStatusCssClass || resolvedTask?.taskStatusCssClass || st?.TaskStatusCssClass || st?.taskStatusCssClass, statusName)}>
              {statusName}
            </Badge>
            <Badge variant={getFullPriorityCssClass(resolvedTask?.TaskPriorityCssClass || resolvedTask?.taskPriorityCssClass || pr?.TaskPriorityCssClass || pr?.taskPriorityCssClass, priorityName)}>
              {priorityName.toLowerCase().includes('priority') ? priorityName : `${priorityName} Priority`}
            </Badge>
          </div>
        </div>

        {/* Deliverable Description */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-sans">Deliverable Description</h4>
          <p className="text-sm text-gray-700 leading-relaxed font-medium bg-gray-50/80 p-4 rounded-xl border border-gray-100 font-sans">
            {resolvedTask.TaskDescription || resolvedTask.taskDescription || 'No description provided.'}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 font-sans">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-sans">Score Weightage</span>
            </div>
            <p className="text-base font-black text-gray-900 mt-1 font-sans">
              {resolvedTask.EarnedScore || resolvedTask.earnedScore || 0} / {resolvedTask.AssignedScore || resolvedTask.assignedScore || 100} Marks
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-sans">Task Progress</span>
            </div>
            <p className="text-base font-black text-gray-900 mt-1 font-sans">
              {resolvedTask.ProgressPercentage || resolvedTask.progressPercentage || 0}% Completed
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-sans">Task Due Date</span>
            </div>
            <p className="text-base font-black text-gray-900 mt-1 font-sans">
              {formatDate(resolvedTask.TaskDueDate || resolvedTask.taskDueDate)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <UserCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-sans">Assigned Date</span>
            </div>
            <p className="text-base font-black text-gray-900 mt-1 font-sans">
              {formatDate(resolvedTask.TaskAssignedDate || resolvedTask.taskAssignedDate)}
            </p>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-sans">
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 font-sans">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs mb-2 font-sans">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Faculty Mentor Remarks</span>
            </div>
            <p className="text-xs text-gray-700 font-medium leading-relaxed font-sans">
              {resolvedTask.FacultyRemarks || resolvedTask.facultyRemarks || 'No faculty feedback recorded yet.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 font-sans">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-2 font-sans">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              <span>Student Candidate Remarks</span>
            </div>
            <p className="text-xs text-gray-700 font-medium leading-relaxed font-sans">
              {resolvedTask.StudentRemarks || resolvedTask.studentRemarks || 'No student submission notes recorded yet.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
