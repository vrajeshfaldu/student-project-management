import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, User, Mail, Phone, ShieldCheck, CheckCircle } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { storage, API_BASE_URL, getAuthHeaders } from '../../helpers';

export const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState(() => storage.getUsers());
  const [userTypes, setUserTypes] = useState(() => storage.getUserTypes());
  const [userObj, setUserObj] = useState(() => {
    const cached = storage.getUsers();
    return cached.find((u) => Number(u.UserID || u.userID) === Number(id)) || null;
  });

  useEffect(() => {
    // Fetch user types
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

    // Fetch user details
    fetch(`${API_BASE_URL}/User/GetUserById/${id}`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.UserID || item.userID)) {
          setUserObj(item);
        }
      })
      .catch(() => {});
  }, [id]);

  const resolvedUser = userObj || users.find((u) => Number(u.UserID || u.userID) === Number(id));
  const userTypeName = userTypes.find(
    (ut) => Number(ut.UserTypeID || ut.userTypeID) === Number(resolvedUser?.UserTypeID || resolvedUser?.userTypeID)
  )?.UserTypeName;

  if (!resolvedUser) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 font-sans">
        <h3 className="text-base font-bold text-gray-900 mb-2 font-sans">User Record Not Found</h3>
        <Button variant="outline" onClick={() => navigate('/users')}>
          Back to User List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans antialiased text-gray-800">
      <PageTitle
        title={`User Details: ${resolvedUser.FullName || resolvedUser.fullName}`}
        subtitle="Individual User account profile properties"
        actionButton={
          <div className="flex items-center gap-2 font-sans">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/users')}>
              Back to List
            </Button>
            <Button variant="primary" icon={Edit3} onClick={() => navigate(`/users/edit/${id}`)}>
              Edit Profile
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-6 font-sans">
        {/* Header Profile Info Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center sm:text-left font-sans">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <Avatar
              src={resolvedUser.ProfilePicturePath || resolvedUser.profilePicturePath || resolvedUser.ImageUrl || resolvedUser.imageUrl}
              name={resolvedUser.FullName || resolvedUser.fullName}
              size="xl"
              className="ring-4 ring-white shadow-lg shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl font-black text-gray-900 font-sans">{resolvedUser.FullName || resolvedUser.fullName}</h2>
              </div>
              <p className="text-xs font-bold text-indigo-600 mb-2 font-sans">{resolvedUser.UserCode || resolvedUser.userCode || 'No Enrollment Code'}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge variant="primary">{userTypeName || resolvedUser.UserTypeName || 'User'}</Badge>
                <Badge variant={resolvedUser.IsActive ? 'success' : 'danger'}>
                  {resolvedUser.IsActive ? 'Active Account' : 'Inactive Account'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Property Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
              <Mail className="w-4 h-4" />
              <span className="text-gray-400 uppercase tracking-wider">Email Address</span>
            </div>
            <span className="text-gray-900 font-bold text-sm block">{resolvedUser.Email || resolvedUser.email || 'N/A'}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
              <Phone className="w-4 h-4" />
              <span className="text-gray-400 uppercase tracking-wider">Mobile Contact</span>
            </div>
            <span className="text-gray-900 font-bold text-sm block">{resolvedUser.MobileNumber || resolvedUser.mobileNumber || 'N/A'}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
              <User className="w-4 h-4" />
              <span className="text-gray-400 uppercase tracking-wider">User Code / Code</span>
            </div>
            <span className="text-indigo-600 font-bold text-sm block">{resolvedUser.UserCode || resolvedUser.userCode || 'N/A'}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-gray-400 uppercase tracking-wider">User Type</span>
            </div>
            <span className="text-gray-900 font-bold text-sm block">{userTypeName || resolvedUser.UserTypeName || 'User'}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-gray-400 uppercase tracking-wider">Account Status</span>
            </div>
            <span className="text-gray-900 font-bold text-sm block">{resolvedUser.IsActive ? 'Active Account' : 'Inactive Account'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
