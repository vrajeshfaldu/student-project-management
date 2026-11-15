import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, UserCheck } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Button } from '../../components/common/Button';
import { storage, API_BASE_URL, getAuthHeaders } from '../../helpers';

export const UserTypeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [utObj, setUtObj] = useState(() => {
    const cached = storage.getUserTypes();
    return cached.find((ut) => Number(ut.UserTypeID || ut.userTypeID) === Number(id)) || null;
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/UserType/GetUserTypeById/${id}`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.UserTypeID || item.userTypeID)) {
          setUtObj(item);
        }
      })
      .catch(() => {});
  }, [id]);

  if (!utObj) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-2">User Type Record Not Found</h3>
        <Button variant="outline" onClick={() => navigate('/user-types')}>
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageTitle
        title={`User Type Details: ${utObj.UserTypeName || utObj.userTypeName}`}
        subtitle="Individual User Type record properties"
        actionButton={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/user-types')}>
              Back to List
            </Button>
            <Button variant="primary" icon={Edit3} onClick={() => navigate(`/user-types/edit/${id}`)}>
              Edit User Type
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{utObj.UserTypeName || utObj.userTypeName}</h3>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs">
          <span className="text-gray-400 block font-bold uppercase mb-1">Description & Scope</span>
          <p className="text-gray-800 leading-relaxed text-sm">{utObj.Description || utObj.description || 'No description provided.'}</p>
        </div>
      </div>
    </div>
  );
};
