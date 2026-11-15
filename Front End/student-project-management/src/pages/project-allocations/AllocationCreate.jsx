import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storage, API_BASE_URL, getAuthHeaders, parseApiResponse } from '../../helpers';

export const AllocationCreate = () => {
  const navigate = useNavigate();
  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [users, setUsers] = useState(() => storage.getUsers());

  const [formData, setFormData] = useState({
    ProjectID: '',
    StudentID: '',
    FacultyID: '',
    ProjectStartDate: new Date().toISOString().split('T')[0],
    ProjectEndDate: '',
    OverAllGrade: 'Pending'
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
    // Fetch Project Masters
    fetch(`${API_BASE_URL}/ProjectMaster/GetAllProjectMasters`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setProjectMasters(list);
          storage.setProjectMasters(list);
        }
      })
      .catch(() => { });

    // Fetch Users
    fetch(`${API_BASE_URL}/User/GetAllUsers`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setUsers(list);
          storage.setUsers(list);
        }
      })
      .catch(() => { });
  }, []);

  const students = users.filter((u) => {
    const typeId = Number(u.UserTypeID || u.userTypeID || 0);
    const code = (u.UserCode || u.userCode || '').toLowerCase();
    const name = (u.UserTypeName || u.userTypeName || '').toLowerCase();
    return typeId === 1 || typeId === 3 || code.startsWith('stu') || name.includes('student');
  });
  const faculties = users.filter((u) => {
    const typeId = Number(u.UserTypeID || u.userTypeID || 0);
    const code = (u.UserCode || u.userCode || '').toLowerCase();
    const name = (u.UserTypeName || u.userTypeName || '').toLowerCase();
    return typeId === 2 || code.startsWith('fac') || name.includes('faculty') || name.includes('guide');
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ProjectAllocation/CreateProjectAllocation`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ProjectID: Number(formData.ProjectID),
          StudentID: Number(formData.StudentID),
          FacultyID: Number(formData.FacultyID),
          AssignedDate: new Date().toISOString(),
          ProjectStartDate: formData.ProjectStartDate,
          ProjectEndDate: formData.ProjectEndDate,
          TotalTasksGiven: 0,
          TotalCompletedTasks: 0,
          ProgressPercentage: 0,
          OverAllGrade: formData.OverAllGrade || 'Pending'
        })
      });

      const resData = await response.json().catch(() => ({}));
      const isSuccess = resData?.success !== undefined ? Boolean(resData.success) : response.ok;
      setIsLoading(false);

      if (isSuccess) {
        const createdAlloc = resData?.data || resData?.Data || {
          ProjectAllocationID: Date.now(),
          ProjectID: Number(formData.ProjectID),
          StudentID: Number(formData.StudentID),
          FacultyID: Number(formData.FacultyID),
          AssignedDate: new Date().toISOString(),
          ProjectStartDate: formData.ProjectStartDate,
          ProjectEndDate: formData.ProjectEndDate,
          TotalTasksGiven: 0,
          TotalCompletedTasks: 0,
          ProgressPercentage: 0,
          OverAllGrade: formData.OverAllGrade || 'Pending'
        };
        const currentList = storage.getProjectAllocations();
        storage.setProjectAllocations([createdAlloc, ...currentList]);

        const parsed = parseApiResponse(resData);
        setApiModal({
          isOpen: true,
          title: parsed.title,
          message: parsed.message,
          details: parsed.details,
          onClose: () => navigate('/project-allocations')
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

  const projectOptions = projectMasters.map((p) => ({
    value: p.ProjectID || p.projectID,
    label: p.ProjectTitle || p.projectTitle
  }));

  const studentOptions = students.map((s) => ({
    value: s.UserID || s.userID,
    label: `${s.FullName || s.fullName} (${s.UserCode || s.userCode})`
  }));

  const facultyOptions = faculties.map((f) => ({
    value: f.UserID || f.userID,
    label: `${f.FullName || f.fullName} (${f.UserCode || f.userCode})`
  }));

  const gradeOptions = [
    { value: 'Pending', label: 'Pending Evaluation' },
    { value: 'A+', label: 'Grade A+' },
    { value: 'A', label: 'Grade A' },
    { value: 'B+', label: 'Grade B+' },
    { value: 'B', label: 'Grade B' },
    { value: 'C', label: 'Grade C' },
    { value: 'F', label: 'Grade F' }
  ];

  return (
    <div className="space-y-6 w-full font-sans antialiased text-gray-800">
      <PageTitle
        title="Allocate Project"
        subtitle="Assign student candidate, faculty guide, timeline, and grade"
        actionButton={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/project-allocations')}>
            Back to Allocations
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs font-sans">
        <form onSubmit={handleSubmit} className="space-y-4 font-sans" noValidate>
          <Select
            label="Select Project Master *"
            placeholder="Choose Project"
            options={projectOptions}
            value={formData.ProjectID}
            onChange={(e) => handleChange('ProjectID', e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assigned Student *"
              placeholder="Choose Student"
              options={studentOptions}
              value={formData.StudentID}
              onChange={(e) => handleChange('StudentID', e.target.value)}
              required
            />
            <Select
              label="Faculty Mentor / Guide *"
              placeholder="Choose Faculty"
              options={facultyOptions}
              value={formData.FacultyID}
              onChange={(e) => handleChange('FacultyID', e.target.value)}
              required
            />
            <Input
              label="Project Start Date *"
              type="date"
              value={formData.ProjectStartDate}
              onChange={(e) => handleChange('ProjectStartDate', e.target.value)}
              required
            />
            <Input
              label="Project Deadline / End Date *"
              type="date"
              value={formData.ProjectEndDate}
              onChange={(e) => handleChange('ProjectEndDate', e.target.value)}
              required
            />
          </div>

          <Select
            label="Overall Semester Grade"
            placeholder="Select Grade"
            options={gradeOptions}
            value={formData.OverAllGrade}
            onChange={(e) => setFormData({ ...formData, OverAllGrade: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 font-sans">
            <Button variant="outline" type="button" onClick={() => navigate('/project-allocations')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Allocate Project
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

