const API_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const msg = (data && data.message) || res.statusText || 'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  me: () => request('/auth/me'),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload }),
  logout: () => request('/auth/logout', { method: 'POST' }),
};

export const subjectsApi = {
  list: ({ page = 1, limit = 50, q = '', teacher } = {}) =>
    request(
      `/subjects?page=${page}&limit=${limit}` +
        (q ? `&q=${encodeURIComponent(q)}` : '') +
        (teacher ? `&teacher=${encodeURIComponent(teacher)}` : '')
    ),
  create: (payload) => request('/subjects', { method: 'POST', body: payload }),
  update: (id, payload) =>
    request(`/subjects/${id}`, { method: 'PATCH', body: payload }),
  remove: (id) => request(`/subjects/${id}`, { method: 'DELETE' }),
};

export const usersApi = {
  list: ({ role, q = '', page = 1, limit = 25 } = {}) =>
    request(
      `/users?${role ? `role=${encodeURIComponent(role)}&` : ''}` +
        `page=${page}&limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ''}`
    ),
  get: (id) => request(`/users/${id}`),
  setParents: (studentId, parents) =>
    request(`/users/${studentId}/parents`, {
      method: 'PATCH',
      body: { parents },
    }),
  setChildren: (parentId, children) =>
    request(`/users/${parentId}/children`, {
      method: 'PATCH',
      body: { children },
    }),
};

export const gradesApi = {
  list: ({
    page = 1,
    limit = 50,
    student,
    teacher,
    subject,
    type,
    from,
    to,
  } = {}) =>
    request(
      `/grades?page=${page}&limit=${limit}` +
        (student ? `&student=${encodeURIComponent(student)}` : '') +
        (teacher ? `&teacher=${encodeURIComponent(teacher)}` : '') +
        (subject ? `&subject=${encodeURIComponent(subject)}` : '') +
        (type ? `&type=${encodeURIComponent(type)}` : '') +
        (from ? `&from=${encodeURIComponent(from)}` : '') +
        (to ? `&to=${encodeURIComponent(to)}` : '')
    ),
  create: (payload) => request('/grades', { method: 'POST', body: payload }), // professors only
};

export const notesApi = {
  list: ({
    page = 1,
    limit = 50,
    q,
    student,
    author,
    visibility,
    from,
    to,
  } = {}) =>
    request(
      `/notes?page=${page}&limit=${limit}` +
        (q ? `&q=${encodeURIComponent(q)}` : '') +
        (student ? `&student=${encodeURIComponent(student)}` : '') +
        (author ? `&author=${encodeURIComponent(author)}` : '') +
        (visibility ? `&visibility=${encodeURIComponent(visibility)}` : '') +
        (from ? `&from=${encodeURIComponent(from)}` : '') +
        (to ? `&to=${encodeURIComponent(to)}` : '')
    ),
  create: (payload) => request('/notes', { method: 'POST', body: payload }), // admin & professor
};

export const adminStatsApi = {
  overview: () => request('/admin/stats/overview'),
  gradesAvgBySubject: ({ from, to } = {}) =>
    request(
      `/admin/stats/grades/avg-by-subject${
        from || to
          ? `?${[
              from ? `from=${encodeURIComponent(from)}` : '',
              to ? `to=${encodeURIComponent(to)}` : '',
            ]
              .filter(Boolean)
              .join('&')}`
          : ''
      }`
    ),
  gradesDistribution: ({ subject, from, to } = {}) =>
    request(
      `/admin/stats/grades/distribution${[
        subject ? `subject=${encodeURIComponent(subject)}` : '',
        from ? `from=${encodeURIComponent(from)}` : '',
        to ? `to=${encodeURIComponent(to)}` : '',
      ]
        .filter(Boolean)
        .join('&')
        .replace(/^/, (s) => (s ? '?' : ''))}`
    ),
  activityByDay: ({ days = 30 } = {}) =>
    request(`/admin/stats/activity/by-day?days=${days}`),
  notesByVisibility: ({ from, to } = {}) =>
    request(
      `/admin/stats/notes/by-visibility${
        from || to
          ? `?${[
              from ? `from=${encodeURIComponent(from)}` : '',
              to ? `to=${encodeURIComponent(to)}` : '',
            ]
              .filter(Boolean)
              .join('&')}`
          : ''
      }`
    ),
  topTeachersByGrades: ({ limit = 5, from, to } = {}) =>
    request(
      `/admin/stats/teachers/top?limit=${limit}${
        from || to
          ? `&${[
              from ? `from=${encodeURIComponent(from)}` : '',
              to ? `to=${encodeURIComponent(to)}` : '',
            ]
              .filter(Boolean)
              .join('&')}`
          : ''
      }`
    ),
  studentCountByClass: () => request('/admin/stats/classes/student-count'),
};

export default request;
