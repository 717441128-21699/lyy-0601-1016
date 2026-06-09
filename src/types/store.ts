export interface Store {
  id: string;
  name: string;
  code: string;
  province: string;
  city: string;
  district: string;
  address: string;
  status: 'open' | 'closed' | 'renovating';
  area: number;
  manager: string;
  phone: string;
  regionCode: string;
}

export interface Region {
  code: string;
  name: string;
  level: 'province' | 'city' | 'district';
  parentCode: string | null;
  children?: Region[];
  storeCount?: number;
}

export interface StoreFilter {
  keyword?: string;
  regionCode?: string;
  status?: Store['status'];
  page?: number;
  pageSize?: number;
}

export const STORE_STATUS_LABEL: Record<Store['status'], string> = {
  open: '营业中',
  closed: '已关闭',
  renovating: '装修中',
};

export const STORE_STATUS_COLOR: Record<Store['status'], string> = {
  open: 'success',
  closed: 'default',
  renovating: 'warning',
};
