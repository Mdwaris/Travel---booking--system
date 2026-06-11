const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const token = options.token;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

export function getDestinations() {
  return request('/destinations');
}

export function loginAdmin(payload) {
  return request('/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getAdminProfile(token) {
  return request('/admin/me', { token });
}

export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getUserProfile(token) {
  return request('/auth/me', { token });
}

export function sendContactMessage(payload) {
  return request('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function submitBookingRequest(payload) {
  return request('/bookings', {
    method: 'POST',
    token: payload.token,
    body: JSON.stringify(payload.data || payload),
  });
}

export function getMyBookingRequests(token) {
  return request('/bookings/my', { token });
}

export function confirmPayment(payload, token = '') {
  return request('/payments/confirm', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function getBookingRequests(token) {
  return request('/bookings', { token });
}

export function updateBookingRequest(id, payload, token) {
  return request(`/bookings/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}
