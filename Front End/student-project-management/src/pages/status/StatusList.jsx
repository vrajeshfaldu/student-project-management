import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit3, Trash2, CheckSquare, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Table } from '../../components/tables/Table';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { StatCard } from '../../components/common/StatCard';
import { storage, API_BASE_URL, getAuthHeaders, extractApiArray } from '../../helpers';

export const StatusList = () => {
  const navigate = useNavigate();
  const [taskStatuses, setTaskStatuses] = useState(() => storage.getTaskStatuses());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/TaskStatus/GetAllTaskStatuses`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data);
        if (Array.isArray(list) && list.length > 0) {
          const cached = storage.getTaskStatuses();
          const merged = deduplicateArray([...cached, ...list]);
          setTaskStatuses(merged);
          storage.setTaskStatuses(merged);
        }
      })
      .catch(() => {});
  }, []);

  const safeStatuses = Array.isArray(taskStatuses) ? taskStatuses : [];

  const filteredStatuses = safeStatuses.filter((s) => {
    if (!s) return false;
    const name = s.TaskStatusName || s.taskStatusName || '';
    const css = s.TaskStatusCssClass || s.taskStatusCssClass || '';
    const term = (searchTerm || '').toLowerCase();
    return name.toLowerCase().includes(term) || css.toLowerCase().includes(term);
  });

  const totalStatuses = safeStatuses.length;
  const pendingStatuses = safeStatuses.filter((s) => {
    const name = (s?.TaskStatusName || s?.taskStatusName || '').toLowerCase();
    return name.includes('pending') || name.includes('todo');
  }).length;
  const inProgressStatuses = safeStatuses.filter((s) => {
    const name = (s?.TaskStatusName || s?.taskStatusName || '').toLowerCase();
    return name.includes('progress') || name.includes('ongoing');
  }).length;
  const completedStatuses = safeStatuses.filter((s) => {
    const name = (s?.TaskStatusName || s?.taskStatusName || '').toLowerCase();
    return name.includes('complete') || name.includes('done');
  }).length;

  const getFullStatusCssClass = (rawCss, statusName = '') => {
    const css = (rawCss || '').trim();
    const name = (statusName || '').toLowerCase();

    if (css === 'bg-amber-50 text-amb' || name.includes('pending') || name.includes('todo')) {
      return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    }
    if (css === 'bg-blue-50 text-blu' || name.includes('progress') || name.includes('ongoing')) {
      return 'bg-blue-100 text-blue-700 border border-blue-300';
    }
    if (css === 'bg-emerald-50 text-e' || name.includes('complete') || name.includes('done')) {
      return 'bg-green-100 text-green-700 border border-green-300';
    }
    if (name.includes('hold')) {
      return 'bg-orange-100 text-orange-700 border border-orange-300';
    }
    if (name.includes('cancel')) {
      return 'bg-red-100 text-red-700 border border-red-300';
    }

    let full = css;
    if (css.endsWith('text-amb')) full = css.replace('text-amb', 'text-yellow-700 border border-yellow-300');
    else if (css.endsWith('text-blu')) full = css.replace('text-blu', 'text-blue-700 border border-blue-300');
    else if (css.endsWith('text-e')) full = css.replace('text-e', 'text-green-700 border border-green-300');

    return full || 'bg-gray-100 text-gray-700 border border-gray-300';
  };

  const columns = [
    {
      header: 'TaskStatusName',
      field: 'TaskStatusName',
      sortable: true,
      render: (row) => <span className="font-bold text-gray-900">{row?.TaskStatusName || row?.taskStatusName || ''}</span>
    },
    {
      header: 'TaskStatusCssClass',
      field: 'TaskStatusCssClass',
      sortable: true,
      render: (row) => {
        const rawCss = row?.TaskStatusCssClass || row?.taskStatusCssClass || '';
        const name = row?.TaskStatusName || row?.taskStatusName || '';
        const fullCss = getFullStatusCssClass(rawCss, name);
        return (
          <span className={`font-mono text-xs font-semibold px-3 py-1 rounded-md inline-block shadow-2xs ${fullCss}`}>
            {fullCss}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => {
        const id = row?.TaskStatusID || row?.taskStatusID;
        return (
          <div className="flex items-center gap-1.5 font-sans">
            <Link
              to={`/task-statuses/${id}`}
              title="View Details"
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              to={`/task-statuses/edit/${id}`}
              title="Edit Task Status"
              className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <Link
              to={`/task-statuses/delete/${id}`}
              title="Delete Task Status"
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
        title="Task Status Management"
        subtitle="Configure deliverable lifecycle status tags and UI color styles"
        actionButton={
          <Button variant="primary" icon={Plus} onClick={() => navigate('/task-statuses/create')}>
            Add New Status
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StatCard
          title="Total Status States"
          value={totalStatuses}
          icon={CheckSquare}
          color="blue"
          badgeText="Active Definitions"
        />
        <StatCard
          title="Pending States"
          value={pendingStatuses}
          icon={Clock}
          color="amber"
          badgeText="Awaiting Execution"
        />
        <StatCard
          title="In Progress States"
          value={inProgressStatuses}
          icon={AlertTriangle}
          color="indigo"
          badgeText="Ongoing Deliverables"
        />
        <StatCard
          title="Completed States"
          value={completedStatuses}
          icon={CheckCircle2}
          color="emerald"
          badgeText="Verified Done"
        />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs font-sans">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search task statuses by name or CSS class..."
        />
      </div>

      <Table columns={columns} data={filteredStatuses} keyField="TaskStatusID" itemsPerPage={6} />
    </div>
  );
};
