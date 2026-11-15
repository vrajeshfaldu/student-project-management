// src/helpers.js
// Simple, beginner-friendly Helpers and Utilities
import { jwtDecode } from 'jwt-decode';

export const API_BASE_URL = 'https://localhost:7283/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('spm_token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const parseJwtToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const decoded = jwtDecode(token);
    const rawRole =
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      decoded['role'] ||
      decoded['Role'] ||
      decoded['UserTypeName'] ||
      '';

    let role = 'Student';
    const lower = (rawRole || '').toLowerCase();
    if (lower.includes('admin')) {
      role = 'Admin';
    } else if (lower.includes('faculty') || lower.includes('guide') || lower.includes('teacher')) {
      role = 'Faculty';
    } else if (lower.includes('student')) {
      role = 'Student';
    } else if (rawRole) {
      role = rawRole;
    }

    const userId =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      decoded['nameid'] ||
      decoded['UserID'] ||
      decoded['userId'] ||
      1;

    const email =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      decoded['email'] ||
      decoded['Email'] ||
      '';

    const exp = decoded.exp ? Number(decoded.exp) : null;
    const isExpired = exp ? Date.now() >= exp * 1000 : false;

    return {
      role,
      userId: Number(userId),
      email,
      exp,
      isExpired
    };
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  const parsed = parseJwtToken(token);
  if (!parsed) return true;
  return parsed.isExpired;
};

// --- 1. LOCAL STORAGE HELPER ---
const STORAGE_KEYS = {
  ROLES: 'spm_roles',
  USER_TYPES: 'spm_user_types',
  USERS: 'spm_users',
  USER_ROLES: 'spm_user_roles',
  TASK_STATUSES: 'spm_task_statuses',
  TASK_PRIORITIES: 'spm_task_priorities',
  PROJECT_MASTERS: 'spm_project_masters',
  PROJECT_ALLOCATIONS: 'spm_project_allocations',
  TASKS: 'spm_tasks',
  AUTH_TOKEN: 'spm_token',
  AUTH_ROLE: 'spm_role',
  AUTH_USER: 'spm_current_user'
};

export const deduplicateArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  const clean = [];

  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;

    const itemKeys = [];

    // 1. RoleUser / RolePermission
    if (item.RoleUserID || item.roleUserID || item.RolePermissionID || item.rolePermissionID) {
      const ruid = Number(item.RoleUserID || item.roleUserID || item.RolePermissionID || item.rolePermissionID || 0);
      if (ruid > 0) itemKeys.push(`roleuser:${ruid}`);
    }

    // 2. ProjectAllocation / Allocation
    if (item.ProjectAllocationID || item.projectAllocationID || item.AllocationID || item.allocationID) {
      const aid = Number(item.ProjectAllocationID || item.projectAllocationID || item.AllocationID || item.allocationID || 0);
      if (aid > 0) itemKeys.push(`allocation:${aid}`);
    }

    // 3. Task
    if (item.TaskID || item.taskID) {
      const tid = Number(item.TaskID || item.taskID || 0);
      if (tid > 0) itemKeys.push(`task:${tid}`);
    }

    // 4. User (Check user ID, user code, and email)
    const hasUserProps = Boolean(
      item.UserCode || item.userCode ||
      item.Email || item.email ||
      item.FullName || item.fullName ||
      item.MobileNumber || item.mobileNumber
    );
    const uid = Number(item.UserID || item.userID || (hasUserProps ? (item.Id || item.id) : 0) || 0);
    const code = (item.UserCode || item.userCode || '').toString().toLowerCase().trim();
    const email = (item.Email || item.email || '').toString().toLowerCase().trim();

    if (uid > 0 || code || email) {
      if (uid > 0) itemKeys.push(`user:${uid}`);
      if (code) itemKeys.push(`usercode:${code}`);
      if (email) itemKeys.push(`useremail:${email}`);
    }

    // 5. ProjectMaster / Project
    if (item.ProjectMasterID || item.projectMasterID) {
      const pmid = Number(item.ProjectMasterID || item.projectMasterID || 0);
      if (pmid > 0) itemKeys.push(`projectmaster:${pmid}`);
    }
    if (item.ProjectTitle && (item.ProjectID || item.projectID)) {
      const pid = Number(item.ProjectID || item.projectID || 0);
      if (pid > 0) itemKeys.push(`project:${pid}`);
    }

    // 6. TaskStatus
    if (item.TaskStatusName && (item.TaskStatusID || item.taskStatusID)) {
      const sid = Number(item.TaskStatusID || item.taskStatusID || 0);
      if (sid > 0) itemKeys.push(`status:${sid}`);
    }

    // 7. TaskPriority
    if (item.TaskPriorityName && (item.TaskPriorityID || item.taskPriorityID)) {
      const prid = Number(item.TaskPriorityID || item.taskPriorityID || 0);
      if (prid > 0) itemKeys.push(`priority:${prid}`);
    }

    // 8. UserType
    if (item.UserTypeName && (item.UserTypeID || item.userTypeID)) {
      const utid = Number(item.UserTypeID || item.userTypeID || 0);
      if (utid > 0) itemKeys.push(`usertype:${utid}`);
    }

    // 9. Role
    if (item.RoleName && (item.RoleID || item.roleID)) {
      const rid = Number(item.RoleID || item.roleID || 0);
      if (rid > 0) itemKeys.push(`role:${rid}`);
    }

    // Fallback generic ID
    if (itemKeys.length === 0) {
      const genId = Number(item.Id || item.id || 0);
      if (genId > 0) itemKeys.push(`id:${genId}`);
    }

    if (itemKeys.length > 0) {
      const isDuplicate = itemKeys.some((k) => seen.has(k));
      if (!isDuplicate) {
        itemKeys.forEach((k) => seen.add(k));
        clean.push(item);
      }
    } else {
      clean.push(item);
    }
  }

  return clean;
};

const getStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return [];
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? deduplicateArray(parsed) : [];
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return [];
  }
};

const setStorage = (key, data) => {
  try {
    const cleanData = Array.isArray(data) ? deduplicateArray(data) : data;
    localStorage.setItem(key, JSON.stringify(cleanData));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
};

export const extractApiArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.Data)) return res.Data;
  if (Array.isArray(res.result)) return res.result;
  if (Array.isArray(res.Result)) return res.Result;
  if (Array.isArray(res.value)) return res.value;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.data?.data)) return res.data.data;
  if (Array.isArray(res.data?.items)) return res.data.items;
  if (Array.isArray(res.data?.projects)) return res.data.projects;
  if (Array.isArray(res.roles)) return res.roles;
  if (Array.isArray(res.userTypes)) return res.userTypes;
  if (Array.isArray(res.users)) return res.users;
  if (Array.isArray(res.userRoles)) return res.userRoles;
  if (Array.isArray(res.roleUsers)) return res.roleUsers;
  if (Array.isArray(res.taskStatuses)) return res.taskStatuses;
  if (Array.isArray(res.taskPriorities)) return res.taskPriorities;
  if (Array.isArray(res.projects)) return res.projects;
  if (Array.isArray(res.projectMasters)) return res.projectMasters;
  if (Array.isArray(res.allocations)) return res.allocations;
  if (Array.isArray(res.projectAllocations)) return res.projectAllocations;
  if (Array.isArray(res.tasks)) return res.tasks;
  return [];
};

export const fetchApiWithFallback = async (endpointUrls, options = {}) => {
  const headers = getAuthHeaders();
  const reqOptions = { headers, ...options };

  for (const url of endpointUrls) {
    try {
      const res = await fetch(url, reqOptions);
      if (res.ok) {
        const data = await res.json();
        const arr = extractApiArray(data);
        return { ok: true, data, arr, url };
      }
    } catch (err) {
      // If backend server is offline or connection refused, stop fallback loop to avoid console spam
      if (err instanceof TypeError || err.message?.includes('fetch') || err.name === 'TypeError') {
        break;
      }
    }
  }

  return { ok: false, data: null, arr: [], url: '' };
};

export const fetchProjectMastersApi = async () => {
  const endpoints = [
    `${API_BASE_URL}/ProjectMaster/GetAllProjectMasters`,
    `${API_BASE_URL}/ProjectMaster/GetAllProjects`,
    `${API_BASE_URL}/ProjectMaster/GetAll`,
    `${API_BASE_URL}/ProjectMaster`
  ];
  return fetchApiWithFallback(endpoints);
};

export const fetchProjectMasterByIdApi = async (id) => {
  const endpoints = [
    `${API_BASE_URL}/ProjectMaster/GetProjectMasterById/${id}`,
    `${API_BASE_URL}/ProjectMaster/GetProjectById/${id}`,
    `${API_BASE_URL}/ProjectMaster/GetById/${id}`,
    `${API_BASE_URL}/ProjectMaster/${id}`
  ];
  return fetchApiWithFallback(endpoints);
};

export const fetchProjectAllocationsApi = async () => {
  const endpoints = [
    `${API_BASE_URL}/ProjectAllocation/GetAllProjectAllocations`,
    `${API_BASE_URL}/ProjectAllocation/GetAll`,
    `${API_BASE_URL}/ProjectAllocation`
  ];
  return fetchApiWithFallback(endpoints);
};

export const fetchTasksApi = async () => {
  const endpoints = [
    `${API_BASE_URL}/Task/GetAllTasks`,
    `${API_BASE_URL}/Task/GetAll`,
    `${API_BASE_URL}/Task`
  ];
  return fetchApiWithFallback(endpoints);
};

export const normalizeProject = (p) => {
  if (!p) return null;
  const id = Number(p.ProjectID ?? p.projectID ?? p.ProjectMasterID ?? p.projectMasterID ?? p.Id ?? p.id ?? p.ID ?? 0);
  const title = p.ProjectTitle || p.projectTitle || p.Title || p.title || p.ProjectName || p.projectName || p.Topic || p.topic || p.ProjectTopic || p.projectTopic || p.Name || p.name || '';
  const description =
    p.Description ||
    p.description ||
    p.ProjectDescription ||
    p.projectDescription ||
    p.Details ||
    p.details ||
    p.ProjectDetails ||
    p.projectDetails ||
    p.Desc ||
    p.desc ||
    p.Scope ||
    p.scope ||
    '';
  const stuId = Number(p.StudentID ?? p.studentID ?? p.UserId ?? p.userId ?? 0);
  const facId = Number(p.FacultyID ?? p.facultyID ?? 0);
  return {
    ...p,
    ProjectID: id,
    projectID: id,
    ProjectTitle: title,
    projectTitle: title,
    Description: description,
    description: description,
    StudentID: stuId,
    studentID: stuId,
    FacultyID: facId,
    facultyID: facId
  };
};

export const normalizeAllocation = (a) => {
  if (!a) return null;
  const allocId = Number(a.ProjectAllocationID ?? a.projectAllocationID ?? a.AllocationID ?? a.allocationID ?? a.Id ?? a.id ?? 0);
  const projId = Number(a.ProjectID ?? a.projectID ?? a.ProjectMasterID ?? a.projectMasterID ?? 0);
  const stuId = Number(a.StudentID ?? a.studentID ?? a.UserId ?? a.userId ?? 0);
  const facId = Number(a.FacultyID ?? a.facultyID ?? 0);

  const projTitle = a.ProjectTitle || a.projectTitle || a.Title || a.title || a.Topic || a.topic || a.ProjectTopic || a.projectTopic || '';
  const description =
    a.Description ||
    a.description ||
    a.ProjectDescription ||
    a.projectDescription ||
    a.Details ||
    a.details ||
    a.ProjectDetails ||
    a.projectDetails ||
    '';
  const stuName = a.StudentName || a.studentName || a.FullName || a.fullName || '';
  const stuCode = a.StudentCode || a.studentCode || a.UserCode || a.userCode || '';
  const facName = a.FacultyName || a.facultyName || '';

  return {
    ...a,
    ProjectAllocationID: allocId,
    projectAllocationID: allocId,
    ProjectID: projId,
    projectID: projId,
    StudentID: stuId,
    studentID: stuId,
    FacultyID: facId,
    facultyID: facId,
    ProjectTitle: projTitle,
    projectTitle: projTitle,
    Description: description,
    description: description,
    StudentName: stuName,
    studentName: stuName,
    StudentCode: stuCode,
    studentCode: stuCode,
    FacultyName: facName,
    facultyName: facName,
    AssignedDate: a.AssignedDate || a.assignedDate || a.CreatedDate || a.createdDate,
    ProjectStartDate: a.ProjectStartDate || a.projectStartDate || a.StartDate || a.startDate,
    ProjectEndDate: a.ProjectEndDate || a.projectEndDate || a.EndDate || a.endDate,
    ProgressPercentage: Number(a.ProgressPercentage ?? a.progressPercentage ?? a.Progress ?? a.progress ?? 0),
    OverAllGrade: a.OverAllGrade || a.overAllGrade || a.Grade || a.grade || 'Pending'
  };
};

export const normalizeTask = (t) => {
  if (!t) return null;
  const taskId = Number(t.TaskID ?? t.taskID ?? t.Id ?? t.id ?? 0);
  const allocId = Number(t.ProjectAllocationID ?? t.projectAllocationID ?? t.AllocationID ?? t.allocationID ?? 0);
  const projId = Number(t.ProjectID ?? t.projectID ?? 0);
  const stuId = Number(t.StudentID ?? t.studentID ?? 0);
  const facId = Number(t.FacultyID ?? t.facultyID ?? 0);

  const title = t.TaskTitle || t.taskTitle || t.Title || t.title || `Task #${taskId}`;
  const desc = t.TaskDescription || t.taskDescription || t.Description || t.description || '';
  const statusId = Number(t.TaskStatusID ?? t.taskStatusID ?? t.StatusID ?? t.statusID ?? 1);
  const priorityId = Number(t.TaskPriorityID ?? t.taskPriorityID ?? t.PriorityID ?? t.priorityID ?? 1);

  return {
    ...t,
    TaskID: taskId,
    taskID: taskId,
    ProjectAllocationID: allocId,
    projectAllocationID: allocId,
    ProjectID: projId,
    projectID: projId,
    StudentID: stuId,
    studentID: stuId,
    FacultyID: facId,
    facultyID: facId,
    TaskTitle: title,
    taskTitle: title,
    TaskDescription: desc,
    taskDescription: desc,
    TaskStatusID: statusId,
    taskStatusID: statusId,
    TaskPriorityID: priorityId,
    taskPriorityID: priorityId,
    AssignedScore: Number(t.AssignedScore ?? t.assignedScore ?? 100),
    EarnedScore: Number(t.EarnedScore ?? t.earnedScore ?? 0),
    ProgressPercentage: Number(t.ProgressPercentage ?? t.progressPercentage ?? 0),
    TaskDueDate: t.TaskDueDate || t.taskDueDate || t.DueDate || t.dueDate,
    FacultyRemarks: t.FacultyRemarks || t.facultyRemarks || t.Remarks || t.remarks || ''
  };
};

export const getUserAllocations = (user, role, allocations = []) => {
  const safeAllocations = extractApiArray(allocations).map(normalizeAllocation).filter(Boolean);
  if (!user || role === 'Admin') return safeAllocations;

  const currentUserId = Number(user.UserID || user.userID || user.id || user.Id || 0);
  const userEmail = (user.Email || user.email || '').toLowerCase().trim();
  const userName = (user.FullName || user.fullName || user.Name || user.name || user.Username || user.username || '').toLowerCase().trim();
  const userCode = (user.UserCode || user.userCode || '').toLowerCase().trim();
  const userFirstName = userName.split(' ')[0] || userEmail.split('@')[0] || '';

  if (role === 'Student') {
    const matched = safeAllocations.filter((a) => {
      const stuId = Number(a.StudentID || a.studentID || a.UserId || a.userId || 0);
      if (currentUserId && stuId === currentUserId) return true;

      const stuCode = (a.StudentCode || a.studentCode || a.UserCode || a.userCode || '').toLowerCase().trim();
      if (userCode && stuCode && userCode === stuCode) return true;

      const stuEmail = (a.StudentEmail || a.studentEmail || a.Email || a.email || '').toLowerCase().trim();
      if (userEmail && stuEmail && (userEmail === stuEmail || userEmail.includes(stuEmail) || stuEmail.includes(userEmail))) return true;

      const stuName = (a.StudentName || a.studentName || a.FullName || a.fullName || '').toLowerCase().trim();
      if (userName && stuName && (userName === stuName || stuName.includes(userName) || userName.includes(stuName))) return true;
      if (userFirstName && userFirstName.length >= 3 && (stuName.includes(userFirstName) || stuEmail.includes(userFirstName))) return true;

      return false;
    });

    return matched;
  }

  if (role === 'Faculty') {
    const matched = safeAllocations.filter((a) => {
      const facId = Number(a.FacultyID || a.facultyID || a.UserId || a.userId || 0);
      if (currentUserId && facId === currentUserId) return true;

      const facCode = (a.FacultyCode || a.facultyCode || a.UserCode || a.userCode || '').toLowerCase().trim();
      if (userCode && facCode && userCode === facCode) return true;

      const facEmail = (a.FacultyEmail || a.facultyEmail || a.Email || a.email || '').toLowerCase().trim();
      if (userEmail && facEmail && (userEmail === facEmail || userEmail.includes(facEmail) || facEmail.includes(userEmail))) return true;

      const facName = (a.FacultyName || a.facultyName || a.FullName || a.fullName || '').toLowerCase().trim();
      if (userName && facName && (userName === facName || facName.includes(userName) || userName.includes(facName))) return true;
      if (userFirstName && userFirstName.length >= 3 && (facName.includes(userFirstName) || facEmail.includes(userFirstName))) return true;

      return false;
    });

    return matched;
  }

  return safeAllocations;
};

export const storage = {
  // Auth Storage
  getAuthToken: () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  getAuthRole: () => localStorage.getItem(STORAGE_KEYS.AUTH_ROLE),
  getAuthUser: () => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
  setAuth: (token, role, user) => {
    if (token) localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    if (role) localStorage.setItem(STORAGE_KEYS.AUTH_ROLE, role);
    if (user) localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_ROLE);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  // Entity Local Storage
  getRoles: () => getStorage(STORAGE_KEYS.ROLES),
  setRoles: (roles) => setStorage(STORAGE_KEYS.ROLES, roles),

  getUserTypes: () => getStorage(STORAGE_KEYS.USER_TYPES),
  setUserTypes: (types) => setStorage(STORAGE_KEYS.USER_TYPES, types),

  getUsers: () => getStorage(STORAGE_KEYS.USERS),
  setUsers: (users) => setStorage(STORAGE_KEYS.USERS, users),

  getUserRoles: () => getStorage(STORAGE_KEYS.USER_ROLES),
  setUserRoles: (userRoles) => setStorage(STORAGE_KEYS.USER_ROLES, userRoles),

  getTaskStatuses: () => getStorage(STORAGE_KEYS.TASK_STATUSES),
  setTaskStatuses: (statuses) => setStorage(STORAGE_KEYS.TASK_STATUSES, statuses),

  getTaskPriorities: () => getStorage(STORAGE_KEYS.TASK_PRIORITIES),
  setTaskPriorities: (priorities) => setStorage(STORAGE_KEYS.TASK_PRIORITIES, priorities),

  getProjectMasters: () => getStorage(STORAGE_KEYS.PROJECT_MASTERS),
  setProjectMasters: (projects) => setStorage(STORAGE_KEYS.PROJECT_MASTERS, projects),

  getProjectAllocations: () => getStorage(STORAGE_KEYS.PROJECT_ALLOCATIONS),
  setProjectAllocations: (allocations) => setStorage(STORAGE_KEYS.PROJECT_ALLOCATIONS, allocations),

  getTasks: () => getStorage(STORAGE_KEYS.TASKS),
  setTasks: (tasks) => setStorage(STORAGE_KEYS.TASKS, tasks),

  resetAll: () => {
    localStorage.removeItem(STORAGE_KEYS.ROLES);
    localStorage.removeItem(STORAGE_KEYS.USER_TYPES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLES);
    localStorage.removeItem(STORAGE_KEYS.TASK_STATUSES);
    localStorage.removeItem(STORAGE_KEYS.TASK_PRIORITIES);
    localStorage.removeItem(STORAGE_KEYS.PROJECT_MASTERS);
    localStorage.removeItem(STORAGE_KEYS.PROJECT_ALLOCATIONS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
  }
};

// --- 2. FORMATTERS ---
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// --- 3. EXPORT HELPERS ---
export const exportToCSV = (filename, rows, headers) => {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(headers);
  const csvContent =
    Object.values(headers).join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const printReport = () => {
  window.print();
};

// --- 4. API RESPONSE PARSER (Backend Common Response & FluentValidation) ---
export const parseApiResponse = (resData) => {
  if (!resData) {
    return {
      title: 'API Response',
      message: '',
      details: []
    };
  }

  if (typeof resData === 'string') {
    return {
      title: 'API Response',
      message: resData,
      details: []
    };
  }

  const isSuccess = resData.success !== undefined ? Boolean(resData.success) : true;
  const rawTitle = resData.title || resData.Title;
  const rawMessage = resData.message || resData.Message;

  const title = rawTitle || (isSuccess ? 'Success' : 'Validation Failed');
  const message = rawMessage || '';
  const details = [];

  const rawErrors =
    resData.error ||
    resData.Error ||
    resData.errors ||
    resData.Errors ||
    resData.data?.error ||
    resData.data?.errors;

  if (Array.isArray(rawErrors)) {
    rawErrors.forEach((err) => {
      if (typeof err === 'string') {
        details.push(err);
      } else if (err && typeof err === 'object') {
        const prop = err.propertyName || err.PropertyName || err.field || err.Field || err.property || '';
        const msg = err.errorMessage || err.ErrorMessage || err.message || err.Message || err.error || '';
        if (prop && msg) {
          details.push(`${prop}: ${msg}`);
        } else if (msg) {
          details.push(msg);
        } else if (prop) {
          details.push(prop);
        }
      }
    });
  } else if (rawErrors && typeof rawErrors === 'object') {
    Object.entries(rawErrors).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((msg) => details.push(`${key}: ${msg}`));
      } else if (typeof val === 'string') {
        details.push(`${key}: ${val}`);
      }
    });
  } else if (typeof rawErrors === 'string' && rawErrors.trim()) {
    details.push(rawErrors);
  }

  return { title, message, details };
};

export const getFullStatusCssClass = (rawCss, statusName = '') => {
  const css = (rawCss || '').trim();
  const name = (statusName || '').toLowerCase();

  if (css === 'bg-amber-50 text-amb' || name.includes('pending') || name.includes('todo')) {
    return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
  }
  if (css === 'bg-blue-50 text-blu' || name.includes('progress') || name.includes('ongoing')) {
    return 'bg-blue-100 text-blue-700 border border-blue-300';
  }
  if (css === 'bg-emerald-50 text-e' || name.includes('complete') || name.includes('done')) {
    return 'bg-green-100 text-green-700 border border-green-300';
  }
  if (name.includes('hold')) {
    return 'bg-orange-100 text-orange-700 border border-orange-300';
  }
  if (name.includes('cancel')) {
    return 'bg-red-100 text-red-700 border border-red-300';
  }

  let full = css;
  if (css.endsWith('text-amb')) full = css.replace('text-amb', 'text-yellow-700 border border-yellow-300');
  else if (css.endsWith('text-blu')) full = css.replace('text-blu', 'text-blue-700 border border-blue-300');
  else if (css.endsWith('text-e')) full = css.replace('text-e', 'text-green-700 border border-green-300');

  return full || 'bg-gray-100 text-gray-700 border border-gray-300';
};

export const getFullPriorityCssClass = (rawCss, priorityName = '') => {
  const css = (rawCss || '').trim();
  const name = (priorityName || '').toLowerCase();

  if (css === 'bg-gray-100 text-gra' || name.includes('low') || css === 'bg-gray-100') {
    return 'bg-gray-100 text-gray-700 border border-gray-300';
  }
  if (css === 'bg-yellow-100 text-y' || name.includes('medium') || name.includes('moderate')) {
    return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
  }
  if (css === 'bg-orange-100 text-o' || name.includes('high')) {
    return 'bg-orange-100 text-orange-700 border border-orange-300';
  }
  if (css === 'bg-red-100 text-red-' || name.includes('critical') || name.includes('urgent')) {
    return 'bg-red-100 text-red-700 border border-red-300';
  }

  let full = css;
  if (css.endsWith('text-gra')) full = css.replace('text-gra', 'text-gray-700 border border-gray-300');
  else if (css.endsWith('text-y')) full = css.replace('text-y', 'text-yellow-700 border border-yellow-300');
  else if (css.endsWith('text-o')) full = css.replace('text-o', 'text-orange-700 border border-orange-300');
  else if (css.endsWith('text-red-')) full = css.replace('text-red-', 'text-red-700 border border-red-300');

  return full || 'bg-gray-100 text-gray-700 border border-gray-300';
};



