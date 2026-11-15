import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const RoleUserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState(() => storage.getUsers());
  const [roles, setRoles] = useState(() => storage.getRoles());
  const [urObj, setUrObj] = useState(() => {
    const cached = storage.getUserRoles();
    return cached.find((ur) => Number(ur.RolePermissionID || ur.rolePermissionID) === Number(id)) || null;
  });

  const [formData, setFormData] = useState({
    UserID: '',
    RoleID: ''
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
    if (urObj) {
      setFormData({
        UserID: urObj.UserID || urObj.userID || '',
        RoleID: urObj.RoleID || urObj.roleID || ''
      });
    }
  }, [urObj]);

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

    // Fetch UserRole by ID
    fetch(`${API_BASE_URL}/UserRole/GetUserRoleById/${id}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.RolePermissionID || item.rolePermissionID)) {
          setUrObj(item);
          setFormData({
            UserID: item.UserID || item.userID || '',
            RoleID: item.RoleID || item.roleID || ''
          });
        }
      })
      .catch(() => {});
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/UserRole/UpdateUserRole/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          RolePermissionID: Number(id),
          UserID: Number(formData.UserID),
          RoleID: Number(formData.RoleID)
        })
      });

      const resData = await response.json().catch(() => ({}));
      const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : response.ok;
      setIsLoading(false);

      if (isSuccess) {
        const currentList = storage.getUserRoles();
        const targetId = Number(id);
        const isTarget = (ur) => {
          const ruid = Number(ur.RoleUserID || ur.roleUserID || ur.RolePermissionID || ur.rolePermissionID || 0);
          if (ruid > 0 && targetId > 0 && ruid === targetId) return true;
          return false;
        };

        const firstMatchIdx = currentList.findIndex(isTarget);
        const baseObj = firstMatchIdx !== -1 ? currentList[firstMatchIdx] : {};
        const updatedRoleUser = {
          ...baseObj,
          RolePermissionID: targetId,
          RoleUserID: targetId,
          UserID: Number(formData.UserID),
          RoleID: Number(formData.RoleID)
        };

        let updatedList = currentList.filter((ur) => !isTarget(ur));
        if (firstMatchIdx !== -1) {
          updatedList.splice(firstMatchIdx, 0, updatedRoleUser);
        } else {
          updatedList.push(updatedRoleUser);
        }

        updatedList = deduplicateArray(updatedList);
        storage.setUserRoles(updatedList);

        const parsed = parseApiResponse(resData);
        setApiModal({
          isOpen: true,
          title: parsed.title,
          message: parsed.message,
          details: parsed.details,
          onClose: () => navigate('/role-user')
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

  const userOptions = users.map((u) => ({
    value: u.UserID || u.userID,
    label: `${u.FullName || u.fullName} (${u.Email || u.email})`
  }));

  const roleOptions = roles.map((r) => ({
    value: r.RoleID || r.roleID,
    label: r.RoleName || r.roleName
  }));

  if (!urObj) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 font-sans">
        <h3 className="text-base font-bold text-gray-900 mb-2 font-sans">Assignment Record Not Found</h3>
        <Link to="/role-user" className="text-xs font-bold text-indigo-600 hover:underline font-sans">
          Back to Assignments List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans">
      <PageTitle
        title="Edit Role Assignment"
        subtitle="Modify assigned user or role permission mapping"
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/role-user')}>
            Back to Assignments
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs font-sans">
        <form onSubmit={handleSubmit} className="space-y-4 font-sans" noValidate>
          <Select
            label="Select User *"
            placeholder="Choose User"
            options={userOptions}
            value={formData.UserID}
            onChange={(e) => handleChange('UserID', e.target.value)}
            required
          />
          <Select
            label="Select Role *"
            placeholder="Choose Role Permission"
            options={roleOptions}
            value={formData.RoleID}
            onChange={(e) => handleChange('RoleID', e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 font-sans">
            <Button variant="outline" type="button" onClick={() => navigate('/role-user')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Assignment
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

