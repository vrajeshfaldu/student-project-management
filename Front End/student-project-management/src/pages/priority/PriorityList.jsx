import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit3, Trash2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Table } from '../../components/tables/Table';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { StatCard } from '../../components/common/StatCard';
import { storage, API_BASE_URL, getAuthHeaders, extractApiArray } from '../../helpers';

export const PriorityList = () => {
  const navigate = useNavigate();
  const [taskPriorities, setTaskPriorities] = useState(() => storage.getTaskPriorities());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/TaskPriority/GetAllTaskPriorities`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = extractApiArray(data);
        if (Array.isArray(list) && list.length > 0) {
          const cached = storage.getTaskPriorities();
          const merged = deduplicateArray([...cached, ...list]);
          setTaskPriorities(merged);
          storage.setTaskPriorities(merged);
        }
      })
      .catch(() => {});
  }, []);

  const safePriorities = Array.isArray(taskPriorities) ? taskPriorities : [];

  const filteredPriorities = safePriorities.filter((p) => {
    if (!p) return false;
    const name = p.TaskPriorityName || p.taskPriorityName || '';
    const css = p.TaskPriorityCssClass || p.taskPriorityCssClass || '';
    const term = (searchTerm || '').toLowerCase();
    return name.toLowerCase().includes(term) || css.toLowerCase().includes(term);
  });

  const totalPriorities = safePriorities.length;
  const criticalPriorities = safePriorities.filter((p) => {
    const name = (p?.TaskPriorityName || p?.taskPriorityName || '').toLowerCase();
    return name.includes('high') || name.includes('critical') || name.includes('urgent');
  }).length;

  const mediumPriorities = safePriorities.filter((p) => {
    const name = (p?.TaskPriorityName || p?.taskPriorityName || '').toLowerCase();
    return name.includes('medium') || name.includes('moderate');
  }).length;

  const lowPriorities = safePriorities.filter((p) => {
    const name = (p?.TaskPriorityName || p?.taskPriorityName || '').toLowerCase();
    return name.includes('low') || name.includes('minor');
  }).length;

  const getFullPriorityCssClass = (rawCss, priorityName = '') => {
    const css = (rawCss || '').trim();
    const name = (priorityName || '').toLowerCase();

    if (css === 'bg-gray-100 text-gra' || name.includes('low') || css === 'bg-gray-100') {
      return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
    if (css === 'bg-yellow-100 text-y' || name.includes('medium') || name.includes('moderate')) {
      return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    }
    if (css === 'bg-orange-100 text-o' || name.includes('high')) {
      return 'bg-orange-100 text-orange-700 border border-orange-300';
    }
    if (css === 'bg-red-100 text-red-' || name.includes('critical') || name.includes('urgent')) {
      return 'bg-red-100 text-red-700 border border-red-300';
    }

    let full = css;
    if (css.endsWith('text-gra')) full = css.replace('text-gra', 'text-gray-700 border border-gray-300');
    else if (css.endsWith('text-y')) full = css.replace('text-y', 'text-yellow-700 border border-yellow-300');
    else if (css.endsWith('text-o')) full = css.replace('text-o', 'text-orange-700 border border-orange-300');
    else if (css.endsWith('text-red-')) full = css.replace('text-red-', 'text-red-700 border border-red-300');

    return full || 'bg-gray-100 text-gray-700 border border-gray-300';
  };

  const columns = [
    {
      header: 'TaskPriorityName',
      field: 'TaskPriorityName',
      sortable: true,
      render: (row) => <span className="font-bold text-gray-900">{row?.TaskPriorityName || row?.taskPriorityName || ''}</span>
    },
    {
      header: 'TaskPriorityCssClass',
      field: 'TaskPriorityCssClass',
      sortable: true,
      render: (row) => {
        const rawCss = row?.TaskPriorityCssClass || row?.taskPriorityCssClass || '';
        const name = row?.TaskPriorityName || row?.taskPriorityName || '';
        const fullCss = getFullPriorityCssClass(rawCss, name);
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
        const id = row?.TaskPriorityID || row?.taskPriorityID;
        return (
          <div className="flex items-center gap-1.5 font-sans">
            <Link
              to={`/task-priorities/${id}`}
              title="View Details"
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              to={`/task-priorities/edit/${id}`}
              title="Edit Task Priority"
              className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <Link
              to={`/task-priorities/delete/${id}`}
              title="Delete Task Priority"
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
        title="Task Priority Management"
        subtitle="Configure deliverable priority levels and urgency badge styling"
        actionButton={
          <Button variant="primary" icon={Plus} onClick={() => navigate('/task-priorities/create')}>
            Add New Priority
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StatCard
          title="Total Priority Levels"
          value={totalPriorities}
          icon={AlertTriangle}
          color="blue"
          badgeText="Urgency Classifications"
        />
        <StatCard
          title="Critical Levels"
          value={criticalPriorities}
          icon={AlertTriangle}
          color="rose"
          badgeText="High Urgency"
        />
        <StatCard
          title="Moderate Levels"
          value={mediumPriorities}
          icon={Clock}
          color="indigo"
          badgeText="Standard Urgency"
        />
        <StatCard
          title="Low Urgency Levels"
          value={lowPriorities}
          icon={ShieldCheck}
          color="emerald"
          badgeText="Low Urgency"
        />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs font-sans">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search task priorities by name or CSS class..."
        />
      </div>

      <Table
        columns={columns}
        data={filteredPriorities}
        keyField="TaskPriorityID"
        showPagination={false}
      />
    </div>
  );
};
