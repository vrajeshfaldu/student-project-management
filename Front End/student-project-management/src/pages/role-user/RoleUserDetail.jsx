import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, UserCheck } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { storage, API_BASE_URL, getAuthHeaders } from '../../helpers';

export const RoleUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState(() => storage.getUserRoles());
  const [users, setUsers] = useState(() => storage.getUsers());
  const [roles, setRoles] = useState(() => storage.getRoles());
  const [urObj, setUrObj] = useState(() => {
    const cached = storage.getUserRoles();
    return cached.find((ur) => Number(ur.RolePermissionID || ur.rolePermissionID) === Number(id)) || null;
  });

  useEffect(() => {
    // Fetch users
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

    // Fetch roles
    fetch(`${API_BASE_URL}/Role/GetAllRoles`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setRoles(list);
          storage.setRoles(list);
        }
      })
      .catch(() => {});

    // Fetch UserRole
    fetch(`${API_BASE_URL}/UserRole/GetUserRoleById/${id}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.RolePermissionID || item.rolePermissionID)) {
          setUrObj(item);
        }
      })
      .catch(() => {});
  }, [id]);

  const permId = Number(id);
  const resolvedUr = urObj || userRoles.find((ur) => Number(ur.RolePermissionID || ur.rolePermissionID) === permId);

  const userId = Number(resolvedUr?.UserID || resolvedUr?.userID);
  const roleId = Number(resolvedUr?.RoleID || resolvedUr?.roleID);

  const userObj = users.find((u) => Number(u.UserID || u.userID) === userId);
  const roleObj = roles.find((r) => Number(r.RoleID || r.roleID) === roleId);

  const userName = resolvedUr?.UserName || resolvedUr?.userName || userObj?.FullName || userObj?.fullName || 'Assigned User';
  const roleName = resolvedUr?.RoleName || resolvedUr?.roleName || roleObj?.RoleName || roleObj?.roleName || (roleId === 1 ? 'Admin' : roleId === 2 ? 'Faculty' : 'Student');

  const roleVariant = roleName.toLowerCase().includes('admin')
    ? 'danger'
    : roleName.toLowerCase().includes('faculty')
    ? 'primary'
    : 'success';

  if (!resolvedUr) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-2">Assignment Record Not Found</h3>
        <Button variant="outline" onClick={() => navigate('/role-user')}>
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans antialiased text-gray-800">
      <PageTitle
        title="Role User Detail"
        subtitle="Individual user account to role permission mapping record"
        actionButton={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/role-user')}>
              Back to List
            </Button>
            <Button variant="primary" icon={Edit3} onClick={() => navigate(`/role-user/edit/${permId}`)}>
              Edit Assignment
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-4">
        {/* Top Header Card */}
        <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{userName}</h3>
            <Badge variant={roleVariant}>{roleName}</Badge>
          </div>
        </div>

        {/* Necessary Information Card */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-3">
          <div>
            <span className="text-gray-400 block font-bold uppercase mb-1">Assigned User</span>
            <span className="font-bold text-gray-800 text-sm">{userName}</span>
          </div>

          <div className="border-t border-gray-200/60 pt-3">
            <span className="text-gray-400 block font-bold uppercase mb-1">Assigned Role</span>
            <span className="font-bold text-indigo-600 text-sm">{roleName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
