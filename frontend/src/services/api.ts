// API Service pour communiquer avec le backend

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// Helper pour récupérer le token
const getAuthToken = (): string | null => {
  return sessionStorage.getItem('auth_token')
}

// Helper pour les headers avec authentification
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Generic fetch wrapper
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Une erreur est survenue' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// ============ ACTIVITIES API ============

export const activitiesAPI = {
  // Récupérer mes activités (Manager)
  getMyActivities: () => fetchAPI<any[]>('/activities/my-activities'),

  // Récupérer activités en attente (Manager)
  getPendingActivities: () => fetchAPI<any[]>('/activities/pending'),

  // Récupérer une activité par ID
  getActivityById: (id: string) => fetchAPI<any>(`/activities/${id}`),

  // Récupérer toutes les activités
  getAllActivities: () => fetchAPI<any[]>('/activities'),

  // Récupérer activités par statut
  getActivitiesByStatus: (status: string) => fetchAPI<any[]>(`/activities/status/${status}`),

  // Récupérer activités par département
  getActivitiesByDepartment: (departmentId: string) =>
    fetchAPI<any[]>(`/activities/department/${departmentId}`),

  // Créer une activité (HR)
  createActivity: (data: any) =>
    fetchAPI<any>('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Mettre à jour une activité (HR)
  updateActivity: (id: string, data: any) =>
    fetchAPI<any>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Changer le statut d'une activité
  updateActivityStatus: (id: string, status: string) =>
    fetchAPI<any>(`/activities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Transférer au manager (HR)
  forwardToManager: (id: string) =>
    fetchAPI<any>(`/activities/${id}/forward`, {
      method: 'PATCH',
    }),

  // Supprimer une activité (HR)
  deleteActivity: (id: string) =>
    fetchAPI<any>(`/activities/${id}`, {
      method: 'DELETE',
    }),
}

// ============ PARTICIPATIONS API ============

export const participationsAPI = {
  // Créer une participation (Manager confirme un employé)
  createParticipation: (data: {
    activityId: string
    employeeId: string
    confirmedBy: string
  }) =>
    fetchAPI<any>('/participations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Récupérer toutes les participations
  getAllParticipations: () => fetchAPI<any[]>('/participations'),

  // Récupérer participations par activité
  getParticipationsByActivity: (activityId: string) =>
    fetchAPI<any[]>(`/participations/activity/${activityId}`),

  // Récupérer participations par employé
  getParticipationsByEmployee: (employeeId: string) =>
    fetchAPI<any[]>(`/participations/employee/${employeeId}`),

  // Récupérer mes participations (Employee)
  getMyParticipations: () => fetchAPI<any[]>('/participations/my-participations'),

  // Récupérer une participation par ID
  getParticipationById: (id: string) => fetchAPI<any>(`/participations/${id}`),

  // Mettre à jour une participation
  updateParticipation: (id: string, data: any) =>
    fetchAPI<any>(`/participations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Accepter une participation (Employee)
  acceptParticipation: (id: string) =>
    fetchAPI<any>(`/participations/${id}/accept`, {
      method: 'PATCH',
    }),

  // Refuser une participation (Employee)
  declineParticipation: (id: string, justification: string) =>
    fetchAPI<any>(`/participations/${id}/decline`, {
      method: 'PATCH',
      body: JSON.stringify({ justification }),
    }),

  // Supprimer une participation
  deleteParticipation: (id: string) =>
    fetchAPI<any>(`/participations/${id}`, {
      method: 'DELETE',
    }),
}

// ============ NOTIFICATIONS API ============

export const notificationsAPI = {
  // Créer une notification
  createNotification: (data: any) =>
    fetchAPI<any>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Récupérer mes notifications
  getMyNotifications: (unreadOnly = false) =>
    fetchAPI<any[]>(`/notifications/my-notifications?unreadOnly=${unreadOnly}`),

  // Compter les notifications non lues
  getUnreadCount: () => fetchAPI<{ count: number }>('/notifications/unread-count'),

  // Récupérer une notification par ID
  getNotificationById: (id: string) => fetchAPI<any>(`/notifications/${id}`),

  // Marquer une notification comme lue
  markAsRead: (id: string) =>
    fetchAPI<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // Marquer toutes les notifications comme lues
  markAllAsRead: () =>
    fetchAPI<any>('/notifications/mark-all-read', {
      method: 'PATCH',
    }),

  // Supprimer une notification
  deleteNotification: (id: string) =>
    fetchAPI<any>(`/notifications/${id}`, {
      method: 'DELETE',
    }),

  // Supprimer toutes mes notifications
  deleteAllNotifications: () =>
    fetchAPI<any>('/notifications/user/all', {
      method: 'DELETE',
    }),
}

// ============ USERS API ============

export const usersAPI = {
  // Login
  login: (email: string, password: string) =>
    fetchAPI<any>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Register
  register: (data: any) =>
    fetchAPI<any>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Récupérer tous les utilisateurs
  getAllUsers: () => fetchAPI<any[]>('/users'),

  // Récupérer un utilisateur par ID
  getUserById: (id: string) => fetchAPI<any>(`/users/${id}`),

  // Mettre à jour un utilisateur
  updateUser: (id: string, data: any) =>
    fetchAPI<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Supprimer un utilisateur
  deleteUser: (id: string) =>
    fetchAPI<any>(`/users/${id}`, {
      method: 'DELETE',
    }),
}

export default {
  activities: activitiesAPI,
  participations: participationsAPI,
  notifications: notificationsAPI,
  users: usersAPI,
}
