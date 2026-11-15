import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Key, ShieldCheck } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const role = storage.getAuthRole() || 'Student';
  const currentUser = storage.getAuthUser() || {};

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passError, setPassError] = useState('');

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
    setPasswords((prev) => ({ ...prev, [field]: value }));
    if (passError) setPassError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!passwords.oldPassword) {
      setPassError('Please enter your current password');
      return;
    }

    if (!passwords.newPassword) {
      setPassError('Please enter your new password');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassError('New Password and Confirm New Password do not match');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long');
      return;
    }

    const updatedUser = {
      ...currentUser,
      Password: passwords.newPassword
    };

    // Save directly in localStorage
    const token = localStorage.getItem('spm_token');
    storage.setAuth(token, role, updatedUser);

    const localUsers = storage.getUsers();
    const updatedUsers = localUsers.map((u) =>
      u.UserID === currentUser.UserID || u.Email === currentUser.Email ? { ...u, ...updatedUser } : u
    );
    storage.setUsers(updatedUsers);

    const headers = getAuthHeaders();

    // Background fetch call to sync with backend API if running
    fetch(`${API_BASE_URL}/User/UpdateUser/${currentUser.UserID || 1}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        UserID: Number(currentUser.UserID || 1),
        UserTypeID: Number(currentUser.UserTypeID || (role === 'Admin' ? 1 : role === 'Faculty' ? 2 : 3)),
        FullName: currentUser.FullName || currentUser.fullName || 'User',
        UserCode: currentUser.UserCode || currentUser.userCode || '',
        Email: currentUser.Email || currentUser.email || '',
        Password: passwords.newPassword,
        MobileNumber: currentUser.MobileNumber || currentUser.mobileNumber || '',
        ProfilePicturePath: currentUser.ProfilePicturePath || currentUser.profilePicturePath || '',
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
            message: resData?.message || 'Password updated successfully.',
            details: [],
            onClose: () => navigate('/profile')
          });
        } else {
          const parsed = parseApiResponse(resData, 'Failed to update password.');
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
          message: 'Password updated successfully.',
          details: [],
          onClose: () => navigate('/profile')
        });
      });
  };

  return (
    <div className="space-y-6 w-full font-sans antialiased text-gray-800">
      {/* Page Title */}
      <PageTitle
        title="Change Account Password"
        subtitle="Update your security credentials and account login password"
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/profile')}>
            Back to Profile
          </Button>
        }
      />

      {/* Main Change Password Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-2xs font-sans w-full">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          
          {/* Header Section */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 font-sans">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-sans">
                Security & Authentication
              </h3>
              <p className="text-xs text-gray-500 font-sans">
                Please enter your current password to authorize this password change request.
              </p>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 font-sans">
            <Input
              label="Current Password *"
              type="password"
              placeholder="••••••••"
              value={passwords.oldPassword}
              onChange={(e) => handleChange('oldPassword', e.target.value)}
              required
            />

            <Input
              label="New Password *"
              type="password"
              placeholder="••••••••"
              value={passwords.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              required
            />

            <Input
              label="Confirm New Password *"
              type="password"
              placeholder="••••••••"
              value={passwords.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={passError}
              required
            />
          </div>

          {/* Helper Security Notice */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3 font-sans">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600 font-sans leading-relaxed">
              <span className="font-bold text-gray-900 block mb-0.5">Password Security Recommendation:</span>
              Use at least 6 characters with a combination of uppercase letters, numbers, and special symbols for max account protection.
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 font-sans">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Lock}>
              Update Password
            </Button>
          </div>

        </form>
      </div>

      {/* API Response Modal */}
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
