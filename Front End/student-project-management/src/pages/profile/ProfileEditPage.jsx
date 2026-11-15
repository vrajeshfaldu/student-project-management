import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const ProfileEditPage = () => {
  const navigate = useNavigate();
  const role = storage.getAuthRole() || 'Student';
  const currentUser = storage.getAuthUser() || {};

  const [formData, setFormData] = useState({
    UserTypeID: currentUser?.UserTypeID || currentUser?.userTypeID || (role === 'Admin' ? 1 : role === 'Faculty' ? 2 : 3),
    FullName: currentUser?.FullName || currentUser?.fullName || '',
    Email: currentUser?.Email || currentUser?.email || '',
    MobileNumber: currentUser?.MobileNumber || currentUser?.mobileNumber || '',
    UserCode: currentUser?.UserCode || currentUser?.userCode || ''
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedData = {
      ...currentUser,
      FullName: formData.FullName,
      Email: formData.Email,
      MobileNumber: formData.MobileNumber,
      UserCode: formData.UserCode
    };

    // Save directly to localStorage immediately
    const token = localStorage.getItem('spm_token');
    storage.setAuth(token, role, updatedData);

    const localUsers = storage.getUsers();
    const updatedUsers = localUsers.map((u) =>
      u.UserID === currentUser.UserID || u.Email === currentUser.Email ? { ...u, ...updatedData } : u
    );
    storage.setUsers(updatedUsers);

    const headers = getAuthHeaders();

    // Background fetch call to sync with backend API if running
    fetch(`${API_BASE_URL}/User/UpdateUser/${currentUser.UserID || 1}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        UserID: Number(currentUser.UserID || 1),
        UserTypeID: Number(formData.UserTypeID || 1),
        FullName: formData.FullName,
        UserCode: formData.UserCode,
        Email: formData.Email,
        Password: currentUser.Password || 'Password123!',
        MobileNumber: formData.MobileNumber,
        ProfilePicturePath: currentUser.ProfilePicturePath || '',
        IsActive: true,
        IsDeleted: false
      })
    })
      .then(async (res) => {
        const resData = await res.json().catch(() => ({}));
        const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : res.ok;
        if (isSuccess) {
          setApiModal({
            isOpen: true,
            title: 'Success',
            message: resData?.message || 'Profile updated successfully.',
            details: [],
            onClose: () => navigate('/profile')
          });
        } else {
          const parsed = parseApiResponse(resData, 'Failed to update Profile.');
          setApiModal({
            isOpen: true,
            title: 'API Response Error',
            message: parsed.message,
            details: parsed.details,
            onClose: null
          });
        }
      })
      .catch(() => {
        setApiModal({
          isOpen: true,
          title: 'Success',
          message: 'Profile details saved successfully.',
          details: [],
          onClose: () => navigate('/profile')
        });
      });
  };

  return (
    <div className="space-y-6 w-full font-sans antialiased text-gray-800">
      {/* Page Title */}
      <PageTitle
        title="Edit Profile Information"
        subtitle="Update your personal details and contact credentials"
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/profile')}>
            Back to Profile
          </Button>
        }
      />

      {/* Main Edit Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-2xs font-sans w-full">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          
          {/* Section 1: Personal & System Information */}
          <div className="space-y-4 font-sans">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-sans">
                PERSONAL & SYSTEM DETAILS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Aarav Mehta"
                value={formData.FullName}
                onChange={(e) => handleChange('FullName', e.target.value)}
                required
              />

              <Input
                label="User Code / Enrollment No"
                placeholder="e.g. SPMS-ADM-0001"
                value={formData.UserCode}
                onChange={(e) => handleChange('UserCode', e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4 pt-4 border-t border-gray-100 font-sans">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-sans">
                CONTACT CREDENTIALS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Email Address *"
                type="email"
                placeholder="name@example.com"
                value={formData.Email}
                onChange={(e) => handleChange('Email', e.target.value)}
                required
              />

              <Input
                label="Mobile Phone Number *"
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.MobileNumber}
                onChange={(e) => handleChange('MobileNumber', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 font-sans">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Save}>
              Save Profile Changes
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
            <div className="text-left bg-red-50 p-3 rounded-xl border border-red-100 text-xs text-red-700 space-y-1.5 max-h-48 overflow-y-auto font-sans">
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
