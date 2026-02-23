export const formatDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString();
};

export const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};
