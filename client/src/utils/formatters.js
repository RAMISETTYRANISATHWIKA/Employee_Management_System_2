export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const statusBadge = (status) => {
  const map = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    cancelled: 'badge-info',
    draft: 'badge-info',
    submitted: 'badge-warning',
    reviewed: 'badge-success',
    returned: 'badge-danger',
    credited: 'badge-success',
    active: 'badge-success',
    inactive: 'badge-danger',
    low: 'badge-info',
    medium: 'badge-warning',
    high: 'badge-danger',
    urgent: 'badge-danger',
  };
  return map[status] || 'badge-info';
};
