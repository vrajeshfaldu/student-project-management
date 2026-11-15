import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Edit3,
  Key,
  CheckCircle2,
  Lock
} from 'lucide-react';

import { PageTitle } from '../../layouts/PageTitle';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { storage, API_BASE_URL, parseApiResponse } from '../../helpers';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => storage.getAuthUser() || {});
  const role = storage.getAuthRole() || 'Student';

  const [loading, setLoading] = useState(false);
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

  // Optional background fetch to enrich from backend API if available
  useEffect(() => {
    const token = localStorage.getItem('spm_token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${API_BASE_URL}/User/GetAllUsers`, {
      method: 'GET',
      headers: headers
    })
      .then((response) => response.json())
      .then((data) => {
        const userList = data?.data || data?.Data || data || [];
        if (Array.isArray(userList) && userList.length > 0) {
          const matched = userList.find(
            (u) =>
              (u.UserID && currentUser?.UserID && Number(u.UserID) === Number(currentUser.UserID)) ||
              ((u.Email || u.email || '').toLowerCase() === (currentUser?.Email || currentUser?.email || '').toLowerCase())
          );
          if (matched) {
            setCurrentUser(matched);
            storage.setAuth(token, role, matched);
          }
        }
      })
      .catch(() => {
        // Safe fallback to localStorage
      });
  }, []);

  const fullName =
    currentUser.FullName ||
    currentUser.fullName ||
    (currentUser.Email ? currentUser.Email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'User Profile');

  const emailAddress = currentUser.Email || currentUser.email || 'user@example.com';
  const mobileNumber = currentUser.MobileNumber || currentUser.mobileNumber || '9876543210';
  const userCode =
    currentUser.UserCode ||
    currentUser.userCode ||
    (role === 'Admin' ? 'ADM001' : role === 'Faculty' ? 'FAC001' : 'STU001');

  const roleName =
    currentUser.UserTypeName ||
    currentUser.userTypeName ||
    (role === 'Admin' ? 'ADMINISTRATOR' : role ? role.toUpperCase() : 'USER');

  const profilePic =
    currentUser.ProfilePicturePath ||
    currentUser.profilePicturePath ||
    currentUser.ImageUrl ||
    currentUser.imageUrl ||
    '';

  const formData = {
    FullName: fullName,
    Email: emailAddress,
    MobileNumber: mobileNumber,
    UserCode: userCode,
    Role: roleName,
    ProfilePicturePath: profilePic
  };

  const [successMessage, setSuccessMessage] = useState('');

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800">
      {/* Page Title */}
      <PageTitle
        title="My Profile"
        subtitle="Manage your personal information, contact credentials, and account settings"
      />

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-2xs font-sans">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Top Profile Summary Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6 font-sans">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <Avatar
            src={formData.ProfilePicturePath}
            name={formData.FullName}
            size="xl"
            className="w-20 h-20 text-2xl ring-4 ring-indigo-50 shadow-md shrink-0 font-sans"
          />
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1">
              <h2 className="text-xl font-black text-gray-900 tracking-tight font-sans">{formData.FullName}</h2>
              <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 font-sans">
                {formData.Role}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-semibold flex items-center justify-center sm:justify-start gap-2 font-sans">
              <span>User Code: <strong className="text-gray-800 font-bold">{formData.UserCode}</strong></span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active Account
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto font-sans">
          <button
            onClick={() => navigate('/profile/edit')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
          <button
            onClick={() => navigate('/profile/change-password')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs font-sans"
          >
            <Key className="w-4 h-4 text-gray-400" /> Change Password
          </button>
        </div>
      </div>

      {/* Clean 2-Column Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        
        {/* Card 1: Personal & Account Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-sans">
              PERSONAL & ACCOUNT INFORMATION
            </h3>
          </div>

          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1 font-sans">Full Name</span>
              <p className="text-sm font-bold text-gray-900 leading-snug font-sans">{formData.FullName}</p>
            </div>

            <div className="border-b border-gray-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1 font-sans">User Code / Enrollment No</span>
              <p className="text-sm font-bold text-indigo-600 leading-snug font-sans">{formData.UserCode}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1 font-sans">System Role</span>
                <p className="text-sm font-bold text-indigo-600 uppercase leading-snug font-sans">
                  {formData.Role}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1 font-sans">Account Status</span>
                <p className="text-sm font-bold text-emerald-600 leading-snug flex items-center gap-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Contact Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-sans">
              CONTACT CREDENTIALS
            </h3>
          </div>

          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1 font-sans">Primary Email Address</span>
              <p className="text-sm font-bold text-gray-900 leading-snug flex items-center gap-2 font-sans">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{formData.Email}</span>
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1 font-sans">Mobile Number</span>
              <p className="text-sm font-bold text-gray-900 leading-snug flex items-center gap-2 font-sans">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{formData.MobileNumber}</span>
              </p>
            </div>
          </div>
        </div>

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
