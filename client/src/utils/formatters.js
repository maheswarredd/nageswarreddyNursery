export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusStyle = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'PAYMENT_SUBMITTED':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'ACCEPTED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'PROCESSING':
      return 'bg-teal-100 text-teal-800 border-teal-300';
    case 'READY_FOR_DELIVERY':
      return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    case 'OUT_FOR_DELIVERY':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'VERIFIED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};
