export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('nutribudget_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
