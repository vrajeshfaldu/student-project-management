import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ProjectTitle: '',
    Description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
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
    // 1. Initial local cache check
    const cached = storage.getProjectMasters();
    const found = cached.find((p) => Number(p.ProjectID || p.projectID) === Number(id));
    if (found) {
      setFormData({
        ProjectTitle: found.ProjectTitle || found.projectTitle || '',
        Description: found.Description || found.description || ''
      });
      setIsLoaded(true);
    }

    // 2. Fetch from backend
    fetch(`${API_BASE_URL}/ProjectMaster/GetProjectMasterById/${id}`, {
      headers: getAuthHeaders()
    })
      .then((r) => r.json())
      .then((data) => {
        const item = data?.data || data?.Data || data;
        if (item && (item.ProjectTitle || item.projectTitle)) {
          setFormData({
            ProjectTitle: item.ProjectTitle || item.projectTitle || '',
            Description: item.Description || item.description || ''
          });
          setIsLoaded(true);
        }
      })
      .catch(() => { })
      .finally(() => {
        setIsLoaded(true);
      });
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ProjectMaster/UpdateProjectMaster/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ProjectID: Number(id),
          ProjectTitle: formData.ProjectTitle.trim(),
          Description: formData.Description.trim()
        })
      });

      const resData = await response.json().catch(() => ({}));
      const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : response.ok;
      setIsLoading(false);

      if (isSuccess) {
        const currentList = storage.getProjectMasters();
        const targetId = Number(id);
        const isTarget = (p) => {
          const pid = Number(p.ProjectID || p.projectID || p.ProjectMasterID || p.projectMasterID || 0);
          if (pid > 0 && targetId > 0 && pid === targetId) return true;
          const pTitle = (p.ProjectTitle || p.projectTitle || '').toLowerCase().trim();
          const formTitle = formData.ProjectTitle.trim().toLowerCase();
          return Boolean(pTitle && formTitle && pTitle === formTitle);
        };

        const firstMatchIdx = currentList.findIndex(isTarget);
        const baseObj = firstMatchIdx !== -1 ? currentList[firstMatchIdx] : {};
        const updatedProject = {
          ...baseObj,
          ProjectTitle: formData.ProjectTitle.trim(),
          Description: formData.Description.trim(),
          ProjectID: targetId,
          ProjectMasterID: targetId
        };

        let updatedList = currentList.filter((p) => !isTarget(p));
        if (firstMatchIdx !== -1) {
          updatedList.splice(firstMatchIdx, 0, updatedProject);
        } else {
          updatedList.push(updatedProject);
        }

        updatedList = deduplicateArray(updatedList);
        storage.setProjectMasters(updatedList);

        const parsed = parseApiResponse(resData);
        setApiModal({
          isOpen: true,
          title: parsed.title,
          message: parsed.message,
          details: parsed.details,
          onClose: () => navigate('/projects')
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

  if (!isLoaded && !formData.ProjectTitle) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 font-sans">
        <h3 className="text-base font-bold text-gray-900 mb-2">Project Not Found</h3>
        <Link to="/projects" className="text-xs font-bold text-indigo-600 hover:underline">
          Back to Projects List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans antialiased text-gray-800">
      <PageTitle
        title="Edit Project"
        subtitle="Modify project title and technical overview"
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-4 font-sans" noValidate>
          <Input
            label="Project Title *"
            placeholder="e.g. Smart College Attendance Portal using Facial Recognition"
            value={formData.ProjectTitle}
            onChange={(e) => handleChange('ProjectTitle', e.target.value)}
            required
          />
          <Textarea
            label="Project Overview / Description *"
            placeholder="Detailed scope, objectives, tech stack requirements..."
            rows={4}
            value={formData.Description}
            onChange={(e) => handleChange('Description', e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 font-sans">
            <Button variant="outline" type="button" onClick={() => navigate('/projects')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Changes
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

