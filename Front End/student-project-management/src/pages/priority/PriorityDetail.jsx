import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, Flag, Palette } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Button } from '../../components/common/Button';
import { storage, API_BASE_URL, getAuthHeaders } from '../../helpers';

export const PriorityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prObj, setPrObj] = useState(() => {
    const cached = storage.getTaskPriorities();
    return cached.find((p) => Number(p.TaskPriorityID || p.taskPriorityID) === Number(id)) || null;
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/TaskPriority/GetTaskPriorityById/${id}`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.TaskPriorityID || item.taskPriorityID)) {
          setPrObj(item);
        }
      })
      .catch(() => {});
  }, [id]);

  if (!prObj) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 font-sans">
        <h3 className="text-base font-bold text-gray-900 mb-2 font-sans">Task Priority Record Not Found</h3>
        <Button variant="outline" onClick={() => navigate('/task-priorities')}>
          Back to Priority List
        </Button>
      </div>
    );
  }

  const priorityName = prObj.TaskPriorityName || prObj.taskPriorityName || 'Priority';
  const cssClass = prObj.TaskPriorityCssClass || prObj.taskPriorityCssClass || 'badge-default';

  return (
    <div className="space-y-6 w-full font-sans antialiased text-gray-800">
      <PageTitle
        title={`Priority Details: ${priorityName}`}
        subtitle="Task priority configuration record"
        actionButton={
          <div className="flex items-center gap-2 font-sans">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/task-priorities')}>
              Back to List
            </Button>
            <Button variant="primary" icon={Edit3} onClick={() => navigate(`/task-priorities/edit/${id}`)}>
              Edit Priority
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-6 font-sans">
        <div className="flex items-center justify-between gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 font-sans">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Flag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 font-sans">{priorityName}</h3>
              </div>
              <p className="text-xs text-gray-500 font-medium font-sans">Task Priority Record</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs font-sans">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-sans">
            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
              <Flag className="w-4 h-4" />
              <span className="text-gray-400 uppercase tracking-wider">Priority Name</span>
            </div>
            <span className="text-gray-900 font-bold text-sm block">{priorityName}</span>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs font-sans">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
            <Palette className="w-4 h-4" />
            <span className="text-gray-400 uppercase tracking-wider font-sans">TaskPriorityCssClass</span>
          </div>
          <div className="flex items-center gap-3">
            <code className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg text-gray-800 border border-gray-200">
              {cssClass}
            </code>
            <span className={`px-3 py-1 rounded-md text-xs font-bold border shadow-2xs ${cssClass.includes('bg-') ? cssClass : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
              {priorityName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
