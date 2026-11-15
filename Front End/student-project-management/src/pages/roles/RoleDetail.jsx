import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, ShieldCheck } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Button } from '../../components/common/Button';
import { storage, API_BASE_URL, getAuthHeaders } from '../../helpers';

export const RoleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roleObj, setRoleObj] = React.useState(() => {
    const cached = storage.getRoles();
    return cached.find((r) => Number(r.RoleID || r.roleID) === Number(id)) || null;
  });

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/Role/GetRoleById/${id}`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.RoleID || item.roleID)) {
          setRoleObj(item);
        }
      })
      .catch(() => {});
  }, [id]);

  if (!roleObj) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-2">Role Not Found</h3>
        <Button variant="outline" onClick={() => navigate('/roles')}>
          Back to Roles
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageTitle
        title={`Role Details: ${roleObj.RoleName}`}
        subtitle="Individual Role record properties"
        actionButton={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/roles')}>
              Back to List
            </Button>
            <Button variant="primary" icon={Edit3} onClick={() => navigate(`/roles/edit/${id}`)}>
              Edit Role
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{roleObj.RoleName}</h3>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs">
          <span className="text-gray-400 block font-bold uppercase mb-1">Permission Scope / Description</span>
          <p className="text-gray-800 leading-relaxed">{roleObj.Description || 'No description provided.'}</p>
        </div>
      </div>
    </div>
  );
};
