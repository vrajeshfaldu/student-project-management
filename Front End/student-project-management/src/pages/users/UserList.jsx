import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit3, Trash2, Filter, Users, ShieldCheck, GraduationCap, UserRound } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Table } from '../../components/tables/Table';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { storage, API_BASE_URL, getAuthHeaders, extractApiArray, deduplicateArray } from '../../helpers';

export const UserList = () => {
  const navigate = useNavigate();
  const role = storage.getAuthRole();
  const user = storage.getAuthUser();

  const [users, setUsers] = useState(() => storage.getUsers());
  const [userTypes, setUserTypes] = useState(() => storage.getUserTypes());
  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');

  useEffect(() => {
    // Fetch Users
    fetch(`${API_BASE_URL}/User/GetAllUsers`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data);
        if (Array.isArray(list) && list.length > 0) {
          const cached = storage.getUsers();
          const merged = deduplicateArray([...cached, ...list]);
          setUsers(merged);
          storage.setUsers(merged);
        }
      })
      .catch(() => {});

    // Fetch User Types
    fetch(`${API_BASE_URL}/UserType/GetAllUserTypes`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = deduplicateArray(extractApiArray(data));
        if (Array.isArray(list) && list.length > 0) {
          setUserTypes(list);
          storage.setUserTypes(list);
        }
      })
      .catch(() => {});

    // Fetch Project Allocations
    fetch(`${API_BASE_URL}/ProjectAllocation/GetAllProjectAllocations`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = deduplicateArray(extractApiArray(data));
        if (Array.isArray(list) && list.length > 0) {
          setProjectAllocations(list);
          storage.setProjectAllocations(list);
        }
      })
      .catch(() => {});
  }, []);

  const currentUserId = Number(user?.UserID || user?.userID);
  const safeAllocations = Array.isArray(projectAllocations) ? projectAllocations : [];
  const safeUsers = deduplicateArray(Array.isArray(users) ? users : []);
  let roleFilteredUsers = safeUsers;

  if (role === 'Faculty') {
    const assignedStudentIds = safeAllocations
      .filter((a) => Number(a.FacultyID || a.facultyID) === currentUserId)
      .map((a) => Number(a.StudentID || a.studentID));

    roleFilteredUsers = safeUsers.filter((u) => {
      const uId = Number(u.UserID || u.userID);
      return uId === currentUserId || assignedStudentIds.includes(uId);
    });
  } else if (role === 'Student') {
    const myAllocations = safeAllocations.filter(
      (a) => Number(a.StudentID || a.studentID) === currentUserId
    );
    const myFacultyIds = myAllocations.map((a) => Number(a.FacultyID || a.facultyID));

    roleFilteredUsers = safeUsers.filter((u) => {
      const uId = Number(u.UserID || u.userID);
      return uId === currentUserId || myFacultyIds.includes(uId);
    });
  }

  const getUserCategory = (u) => {
    const rawTypeName = (u?.UserTypeName || u?.userTypeName || '').toLowerCase();
    const code = (u?.UserCode || u?.userCode || '').toUpperCase();
    const typeId = Number(u?.UserTypeID || u?.userTypeID || 0);
    const typeObj = (userTypes || []).find((ut) => Number(ut?.UserTypeID || ut?.userTypeID) === typeId);
    const resolvedTypeName = (rawTypeName || typeObj?.UserTypeName || typeObj?.userTypeName || '').toLowerCase();

    if (resolvedTypeName.includes('admin') || code.startsWith('ADM') || typeId === 1) {
      if (!resolvedTypeName.includes('student') && !resolvedTypeName.includes('faculty') && !code.startsWith('STU') && !code.startsWith('FAC')) {
        return 'admin';
      }
    }
    if (resolvedTypeName.includes('faculty') || resolvedTypeName.includes('guide') || code.startsWith('FAC') || typeId === 2) {
      if (!resolvedTypeName.includes('student') && !code.startsWith('STU')) {
        return 'faculty';
      }
    }
    if (resolvedTypeName.includes('student') || resolvedTypeName.includes('candidate') || code.startsWith('STU') || typeId === 3) {
      return 'student';
    }

    if (typeId === 1) return 'admin';
    if (typeId === 2) return 'faculty';
    return 'student';
  };

  const filteredUsers = roleFilteredUsers.filter((u) => {
    const fullName = u.FullName || u.fullName || '';
    const email = u.Email || u.email || '';
    const userCode = u.UserCode || u.userCode || '';
    const userIdStr = String(u.UserID || u.userID || '');

    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userIdStr.includes(searchTerm);

    const userTypeId = Number(u.UserTypeID || u.userTypeID || 1);
    const matchesType = selectedTypeFilter ? userTypeId === Number(selectedTypeFilter) : true;
    return matchesSearch && matchesType;
  });

  const totalUsers = roleFilteredUsers.length;
  const adminCount = roleFilteredUsers.filter((u) => getUserCategory(u) === 'admin').length;
  const facultyCount = roleFilteredUsers.filter((u) => getUserCategory(u) === 'faculty').length;
  const studentCount = roleFilteredUsers.filter((u) => getUserCategory(u) === 'student').length;

  const columns = [
    {
      header: 'User',
      field: 'FullName',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.ProfilePicturePath || row.profilePicturePath || row.ImageUrl || row.imageUrl} name={row.FullName || row.fullName} size="sm" />
          <div>
            <div className="font-bold text-gray-900">{row.FullName || row.fullName}</div>
            <div className="text-[11px] text-gray-400">{row.Email || row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'User Code',
      field: 'UserCode',
      sortable: true,
      render: (row) => <span className="font-semibold text-indigo-600">{row.UserCode || row.userCode || 'N/A'}</span>
    },
    {
      header: 'User Type',
      field: 'UserTypeID',
      sortable: true,
      render: (row) => {
        const cat = getUserCategory(row);
        const name = cat === 'admin' ? 'Admin' : cat === 'faculty' ? 'Faculty' : 'Student';
        const variant = cat === 'admin' ? 'danger' : cat === 'faculty' ? 'primary' : 'success';
        return <Badge variant={variant}>{name}</Badge>;
      }
    },
    {
      header: 'Mobile',
      field: 'MobileNumber',
      render: (row) => row.MobileNumber || row.mobileNumber || 'N/A'
    },
    {
      header: 'Status',
      field: 'IsActive',
      sortable: true,
      render: (row) => {
        const isActive = row.IsActive !== undefined ? row.IsActive : row.isActive;
        return (
          <Badge variant={isActive ? 'success' : 'danger'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => {
        const id = row.UserID || row.userID;
        return (
          <div className="flex items-center gap-1.5 font-sans">
            <Link
              to={`/users/${id}`}
              title="View Profile"
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              to={`/users/edit/${id}`}
              title="Edit User"
              className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <Link
              to={`/users/delete/${id}`}
              title="Delete User"
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
        title="User Management"
        subtitle="Full directory of Administrators, Faculty Mentors, and Student Candidates"
        actionButton={
          <Button variant="primary" icon={Plus} onClick={() => navigate('/users/create')}>
            Add New User
          </Button>
        }
      />

      {/* Dynamic Summary StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StatCard
          title="Total Registered Users"
          value={totalUsers}
          icon={Users}
          color="blue"
          badgeText="Active System Accounts"
        />
        <StatCard
          title="Admin Operators"
          value={adminCount}
          icon={ShieldCheck}
          color="purple"
          badgeText="Root Operators"
        />
        <StatCard
          title="Faculty Guides"
          value={facultyCount}
          icon={GraduationCap}
          color="emerald"
          badgeText="Academic Mentors"
        />
        <StatCard
          title="Student Candidates"
          value={studentCount}
          icon={UserRound}
          color="amber"
          badgeText="Project Deliverers"
        />
      </div>

      {/* Toolbar SearchBar Div */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs font-sans">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search by Name, Email, or User Code..."
        />

        <div className="flex items-center gap-2 font-sans w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans cursor-pointer w-full sm:w-auto"
          >
            <option value="">All User Types</option>
            {userTypes.map((ut) => {
              const utId = ut.UserTypeID || ut.userTypeID;
              const utName = ut.UserTypeName || ut.userTypeName;
              return (
                <option key={utId} value={utId}>
                  {utName}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Table Display */}
      <Table columns={columns} data={filteredUsers} keyField="UserID" itemsPerPage={6} />
    </div>
  );
};
