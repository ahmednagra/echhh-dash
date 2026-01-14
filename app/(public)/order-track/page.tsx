// src/app/(public)/order-track/page.tsx

import React from 'react'
import { Metadata } from 'next'
import OrderTracker from '@/components/public/order-track/OrderTracker'

export const metadata: Metadata = {
  title: 'Order Tracking - Search by Discount Code',
  description: 'Track your orders using discount codes. Enter your discount code to view order details, status, and shipping information.',
  keywords: ['order tracking', 'discount codes', 'order search', 'e-commerce', 'order status'],
  robots: 'index, follow',
  openGraph: {
    title: 'Order Tracking - Search by Discount Code',
    description: 'Track your orders using discount codes. Enter your discount code to view order details.',
    type: 'website',
  },
}
     
export default function OrderTrackPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <OrderTracker />
    </div>
  )
}