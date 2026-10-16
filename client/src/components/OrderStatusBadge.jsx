import React from 'react';
import { getStatusStyle } from '../utils/formatters';

const statusLabels = {
  PENDING: 'Pending Confirmation',
  PAYMENT_SUBMITTED: 'Payment Submitted (Verifying)',
  ACCEPTED: 'Accepted by Nursery',
  PROCESSING: 'Processing & Root Conditioning',
  READY_FOR_DELIVERY: 'Ready for Dispatch',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered Successfully',
  CANCELLED: 'Cancelled'
};

const OrderStatusBadge = ({ status }) => {
  const style = getStatusStyle(status);
  const label = statusLabels[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {label}
    </span>
  );
};

export default OrderStatusBadge;
