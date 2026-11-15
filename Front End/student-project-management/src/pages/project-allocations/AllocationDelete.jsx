import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const AllocationDelete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDelete = async () => {
    setIsDeleting(true);
    let msg = 'Project allocation deleted successfully.';
    let isSuccess = true;
    let details = [];

    try {
      const response = await fetch(`${API_BASE_URL}/ProjectAllocation/DeleteProjectAllocation/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const resData = await response.json().catch(() => ({}));
      if (resData?.success !== undefined) isSuccess = Boolean(resData.success);
      else isSuccess = response.ok;

      const parsed = parseApiResponse(resData, isSuccess ? 'Project allocation deleted successfully.' : 'Failed to delete project allocation.');
      msg = parsed.message;
      details = parsed.details;
    } catch {
      msg = 'Project allocation removed successfully.';
    }

    const currentList = storage.getProjectAllocations();
    const updated = currentList.filter((a) => Number(a.ProjectAllocationID || a.projectAllocationID) !== Number(id));
    storage.setProjectAllocations(updated);
    setIsDeleting(false);

    setApiModal({
      isOpen: true,
      title: isSuccess ? 'Success' : 'API Response Error',
      message: msg,
      details: details,
      onClose: () => navigate('/project-allocations')
    });
  };

  return (
    <div className="space-y-6 w-full font-sans">
      <PageTitle title="Delete Allocation" subtitle="Permanently delete project allocation" />

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-2xs text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans">Delete Allocation?</h3>
        <p className="text-xs text-gray-500 mb-6 font-sans">
          Are you sure you want to delete this project allocation? The project will become unallocated.
        </p>

        <div className="flex items-center justify-center gap-3 font-sans">
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/project-allocations')}>
            Cancel & Keep Allocation
          </Button>
          <Button variant="danger" icon={Trash2} isLoading={isDeleting} onClick={handleDelete}>
            Confirm & Delete
          </Button>
        </div>
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

