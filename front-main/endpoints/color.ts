import instance from './instance';

export interface Color {
  id: number;
  name: string;
  code?: string;
  hex?: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllColors = async (): Promise<Color[]> => {
  const res = await instance.get('/color');
  return res.data;
};

export const getColorById = async (id: number): Promise<Color> => {
  const res = await instance.get(`/color/${id}`);
  return res.data;
};

export const createColor = async (colorData: Omit<Color, 'id' | 'createdAt' | 'updatedAt'>): Promise<Color> => {
  const res = await instance.post('/color', colorData);
  return res.data;
};

export const updateColor = async (id: number, colorData: Partial<Color>): Promise<Color> => {
  const res = await instance.put(`/color/${id}`, colorData);
  return res.data;
};

export const deleteColor = async (id: number): Promise<void> => {
  await instance.delete(`/color/${id}`);
};

// Compatibility aliases and default export
export const getAll = getAllColors;

const colorApi = {
  getAll: getAllColors,
  getById: getColorById,
  create: createColor,
  update: updateColor,
  delete: deleteColor,
};

export default colorApi;