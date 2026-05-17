export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
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

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image_url: string;
  status: string;
  sort_order: number;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  created_at: number;
  updated_at: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
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

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductReview {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  title: string;
  content: string;
  created_at: number;
}

export interface ReviewListResponse {
  reviews: ProductReview[];
  total: number;
  avg_rating: number;
}

export interface UserAddress {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  district: string;
  street: string;
  zip_code: string;
  is_default: boolean;
  created_at: number;
  updated_at: number;
}

export interface Coupon {
  id: number;
  code: string;
  type: string;
  value: number;
  min_order_amount: number;
  max_discount: number;
  usage_limit: number;
  usage_count: number;
  status: string;
  starts_at: number;
  expires_at: number;
}

export interface CouponValidation {
  coupon: Coupon;
  discount_amount: number;
  is_valid: boolean;
  message: string;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}
