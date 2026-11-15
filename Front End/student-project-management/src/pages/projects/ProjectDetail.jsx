import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, FolderGit2 } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate, storage, API_BASE_URL, getAuthHeaders, fetchProjectMasterByIdApi, normalizeProject } from '../../helpers';

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = storage.getAuthRole();

  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [users, setUsers] = useState(() => storage.getUsers());
  const [projObj, setProjObj] = useState(() => {
    const cached = storage.getProjectMasters();
    return cached.find((p) => Number(p.ProjectID || p.projectID) === Number(id)) || null;
  });

  useEffect(() => {
    // Fetch project using resilient API helper
    fetchProjectMasterByIdApi(id).then((res) => {
      if (res.ok && res.data) {
        const item = res.data.data || res.data.Data || res.data;
        if (item) setProjObj(normalizeProject(item));
      }
    });

    // Fetch allocations
    fetch(`${API_BASE_URL}/ProjectAllocation/GetAllProjectAllocations`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setProjectAllocations(list);
          storage.setProjectAllocations(list);
        }
      })
      .catch(() => {});

    // Fetch users
    fetch(`${API_BASE_URL}/User/GetAllUsers`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          setUsers(list);
          storage.setUsers(list);
        }
      })
      .catch(() => {});
  }, [id]);

  const proj = projObj || projectMasters.find((p) => Number(p.ProjectID || p.projectID) === Number(id));
  const alloc = projectAllocations.find((a) => Number(a.ProjectID || a.projectID) === Number(id));
  const student = users.find((u) => Number(u.UserID || u.userID) === Number(alloc?.StudentID || alloc?.studentID));
  const faculty = users.find((u) => Number(u.UserID || u.userID) === Number(alloc?.FacultyID || alloc?.facultyID));

  if (!proj) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-2">Project Not Found</h3>
        <Button variant="outline" onClick={() => navigate('/projects')}>
          Back to Projects List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageTitle
        title={`Project Details: ${proj.ProjectTitle || proj.projectTitle}`}
        subtitle="Complete project overview and allocation mapping"
        actionButton={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/projects')}>
              Back to List
            </Button>
            {role !== 'Student' && (
              <Button variant="primary" icon={Edit3} onClick={() => navigate(`/projects/edit/${id}`)}>
                Edit Project
              </Button>
            )}
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-6">
        <div className="flex items-start gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-gray-900 leading-tight">{proj.ProjectTitle || proj.projectTitle}</h2>
            {alloc?.OverAllGrade ? (
              <Badge variant="success">Semester Grade: {alloc.OverAllGrade}</Badge>
            ) : (
              <Badge variant="gray">Unallocated / Pending Grade</Badge>
            )}
          </div>
        </div>

        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
          <span className="text-gray-400 block font-bold uppercase mb-1">Project Description & Scope</span>
          <p className="text-gray-800 leading-relaxed text-sm">{proj.Description || proj.description || 'No description provided.'}</p>
        </div>

        {alloc ? (
          <div className="space-y-3 p-5 bg-gray-50/80 rounded-2xl border border-gray-100 text-xs">
            <h4 className="font-bold text-gray-900 text-sm">Allocation Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-gray-400 block mb-1">Student Candidate</span>
                <span className="font-bold text-gray-800">{student?.FullName || alloc?.StudentName || 'Assigned Student'}</span>
                <span className="text-indigo-600 font-semibold block">{student?.UserCode || ''}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-100">
                <span className="text-gray-400 block mb-1">Faculty Guide</span>
                <span className="font-bold text-gray-800">{faculty?.FullName || alloc?.FacultyName || 'Faculty Mentor'}</span>
              </div>
            </div>
            <div className="pt-2 text-xs text-gray-600">
              <strong>Dates:</strong> {formatDate(alloc.ProjectStartDate)} to {formatDate(alloc.ProjectEndDate)}
            </div>
          </div>
        ) : (
          <p className="text-xs text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200 font-semibold">
            This project has not been allocated to a student yet.
          </p>
        )}
      </div>
    </div>
  );
};
