import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const TaskCreate = () => {
  const navigate = useNavigate();
  const role = storage.getAuthRole();
  const user = storage.getAuthUser();

  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [users, setUsers] = useState(() => storage.getUsers());
  const [taskStatuses, setTaskStatuses] = useState(() => storage.getTaskStatuses());
  const [taskPriorities, setTaskPriorities] = useState(() => storage.getTaskPriorities());

  const [formData, setFormData] = useState({
    ProjectAllocationID: '',
    TaskTitle: '',
    TaskDescription: '',
    TaskStatusID: 1,
    TaskPriorityID: 2,
    AssignedScore: 100,
    EarnedScore: 0,
    ProgressPercentage: 0,
    TaskAssignedDate: new Date().toISOString().split('T')[0],
    TaskStartDate: '',
    TaskDueDate: '',
    TaskCompletedDate: '',
    NextFollowUpDate: '',
    FacultyRemarks: '',
    StudentRemarks: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiModal, setApiModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: [],
    onClose: null
  });

  const closeApiModal = () => {
    const cb = apiModal.onClose;
    setApiModal({ isOpen: false, title: '', message: '', details: [], onClose: null });
    if (cb) cb();
  };

  useEffect(() => {
    // Fetch Allocations
    fetch(`${API_BASE_URL}/ProjectAllocation/GetAllProjectAllocations`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setProjectAllocations(list);
          storage.setProjectAllocations(list);
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
  }, []);

  const currentUserId = Number(user?.UserID || user?.userID);
  const students = users.filter((u) => {
    const typeId = Number(u.UserTypeID || u.userTypeID || 0);
    const code = (u.UserCode || u.userCode || '').toLowerCase();
    const name = (u.UserTypeName || u.userTypeName || '').toLowerCase();
    return typeId === 1 || typeId === 3 || code.startsWith('stu') || name.includes('student');
  });

  let userAllocations = Array.isArray(projectAllocations) ? projectAllocations : [];
  if (role === 'Faculty') {
    userAllocations = userAllocations.filter(
      (a) =>
        (currentUserId && Number(a.FacultyID || a.facultyID) === currentUserId) ||
        (a.FacultyName && user?.FullName && a.FacultyName.toLowerCase() === user.FullName.toLowerCase())
    );
  } else if (role === 'Student') {
    userAllocations = userAllocations.filter(
      (a) =>
        (currentUserId && Number(a.StudentID || a.studentID) === currentUserId) ||
        (a.StudentName && user?.FullName && a.StudentName.toLowerCase() === user.FullName.toLowerCase())
    );
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Task/CreateTask`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ProjectAllocationID: Number(formData.ProjectAllocationID),
          TaskTitle: formData.TaskTitle || '',
          TaskDescription: formData.TaskDescription || '',
          TaskStatusID: Number(formData.TaskStatusID || 1),
          TaskPriorityID: Number(formData.TaskPriorityID || 1),
          AssignedScore: Number(formData.AssignedScore || 100),
          EarnedScore: Number(formData.EarnedScore || 0),
          ProgressPercentage: Number(formData.ProgressPercentage || 0),
          TaskAssignedDate: formData.TaskAssignedDate || new Date().toISOString(),
          TaskStartDate: formData.TaskStartDate || null,
          TaskDueDate: formData.TaskDueDate,
          TaskCompletedDate: formData.TaskCompletedDate || null,
          FacultyRemarks: formData.FacultyRemarks || '',
          StudentRemarks: formData.StudentRemarks || ''
        })
      });

      const resData = await response.json().catch(() => ({}));
      const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : response.ok;
      setIsLoading(false);

      if (isSuccess) {
        const createdTask = resData?.data || resData?.Data || {
          TaskID: Date.now(),
          ...formData,
          ProjectAllocationID: Number(formData.ProjectAllocationID),
          TaskStatusID: Number(formData.TaskStatusID || 1),
          TaskPriorityID: Number(formData.TaskPriorityID || 1),
          AssignedScore: Number(formData.AssignedScore || 100),
          EarnedScore: Number(formData.EarnedScore || 0),
          ProgressPercentage: Number(formData.ProgressPercentage || 0)
        };
        const currentTasks = storage.getTasks();
        storage.setTasks([createdTask, ...currentTasks]);

        const parsed = parseApiResponse(resData);
        setApiModal({
          isOpen: true,
          title: parsed.title,
          message: parsed.message,
          details: parsed.details,
          onClose: () => navigate('/tasks')
        });
      } else {
        const parsed = parseApiResponse(resData);
        setApiModal({
          isOpen: true,
          title: parsed.title,
          message: parsed.message,
          details: parsed.details,
          onClose: null
        });
      }
    } catch (err) {
      setIsLoading(false);
      const parsed = parseApiResponse(null);
      setApiModal({
        isOpen: true,
        title: parsed.title,
        message: 'Could not connect to backend server.',
        details: [],
        onClose: null
      });
    }
  };

  const allocationOptions = userAllocations.map((a) => {
    const proj = projectMasters.find((p) => Number(p.ProjectID || p.projectID) === Number(a.ProjectID || a.projectID));
    const stu = students.find((s) => Number(s.UserID || s.userID) === Number(a.StudentID || a.studentID));
    return {
      value: a.ProjectAllocationID || a.projectAllocationID,
      label: `${proj?.ProjectTitle || proj?.projectTitle || 'Project'} - ${stu?.FullName || stu?.fullName || 'Student'}`
    };
  });

  const statusOptions = taskStatuses.map((s) => ({
    value: s.TaskStatusID || s.taskStatusID,
    label: s.TaskStatusName || s.taskStatusName
  }));

  const priorityOptions = taskPriorities.map((p) => ({
    value: p.TaskPriorityID || p.taskPriorityID,
    label: p.TaskPriorityName || p.taskPriorityName
  }));

  return (
    <div className="space-y-6 w-full font-sans antialiased text-gray-800">
      <PageTitle
        title="Create Task"
        subtitle="Specify task title, due date, status, priority, and assigned scores"
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/tasks')}>
            Back to Tasks
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-4 font-sans" noValidate>
          <Select
            label="Project Allocation *"
            placeholder="Select Allocated Project & Student"
            options={allocationOptions}
            value={formData.ProjectAllocationID}
            onChange={(e) => handleChange('ProjectAllocationID', e.target.value)}
            required
            disabled={role === 'Student'}
          />

          <Input
            label="Task Title *"
            placeholder="e.g. Database Schema Design & ERD Modeling"
            value={formData.TaskTitle}
            onChange={(e) => handleChange('TaskTitle', e.target.value)}
            required
            disabled={role === 'Student'}
          />

          <Textarea
            label="Task Details / Instructions"
            placeholder="Detailed scope, technical deliverables, criteria..."
            rows={3}
            value={formData.TaskDescription}
            onChange={(e) => handleChange('TaskDescription', e.target.value)}
            disabled={role === 'Student'}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Task Status"
              options={statusOptions}
              value={formData.TaskStatusID}
              onChange={(e) => handleChange('TaskStatusID', e.target.value)}
            />
            <Select
              label="Task Priority"
              options={priorityOptions}
              value={formData.TaskPriorityID}
              onChange={(e) => handleChange('TaskPriorityID', e.target.value)}
              disabled={role === 'Student'}
            />
            <Input
              label="Assigned Max Score"
              type="number"
              value={formData.AssignedScore}
              onChange={(e) => handleChange('AssignedScore', e.target.value)}
              required
              disabled={role === 'Student'}
            />
            <Input
              label="Earned Score (Graded)"
              type="number"
              value={formData.EarnedScore}
              onChange={(e) => handleChange('EarnedScore', e.target.value)}
              disabled={role === 'Student'}
            />
            <Input
              label="Completion Progress (%)"
              type="number"
              min="0"
              max="100"
              value={formData.ProgressPercentage}
              onChange={(e) => handleChange('ProgressPercentage', e.target.value)}
              required
            />
            <Input
              label="Due Date *"
              type="date"
              value={formData.TaskDueDate}
              onChange={(e) => handleChange('TaskDueDate', e.target.value)}
              disabled={role === 'Student'}
              required
            />
            <Input
              label="Task Start Date"
              type="date"
              value={formData.TaskStartDate}
              onChange={(e) => handleChange('TaskStartDate', e.target.value)}
            />
            <Input
              label="Next Follow-up Date"
              type="date"
              value={formData.NextFollowUpDate}
              onChange={(e) => handleChange('NextFollowUpDate', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Faculty Remarks / Feedback"
              placeholder="Faculty notes or review comments..."
              rows={2}
              value={formData.FacultyRemarks}
              onChange={(e) => setFormData({ ...formData, FacultyRemarks: e.target.value })}
              disabled={role === 'Student'}
            />
            <Textarea
              label="Student Remarks / Updates"
              placeholder="Student progress notes or blockers..."
              rows={2}
              value={formData.StudentRemarks}
              onChange={(e) => setFormData({ ...formData, StudentRemarks: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate('/tasks')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Task
            </Button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={apiModal.isOpen}
        onClose={closeApiModal}
        title={apiModal.title}
      >
        <div className="space-y-4 text-center font-sans">
          <p className="text-sm font-semibold text-gray-800">{apiModal.message}</p>
          {Array.isArray(apiModal.details) && apiModal.details.length > 0 && (
            <div className="text-left bg-red-50 p-3 rounded-xl border border-red-100 text-xs text-red-700 space-y-1.5 max-h-48 overflow-y-auto">
              <p className="font-bold text-red-800 text-[11px] uppercase tracking-wider border-b border-red-100 pb-1">Validation Errors:</p>
              {apiModal.details.map((err, idx) => (
                <div key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="font-bold text-red-500">•</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-2 font-sans">
            <Button onClick={closeApiModal}>
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

