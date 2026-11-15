import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { RoleRoute } from './RoleRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { storage } from '../helpers';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { UnauthorizedPage } from '../pages/unauthorized/UnauthorizedPage';

// Dashboard Pages
import { AdminDashboard } from '../pages/dashboard/AdminDashboard';
import { FacultyDashboard } from '../pages/dashboard/FacultyDashboard';
import { StudentDashboard } from '../pages/dashboard/StudentDashboard';

// Profile Page
import { ProfilePage as Profile } from '../pages/profile/ProfilePage';
import { ProfileEditPage as ProfileEdit } from '../pages/profile/ProfileEditPage';
import { ChangePasswordPage as ChangePassword } from '../pages/profile/ChangePasswordPage';

// Roles Module Pages
import { RoleList } from '../pages/roles/RoleList';
import { RoleCreate } from '../pages/roles/RoleCreate';
import { RoleEdit } from '../pages/roles/RoleEdit';
import { RoleDetail } from '../pages/roles/RoleDetail';
import { RoleDelete } from '../pages/roles/RoleDelete';

// User Types Module Pages
import { UserTypeList } from '../pages/user-types/UserTypeList';
import { UserTypeCreate } from '../pages/user-types/UserTypeCreate';
import { UserTypeEdit } from '../pages/user-types/UserTypeEdit';
import { UserTypeDetail } from '../pages/user-types/UserTypeDetail';
import { UserTypeDelete } from '../pages/user-types/UserTypeDelete';

// Users Module Pages
import { UserList } from '../pages/users/UserList';
import { UserCreate } from '../pages/users/UserCreate';
import { UserEdit } from '../pages/users/UserEdit';
import { UserDetail } from '../pages/users/UserDetail';
import { UserDelete } from '../pages/users/UserDelete';

// Role User Assignment Module Pages
import { RoleUserList } from '../pages/role-user/RoleUserList';
import { RoleUserCreate } from '../pages/role-user/RoleUserCreate';
import { RoleUserEdit } from '../pages/role-user/RoleUserEdit';
import { RoleUserDetail } from '../pages/role-user/RoleUserDetail';
import { RoleUserDelete } from '../pages/role-user/RoleUserDelete';

// Status Module Pages
import { StatusList } from '../pages/status/StatusList';
import { StatusCreate } from '../pages/status/StatusCreate';
import { StatusEdit } from '../pages/status/StatusEdit';
import { StatusDetail } from '../pages/status/StatusDetail';
import { StatusDelete } from '../pages/status/StatusDelete';

// Priority Module Pages
import { PriorityList } from '../pages/priority/PriorityList';
import { PriorityCreate } from '../pages/priority/PriorityCreate';
import { PriorityEdit } from '../pages/priority/PriorityEdit';
import { PriorityDetail } from '../pages/priority/PriorityDetail';
import { PriorityDelete } from '../pages/priority/PriorityDelete';

// Projects Module Pages
import { ProjectList } from '../pages/projects/ProjectList';
import { ProjectCreate } from '../pages/projects/ProjectCreate';
import { ProjectEdit } from '../pages/projects/ProjectEdit';
import { ProjectDetail } from '../pages/projects/ProjectDetail';
import { ProjectDelete } from '../pages/projects/ProjectDelete';

// Project Allocations Module Pages
import { AllocationList } from '../pages/project-allocations/AllocationList';
import { AllocationCreate } from '../pages/project-allocations/AllocationCreate';
import { AllocationEdit } from '../pages/project-allocations/AllocationEdit';
import { AllocationDetail } from '../pages/project-allocations/AllocationDetail';
import { AllocationDelete } from '../pages/project-allocations/AllocationDelete';

// Tasks Module Pages
import { TaskList } from '../pages/tasks/TaskList';
import { TaskCreate } from '../pages/tasks/TaskCreate';
import { TaskEdit } from '../pages/tasks/TaskEdit';
import { TaskDetail } from '../pages/tasks/TaskDetail';
import { TaskDelete } from '../pages/tasks/TaskDelete';

// Reports Module Pages
import { ReportsPage } from '../pages/reports/ReportsPage';
import { ProjectReportPage } from '../pages/reports/ProjectReportPage';
import { FacultyReportPage } from '../pages/reports/FacultyReportPage';
import { StudentReportPage } from '../pages/reports/StudentReportPage';

// Helper component for Role-based Dashboard redirect
const DashboardRedirect = () => {
  const role = storage.getAuthRole() || 'Admin';
  if (role === 'Faculty') return <Navigate to="/dashboard/faculty" replace />;
  if (role === 'Student') return <Navigate to="/dashboard/student" replace />;
  return <Navigate to="/dashboard/admin" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      {/* Unauthorized Forbidden Page */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected App Routes wrapped in MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardRedirect />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/faculty" element={<FacultyDashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />

          {/* Roles Module Pages - Admin Only */}
          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route path="/roles" element={<RoleList />} />
            <Route path="/roles/create" element={<RoleCreate />} />
            <Route path="/roles/edit/:id" element={<RoleEdit />} />
            <Route path="/roles/:id" element={<RoleDetail />} />
            <Route path="/roles/delete/:id" element={<RoleDelete />} />
          </Route>

          {/* User Types Module Pages - Admin Only */}
          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route path="/user-types" element={<UserTypeList />} />
            <Route path="/user-types/create" element={<UserTypeCreate />} />
            <Route path="/user-types/edit/:id" element={<UserTypeEdit />} />
            <Route path="/user-types/:id" element={<UserTypeDetail />} />
            <Route path="/user-types/delete/:id" element={<UserTypeDelete />} />
          </Route>

          {/* Users Module Pages - Admin Only */}
          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route path="/users" element={<UserList />} />
            <Route path="/users/create" element={<UserCreate />} />
            <Route path="/users/edit/:id" element={<UserEdit />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/users/delete/:id" element={<UserDelete />} />
          </Route>

          {/* Role User Assignment Module Pages - Admin Only */}
          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route path="/role-user" element={<RoleUserList />} />
            <Route path="/role-user/create" element={<RoleUserCreate />} />
            <Route path="/role-user/edit/:id" element={<RoleUserEdit />} />
            <Route path="/role-user/:id" element={<RoleUserDetail />} />
            <Route path="/role-user/delete/:id" element={<RoleUserDelete />} />
          </Route>

          {/* Status Module Pages - Admin Only */}
          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route path="/status" element={<StatusList />} />
            <Route path="/status/create" element={<StatusCreate />} />
            <Route path="/status/edit/:id" element={<StatusEdit />} />
            <Route path="/status/:id" element={<StatusDetail />} />
            <Route path="/status/delete/:id" element={<StatusDelete />} />

            <Route path="/task-statuses" element={<StatusList />} />
            <Route path="/task-statuses/create" element={<StatusCreate />} />
            <Route path="/task-statuses/edit/:id" element={<StatusEdit />} />
            <Route path="/task-statuses/:id" element={<StatusDetail />} />
            <Route path="/task-statuses/delete/:id" element={<StatusDelete />} />
          </Route>

          {/* Priority Module Pages - Admin Only */}
          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route path="/priority" element={<PriorityList />} />
            <Route path="/priority/create" element={<PriorityCreate />} />
            <Route path="/priority/edit/:id" element={<PriorityEdit />} />
            <Route path="/priority/:id" element={<PriorityDetail />} />
            <Route path="/priority/delete/:id" element={<PriorityDelete />} />

            <Route path="/task-priorities" element={<PriorityList />} />
            <Route path="/task-priorities/create" element={<PriorityCreate />} />
            <Route path="/task-priorities/edit/:id" element={<PriorityEdit />} />
            <Route path="/task-priorities/:id" element={<PriorityDetail />} />
            <Route path="/task-priorities/delete/:id" element={<PriorityDelete />} />
          </Route>

          {/* Projects Module Pages */}
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/create" element={<ProjectCreate />} />
          <Route path="/projects/edit/:id" element={<ProjectEdit />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/delete/:id" element={<ProjectDelete />} />

          {/* Project Allocations Module Pages - Admin and Faculty */}
          <Route element={<RoleRoute allowedRoles={['Admin', 'Faculty']} />}>
            <Route path="/project-allocations" element={<AllocationList />} />
            <Route path="/project-allocations/create" element={<AllocationCreate />} />
            <Route path="/project-allocations/edit/:id" element={<AllocationEdit />} />
            <Route path="/project-allocations/:id" element={<AllocationDetail />} />
            <Route path="/project-allocations/delete/:id" element={<AllocationDelete />} />
          </Route>

          {/* Tasks Module Pages */}
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/create" element={<TaskCreate />} />
          <Route path="/tasks/edit/:id" element={<TaskEdit />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/delete/:id" element={<TaskDelete />} />

          {/* Reports Module Pages */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/projects" element={<ProjectReportPage />} />
          <Route path="/reports/faculty" element={<FacultyReportPage />} />
          <Route path="/reports/student" element={<StudentReportPage />} />
        </Route>
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
