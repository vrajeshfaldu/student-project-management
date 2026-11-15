import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const RoleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roleObj, setRoleObj] = useState(() => {
    const cached = storage.getRoles();
    return cached.find((r) => Number(r.RoleID || r.roleID) === Number(id)) || null;
  });

  const [formData, setFormData] = useState({
    RoleName: '',
    Description: ''
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
    if (roleObj) {
      setFormData({
        RoleName: roleObj.RoleName || roleObj.roleName || '',
        Description: roleObj.Description || roleObj.description || ''
      });
    }
  }, [roleObj]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/Role/GetRoleById/${id}`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.RoleID || item.roleID)) {
          setRoleObj(item);
          setFormData({
            RoleName: item.RoleName || item.roleName || '',
            Description: item.Description || item.description || ''
          });
        }
      })
      .catch(() => { });
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Role/UpdateRole/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          RoleID: Number(id),
          RoleName: formData.RoleName || '',
          Description: formData.Description || ''
        })
      });

      const resData = await response.json().catch(() => ({}));
      const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : response.ok;
      setIsLoading(false);

      if (isSuccess) {
        const currentRoles = storage.getRoles();
        const targetId = Number(id);
        const isTarget = (r) => {
          const rid = Number(r.RoleID || r.roleID || 0);
          if (rid > 0 && targetId > 0 && rid === targetId) return true;
          const rName = (r.RoleName || r.roleName || '').toLowerCase().trim();
          const formName = (formData.RoleName || '').toLowerCase().trim();
          return Boolean(rName && formName && rName === formName);
        };

        const firstMatchIdx = currentRoles.findIndex(isTarget);
        const baseObj = firstMatchIdx !== -1 ? currentRoles[firstMatchIdx] : {};
        const updatedRole = {
          ...baseObj,
          ...formData,
          RoleID: targetId
        };

        let updatedList = currentRoles.filter((r) => !isTarget(r));
        if (firstMatchIdx !== -1) {
          updatedList.splice(firstMatchIdx, 0, updatedRole);
        } else {
          updatedList.push(updatedRole);
        }

        updatedList = deduplicateArray(updatedList);
        storage.setRoles(updatedList);

        const parsed = parseApiResponse(resData);
        setApiModal({
          isOpen: true,
          title: parsed.title,
          message: parsed.message,
          details: parsed.details,
          onClose: () => navigate('/roles')
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

  if (!roleObj) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 font-sans">
        <h3 className="text-base font-bold text-gray-900 mb-2 font-sans">Role Not Found</h3>
        <Link to="/roles" className="text-xs font-bold text-indigo-600 hover:underline font-sans">
          Back to Roles List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans">
      <PageTitle
        title="Edit Role"
        subtitle="Modify role definition and permission description"
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/roles')}>
            Back to Roles
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs font-sans">
        <form onSubmit={handleSubmit} className="space-y-4 font-sans" noValidate>
          <Input
            label="Role Name *"
            placeholder="e.g. Admin, Faculty, Student"
            value={formData.RoleName}
            onChange={(e) => handleChange('RoleName', e.target.value)}
            required
          />
          <Textarea
            label="Description"
            placeholder="Brief description of permissions..."
            value={formData.Description}
            onChange={(e) => handleChange('Description', e.target.value)}
          />
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 font-sans">
            <Button variant="outline" type="button" onClick={() => navigate('/roles')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Role
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

