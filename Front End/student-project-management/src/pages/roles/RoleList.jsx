import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit3, Trash2, ShieldCheck, Award, UserCheck, Layers } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Table } from '../../components/tables/Table';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { StatCard } from '../../components/common/StatCard';
import { storage, API_BASE_URL, getAuthHeaders, extractApiArray } from '../../helpers';

export const RoleList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState(() => storage.getRoles());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/Role/GetAllRoles`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data);
        if (Array.isArray(list) && list.length > 0) {
          const cached = storage.getRoles();
          const merged = deduplicateArray([...cached, ...list]);
          setRoles(merged);
          storage.setRoles(merged);
        }
      })
      .catch(() => {});
  }, []);

  const safeRoles = Array.isArray(roles) ? roles : [];

  const filteredRoles = safeRoles.filter((r) => {
    if (!r) return false;
    const name = r.RoleName || r.roleName || r.name || '';
    const desc = r.Description || r.description || '';
    const term = (searchTerm || '').toLowerCase();
    return name.toLowerCase().includes(term) || desc.toLowerCase().includes(term);
  });

  const totalRoles = safeRoles.length;
  const adminRoles = safeRoles.filter((r) => ((r?.RoleName || r?.roleName || '')).toLowerCase().includes('admin')).length;
  const facultyRoles = safeRoles.filter((r) => {
    const name = ((r?.RoleName || r?.roleName || '')).toLowerCase();
    return name.includes('faculty') || name.includes('guide') || name.includes('mentor');
  }).length;
  const studentRoles = safeRoles.filter((r) => {
    const name = ((r?.RoleName || r?.roleName || '')).toLowerCase();
    return name.includes('student') || name.includes('candidate');
  }).length;

  const columns = [
    {
      header: 'Role Name',
      field: 'RoleName',
      sortable: true,
      render: (row) => <span className="font-bold text-gray-900">{row?.RoleName || row?.roleName || 'N/A'}</span>
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
        const id = row?.RoleID || row?.roleID;
        return (
          <div className="flex items-center gap-1.5 font-sans">
            <Link
              to={`/roles/${id}`}
              title="View Details"
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              to={`/roles/edit/${id}`}
              title="Edit Role"
              className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <Link
              to={`/roles/delete/${id}`}
              title="Delete Role"
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
        title="Role Management"
        subtitle="Manage access control levels and security permissions"
        actionButton={
          <Button variant="primary" icon={Plus} onClick={() => navigate('/roles/create')}>
            Add New Role
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StatCard
          title="Total System Roles"
          value={totalRoles}
          icon={Layers}
          color="blue"
          badgeText="Active Definitions"
        />
        <StatCard
          title="Admin Privileges"
          value={adminRoles}
          icon={ShieldCheck}
          color="purple"
          badgeText="Root Operators"
        />
        <StatCard
          title="Faculty Mentors"
          value={facultyRoles}
          icon={Award}
          color="emerald"
          badgeText="Guide Evaluators"
        />
        <StatCard
          title="Student Candidates"
          value={studentRoles}
          icon={UserCheck}
          color="amber"
          badgeText="Project Performers"
        />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs font-sans">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search roles by title or description..."
        />
      </div>

      <Table columns={columns} data={filteredRoles} keyField="RoleID" itemsPerPage={6} />
    </div>
  );
};
