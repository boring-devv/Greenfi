"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/components/admin/useAdminAuth';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';

interface AdminProjectRow {
  id: string;
  projectName: string;
  location?: string;
  description?: string;
  fundsRaised?: number;
  impactScore?: number;
  status?: string;
}

export default function AdminProjectsPage() {
  const { token, loading } = useAdminAuth({ require: true });
  const router = useRouter();
  const [projects, setProjects] = useState<AdminProjectRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!loading && !token) {
      router.push('/admin/login');
    }
  }, [loading, token, router]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/admin/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || 'Failed to load projects');
          return;
        }
        const data = (await res.json()) as { projects: AdminProjectRow[] };
        setProjects(data.projects || []);
      } catch (err) {
        console.error(err);
        setError('Unexpected error while loading projects');
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token]);

  const handleCreate = async () => {
    if (!token) return;
    if (!projectName.trim()) {
      setCreateError('Project name is required');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch(`${API_BASE}/projects/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectName: projectName.trim(), location: location.trim() || undefined, description: description.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.message || 'Failed to create project');
        return;
      }
      const data = (await res.json()) as { project: AdminProjectRow };
      setProjects((prev) => [data.project, ...prev]);
      setProjectName('');
      setLocation('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setCreateError('Unexpected error while creating project');
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/projects/approve/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { project: AdminProjectRow };
      setProjects((prev) => prev.map((p) => (p.id === id ? data.project : p)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !token) {
    return <div className="text-gray-400 text-sm">Loading projects...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neon-green mb-1">Projects</h1>
        <p className="text-sm text-gray-400">Manage and monitor climate projects funded by GreenFi.</p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="rounded-xl border border-neon-green/20 bg-black/60 p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-neon-green text-sm">Create new project</div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-3 py-1 rounded-full bg-neon-green text-black text-xs font-semibold hover:bg-neon-green/90 disabled:opacity-60"
          >
            {creating ? 'Creating...' : 'Add project'}
          </button>
        </div>
        {createError && <p className="text-[11px] text-red-400">{createError}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
            className="px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (optional)"
            className="px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            className="px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green md:col-span-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-neon-green/20 bg-black/60 p-4 shadow-[0_0_25px_rgba(0,255,136,0.15)]"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white">{p.projectName}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 uppercase">
                  {p.status || 'PENDING'}
                </span>
                {p.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleApprove(p.id)}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-neon-green/60 text-neon-green hover:bg-neon-green/10"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
            {p.location && <p className="text-xs text-gray-400 mb-1">{p.location}</p>}
            {p.description && <p className="text-xs text-gray-500 mb-3 line-clamp-3">{p.description}</p>}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                Funds Raised:{' '}
                <span className="text-neon-green">{p.fundsRaised ?? 0}</span>
              </span>
              <span>
                Impact Score:{' '}
                <span className="text-neon-green">{p.impactScore ?? 0}</span>
              </span>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-xs text-gray-500">No projects yet.</div>
        )}
      </div>
    </div>
  );
}
