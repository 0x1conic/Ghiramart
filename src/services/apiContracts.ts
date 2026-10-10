export interface ApiUser { id: number; phone: string; full_name: string; role: string; is_verified: boolean }
export interface ApiAuthResponse { user: ApiUser; access_token: string; token_type?: string }
export interface ApiTokenResponse { access_token: string; token_type?: string }
export interface ApiProduct { id: number; name: string; brand: string; category: string; description: string; price: string; discounted_price: string | null; image_urls: string; stock_quantity: number; created_at: string; updated_at: string }
export interface ApiPage<T> { items: T[]; total: number; page: number; size: number; pages: number }
export interface ApiAddress { id: number; street: string; city: string; state: string; phone_number: string; address_type: 'primary' | 'secondary' }
export interface ApiCartItem { id: number; product_id: number; quantity: number; line_total: string; product: ApiProduct }
export interface ApiCart { id: number; user_id: number; total_amount: string; items: ApiCartItem[] }
export type ApiOrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export interface ApiOrder { id: number; user_id: number; status: ApiOrderStatus; payment_option: 'cod'; total_amount: string; address: Omit<ApiAddress, 'id' | 'address_type'>; items: Array<{ id: number; product_id: number; product_name: string; unit_price: string; quantity: number; line_total: string }>; created_at: string; updated_at: string }
