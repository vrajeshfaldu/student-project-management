// Student Project Management - Dynamic Dashboard UI
const CONFIG = {
    endpoints: {
        User: '/api/User/GetAllUsers',
        UserType: '/api/UserType/GetAllUserTypes',
        Role: '/api/Role/GetAllRoles',
        UserRole: '/api/UserRole/GetAllUserRoles',
        ProjectMaster: '/api/ProjectMaster/GetAllProjects',
        ProjectAllocation: '/api/ProjectAllocation/GetAllProjectAllocations',
        Task: '/api/Task/GetAllTasks',
        TaskStatus: '/api/TaskStatus/GetAllTaskStatuses',
        TaskPriority: '/api/TaskPriority/GetAllTaskPriorities',
        Login: '/api/Auth/login'
    },
    meta: {
        User: { title: '👥 Users', subtitle: 'Manage registered students, faculty, and administrators with UserType filtering' },
        UserType: { title: '🏷️ User Types', subtitle: 'Define system user categories (e.g. Student, Faculty, Admin)' },
        Role: { title: '🛡️ Roles', subtitle: 'Manage application permissions and access levels' },
        UserRole: { title: '🔗 User Roles', subtitle: 'Role assignments mapping users to roles' },
        ProjectMaster: { title: '📊 Project Master', subtitle: 'Overview of all academic projects and descriptions' },
        ProjectAllocation: { title: '📌 Project Allocations', subtitle: 'Assigned student & faculty project allocations, grades, and progress' },
        Task: { title: '📝 Tasks', subtitle: 'Project tasks, deadlines, priorities, scores, and status' },
        TaskStatus: { title: '🚦 Task Statuses', subtitle: 'Task workflow statuses (e.g., Pending, In Progress, Completed)' },
        TaskPriority: { title: '⚡ Task Priorities', subtitle: 'Task urgency levels (e.g., High, Medium, Low)' }
    }
};

// Application State
const state = {
    currentEntity: 'User',
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    userTypeId: '',
    token: localStorage.getItem('jwt_token') || '',
    userTypesList: []
};

// DOM Elements
const dom = {
    tableTabs: document.getElementById('tableTabs'),
    tableTitle: document.getElementById('tableTitle'),
    tableSubtitle: document.getElementById('tableSubtitle'),
    filterToolbar: document.getElementById('filterToolbar'),
    userTypeFilter: document.getElementById('userTypeFilter'),
    applyFilterBtn: document.getElementById('applyFilterBtn'),
    clearFilterBtn: document.getElementById('clearFilterBtn'),
    activeFilterBadge: document.getElementById('activeFilterBadge'),
    activeFilterName: document.getElementById('activeFilterName'),
    tableContainer: document.getElementById('tableContainer'),
    pageInfoText: document.getElementById('pageInfoText'),
    pageSizeSelect: document.getElementById('pageSizeSelect'),
    paginationControls: document.getElementById('paginationControls'),
    refreshBtn: document.getElementById('refreshBtn'),
    authBadge: document.getElementById('authBadge'),
    authText: document.getElementById('authText'),
    authModalBtn: document.getElementById('authModalBtn'),
    authModal: document.getElementById('authModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    manualTokenInput: document.getElementById('manualTokenInput'),
    saveTokenBtn: document.getElementById('saveTokenBtn'),
    clearTokenBtn: document.getElementById('clearTokenBtn'),
    toastContainer: document.getElementById('toastContainer')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    bindEvents();
    loadUserTypes();
    fetchCurrentEntityData();
});

// Bind Event Listeners
function bindEvents() {
    // Tabs Navigation
    dom.tableTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        const entity = btn.dataset.entity;
        if (entity === state.currentEntity) return;

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.currentEntity = entity;
        state.pageNumber = 1;
        updateHeaderAndToolbar();
        fetchCurrentEntityData();
    });

    // Page Size Change
    dom.pageSizeSelect.addEventListener('change', (e) => {
        state.pageSize = parseInt(e.target.value, 10);
        state.pageNumber = 1;
        fetchCurrentEntityData();
    });

    // Refresh Button
    dom.refreshBtn.addEventListener('click', () => {
        fetchCurrentEntityData(true);
    });

    // User Type Filter Button
    dom.applyFilterBtn.addEventListener('click', () => {
        state.userTypeId = dom.userTypeFilter.value;
        state.pageNumber = 1;
        updateFilterBadge();
        fetchCurrentEntityData();
    });

    // Clear Filter Button
    dom.clearFilterBtn.addEventListener('click', () => {
        dom.userTypeFilter.value = '';
        state.userTypeId = '';
        state.pageNumber = 1;
        updateFilterBadge();
        fetchCurrentEntityData();
    });

    // Auth Modal
    dom.authModalBtn.addEventListener('click', openAuthModal);
    dom.modalCloseBtn.addEventListener('click', closeAuthModal);
    dom.authModal.addEventListener('click', (e) => {
        if (e.target === dom.authModal) closeAuthModal();
    });

    // Login Form Submit
    dom.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = dom.loginEmail.value.trim();
        const password = dom.loginPassword.value.trim();
        if (!email || !password) {
            showToast('Please enter email and password.', 'error');
            return;
        }

        try {
            const res = await fetch(CONFIG.endpoints.Login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const errData = await res.text();
                showToast(errData || 'Login failed.', 'error');
                return;
            }

            const data = await res.json();
            if (data.token) {
                setToken(data.token);
                closeAuthModal();
                showToast('Authentication successful!', 'success');
                loadUserTypes();
                fetchCurrentEntityData();
            } else {
                showToast('No token returned from server.', 'error');
            }
        } catch (err) {
            showToast('Error connecting to login endpoint: ' + err.message, 'error');
        }
    });

    // Save Manual Token
    dom.saveTokenBtn.addEventListener('click', () => {
        const token = dom.manualTokenInput.value.trim();
        if (!token) {
            showToast('Please paste a valid JWT token.', 'error');
            return;
        }
        setToken(token);
        closeAuthModal();
        showToast('JWT Token saved successfully.', 'success');
        loadUserTypes();
        fetchCurrentEntityData();
    });

    // Clear Token
    dom.clearTokenBtn.addEventListener('click', () => {
        clearToken();
        closeAuthModal();
        showToast('Logged out / Token cleared.', 'success');
        fetchCurrentEntityData();
    });
}

// Update Header Titles and Filter Visibility
function updateHeaderAndToolbar() {
    const meta = CONFIG.meta[state.currentEntity] || { title: state.currentEntity, subtitle: '' };
    dom.tableTitle.textContent = meta.title;
    dom.tableSubtitle.textContent = meta.subtitle;

    if (state.currentEntity === 'User') {
        dom.filterToolbar.style.display = 'flex';
        updateFilterBadge();
    } else {
        dom.filterToolbar.style.display = 'none';
    }
}

// Update Filter Active Badge
function updateFilterBadge() {
    if (state.userTypeId) {
        const selectedOption = dom.userTypeFilter.options[dom.userTypeFilter.selectedIndex];
        const typeName = selectedOption ? selectedOption.text : `Type #${state.userTypeId}`;
        dom.activeFilterName.textContent = typeName;
        dom.activeFilterBadge.style.display = 'inline-flex';
        dom.clearFilterBtn.style.display = 'inline-flex';
    } else {
        dom.activeFilterBadge.style.display = 'none';
        dom.clearFilterBtn.style.display = 'none';
    }
}

// Load User Types for Filter Dropdown
async function loadUserTypes() {
    try {
        const headers = getHeaders();
        const res = await fetch(`${CONFIG.endpoints.UserType}?pageNumber=1&pageSize=100`, { headers });
        if (res.ok) {
            const data = await res.json();
            const items = data.data?.items || data.data || [];
            state.userTypesList = items;
            populateUserTypeDropdown(items);
        }
    } catch {
        // Fallback default options
        populateUserTypeDropdown([
            { userTypeID: 1, userTypeName: 'Admin' },
            { userTypeID: 2, userTypeName: 'Faculty' },
            { userTypeID: 3, userTypeName: 'Student' }
        ]);
    }
}

function populateUserTypeDropdown(types) {
    const currentVal = dom.userTypeFilter.value;
    dom.userTypeFilter.innerHTML = '<option value="">All User Types</option>';
    types.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.userTypeID;
        opt.textContent = t.userTypeName || `Type #${t.userTypeID}`;
        dom.userTypeFilter.appendChild(opt);
    });
    if (currentVal) dom.userTypeFilter.value = currentVal;
}

// Fetch Current Entity Data
async function fetchCurrentEntityData(isManualRefresh = false) {
    renderLoading();

    const baseUrl = CONFIG.endpoints[state.currentEntity];
    if (!baseUrl) {
        renderError('Unknown table endpoint.');
        return;
    }

    let url = `${baseUrl}?pageNumber=${state.pageNumber}&pageSize=${state.pageSize}`;

    // Apply UserType filter when on User table
    if (state.currentEntity === 'User' && state.userTypeId) {
        url += `&userTypeId=${encodeURIComponent(state.userTypeId)}`;
    }

    try {
        const res = await fetch(url, { headers: getHeaders() });

        if (res.status === 401) {
            renderUnauthorized();
            return;
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: res.statusText }));
            renderError(err.message || 'Failed to fetch data.');
            return;
        }

        const json = await res.json();
        const data = json.data;

        if (data && typeof data === 'object' && Array.isArray(data.items)) {
            state.totalCount = data.totalCount ?? data.items.length;
            state.totalPages = data.totalPages ?? 1;
            state.pageNumber = data.pageNumber ?? state.pageNumber;
            renderTable(data.items);
            renderPagination();
        } else if (Array.isArray(data)) {
            // Non-paginated fallback
            state.totalCount = data.length;
            state.totalPages = 1;
            renderTable(data);
            renderPagination();
        } else {
            renderEmpty();
        }

        if (isManualRefresh) {
            showToast(`${state.currentEntity} records refreshed.`, 'success');
        }
    } catch (err) {
        renderError('Network error: ' + err.message);
    }
}

// Table Rendering Engine
function renderTable(items) {
    if (!items || items.length === 0) {
        renderEmpty();
        return;
    }

    const columns = getColumnsForEntity(state.currentEntity);
    let html = `
        <table>
            <thead>
                <tr>
                    ${columns.map(c => `<th>${c.label}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${items.map(row => `
                    <tr>
                        ${columns.map(c => `<td>${c.render(row)}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    dom.tableContainer.innerHTML = html;
}

// Column Definitions for each Entity
function getColumnsForEntity(entity) {
    switch (entity) {
        case 'User':
            return [
                { label: 'ID', render: r => `<strong>#${r.userID}</strong>` },
                { label: 'User Code', render: r => r.userCode ? `<span class="badge badge-info">${escapeHtml(r.userCode)}</span>` : '-' },
                { label: 'Full Name', render: r => `<strong>${escapeHtml(r.fullName)}</strong>` },
                { label: 'Email', render: r => `<span style="color: #c7d2fe;">${escapeHtml(r.email)}</span>` },
                { label: 'Mobile', render: r => escapeHtml(r.mobileNumber || '-') },
                { label: 'User Type', render: r => `<span class="badge badge-primary">${escapeHtml(r.userTypeName || 'Type ' + r.userTypeID)}</span>` },
                { label: 'Status', render: r => r.isActive ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>' }
            ];

        case 'UserType':
            return [
                { label: 'ID', render: r => `<strong>#${r.userTypeID}</strong>` },
                { label: 'User Type Name', render: r => `<span class="badge badge-primary">${escapeHtml(r.userTypeName)}</span>` },
                { label: 'Description', render: r => escapeHtml(r.description || '-') }
            ];

        case 'Role':
            return [
                { label: 'ID', render: r => `<strong>#${r.roleID}</strong>` },
                { label: 'Role Name', render: r => `<span class="badge badge-info">${escapeHtml(r.roleName)}</span>` },
                { label: 'Description', render: r => escapeHtml(r.description || '-') }
            ];

        case 'UserRole':
            return [
                { label: 'Permission ID', render: r => `<strong>#${r.rolePermissionID}</strong>` },
                { label: 'User ID', render: r => `#${r.userID}` },
                { label: 'User Name', render: r => `<strong>${escapeHtml(r.userName || '-')}</strong>` },
                { label: 'Role ID', render: r => `#${r.roleID}` },
                { label: 'Role Name', render: r => `<span class="badge badge-primary">${escapeHtml(r.roleName || '-')}</span>` }
            ];

        case 'ProjectMaster':
            return [
                { label: 'Project ID', render: r => `<strong>#${r.projectID}</strong>` },
                { label: 'Project Title', render: r => `<strong>${escapeHtml(r.projectTitle)}</strong>` },
                { label: 'Description', render: r => escapeHtml(r.description || '-') }
            ];

        case 'ProjectAllocation':
            return [
                { label: 'Allocation ID', render: r => `<strong>#${r.projectAllocationID}</strong>` },
                { label: 'Project', render: r => `<strong>${escapeHtml(r.projectTitle || 'Project #' + r.projectID)}</strong>` },
                { label: 'Student', render: r => escapeHtml(r.studentName || 'Student #' + r.studentID) },
                { label: 'Faculty', render: r => escapeHtml(r.facultyName || 'Faculty #' + r.facultyID) },
                { label: 'Start Date', render: r => formatDate(r.projectStartDate) },
                { label: 'End Date', render: r => formatDate(r.projectEndDate) },
                { label: 'Progress', render: r => `<span class="badge badge-info">${r.progressPercentage}%</span>` },
                { label: 'Grade', render: r => r.overAllGrade ? `<span class="badge badge-success">${r.overAllGrade}</span>` : '-' }
            ];

        case 'Task':
            return [
                { label: 'Task ID', render: r => `<strong>#${r.taskID}</strong>` },
                { label: 'Title', render: r => `<strong>${escapeHtml(r.taskTitle)}</strong>` },
                { label: 'Project', render: r => escapeHtml(r.projectTitle || 'Allocation #' + r.projectAllocationID) },
                { label: 'Status', render: r => `<span class="badge badge-info">${escapeHtml(r.taskStatusName || 'Status #' + r.taskStatusID)}</span>` },
                { label: 'Priority', render: r => `<span class="badge badge-primary">${escapeHtml(r.taskPriorityName || 'Priority #' + r.taskPriorityID)}</span>` },
                { label: 'Progress', render: r => `${r.progressPercentage}%` },
                { label: 'Score', render: r => `${r.earnedScore ?? '-'}/${r.assignedScore}` },
                { label: 'Due Date', render: r => formatDate(r.taskDueDate) }
            ];

        case 'TaskStatus':
            return [
                { label: 'ID', render: r => `<strong>#${r.taskStatusID}</strong>` },
                { label: 'Status Name', render: r => `<span class="badge badge-primary">${escapeHtml(r.taskStatusName)}</span>` },
                { label: 'CSS Class', render: r => `<code>${escapeHtml(r.taskStatusCssClass || '-')}</code>` }
            ];

        case 'TaskPriority':
            return [
                { label: 'ID', render: r => `<strong>#${r.taskPriorityID}</strong>` },
                { label: 'Priority Name', render: r => `<span class="badge badge-primary">${escapeHtml(r.taskPriorityName)}</span>` },
                { label: 'CSS Class', render: r => `<code>${escapeHtml(r.taskPriorityCssClass || '-')}</code>` }
            ];

        default:
            return [{ label: 'Data', render: r => JSON.stringify(r) }];
    }
}

// Render Universal Pagination Controls
function renderPagination() {
    const { pageNumber, pageSize, totalCount, totalPages } = state;

    if (totalCount === 0) {
        dom.pageInfoText.textContent = 'Showing 0 of 0 entries';
        dom.paginationControls.innerHTML = '';
        return;
    }

    const startItem = (pageNumber - 1) * pageSize + 1;
    const endItem = Math.min(pageNumber * pageSize, totalCount);
    dom.pageInfoText.textContent = `Showing ${startItem} to ${endItem} of ${totalCount} entries`;

    let buttonsHtml = '';

    // First & Previous Buttons
    buttonsHtml += `
        <button class="page-btn" ${pageNumber <= 1 ? 'disabled' : ''} onclick="goToPage(1)" title="First Page">«</button>
        <button class="page-btn" ${pageNumber <= 1 ? 'disabled' : ''} onclick="goToPage(${pageNumber - 1})" title="Previous Page">‹</button>
    `;

    // Numeric Page Buttons with windowing
    const maxVisible = 5;
    let startPage = Math.max(1, pageNumber - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        buttonsHtml += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            buttonsHtml += `<span style="padding: 0 0.3rem; color: var(--text-muted);">…</span>`;
        }
    }

    for (let p = startPage; p <= endPage; p++) {
        buttonsHtml += `
            <button class="page-btn ${p === pageNumber ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            buttonsHtml += `<span style="padding: 0 0.3rem; color: var(--text-muted);">…</span>`;
        }
        buttonsHtml += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Next & Last Buttons
    buttonsHtml += `
        <button class="page-btn" ${pageNumber >= totalPages ? 'disabled' : ''} onclick="goToPage(${pageNumber + 1})" title="Next Page">›</button>
        <button class="page-btn" ${pageNumber >= totalPages ? 'disabled' : ''} onclick="goToPage(${totalPages})" title="Last Page">»</button>
    `;

    dom.paginationControls.innerHTML = buttonsHtml;
}

// Global Page Navigation handler
window.goToPage = function(pageNum) {
    if (pageNum < 1 || pageNum > state.totalPages || pageNum === state.pageNumber) return;
    state.pageNumber = pageNum;
    fetchCurrentEntityData();
};

// UI State Messages
function renderLoading() {
    dom.tableContainer.innerHTML = `
        <div class="state-container">
            <div class="spinner"></div>
            <p>Loading ${state.currentEntity} records...</p>
        </div>
    `;
}

function renderEmpty() {
    dom.tableContainer.innerHTML = `
        <div class="state-container">
            <div class="icon">📭</div>
            <p>No records found.</p>
        </div>
    `;
    dom.pageInfoText.textContent = 'Showing 0 of 0 entries';
    dom.paginationControls.innerHTML = '';
}

function renderError(msg) {
    dom.tableContainer.innerHTML = `
        <div class="state-container">
            <div class="icon">⚠️</div>
            <p style="color: var(--danger); font-weight: 600;">Failed to load data</p>
            <p style="font-size: 0.8rem; margin-top: 0.25rem;">${escapeHtml(msg)}</p>
        </div>
    `;
}

function renderUnauthorized() {
    dom.tableContainer.innerHTML = `
        <div class="state-container">
            <div class="icon">🔒</div>
            <p style="color: var(--warning); font-weight: 600;">Authorization Required</p>
            <p style="font-size: 0.85rem; margin-top: 0.25rem; max-width: 400px;">
                This endpoint requires an authenticated token (Role: Admin / Faculty / Student).
            </p>
            <button class="btn btn-primary" onclick="openAuthModal()" style="margin-top: 1rem;">
                🔑 Login or Set Bearer Token
            </button>
        </div>
    `;
}

// Auth Helpers
function initAuthUI() {
    if (state.token) {
        dom.authBadge.className = 'auth-badge';
        dom.authText.textContent = 'Authenticated (JWT Active)';
        dom.manualTokenInput.value = state.token;
    } else {
        dom.authBadge.className = 'auth-badge unauth';
        dom.authText.textContent = 'Guest / No Token';
        dom.manualTokenInput.value = '';
    }
}

function setToken(token) {
    state.token = token;
    localStorage.setItem('jwt_token', token);
    initAuthUI();
}

function clearToken() {
    state.token = '';
    localStorage.removeItem('jwt_token');
    initAuthUI();
}

function getHeaders() {
    const headers = { 'Accept': 'application/json' };
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }
    return headers;
}

window.openAuthModal = function() {
    dom.authModal.classList.add('active');
    dom.manualTokenInput.value = state.token || '';
};

function closeAuthModal() {
    dom.authModal.classList.remove('active');
}

// Utility Helpers
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
