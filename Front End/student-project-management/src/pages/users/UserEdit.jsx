import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userTypes, setUserTypes] = useState(() => storage.getUserTypes());
  const [userObj, setUserObj] = useState(() => {
    const cached = storage.getUsers();
    return cached.find((u) => Number(u.UserID || u.userID) === Number(id)) || null;
  });

  const [formData, setFormData] = useState({
    UserTypeID: '',
    FullName: '',
    UserCode: '',
    Email: '',
    Password: '',
    MobileNumber: '',
    ProfilePicturePath: '',
    IsActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiModal, setApiModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: [],
    onClose: null
  });

  useEffect(() => {
    if (userObj) {
      setFormData({
        UserTypeID: userObj.UserTypeID || userObj.userTypeID || '',
        FullName: userObj.FullName || userObj.fullName || '',
        UserCode: userObj.UserCode || userObj.userCode || '',
        Email: userObj.Email || userObj.email || '',
        Password: userObj.Password || userObj.password || '',
        MobileNumber: userObj.MobileNumber || userObj.mobileNumber || '',
        ProfilePicturePath: userObj.ProfilePicturePath || userObj.profilePicturePath || '',
        IsActive: userObj.IsActive !== undefined ? userObj.IsActive : (userObj.isActive !== undefined ? userObj.isActive : true)
      });
    }
  }, [userObj]);

  useEffect(() => {
    // Fetch User Types
    fetch(`${API_BASE_URL}/UserType/GetAllUserTypes`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setUserTypes(list);
          storage.setUserTypes(list);
        }
      })
      .catch(() => {});

    // Fetch User by ID
    fetch(`${API_BASE_URL}/User/GetUserById/${id}`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.UserID || item.userID)) {
          setUserObj(item);
          setFormData({
            UserTypeID: item.UserTypeID || item.userTypeID || '',
            FullName: item.FullName || item.fullName || '',
            UserCode: item.UserCode || item.userCode || '',
            Email: item.Email || item.email || '',
            Password: item.Password || item.password || '',
            MobileNumber: item.MobileNumber || item.mobileNumber || '',
            ProfilePicturePath: item.ProfilePicturePath || item.profilePicturePath || '',
            IsActive: item.IsActive !== undefined ? item.IsActive : (item.isActive !== undefined ? item.isActive : true)
          });
        }
      })
      .catch(() => {});
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const closeApiModal = () => {
    const cb = apiModal.onClose;
    setApiModal({ isOpen: false, title: '', message: '', details: [], onClose: null });
    if (cb) cb();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/User/UpdateUser/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          UserID: Number(id),
          UserTypeID: Number(formData.UserTypeID),
          FullName: formData.FullName || '',
          UserCode: formData.UserCode || '',
          Email: formData.Email || '',
          Password: formData.Password || '',
          MobileNumber: formData.MobileNumber || '',
          ProfilePicturePath: formData.ProfilePicturePath || '',
          IsActive: formData.IsActive !== undefined ? formData.IsActive : true
        })
      });

      const resData = await response.json().catch(() => ({}));
      const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : response.ok;
      setIsLoading(false);

      if (isSuccess) {
        const currentUsers = storage.getUsers();
        const targetIdNum = Number(id);
        const targetIdStr = String(id);

        const isTargetUser = (u) => {
          const uId = u.UserID ?? u.userID ?? u.Id ?? u.id;
          if (uId !== undefined && uId !== null && (Number(uId) === targetIdNum || String(uId) === targetIdStr)) {
            return true;
          }
          const uCode = (u.UserCode || u.userCode || '').toLowerCase().trim();
          const formCode = (formData.UserCode || '').toLowerCase().trim();
          if (uCode && formCode && uCode === formCode) return true;

          const userObjCode = (userObj?.UserCode || userObj?.userCode || '').toLowerCase().trim();
          if (uCode && userObjCode && uCode === userObjCode) return true;

          const userObjEmail = (userObj?.Email || userObj?.email || '').toLowerCase().trim();
          const uEmail = (u.Email || u.email || '').toLowerCase().trim();
          if (uEmail && userObjEmail && uEmail === userObjEmail) return true;

          return false;
        };

        const firstMatchIdx = currentUsers.findIndex(isTargetUser);
        const baseUserObj = firstMatchIdx !== -1 ? currentUsers[firstMatchIdx] : userObj;

        const updatedUser = {
          ...baseUserObj,
          ...userObj,
          ...formData,
          UserID: targetIdNum,
          userID: targetIdNum,
          UserTypeID: Number(formData.UserTypeID)
        };

        let updatedList = currentUsers.filter((u) => !isTargetUser(u));

        if (firstMatchIdx !== -1) {
          updatedList.splice(firstMatchIdx, 0, updatedUser);
        } else {
          updatedList.push(updatedUser);
        }

        updatedList = deduplicateArray(updatedList);
        storage.setUsers(updatedList);

        const parsed = parseApiResponse(resData);
        setApiModal({
          isOpen: true,
          title: parsed.title,
          message: parsed.message,
          details: parsed.details,
          onClose: () => navigate('/users')
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

  const typeOptions = userTypes.map((ut) => ({
    value: ut.UserTypeID || ut.userTypeID,
    label: ut.UserTypeName || ut.userTypeName
  }));

  if (!userObj) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-2">User Record Not Found</h3>
        <Link to="/users" className="text-xs font-bold text-indigo-600 hover:underline">
          Back to User List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageTitle
        title="Edit User"
        subtitle={`Update account profile for ${userObj.FullName || userObj.fullName}`}
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/users')}>
            Back to Users
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="User Type *"
              placeholder="Select User Type"
              options={typeOptions}
              value={formData.UserTypeID}
              onChange={(e) => handleChange('UserTypeID', e.target.value)}
              required
            />
            <Input
              label="Full Name *"
              placeholder="e.g. Aarav Mehta"
              value={formData.FullName}
              onChange={(e) => handleChange('FullName', e.target.value)}
              required
            />
            <Input
              label="User Code / Enrollment No *"
              placeholder="e.g. 2401CS52101 / FAC-101"
              value={formData.UserCode}
              onChange={(e) => handleChange('UserCode', e.target.value)}
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="user@spm.edu"
              value={formData.Email}
              onChange={(e) => handleChange('Email', e.target.value)}
              required
            />
            <Input
              label="Password *"
              type="password"
              placeholder="••••••••"
              value={formData.Password}
              onChange={(e) => handleChange('Password', e.target.value)}
              required
            />
            <Input
              label="Mobile Number *"
              placeholder="+91 98765 43210"
              value={formData.MobileNumber}
              onChange={(e) => handleChange('MobileNumber', e.target.value)}
              required
            />
          </div>

          <Input
            label="Profile Picture URL"
            placeholder="https://example.com/avatar.jpg"
            value={formData.ProfilePicturePath}
            onChange={(e) => setFormData({ ...formData, ProfilePicturePath: e.target.value })}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.IsActive}
              onChange={(e) => setFormData({ ...formData, IsActive: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-gray-700">
              Account Active Status
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate('/users')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save User
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
          <div className="flex justify-end pt-2">
            <Button onClick={closeApiModal}>
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

