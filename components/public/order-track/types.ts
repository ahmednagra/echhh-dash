// src/components/public/order-track/types.ts - UPDATED

export interface Collection {
  id?: string
  handle?: string
  title?: string
}

export interface Product {
  title: string
  variant_title?: string
  quantity: number
  price: number
  sku?: string
  total_discount?: number
  
  // NEW: Collection and discount information per product
  collections?: Collection[]
  collection_handles?: string[]
  applied_discount_code?: string
  discount_rate?: number
  discount_amount?: number
  discount_type?: string  // 'percentage', 'fixed_amount'
}

export interface DiscountApplication {
  type?: string
  value?: string
  value_type?: string  // 'percentage' | 'fixed_amount'
  allocation_method?: string
  target_selection?: string
  target_type?: string
  description?: string
  title?: string
  code?: string
}

export interface Order {
  quantity: number
  id: number
  shopify_order_id: string
  order_number: string
  email: string
  mobile_phone?: string
  first_name: string
  last_name: string
  full_name: string
  country?: string
  address_line1?: string
  address_line2?: string
  city?: string
  postal_code?: string
  payment_method: string
  
  // Product information
  product_title: string        // First product title (for backward compatibility)
  products?: Product[]         // Array of all products in the order with individual discounts
  
  subtotal_price: number
  shipping_method: string
  shipping_price: number
  total_price: number
  total_tax: number            // ENSURE this field is included
  currency: string
  discount_code: string
  discount_amount: number
  discount_percentage: number
  
  // NEW: Collections and enhanced discount information
  collections?: Collection[]           // All collections in this order
  discount_applications?: DiscountApplication[]  // Detailed discount applications
  
  // All status fields from database
  order_status: string          // open, closed, cancelled, etc.
  financial_status: string      // paid, pending, refunded, etc.
  fulfillment_status: string    // fulfilled, unfulfilled, partial, etc.
  
  notes?: string
  source_name: string
  order_created_at: string
  created_at: string
  updated_at: string
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalRecords: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SearchSectionProps {
  onSearch: (discountCode: string) => void
  onClear: () => void
  isLoading: boolean
  searchQuery: string
}

export interface ResultsTableProps {
  orders: Order[]
  pagination: Pagination
  activeSearch: string
  onPageChange: (page: number) => void
}

export interface HelpSectionProps {
  onExampleSearch: (code: string) => void
}