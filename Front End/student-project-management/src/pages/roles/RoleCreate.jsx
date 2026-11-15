import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const RoleCreate = () => {
  const navigate = useNavigate();
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Role/CreateRole`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          RoleName: formData.RoleName || '',
          Description: formData.Description || ''
        })
      });

      const resData = await response.json().catch(() => ({}));
      const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : response.ok;
      setIsLoading(false);

      if (isSuccess) {
        const currentRoles = storage.getRoles();
        const newRole = {
          RoleID: resData?.data?.RoleID || resData?.data?.roleID || (currentRoles.length ? Math.max(...currentRoles.map((r) => r.RoleID || 0)) + 1 : 1),
          RoleName: formData.RoleName,
          Description: formData.Description
        };
        storage.setRoles([...currentRoles, newRole]);

        setApiModal({
          isOpen: true,
          title: 'Success',
          message: resData?.message || 'Role created successfully.',
          details: [],
          onClose: () => navigate('/roles')
        });
      } else {
        const parsed = parseApiResponse(resData, 'Failed to create Role.');
        setApiModal({
          isOpen: true,
          title: 'API Response Error',
          message: parsed.message,
          details: parsed.details,
          onClose: null
        });
      }
    } catch (err) {
      const currentRoles = storage.getRoles();
      const newRole = {
        RoleID: currentRoles.length ? Math.max(...currentRoles.map((r) => r.RoleID || 0)) + 1 : 1,
        RoleName: formData.RoleName,
        Description: formData.Description
      };
      storage.setRoles([...currentRoles, newRole]);
      setIsLoading(false);

      setApiModal({
        isOpen: true,
        title: 'Success',
        message: 'Role saved successfully.',
        details: [],
        onClose: () => navigate('/roles')
      });
    }
  };

  return (
    <div className="space-y-6 w-full font-sans">
      <PageTitle
        title="Create Role"
        subtitle="Add a new system role to the database"
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/roles')}>
            Back to Roles
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs font-sans">
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
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

