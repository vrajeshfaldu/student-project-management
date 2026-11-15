import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const UserTypeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [utObj, setUtObj] = useState(() => {
    const cached = storage.getUserTypes();
    return cached.find((ut) => Number(ut.UserTypeID || ut.userTypeID) === Number(id)) || null;
  });

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

  useEffect(() => {
    if (utObj) {
      setFormData({
        UserTypeName: utObj.UserTypeName || utObj.userTypeName || '',
        Description: utObj.Description || utObj.description || ''
      });
    }
  }, [utObj]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/UserType/GetUserTypeById/${id}`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.UserTypeID || item.userTypeID)) {
          setUtObj(item);
          setFormData({
            UserTypeName: item.UserTypeName || item.userTypeName || '',
            Description: item.Description || item.description || ''
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
      const response = await fetch(`${API_BASE_URL}/UserType/UpdateUserType/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          UserTypeID: Number(id),
          UserTypeName: formData.UserTypeName || '',
          Description: formData.Description || ''
        })
      });

      const resData = await response.json().catch(() => ({}));
      const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : response.ok;
      setIsLoading(false);

      if (isSuccess) {
        const currentTypes = storage.getUserTypes();
        const targetId = Number(id);
        const isTarget = (ut) => {
          const utid = Number(ut.UserTypeID || ut.userTypeID || 0);
          if (utid > 0 && targetId > 0 && utid === targetId) return true;
          const utName = (ut.UserTypeName || ut.userTypeName || '').toLowerCase().trim();
          const formName = (formData.UserTypeName || '').toLowerCase().trim();
          return Boolean(utName && formName && utName === formName);
        };

        const firstMatchIdx = currentTypes.findIndex(isTarget);
        const baseObj = firstMatchIdx !== -1 ? currentTypes[firstMatchIdx] : {};
        const updatedType = {
          ...baseObj,
          ...formData,
          UserTypeID: targetId
        };

        let updatedList = currentTypes.filter((ut) => !isTarget(ut));
        if (firstMatchIdx !== -1) {
          updatedList.splice(firstMatchIdx, 0, updatedType);
        } else {
          updatedList.push(updatedType);
        }

        updatedList = deduplicateArray(updatedList);
        storage.setUserTypes(updatedList);

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

  if (!utObj) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 font-sans">
        <h3 className="text-base font-bold text-gray-900 mb-2 font-sans">User Type Not Found</h3>
        <Link to="/user-types" className="text-xs font-bold text-indigo-600 hover:underline font-sans">
          Back to User Types List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans">
      <PageTitle
        title="Edit User Type"
        subtitle="Modify category title or description"
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
              Update User Type
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

