import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const PriorityCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    TaskPriorityName: '',
    TaskPriorityCssClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  });
  const [loading, setLoading] = useState(false);
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/TaskPriority/CreateTaskPriority`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          TaskPriorityName: formData.TaskPriorityName || '',
          TaskPriorityCssClass: formData.TaskPriorityCssClass || ''
        })
      });

      const resData = await response.json().catch(() => ({}));
      const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : response.ok;
      setLoading(false);

      if (isSuccess) {
        const createdPriority = resData?.data || resData?.Data || {
          TaskPriorityID: Date.now(),
          TaskPriorityName: formData.TaskPriorityName,
          TaskPriorityCssClass: formData.TaskPriorityCssClass
        };
        const currentList = storage.getTaskPriorities();
        storage.setTaskPriorities([createdPriority, ...currentList]);

        const parsed = parseApiResponse(resData);
        setApiModal({
          isOpen: true,
          title: parsed.title,
          message: parsed.message,
          details: parsed.details,
          onClose: () => navigate('/task-priorities')
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
      setLoading(false);
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

  return (
    <div className="space-y-6 w-full font-sans antialiased text-gray-800">
      <PageTitle
        title="Create Task Priority"
        subtitle="Specify priority level and badge styling"
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/task-priorities')}>
            Back to Priorities
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs font-sans">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Priority Name *"
            placeholder="e.g. Low, Moderate, Critical"
            value={formData.TaskPriorityName}
            onChange={(e) => handleChange('TaskPriorityName', e.target.value)}
            required
          />
          <Input
            label="Tailwind CSS Badge Styling Class"
            placeholder="bg-red-100 text-red-700 border border-red-300"
            value={formData.TaskPriorityCssClass}
            onChange={(e) => handleChange('TaskPriorityCssClass', e.target.value)}
          />
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 font-sans">
            <Button variant="outline" type="button" onClick={() => navigate('/task-priorities')} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Save Priority
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
            <div className="text-left bg-red-50 p-3 rounded-xl border border-red-100 text-xs text-red-700 space-y-1.5 max-h-48 overflow-y-auto font-sans">
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
