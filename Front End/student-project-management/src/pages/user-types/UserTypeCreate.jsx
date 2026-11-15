import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const UserTypeCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    UserTypeName: '',
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
      const response = await fetch(`${API_BASE_URL}/UserType/CreateUserType`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          UserTypeName: formData.UserTypeName.trim(),
          Description: formData.Description.trim()
        })
      });

      const resData = await response.json().catch(() => ({}));
      const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : response.ok;
      setIsLoading(false);

      if (isSuccess) {
        const currentTypes = storage.getUserTypes();
        const newType = {
          UserTypeID: resData?.data?.UserTypeID || resData?.data?.userTypeID || (currentTypes.length ? Math.max(...currentTypes.map((u) => u.UserTypeID || 0)) + 1 : 1),
          UserTypeName: formData.UserTypeName.trim(),
          Description: formData.Description.trim()
        };
        storage.setUserTypes([...currentTypes, newType]);

        const parsed = parseApiResponse(resData);
        setApiModal({
          isOpen: true,
          title: parsed.title,
          message: parsed.message,
          details: parsed.details,
          onClose: () => navigate('/user-types')
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

  return (
    <div className="space-y-6 w-full font-sans">
      <PageTitle
        title="Create User Type"
        subtitle="Add a new account classification category"
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/user-types')}>
            Back to User Types
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs font-sans">
        <form onSubmit={handleSubmit} className="space-y-4 font-sans" noValidate>
          <Input
            label="User Type Name *"
            placeholder="e.g. Admin, Faculty, Student, Co-Guide"
            value={formData.UserTypeName}
            onChange={(e) => handleChange('UserTypeName', e.target.value)}
            required
          />

          <Textarea
            label="Description (Optional)"
            placeholder="e.g. Full System Administrator access, Faculty mentor permissions..."
            rows={4}
            value={formData.Description}
            onChange={(e) => handleChange('Description', e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 font-sans">
            <Button variant="outline" type="button" onClick={() => navigate('/user-types')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save User Type
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

