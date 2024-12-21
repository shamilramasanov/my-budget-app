export function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}.${month}.${year}`;
}

export function formatDateTime(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function parseDate(dateString) {
  if (!dateString) return null;
  
  const [day, month, year] = dateString.split('.');
  return new Date(year, month - 1, day);
}

export function toISODate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}