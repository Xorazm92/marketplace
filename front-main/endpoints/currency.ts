import instance from './instance';

export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllCurrencies = async (): Promise<Currency[]> => {
  const res = await instance.get('/currency');
  return res.data;
};

export const getCurrencyById = async (id: number): Promise<Currency> => {
  const res = await instance.get(`/currency/${id}`);
  return res.data;
};

export const createCurrency = async (currencyData: Omit<Currency, 'id' | 'createdAt' | 'updatedAt'>): Promise<Currency> => {
  const res = await instance.post('/currency', currencyData);
  return res.data;
};

export const updateCurrency = async (id: number, currencyData: Partial<Currency>): Promise<Currency> => {
  const res = await instance.put(`/currency/${id}`, currencyData);
  return res.data;
};

export const deleteCurrency = async (id: number): Promise<void> => {
  await instance.delete(`/currency/${id}`);
};

export const seedCurrencies = async (): Promise<void> => {
  await instance.post('/currency/seed', {});
};

// Compatibility exports and default
export const getAll = getAllCurrencies;

const currencyApi = {
  getAll: getAllCurrencies,
  getById: getCurrencyById,
  create: createCurrency,
  update: updateCurrency,
  delete: deleteCurrency,
  seed: seedCurrencies,
};

export default currencyApi;