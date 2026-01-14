// src/components/public/order-track/ResultsTable.tsx
// Updated with simplified modal showing only essential columns

import React, { useState, useRef, useEffect } from 'react'
import { ResultsTableProps, Order } from './types'
import { formatCurrency } from './utils'
import Pagination from './Pagination'

// Utility function to format date and time separately
function formatDateTime(dateString: string): { date: string; time: string } {
  const date = new Date(dateString)
  
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  return {
    date: formattedDate,
    time: formattedTime
  }
}

// Simple hover tooltip for product cells
function ProductHoverTooltip({ isVisible, triggerRef }: { 
  isVisible: boolean,
  triggerRef: React.RefObject<HTMLTableDataCellElement | null>
}) {
  const [position, setPosition] = useState({ top: -9999, left: -9999 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isVisible) {
      setPosition({ top: -9999, left: -9999 })
      return
    }

    const updatePosition = (e: MouseEvent) => {
      const tooltip = tooltipRef.current
      if (!tooltip) return

      const cursorX = e.clientX
      const cursorY = e.clientY
      const tooltipRect = tooltip.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let left = cursorX + 12
      let top = cursorY - 8

      if (left + tooltipRect.width > viewportWidth - 10) {
        left = cursorX - tooltipRect.width - 12
      }

      if (top + tooltipRect.height > viewportHeight - 10) {
        top = cursorY - tooltipRect.height + 8
      }

      if (top < 10) {
        top = cursorY + 12
      }

      if (left < 10) {
        left = 10
      }

      setPosition({ top, left })
    }

    if (triggerRef.current) {
      triggerRef.current.addEventListener('mousemove', updatePosition)
      
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({ 
        top: rect.top + rect.height / 2 - 8, 
        left: rect.right + 12 
      })

      return () => {
        if (triggerRef.current) {
          triggerRef.current.removeEventListener('mousemove', updatePosition)
        }
      }
    }
  }, [isVisible, triggerRef])

  if (!isVisible) return null

  return (
    <div 
      ref={tooltipRef}
      className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: position.top === -9999 ? 0 : 1,
        transition: position.top === -9999 ? 'none' : 'opacity 150ms ease-out'
      }}
    >
      Click to view all product details
      <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
    </div>
  )
}

// Simplified Product Details Modal
function ProductDetailsModal({ 
  products, 
  isOpen, 
  onClose, 
  orderNumber,
  orderData
}: { 
  products: any[], 
  isOpen: boolean,
  onClose: () => void,
  orderNumber: string,
  orderData?: any
}) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !products || products.length === 0) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[85vh] flex flex-col transform transition-all duration-300 ease-out ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Order #{orderNumber} - Product Details
              </h2>
              <p className="text-xs text-gray-600">
                {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content - Simplified Table Layout */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Title
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* Product Number */}
                    <td className="px-3 py-2">
                      <span className="text-sm text-gray-900">
                        {index + 1}
                      </span>
                    </td>
                    
                    {/* Product Title */}
                    <td className="px-3 py-2">
                      <div className="text-sm font-medium text-gray-900 max-w-[300px] break-words leading-tight">
                        {product.title}
                      </div>
                      {product.variant_title && (
                        <div className="text-xs text-gray-500 mt-1">
                          Variant: {product.variant_title}
                        </div>
                      )}
                    </td>
                    
                    {/* Quantity */}
                    <td className="px-3 py-2 text-center">
                      <span className="text-sm text-gray-900">
                        {product.quantity}
                      </span>
                    </td>
                    
                    {/* Unit Price */}
                    <td className="px-3 py-2 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price, orderData?.currency || 'USD')}
                      </span>
                    </td>
                    
                    {/* Total Price */}
                    <td className="px-3 py-2 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price * product.quantity, orderData?.currency || 'USD')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Updated Modal Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="space-y-3">
            {/* Order Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Total Items:</span> 
                  <span className="ml-1 font-semibold text-gray-900">
                    {products.reduce((sum: number, p: any) => sum + p.quantity, 0)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Products:</span> 
                  <span className="ml-1 font-semibold text-gray-900">
                    {products.length}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Total Discount:</span> 
                  <span className="ml-1 font-semibold text-green-600">
                    -{formatCurrency(
                      orderData?.discount_amount || 0, 
                      orderData?.currency || 'USD'
                    )}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Total Tax:</span> 
                  <span className="ml-1 font-semibold text-gray-900">
                    {formatCurrency(
                      orderData?.total_tax || 0, 
                      orderData?.currency || 'USD'
                    )}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Payable Total</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    orderData?.total_price || 
                    products.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0), 
                    orderData?.currency || 'USD'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsTable({ orders, pagination, activeSearch, onPageChange }: ResultsTableProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    products: any[];
    orderNumber: string;
    orderData?: any;
  }>({
    isOpen: false,
    products: [],
    orderNumber: '',
    orderData: null
  });

  const openModal = (products: any[], orderNumber: string, orderData?: any) => {
    setModalState({ isOpen: true, products, orderNumber, orderData });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, products: [], orderNumber: '', orderData: null });
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="p-4 pb-3 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                Orders with code: <span className="text-blue-600">"{activeSearch}"</span>
              </h3>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                {pagination.totalRecords} order{pagination.totalRecords !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 pt-0">
          {/* Table container */}
          <div className="w-full">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Products
                  </th>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Fulfillment
                  </th>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} onOpenModal={openModal} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pt-4 border-t border-gray-200 mt-4">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Simplified Product Details Modal */}
      <ProductDetailsModal
        products={modalState.products}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        orderNumber={modalState.orderNumber}
        orderData={modalState.orderData}
      />
    </>
  )
}

// Order Row Component (unchanged)
function OrderRow({ order, onOpenModal }: { order: Order; onOpenModal: (products: any[], orderNumber: string, orderData?: any) => void }) {
  const [showHoverTooltip, setShowHoverTooltip] = useState(false)
  const triggerRef = useRef<HTMLTableDataCellElement>(null)

  const handleProductCellClick = () => {
    if (order.products && order.products.length > 0) {
      onOpenModal(order.products, order.order_number, order)
    }
  }

  // Get unique discount codes from products
  const getProductDiscountCodes = () => {
    if (!order.products) return []
    const codes = new Set<string>()
    order.products.forEach(product => {
      if (product.applied_discount_code) {
        codes.add(product.applied_discount_code)
      }
    })
    return Array.from(codes)
  }

  const productDiscountCodes = getProductDiscountCodes()

  return (
    <tr className="hover:bg-gray-50">
      {/* Order Number */}
      <td className="px-2 py-1.5">
        <div className="text-sm font-medium text-gray-900">
          #{order.order_number}
        </div>
        <div className="text-xs text-gray-500">
          ID: {order.shopify_order_id.slice(-6)}
        </div>
      </td>

      {/* Customer */}
      <td className="px-2 py-1.5">
        <div className="space-y-1">
          <div className="text-sm text-gray-900 max-w-[120px] break-words">
            {order.full_name}
          </div>
          <div className="text-xs text-gray-500 max-w-[120px] break-words">
            {order.email}
          </div>
        </div>
      </td>

      {/* Products */}
      <td 
        className="px-2 py-1.5 hidden md:table-cell relative cursor-pointer hover:bg-blue-50 transition-colors border-l-2 border-l-transparent hover:border-l-blue-500"
        ref={triggerRef}
        onMouseEnter={() => setShowHoverTooltip(true)}
        onMouseLeave={() => setShowHoverTooltip(false)}
        onClick={handleProductCellClick}
      >
        <div>
          {order.products && order.products.length > 1 ? (
            // Multiple products - show first product + count
            <div>
              <div className="text-sm text-gray-900 break-words leading-tight">
                {order.products[0].title}
              </div>
              <div className="text-xs text-blue-600 font-medium mt-1">
                {order.products.length - 1} more product{order.products.length - 1 !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Total: {order.products.reduce((sum, p) => sum + p.quantity, 0)} items
              </div>
              {/* Show if multiple discount codes are applied */}
              {productDiscountCodes.length > 1 && (
                <div className="text-xs text-orange-600 mt-1">
                  {productDiscountCodes.length} discount codes
                </div>
              )}
            </div>
          ) : (
            // Single product
            <div>
              <div className="text-sm text-gray-900 break-words leading-tight">
                {order.product_title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Qty: {order.quantity || 1}
              </div>
              {/* Show product's specific discount code if different from order */}
              {order.products && order.products[0]?.applied_discount_code && 
               order.products[0].applied_discount_code !== order.discount_code && (
                <div className="text-xs text-blue-600 mt-1">
                  Code: {order.products[0].applied_discount_code}
                </div>
              )}
            </div>
          )}
          
          {/* Click indicator icon */}
          <div className="flex items-center mt-1">
            <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs text-gray-400 ml-1">Click to view</span>
          </div>
        </div>
        
        {/* Hover Tooltip */}
        <ProductHoverTooltip 
          isVisible={showHoverTooltip}
          triggerRef={triggerRef}
        />
      </td>

      {/* Order Status */}
      <td className="px-2 py-1.5">
        <StatusBadge status={order.order_status} type="order" />
      </td>

      {/* Financial Status */}
      <td className="px-2 py-1.5">
        <StatusBadge status={order.financial_status} type="financial" />
      </td>

      {/* Fulfillment Status - Hidden on small screens */}
      <td className="px-2 py-1.5 hidden sm:table-cell">
        <StatusBadge status={order.fulfillment_status} type="fulfillment" />
      </td>

      {/* Amount & Discount */}
      <td className="px-2 py-1.5">
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(order.total_price, order.currency || 'USD')}
          </div>
          {order.discount_amount > 0 && (
            <div className="text-xs text-green-600">
              -{formatCurrency(order.discount_amount, order.currency || 'USD')}
              {order.discount_percentage > 0 && (
                <span className="ml-1">({order.discount_percentage.toFixed(1)}%)</span>
              )}
            </div>
          )}
          {/* Show if products have individual discounts */}
          {order.products && order.products.some(p => p.discount_amount && p.discount_amount > 0) && (
            <div className="text-xs text-blue-600">
              Individual discounts applied
            </div>
          )}
        </div>
      </td>

      {/* Date - Date on top, Time below */}
      <td className="px-2 py-1.5">
        <div className="space-y-1">
          <div className="text-sm text-gray-900">
            {formatDateTime(order.order_created_at).date}
          </div>
          <div className="text-xs text-gray-500">
            {formatDateTime(order.order_created_at).time}
          </div>
          {order.city && (
            <div className="text-xs text-gray-400 max-w-[80px] break-words">
              {order.city}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

// Status Badge Component (unchanged)
function StatusBadge({ status, type }: { status: string; type: 'financial' | 'fulfillment' | 'order' }) {
  const getStatusColor = (status: string, type: string) => {
    const normalizedStatus = status?.toLowerCase() || 'unknown'
    
    if (type === 'financial') {
      switch (normalizedStatus) {
        case 'paid':
          return 'bg-green-100 text-green-800'
        case 'pending':
        case 'pending payment':
          return 'bg-yellow-100 text-yellow-800'
        case 'cancelled':
        case 'failed':
        case 'declined':
          return 'bg-red-100 text-red-800'
        case 'refunded':
        case 'partially_refunded':
          return 'bg-gray-100 text-gray-800'
        case 'authorized':
          return 'bg-blue-100 text-blue-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    } else if (type === 'fulfillment') {
      switch (normalizedStatus) {
        case 'fulfilled':
        case 'delivered':
        case 'shipped':
          return 'bg-green-100 text-green-800'
        case 'partial':
        case 'partially_fulfilled':
          return 'bg-blue-100 text-blue-800'
        case 'unfulfilled':
        case 'pending':
          return 'bg-yellow-100 text-yellow-800'
        case 'cancelled':
        case 'returned':
          return 'bg-red-100 text-red-800'
        case 'restocked':
          return 'bg-gray-100 text-gray-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    } else if (type === 'order') {
      switch (normalizedStatus) {
        case 'open':
        case 'active':
          return 'bg-blue-100 text-blue-800'
        case 'closed':
        case 'completed':
          return 'bg-green-100 text-green-800'
        case 'cancelled':
        case 'canceled':
          return 'bg-red-100 text-red-800'
        case 'archived':
          return 'bg-gray-100 text-gray-800'
        case 'pending':
          return 'bg-yellow-100 text-yellow-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
    
    return 'bg-gray-100 text-gray-800'
  }

  // Financial, Fulfillment, and Order Status Text Normalization
  const getStatusText = (status: string, type: string) => {
    const normalizedStatus = status?.toLowerCase() || 'unknown'
    
    if (type === 'financial') {
      switch (normalizedStatus) {
        case 'paid': return 'Paid'
        case 'pending': return 'Pending'
        case 'pending payment': return 'Pending'
        case 'cancelled': return 'Cancelled'
        case 'failed': return 'Failed'
        case 'declined': return 'Declined'
        case 'refunded': return 'Refunded'
        case 'partially_refunded': return 'Part. Refund'
        case 'authorized': return 'Authorized'
        default: return status || 'Unknown'
      }
    } else if (type === 'fulfillment') {
      switch (normalizedStatus) {
        case 'fulfilled': return 'Fulfilled'
        case 'delivered': return 'Delivered'
        case 'shipped': return 'Shipped'
        case 'partial': return 'Partial'
        case 'partially_fulfilled': return 'Partial'
        case 'unfulfilled': return 'Pending'
        case 'pending': return 'Pending'
        case 'cancelled': return 'Cancelled'
        case 'returned': return 'Returned'
        case 'restocked': return 'Restocked'
        default: return status || 'Unknown'
      }
    } else if (type === 'order') {
      switch (normalizedStatus) {
        case 'open': return 'Open'
        case 'active': return 'Active'
        case 'closed': return 'Closed'
        case 'completed': return 'Complete'
        case 'archived': return 'Archived'
        case 'pending': return 'Pending'
        default: return status || 'Unknown'
      }
    }
    
    return status || 'Unknown'
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status, type)}`}>
      {getStatusText(status, type)}
    </span>
  )
}