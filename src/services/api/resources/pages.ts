import Server from '../config';

const getTypes = () => {
  return Server.get('/type');
};

const getStructures = (websiteId: number) => {
  return Server.get(`structure/list/${websiteId}`);
};

export interface CreatePageDto {
  websiteId: number;
  parentId?: number | null;
  typeId: number;
  url: string;
  name: string;
}
const createPage = (data: CreatePageDto) => {
  return Server.post('/structure', data);
};

const getPages = (structureId: number) => {
  return Server.get(`/page/${structureId}`);
};

const removePage = (structureId: number) => {
  return Server.delete(`/structure/${structureId}`);
};

export interface UpdatePageDto {
  name?: string;
  content?: LooseObject[];
}
const updatePage = (id: number, data: UpdatePageDto) => {
  return Server.put(`/page/${id}`, data);
};

const getPageDetail = (structureId: number, id: number) => {
  return Server.get(`/page/${structureId}/${id}`);
};

const removeType = (id: number) => {
  return Server.delete(`/type/${id}`);
};

export interface CreateTypeDto {
  name: string;
  defaultContent?: LooseObject[];
}
const addType = (data: CreateTypeDto) => {
  return Server.post('/type', data);
};

export interface UpdateTypeDto {
  name?: string;
  defaultContent?: LooseObject[];
}
const editType = (id: number, data: UpdateTypeDto) => {
  return Server.put(`/type/${id}`, data);
};

const getType = (id: number) => {
  return Server.get(`/type/${id}`);
};

export {
  getTypes,
  getStructures,
  createPage,
  getPages,
  removePage,
  updatePage,
  getPageDetail,
  removeType,
  addType,
  editType,
  getType
};
