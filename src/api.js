import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ────────────────────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data)

// ── Users ───────────────────────────────────────────────────────────────────
export const getUsers      = ()         => api.get('/users')
export const getUsersByRole = (role)    => api.get(`/users/by-role?role=${role}`)
export const getMe         = ()         => api.get('/users/me')
export const createUser    = (data)     => api.post('/users', data)
export const updateRole    = (id, role) => api.patch(`/users/${id}/role`, { role })
export const deleteUser    = (id)       => api.delete(`/users/${id}`)
export const changePassword = (data)   => api.patch('/users/me/password', data)

// ── Tickets ─────────────────────────────────────────────────────────────────
export const getTickets        = ()           => api.get('/tickets')
export const getTicket         = (id)         => api.get(`/tickets/${id}`)
export const createTicket      = (data)       => api.post('/tickets', data)
export const updateTicket      = (id, data)   => api.patch(`/tickets/${id}`, data)
export const updateStatus      = (id, status) => api.patch(`/tickets/${id}/status`, { status })
export const assignTechnician  = (id, techId)  => api.patch(`/tickets/${id}/assign-technician`, { technicianId: techId })
export const assignInfoline    = (id, infoId)  => api.patch(`/tickets/${id}/assign-infoline`,    { infolineId: infoId })
export const deleteTicket      = (id)         => api.delete(`/tickets/${id}`)
export const getTicketHistory  = (id)         => api.get(`/tickets/${id}/history`)

// ── Devis ───────────────────────────────────────────────────────────────────
export const createDevis       = (data)       => api.post('/devis', data)
export const updateDevis       = (id, data)   => api.put(`/devis/${id}`, data)
export const getDevisByTicket  = (ticketId)   => api.get(`/devis/ticket/${ticketId}`)
export const getLatestDevis    = (ticketId)   => api.get(`/devis/ticket/${ticketId}/latest`)
export const updateLigne       = (ligneId, acceptee) => api.patch(`/devis/lignes/${ligneId}/acceptee`, { acceptee })
