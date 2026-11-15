import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit3, Trash2, Users, ShieldCheck, GraduationCap, UserCheck } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Table } from '../../components/tables/Table';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { StatCard } from '../../components/common/StatCard';
import { storage, API_BASE_URL, getAuthHeaders, extractApiArray } from '../../helpers';

export const UserTypeList = () => {
  const navigate = useNavigate();
  const [userTypes, setUserTypes] = useState(() => storage.getUserTypes());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/UserType/GetAllUserTypes`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data);
        if (Array.isArray(list) && list.length > 0) {
          const cached = storage.getUserTypes();
          const merged = deduplicateArray([...cached, ...list]);
          setUserTypes(merged);
          storage.setUserTypes(merged);
        }
      })
      .catch(() => {});
  }, []);

  const safeUserTypes = Array.isArray(userTypes) ? userTypes : [];

  const filteredUserTypes = safeUserTypes.filter((u) => {
    if (!u) return false;
    const name = u.UserTypeName || u.userTypeName || '';
    const desc = u.Description || u.description || '';
    const term = (searchTerm || '').toLowerCase();
    return name.toLowerCase().includes(term) || desc.toLowerCase().includes(term);
  });

  const totalTypes = safeUserTypes.length;
  const adminTypes = safeUserTypes.filter((ut) => (ut?.UserTypeName || ut?.userTypeName || '').toLowerCase().includes('admin')).length;
  const facultyTypes = safeUserTypes.filter((ut) => {
    const name = (ut?.UserTypeName || ut?.userTypeName || '').toLowerCase();
    return name.includes('faculty') || name.includes('guide') || name.includes('mentor');
  }).length;
  const studentTypes = safeUserTypes.filter((ut) => {
    const name = (ut?.UserTypeName || ut?.userTypeName || '').toLowerCase();
    return name.includes('student') || name.includes('candidate');
  }).length;

  const columns = [

    {
      header: 'User Type Name',
      field: 'UserTypeName',
      sortable: true,
      render: (row) => <span className="font-bold text-gray-900">{row?.UserTypeName || row?.userTypeName || 'N/A'}</span>
    },
    {
      header: 'Description',
      field: 'Description',
      render: (row) => (row?.Description || row?.description) || <span className="text-gray-400">N/A</span>
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => {
        const id = row?.UserTypeID || row?.userTypeID;
        return (
          <div className="flex items-center gap-1.5 font-sans">
            <Link
              to={`/user-types/${id}`}
              title="View Details"
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              to={`/user-types/edit/${id}`}
              title="Edit User Type"
              className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <Link
              to={`/user-types/delete/${id}`}
              title="Delete User Type"
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </Link>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800">
      <PageTitle
        title="User Type Management"
        subtitle="Define global account classifications and operational permissions"
        actionButton={
          <Button variant="primary" icon={Plus} onClick={() => navigate('/user-types/create')}>
            Add New User Type
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StatCard
          title="Total User Classifications"
          value={totalTypes}
          icon={Users}
          color="blue"
          badgeText="Active System Types"
        />
        <StatCard
          title="Admin Operators"
          value={adminTypes}
          icon={ShieldCheck}
          color="purple"
          badgeText="System Administrators"
        />
        <StatCard
          title="Faculty Mentors"
          value={facultyTypes}
          icon={GraduationCap}
          color="emerald"
          badgeText="Academic Guides"
        />
        <StatCard
          title="Student Performers"
          value={studentTypes}
          icon={UserCheck}
          color="amber"
          badgeText="Project Candidates"
        />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs font-sans">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search user types by name or description..."
        />
      </div>

      <Table columns={columns} data={filteredUserTypes} keyField="UserTypeID" itemsPerPage={6} />
    </div>
  );
};
