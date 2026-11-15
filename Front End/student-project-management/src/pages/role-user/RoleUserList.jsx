import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit3, Trash2, ShieldCheck, GraduationCap, UserCheck, Users } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Table } from '../../components/tables/Table';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { storage, API_BASE_URL, getAuthHeaders, extractApiArray } from '../../helpers';

export const RoleUserList = () => {
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState(() => storage.getUserRoles());
  const [users, setUsers] = useState(() => storage.getUsers());
  const [roles, setRoles] = useState(() => storage.getRoles());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch User Roles
    fetch(`${API_BASE_URL}/UserRole/GetAllUserRoles`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data);
        if (Array.isArray(list) && list.length > 0) {
          const cached = storage.getUserRoles();
          const merged = deduplicateArray([...cached, ...list]);
          setUserRoles(merged);
          storage.setUserRoles(merged);
        }
      })
      .catch(() => {});

    // Fetch Users
    fetch(`${API_BASE_URL}/User/GetAllUsers`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data);
        if (Array.isArray(list) && list.length > 0) {
          const cached = storage.getUsers();
          const merged = deduplicateArray([...cached, ...list]);
          setUsers(merged);
          storage.setUsers(merged);
        }
      })
      .catch(() => {});

    // Fetch Roles
    fetch(`${API_BASE_URL}/Role/GetAllRoles`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data);
        if (Array.isArray(list) && list.length > 0) {
          const cached = storage.getRoles();
          const merged = deduplicateArray([...cached, ...list]);
          setRoles(merged);
          storage.setRoles(merged);
        }
      })
      .catch(() => {});
  }, []);

  const safeUserRoles = Array.isArray(userRoles) ? userRoles : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeRoles = Array.isArray(roles) ? roles : [];

  const mappedUserRoles = safeUserRoles.map((ur) => {
    const urUserId = Number(ur.UserID || ur.userID);
    const urRoleId = Number(ur.RoleID || ur.roleID);

    const userObj = safeUsers.find((u) => Number(u.UserID || u.userID) === urUserId);
    const roleObj = safeRoles.find((r) => Number(r.RoleID || r.roleID) === urRoleId);

    const uName = ur.UserName || ur.userName || userObj?.FullName || userObj?.fullName || 'Assigned User';
    const rName = ur.RoleName || ur.roleName || roleObj?.RoleName || roleObj?.roleName || (urRoleId === 1 ? 'Admin' : urRoleId === 2 ? 'Faculty' : 'Student');

    return {
      ...ur,
      RolePermissionID: ur.RolePermissionID || ur.rolePermissionID,
      UserID: urUserId,
      RoleID: urRoleId,
      userName: uName,
      roleName: rName
    };
  });

  const filteredUserRoles = mappedUserRoles.filter(
    (ur) =>
      ur.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ur.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssignments = mappedUserRoles.length;
  const adminAssignments = mappedUserRoles.filter(a => a.roleName.toLowerCase().includes('admin')).length;
  const facultyAssignments = mappedUserRoles.filter(a => a.roleName.toLowerCase().includes('faculty')).length;
  const studentAssignments = mappedUserRoles.filter(a => a.roleName.toLowerCase().includes('student')).length;

  const columns = [
    {
      header: 'Assigned User',
      field: 'userName',
      sortable: true,
      render: (row) => <span className="font-bold text-gray-900">{row.userName}</span>
    },
    {
      header: 'Assigned Role',
      field: 'roleName',
      sortable: true,
      render: (row) => {
        const variant = row.roleName.toLowerCase().includes('admin') ? 'danger' : row.roleName.toLowerCase().includes('faculty') ? 'primary' : 'success';
        return <Badge variant={variant}>{row.roleName}</Badge>;
      }
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5 font-sans">
          <Link
            to={`/role-user/${row.RolePermissionID}`}
            title="View Details"
            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            to={`/role-user/edit/${row.RolePermissionID}`}
            title="Edit Role Assignment"
            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
          <Link
            to={`/role-user/delete/${row.RolePermissionID}`}
            title="Remove Assignment"
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800">
      <PageTitle
        title="Role User Management"
        subtitle="List of user account to role permission mappings"
        actionButton={
          <Button variant="primary" icon={Plus} onClick={() => navigate('/role-user/create')}>
            Assign Role To User
          </Button>
        }
      />

      {/* Top StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StatCard
          title="Total Role Mappings"
          value={totalAssignments}
          icon={Users}
          color="blue"
          badgeText="Active Mappings"
        />
        <StatCard
          title="Admin Assignments"
          value={adminAssignments}
          icon={ShieldCheck}
          color="purple"
          badgeText="Root Privileges"
        />
        <StatCard
          title="Faculty Assignments"
          value={facultyAssignments}
          icon={GraduationCap}
          color="emerald"
          badgeText="Mentor Guides"
        />
        <StatCard
          title="Student Assignments"
          value={studentAssignments}
          icon={UserCheck}
          color="amber"
          badgeText="Project Candidates"
        />
      </div>

      {/* Toolbar SearchBar Div */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs font-sans">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search by User Name or Role..."
        />
      </div>

      {/* Table Display */}
      <Table columns={columns} data={filteredUserRoles} keyField="RolePermissionID" itemsPerPage={6} />
    </div>
  );
};
