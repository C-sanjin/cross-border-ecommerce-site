export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_desc: string;
  category_id: number;
  price: number;
  compare_price: number;
  stock: number;
  weight: number;
  status: string;
  images: string;
  is_featured: boolean;
  meta_title: string;
  meta_desc: string;
  created_at: number;
  updated_at: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_title: string;
  sku_code: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderAddress {
  name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  street: string;
  zip_code: string;
}

export interface Order {
  id: number;
  order_no: string;
  user_id: number;
  status: string;
  total_amount: number;
  discount_amount: number;
  shipping_fee: number;
  payment_method: string;
  shipping_address: OrderAddress;
  note: string;
  items: OrderItem[];
  created_at: number;
  updated_at: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image_url: string;
  status: string;
  sort_order: number;
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_users: number;
  total_products: number;
  today_orders: number;
  today_revenue: number;
  pending_orders: number;
  low_stock_products: number;
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductCreateRequest {
  title: string;
  slug: string;
  description: string;
  short_desc: string;
  category_id: number;
  price: number;
  compare_price: number;
  stock: number;
  weight: number;
  status: string;
  images: string;
  is_featured: boolean;
  meta_title: string;
  meta_desc: string;
}

export interface ProductUpdateRequest extends ProductCreateRequest {}
