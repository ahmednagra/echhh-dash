// src/lib/orderApi.ts - UPDATED with enhanced total_tax handling

const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_DEV || 'http://localhost:8000'

interface BackendCollection {
  id?: string
  handle?: string
  title?: string
}

interface BackendOrderItem {
  product_title: string
  variant_title?: string
  quantity?: number
  price?: number | string
  sku?: string
  total_discount?: number | string
  
  // NEW: Collection and discount information
  collections?: BackendCollection[]
  collection_handles?: string[]
  applied_discount_code?: string
  discount_rate?: number | string
  discount_amount?: number | string
  discount_type?: string
}

interface BackendDiscountApplication {
  type?: string
  value?: string
  value_type?: string
  allocation_method?: string
  target_selection?: string
  target_type?: string
  description?: string
  title?: string
  code?: string
}

interface BackendOrder {
  id: string
  shopify_order_id: string
  order_number: string
  customer_email: string | null
  customer_phone?: string | null
  customer_first_name?: string | null
  customer_last_name?: string | null
  total_price?: number | null
  subtotal_price?: number | null
  total_discounts?: number | null
  total_tax?: number | null          // ENSURE this field is included
  shipping_price?: number | null
  currency: string
  used_discount_code: string
  discount_codes?: Array<{ code: string; amount: string; type: string }>
  discount_applications?: BackendDiscountApplication[]  // NEW: Enhanced discount applications
  
  // NEW: Collections information
  collections?: BackendCollection[]
  
  // All status fields from backend
  order_status?: string | null           
  financial_status?: string | null       
  fulfillment_status?: string | null     
  
  shipping_address?: any
  billing_address?: any
  created_at: string
  order_items?: BackendOrderItem[]  // Updated with enhanced product information
}

interface BackendResponse {
  orders: BackendOrder[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Helper function to extract discount code from applications
function extractDiscountCodeFromApplications(applications?: BackendDiscountApplication[]): string {
  if (!applications || applications.length === 0) return 'N/A'
  
  const firstApp = applications[0]
  return firstApp.title || firstApp.code || firstApp.description || 'N/A'
}

// Helper function to calculate discount percentage from applications
function calculateDiscountPercentage(
  applications?: BackendDiscountApplication[], 
  subtotal?: number
): number {
  if (!applications || applications.length === 0 || !subtotal || subtotal === 0) return 0
  
  let totalDiscountAmount = 0
  
  for (const app of applications) {
    const value = typeof app.value === 'string' ? parseFloat(app.value) : (app.value || 0)
    
    if (app.value_type === 'percentage') {
      totalDiscountAmount += (subtotal * value) / 100
    } else if (app.value_type === 'fixed_amount') {
      totalDiscountAmount += value
    }
  }
  
  return subtotal > 0 ? (totalDiscountAmount / subtotal) * 100 : 0
}

// Transform backend order to match frontend Order type
function transformOrder(backendOrder: BackendOrder): any {
  // Enhanced discount code extraction
  const discountCode = backendOrder.used_discount_code || 
                      extractDiscountCodeFromApplications(backendOrder.discount_applications) ||
                      backendOrder.discount_codes?.[0]?.code || 
                      'N/A'
  
  const discountAmount = backendOrder.total_discounts || 0
  const subtotal = backendOrder.subtotal_price || 0
  
  // Calculate discount percentage from applications if available
  const discountPercentage = backendOrder.discount_applications ? 
    calculateDiscountPercentage(backendOrder.discount_applications, subtotal) :
    (subtotal > 0 ? (discountAmount / subtotal) * 100 : 0)
  
  const firstName = backendOrder.customer_first_name || ''
  const lastName = backendOrder.customer_last_name || ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Customer'
  
  const address = backendOrder.shipping_address || backendOrder.billing_address

  // Transform products with enhanced discount information
  const products = backendOrder.order_items?.map(item => ({
    title: item.product_title,
    variant_title: item.variant_title,
    quantity: item.quantity || 1,
    price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
    sku: item.sku,
    total_discount: typeof item.total_discount === 'string' ? 
      parseFloat(item.total_discount) : (item.total_discount || 0),
    
    // NEW: Collection and discount information per product
    collections: item.collections || [],
    collection_handles: item.collection_handles || [],
    applied_discount_code: item.applied_discount_code,
    discount_rate: typeof item.discount_rate === 'string' ? 
      parseFloat(item.discount_rate) : item.discount_rate,
    discount_amount: typeof item.discount_amount === 'string' ? 
      parseFloat(item.discount_amount) : item.discount_amount,
    discount_type: item.discount_type
  })) || []

  // Debug logging for tax
  console.log('🔄 Backend total_tax:', backendOrder.total_tax);
  console.log('🔄 Backend total_tax type:', typeof backendOrder.total_tax);

  // For backward compatibility, keep first product info
  const firstProduct = products[0]
  const productTitle = firstProduct?.title || 'Product Information Not Available'
  const quantity = firstProduct?.quantity || 1

  const transformedOrder = {
    id: parseInt(backendOrder.id) || Math.random(),
    shopify_order_id: backendOrder.shopify_order_id,
    order_number: backendOrder.order_number,
    email: backendOrder.customer_email || '',
    mobile_phone: backendOrder.customer_phone || address?.phone || '',
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    country: address?.country || '',
    address_line1: address?.address1 || '',
    address_line2: address?.address2 || '',
    city: address?.city || '',
    postal_code: address?.zip || '',
    payment_method: 'Card Payment',
    
    // Product information
    product_title: productTitle,        // First product (backward compatibility)
    products: products,                 // Enhanced products array with individual discounts
    quantity: quantity,                 // First product quantity (backward compatibility)
    
    subtotal_price: backendOrder.subtotal_price || 0,
    shipping_method: 'Standard',
    shipping_price: backendOrder.shipping_price || 0,
    total_price: backendOrder.total_price || 0,
    total_tax: backendOrder.total_tax || 0,  // EXPLICITLY map total_tax
    currency: backendOrder.currency,
    discount_code: discountCode,
    discount_amount: discountAmount,
    discount_percentage: discountPercentage,
    
    // NEW: Enhanced discount and collection information
    collections: backendOrder.collections || [],
    discount_applications: backendOrder.discount_applications || [],
    
    // Map all status fields from backend
    order_status: backendOrder.order_status || 'unknown',
    financial_status: backendOrder.financial_status || 'unknown',
    fulfillment_status: backendOrder.fulfillment_status || 'unfulfilled',
    
    notes: '',
    source_name: 'online_store',
    order_created_at: backendOrder.created_at,
    created_at: backendOrder.created_at,
    updated_at: backendOrder.created_at
  }

  // Debug log the final transformed order
  console.log('🔄 Transformed order total_tax:', transformedOrder.total_tax);
  
  return transformedOrder
}

// Search orders by discount code - connects to your backend
export async function searchOrdersByDiscountCode(discountCode: string): Promise<any[]> {
  try {
    console.log('🔍 Searching for discount code:', discountCode)
    console.log('🌐 API Base URL:', API_BASE_URL)
    
    const url = `${API_BASE_URL}/v0/orders/discount/${encodeURIComponent(discountCode)}`
    console.log('📡 Full URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
    })

    console.log('📊 Response status:', response.status)
    console.log('📊 Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error response:', errorText)
      
      if (response.status === 404) {
        console.log('ℹ️ No orders found (404)')
        return [] // No orders found
      }
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication required - endpoint may need to be public')
      }
      
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    const responseText = await response.text()
    console.log('📄 Raw response text:', responseText)

    let data: BackendResponse
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      throw new Error('Invalid JSON response from server')
    }

    console.log('📦 Parsed data:', data)
    console.log('✅ Found orders:', data.orders?.length || 0)
    
    if (!data.orders || !Array.isArray(data.orders)) {
      console.error('❌ Invalid response format - orders is not an array')
      return []
    }
    
    // Transform backend orders to match your frontend format
    const transformedOrders = data.orders.map(transformOrder)
    console.log('🔄 Transformed orders:', transformedOrders.length)
    
    // Log enhanced product information for debugging
    if (transformedOrders.length > 0) {
      const firstOrder = transformedOrders[0]
      console.log('📋 First order enhanced info:', {
        product_title: firstOrder.product_title,
        products_count: firstOrder.products?.length || 0,
        products: firstOrder.products,
        collections: firstOrder.collections,
        discount_applications: firstOrder.discount_applications,
        discount_percentage: firstOrder.discount_percentage,
        total_tax: firstOrder.total_tax,  // Log tax for debugging
        total_price: firstOrder.total_price
      })
    }
    
    return transformedOrders
    
  } catch (error) {
    console.error('❌ Error searching orders:', error)
    throw error
  }
}