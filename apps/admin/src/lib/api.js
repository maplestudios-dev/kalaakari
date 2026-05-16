import axios from 'axios'

const baseURL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:4000/api'

export const api = axios.create({ baseURL })

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('kalaakaari_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kalaakaari_token')
      if (location.pathname !== '/login') location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  me:    () => api.get('/auth/me').then((r) => r.data)
}

export const portfolio = {
  list:   () => api.get('/portfolio').then((r) => r.data.items),
  create: (data) => api.post('/portfolio', data).then((r) => r.data.item),
  update: (id, data) => api.put(`/portfolio/${id}`, data).then((r) => r.data.item),
  remove: (id) => api.delete(`/portfolio/${id}`)
}

export const contact = {
  list:   () => api.get('/contact').then((r) => r.data.items),
  patch:  (id, data) => api.patch(`/contact/${id}`, data).then((r) => r.data.item),
  remove: (id) => api.delete(`/contact/${id}`)
}

export const users = {
  list:    () => api.get('/users').then((r) => r.data.items),
  invite:  (data) => api.post('/users/invite', data).then((r) => r.data),
  update:  (id, data) => api.patch(`/users/${id}`, data).then((r) => r.data.user),
  suspend: (id) => api.post(`/users/${id}/suspend`).then((r) => r.data.user),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`).then((r) => r.data),
  remove:  (id) => api.delete(`/users/${id}`)
}

export const audit = {
  list: (params = {}) => api.get('/audit', { params }).then((r) => r.data.items)
}

export const copy = {
  get:      () => api.get('/site-copy').then((r) => r.data),
  put:      (copy, note) => api.put('/site-copy', { copy, note }).then((r) => r.data),
  versions: () => api.get('/site-copy/versions').then((r) => r.data),
  restore:  (version) => api.post(`/site-copy/restore/${version}`).then((r) => r.data),
  default:  () => api.get('/site-copy/default').then((r) => r.data.copy)
}

export const video = {
  list:   () => api.get('/video').then((r) => r.data.items),
  create: (data) => api.post('/video', data).then((r) => r.data.item),
  update: (id, data) => api.put(`/video/${id}`, data).then((r) => r.data.item),
  remove: (id) => api.delete(`/video/${id}`)
}

export const seo = {
  entries:  () => api.get('/seo/entries').then((r) => r.data.items),
  saveEntry:(data) => api.put('/seo/entries', data).then((r) => r.data.item),
  removeEntry:(id) => api.delete(`/seo/entries/${id}`),
  redirects:() => api.get('/seo/redirects/all').then((r) => r.data.items),
  addRedirect:(data) => api.post('/seo/redirects', data).then((r) => r.data.item),
  removeRedirect:(id) => api.delete(`/seo/redirects/${id}`)
}

export const testimonials = {
  list:   () => api.get('/testimonials').then((r) => r.data.items),
  create: (data) => api.post('/testimonials', data).then((r) => r.data.item),
  update: (id, data) => api.put(`/testimonials/${id}`, data).then((r) => r.data.item),
  remove: (id) => api.delete(`/testimonials/${id}`)
}

export const press = {
  list:   () => api.get('/press').then((r) => r.data.items),
  create: (data) => api.post('/press', data).then((r) => r.data.item),
  update: (id, data) => api.put(`/press/${id}`, data).then((r) => r.data.item),
  remove: (id) => api.delete(`/press/${id}`)
}

export const blog = {
  list:   () => api.get('/blog').then((r) => r.data.items),
  create: (data) => api.post('/blog', data).then((r) => r.data.item),
  update: (id, data) => api.put(`/blog/${id}`, data).then((r) => r.data.item),
  remove: (id) => api.delete(`/blog/${id}`)
}

export const meStore = {
  set(me, rolePermissions) {
    localStorage.setItem('kalaakaari_me', JSON.stringify({ me, rolePermissions }))
  },
  get() {
    try { return JSON.parse(localStorage.getItem('kalaakaari_me') || 'null') } catch { return null }
  },
  clear() { localStorage.removeItem('kalaakaari_me') }
}

export function can(perm) {
  const s = meStore.get()
  if (!s?.me) return false
  if (s.me.role === 'Owner') return true
  return (s.rolePermissions || []).includes(perm) || (s.me.permissions || []).includes(perm)
}
