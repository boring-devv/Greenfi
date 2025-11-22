import { firestore } from '../config/firebase';
import { v4 as uuid } from 'uuid';

if (!firestore) {
  throw new Error('Firestore not initialized');
}

const projectsCollection = firestore.collection('projects');

export interface ProjectRecord {
  id: string;
  projectName: string;
  location?: string;
  description?: string;
  fundsRaised?: number;
  impactScore?: number;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProjectInput {
  projectName: string;
  location?: string;
  description?: string;
  fundsRaised?: number;
  impactScore?: number;
  status?: string;
}

export async function listProjects(limit = 100): Promise<ProjectRecord[]> {
  const snap = await projectsCollection.orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ProjectRecord) }));
}

export async function createProject(input: CreateProjectInput): Promise<ProjectRecord> {
  const id = uuid();
  const now = new Date().toISOString();

  const project: ProjectRecord = {
    id,
    projectName: input.projectName,
    location: input.location,
    description: input.description,
    fundsRaised: input.fundsRaised ?? 0,
    impactScore: input.impactScore ?? 0,
    status: input.status || 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  const cleanProject = Object.fromEntries(
    Object.entries(project).filter(([, value]) => value !== undefined)
  ) as ProjectRecord;

  await projectsCollection.doc(id).set(cleanProject);
  return cleanProject;
}

export async function approveProject(id: string): Promise<ProjectRecord | null> {
  const docRef = projectsCollection.doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  const now = new Date().toISOString();
  await docRef.update({ status: 'APPROVED', updatedAt: now });
  const updated = await docRef.get();
  return { id: updated.id, ...(updated.data() as ProjectRecord) };
}
