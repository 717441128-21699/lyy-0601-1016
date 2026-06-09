export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  price: number;
  originalPrice: number;
  stock: number;
  imageUrl: string;
  status: 'on_sale' | 'off_sale' | 'out_of_stock';
  specs: string;
  brand: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  parentId: string | null;
  children?: ProductCategory[];
  productCount?: number;
}

export interface ProductFilter {
  keyword?: string;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  status?: Product['status'];
  page?: number;
  pageSize?: number;
}

export const PRODUCT_STATUS_LABEL: Record<Product['status'], string> = {
  on_sale: '在售',
  off_sale: '下架',
  out_of_stock: '缺货',
};

export const PRODUCT_STATUS_COLOR: Record<Product['status'], string> = {
  on_sale: 'success',
  off_sale: 'default',
  out_of_stock: 'error',
};
