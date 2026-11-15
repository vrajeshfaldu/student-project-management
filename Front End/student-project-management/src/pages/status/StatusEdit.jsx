import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const StatusEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stObj, setStObj] = useState(() => {
    const cached = storage.getTaskStatuses();
    return cached.find((s) => Number(s.TaskStatusID || s.taskStatusID) === Number(id)) || null;
  });

  const [formData, setFormData] = useState({
    TaskStatusName: '',
    TaskStatusCssClass: 'bg-blue-50 text-blue-700 border-blue-200'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiModal, setApiModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: [],
    onClose: null
  });

  const closeApiModal = () => {
    const cb = apiModal.onClose;
    setApiModal({ isOpen: false, title: '', message: '', details: [], onClose: null });
    if (cb) cb();
  };

  useEffect(() => {
    if (stObj) {
      setFormData({
        TaskStatusName: stObj.TaskStatusName || stObj.taskStatusName || '',
        TaskStatusCssClass: stObj.TaskStatusCssClass || stObj.taskStatusCssClass || 'bg-blue-50 text-blue-700 border-blue-200'
      });
    }
  }, [stObj]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/TaskStatus/GetTaskStatusById/${id}`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.TaskStatusID || item.taskStatusID)) {
          setStObj(item);
          setFormData({
            TaskStatusName: item.TaskStatusName || item.taskStatusName || '',
            TaskStatusCssClass: item.TaskStatusCssClass || item.taskStatusCssClass || 'bg-blue-50 text-blue-700 border-blue-200'
          });
        }
      })
      .catch(() => { });
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/TaskStatus/UpdateTaskStatus/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          TaskStatusID: Number(id),
          TaskStatusName: formData.TaskStatusName || '',
          TaskStatusCssClass: formData.TaskStatusCssClass || ''
        })
      });

      const resData = await response.json().catch(() => ({}));
      const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : response.ok;
      setIsLoading(false);

      if (isSuccess) {
        const currentList = storage.getTaskStatuses();
        const targetId = Number(id);
        const isTarget = (s) => {
          const sid = Number(s.TaskStatusID || s.taskStatusID || 0);
          if (sid > 0 && targetId > 0 && sid === targetId) return true;
          const sName = (s.TaskStatusName || s.taskStatusName || '').toLowerCase().trim();
          const formName = (formData.TaskStatusName || '').toLowerCase().trim();
          return Boolean(sName && formName && sName === formName);
        };

        const firstMatchIdx = currentList.findIndex(isTarget);
        const baseObj = firstMatchIdx !== -1 ? currentList[firstMatchIdx] : {};
        const updatedStatus = {
          ...baseObj,
          ...formData,
          TaskStatusID: targetId
        };

        let updatedList = currentList.filter((s) => !isTarget(s));
        if (firstMatchIdx !== -1) {
          updatedList.splice(firstMatchIdx, 0, updatedStatus);
        } else {
          updatedList.push(updatedStatus);
        }

        updatedList = deduplicateArray(updatedList);
        storage.setTaskStatuses(updatedList);

        const parsed = parseApiResponse(resData);
        setApiModal({
          isOpen: true,
          title: parsed.title,
          message: parsed.message,
          details: parsed.details,
          onClose: () => navigate('/task-statuses')
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

  if (!stObj) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 font-sans">
        <h3 className="text-base font-bold text-gray-900 mb-2 font-sans">Status Record Not Found</h3>
        <Link to="/task-statuses" className="text-xs font-bold text-indigo-600 hover:underline font-sans">
          Back to Status List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans">
      <PageTitle
        title="Edit Task Status"
        subtitle="Modify TaskStatusName or CSS class"
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/task-statuses')}>
            Back to Statuses
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs font-sans">
        <form onSubmit={handleSubmit} className="space-y-4 font-sans" noValidate>
          <Input
            label="Status Name *"
            placeholder="e.g. Pending, Ongoing, Completed, Cancelled"
            value={formData.TaskStatusName}
            onChange={(e) => handleChange('TaskStatusName', e.target.value)}
            required
          />
          <Input
            label="Tailwind CSS Badge Styling Class"
            placeholder="bg-emerald-50 text-emerald-700 border-emerald-200"
            value={formData.TaskStatusCssClass}
            onChange={(e) => handleChange('TaskStatusCssClass', e.target.value)}
          />
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 font-sans">
            <Button variant="outline" type="button" onClick={() => navigate('/task-statuses')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Task Status
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
          <div className="flex justify-end pt-2 font-sans">
            <Button onClick={closeApiModal}>
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

