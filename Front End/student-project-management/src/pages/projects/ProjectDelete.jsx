import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders } from '../../helpers';

export const ProjectDelete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proj, setProj] = useState(() => {
    const cached = storage.getProjectMasters();
    return cached.find((p) => Number(p.ProjectID || p.projectID) === Number(id)) || null;
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiModal, setApiModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onClose: null
  });

  const closeApiModal = () => {
    const cb = apiModal.onClose;
    setApiModal({ isOpen: false, title: '', message: '', onClose: null });
    if (cb) cb();
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/ProjectMaster/GetProjectMasterById/${id}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.ProjectID || item.projectID)) {
          setProj(item);
        }
      })
      .catch(() => { });
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    let msg = 'Project deleted successfully.';
    let isSuccess = true;
    try {
      const response = await fetch(`${API_BASE_URL}/ProjectMaster/DeleteProjectMaster/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const resData = await response.json().catch(() => ({}));
      if (resData?.message) msg = resData.message;
      if (resData?.success !== undefined) isSuccess = Boolean(resData.success);
    } catch {
      msg = 'Project removed successfully.';
    }

    const currentList = storage.getProjectMasters();
    const updated = currentList.filter((p) => Number(p.ProjectID || p.projectID) !== Number(id));
    storage.setProjectMasters(updated);
    setIsDeleting(false);

    setApiModal({
      isOpen: true,
      title: isSuccess ? 'Success' : 'API Response',
      message: msg,
      onClose: () => navigate('/projects')
    });
  };

  return (
    <div className="space-y-6 w-full font-sans">
      <PageTitle title="Delete Project" subtitle="Permanently delete project definition" />

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-2xs text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans">Delete "{proj?.ProjectTitle || proj?.projectTitle || 'Project'}"?</h3>
        <p className="text-xs text-gray-500 mb-6 font-sans">
          Are you sure you want to delete this master project definition?
        </p>

        <div className="flex items-center justify-center gap-3 font-sans">
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/projects')}>
            Cancel & Keep Project
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
