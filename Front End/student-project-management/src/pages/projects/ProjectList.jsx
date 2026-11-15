import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit3, Trash2, FolderGit2, CheckCircle2, Clock, Users } from 'lucide-react';
import { PageTitle } from '../../layouts/PageTitle';
import { Table } from '../../components/tables/Table';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { StatCard } from '../../components/common/StatCard';
import { storage, API_BASE_URL, getAuthHeaders, getUserAllocations, extractApiArray, normalizeProject, normalizeAllocation, fetchProjectMastersApi, fetchProjectAllocationsApi } from '../../helpers';

export const ProjectList = () => {
  const navigate = useNavigate();
  const role = storage.getAuthRole();
  const user = storage.getAuthUser();

  const [projectMasters, setProjectMasters] = useState(() => storage.getProjectMasters());
  const [projectAllocations, setProjectAllocations] = useState(() => storage.getProjectAllocations());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Resilient Fetch Project Masters
    fetchProjectMastersApi().then((res) => {
      if (res.ok && res.arr.length > 0) {
        const list = res.arr.map(normalizeProject).filter(Boolean);
        setProjectMasters(list);
        storage.setProjectMasters(list);
      }
    });

    // Resilient Fetch Project Allocations
    fetchProjectAllocationsApi().then((res) => {
      if (res.ok && res.arr.length > 0) {
        const list = res.arr.map(normalizeAllocation).filter(Boolean);
        setProjectAllocations(list);
        storage.setProjectAllocations(list);
      }
    });
  }, []);

  const currentUserId = Number(user?.UserID || user?.userID || 0);
  const rawProjects = extractApiArray(projectMasters).map(normalizeProject).filter(Boolean);
  const rawAllocations = extractApiArray(projectAllocations).map(normalizeAllocation).filter(Boolean);

  // Helper to reliably find the matching backend ProjectMaster by ProjectID, AllocationID, or Title
  const getMasterForProject = (item) => {
    if (!item) return null;
    const itemProjId = Number(item.ProjectID || item.projectID || item.ProjectMasterID || item.projectMasterID || 0);
    const itemAllocId = Number(item.ProjectAllocationID || item.projectAllocationID || 0);
    const itemTitle = (item.ProjectTitle || item.projectTitle || item.Title || item.title || item.Topic || item.topic || item.ProjectTopic || item.projectTopic || '').toLowerCase().trim();

    // 1. Match by ProjectID
    if (itemProjId > 0) {
      const matchById = rawProjects.find((p) => Number(p.ProjectID || p.projectID || p.ProjectMasterID || p.projectMasterID) === itemProjId);
      if (matchById) return matchById;
    }

    // 2. Match by AllocationID
    if (itemAllocId > 0) {
      const matchByAllocId = rawProjects.find((p) => Number(p.ProjectID || p.projectID || p.ProjectMasterID || p.projectMasterID) === itemAllocId);
      if (matchByAllocId) return matchByAllocId;
    }

    // 3. Match by Title / Topic string similarity
    if (itemTitle) {
      const matchByTitle = rawProjects.find((p) => {
        const pTitle = (p.ProjectTitle || p.projectTitle || p.Title || p.title || p.Topic || p.topic || p.ProjectTopic || p.projectTopic || '').toLowerCase().trim();
        return pTitle && (itemTitle === pTitle || itemTitle.includes(pTitle) || pTitle.includes(itemTitle));
      });
      if (matchByTitle) return matchByTitle;
    }

    return null;
  };

  // Filter projects based on user role
  let roleFilteredProjects = rawProjects;
  let roleFilteredAllocations = rawAllocations;

  if (role === 'Faculty' || role === 'Student') {
    roleFilteredAllocations = getUserAllocations(user, role, rawAllocations);

    const assignedProjectIds = roleFilteredAllocations.map(
      (a) => Number(a.ProjectID || a.projectID || a.ProjectMasterID || a.projectMasterID || 0)
    ).filter((id) => id > 0);

    const assignedTitles = roleFilteredAllocations.map(
      (a) => (a.ProjectTitle || a.projectTitle || a.Topic || a.topic || '').toLowerCase().trim()
    ).filter((t) => t.length > 0);

    // 1. Find matching ProjectMaster objects directly from rawProjects (which contain real Description!)
    const matchedMasterProjects = rawProjects.filter((p) => {
      const pId = Number(p.ProjectID || p.projectID || p.ProjectMasterID || p.projectMasterID || 0);
      const pTitle = (p.ProjectTitle || p.projectTitle || p.Title || p.title || '').toLowerCase().trim();
      const stuId = Number(p.StudentID || p.studentID || 0);
      const facId = Number(p.FacultyID || p.facultyID || 0);

      if (pId && assignedProjectIds.includes(pId)) return true;
      if (pTitle && assignedTitles.some((t) => t === pTitle || t.includes(pTitle) || pTitle.includes(t))) return true;
      if (currentUserId && (stuId === currentUserId || facId === currentUserId)) return true;
      return false;
    });

    const projectMap = new Map();
    matchedMasterProjects.forEach((p) => {
      const pId = Number(p.ProjectID || p.projectID);
      if (pId) projectMap.set(pId, p);
    });

    // 2. For any allocation whose master is not in projectMap yet, attempt master lookup
    roleFilteredAllocations.forEach((a) => {
      const master = getMasterForProject(a);
      if (master) {
        const mId = Number(master.ProjectID || master.projectID);
        if (mId && !projectMap.has(mId)) {
          projectMap.set(mId, master);
        }
      } else {
        const aId = Number(a.ProjectID || a.projectID || a.ProjectAllocationID);
        if (aId && !projectMap.has(aId)) {
          projectMap.set(aId, normalizeProject(a));
        }
      }
    });

    const combinedUserProjects = Array.from(projectMap.values());
    roleFilteredProjects = combinedUserProjects;
  }

  const filteredProjects = roleFilteredProjects.filter((p) => {
    if (!p) return false;
    const master = getMasterForProject(p) || p;
    const title = master.ProjectTitle || master.projectTitle || p.ProjectTitle || p.projectTitle || '';
    const desc = master.Description || master.description || p.Description || p.description || '';
    const term = (searchTerm || '').toLowerCase();
    return title.toLowerCase().includes(term) || desc.toLowerCase().includes(term);
  });

  const totalProjects = roleFilteredProjects.length;
  const allocatedProjects = roleFilteredAllocations.length;
  const completedProjects = roleFilteredAllocations.filter((a) => Number(a.ProgressPercentage || a.progressPercentage || 0) >= 100).length;
  const activeProjects = roleFilteredAllocations.filter((a) => Number(a.ProgressPercentage || a.progressPercentage || 0) < 100).length;

  const columns = [
    {
      header: 'Project Title',
      field: 'ProjectTitle',
      sortable: true,
      render: (row) => {
        const master = getMasterForProject(row) || row;
        const title = master?.ProjectTitle || master?.projectTitle || row?.ProjectTitle || row?.projectTitle || 'Untitled Project';
        return <span className="font-bold text-gray-900">{title}</span>;
      }
    },
    {
      header: 'Description',
      field: 'Description',
      render: (row) => {
        const master = getMasterForProject(row) || row;
        const desc =
          master?.Description ||
          master?.description ||
          master?.ProjectDescription ||
          master?.projectDescription ||
          master?.Details ||
          master?.details ||
          row?.Description ||
          row?.description ||
          '';
        return <span className="text-xs text-gray-600 font-medium line-clamp-2">{desc}</span>;
      }
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => {
        const id = row?.ProjectID || row?.projectID;
        return (
          <div className="flex items-center gap-1.5 font-sans">
            <Link
              to={`/projects/${id}`}
              title="View Project Details"
              className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {role !== 'Student' && (
              <>
                <Link
                  to={`/projects/edit/${id}`}
                  title="Edit Project"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
                <Link
                  to={`/projects/delete/${id}`}
                  title="Delete Project"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800">
      <PageTitle
        title="Project Masters"
        subtitle="Repository of university approved technical projects and scopes"
        actionButton={
          role !== 'Student' ? (
            <Button variant="primary" icon={Plus} onClick={() => navigate('/projects/create')}>
              Create Project Master
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <StatCard
          title="Total Registered Projects"
          value={totalProjects}
          icon={FolderGit2}
          color="blue"
          badgeText="Active Masters"
        />
        <StatCard
          title="Allocated Projects"
          value={allocatedProjects}
          icon={Users}
          color="emerald"
          badgeText="Assigned to Candidates"
        />
        <StatCard
          title="Active Sprints"
          value={activeProjects}
          icon={Clock}
          color="indigo"
          badgeText="In Execution"
        />
        <StatCard
          title="Completed Projects"
          value={completedProjects}
          icon={CheckCircle2}
          color="amber"
          badgeText="Evaluated Done"
        />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs font-sans">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Search projects by title or description..."
        />
      </div>

      <Table columns={columns} data={filteredProjects} keyField="ProjectID" itemsPerPage={6} />
    </div>
  );
};
