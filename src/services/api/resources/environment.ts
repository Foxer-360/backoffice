import Server from '../config';

const getLanguages = () => {
  return Server.get('/language');
};

const getProjects = () => {
  return Server.get('/project');
};

const getWebsites = (projectId: number) => {
  return Server.get(`/website/${projectId}`);
};

export interface CreateProjectDto {
  name: string;
  defaultName?: string;
  languages: number[];
  defaultLanguage: number;
  settings?: LooseObject;
}
const createProject = (data: CreateProjectDto) => {
  return Server.post('/project', data);
};

export interface UpdateProjectDto {
  name?: string;
  defaultName?: string;
  languages?: number[];
  defaultLanguage?: number;
  settings?: LooseObject;
}
const updateProject = (id: number, data: UpdateProjectDto) => {
  return Server.put(`/project/${id}`, data);
};

const removeProject = (id: number) => {
  return Server.delete(`/project/${id}`);
};

export interface CreateWebsiteDto {
  title: string;
  projectId: number;
  languages: number[];
  defaultLanguage: number;
  urlMask: string;
  settings?: LooseObject;
}
const createWebsite = (data: CreateWebsiteDto) => {
  return Server.post('/website', data);
};

export interface UpdateWebsiteDto {
  title?: string;
  projectId?: number;
  languages?: number[];
  defaultLanguage?: number;
  urlMask?: string;
  settings?: LooseObject;
}
const updateWebsite = (id: number, data: UpdateWebsiteDto) => {
  return Server.put(`/website/${id}`, data);
};

const removeWebsite = (id: number) => {
  return Server.delete(`/website/${id}`);
};

export {
  getLanguages,
  getProjects,
  getWebsites,
  createProject,
  updateProject,
  removeProject,
  createWebsite,
  updateWebsite,
  removeWebsite
};
