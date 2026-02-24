export const formatDate = (
  dateString: string | null,
  locale: string = 'en-US'
): string | null => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(locale);
};

export const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-CA');
};

export const getTodayDate = (): string => {
  return new Date().toLocaleDateString('en-CA');
};

export const convertDateToISO = (dateString?: string): string | undefined => {
  if (!dateString) return undefined;
  // Convert YYYY-MM-DD to ISO datetime format
  return `${dateString}T00:00:00`;
};
