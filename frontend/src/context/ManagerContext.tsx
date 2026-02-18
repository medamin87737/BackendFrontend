import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { activitiesAPI, participationsAPI, notificationsAPI } from '../services/api'

interface Activity {
  _id: string
  title: string
  description: string
  type: string
  status: string
  priority: string
  maxParticipants: number
  startDate: string
  endDate?: string
  location: string
  duration?: string
  managerId?: string
  createdBy: string
  requiredSkills: Array<{
    skill_name: string
    desired_level: string
    weight?: number
  }>
  createdAt: string
  updatedAt: string
}

interface Participation {
  _id: string
  activityId: string
  employeeId: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REJECTED_BY_MANAGER'
  confirmedBy?: string
  justification?: string
  createdAt: string
  updatedAt: string
}

interface Notification {
  _id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  activityId?: string
  participationId?: string
  createdAt: string
}

interface ManagerContextType {
  // Activities
  myActivities: Activity[]
  pendingActivities: Activity[]
  loadingActivities: boolean
  refreshActivities: () => Promise<void>
  getActivityById: (id: string) => Promise<Activity | null>
  updateActivityStatus: (id: string, status: string) => Promise<boolean>
  
  // Participations
  participations: Participation[]
  loadingParticipations: boolean
  getParticipationsByActivity: (activityId: string) => Participation[]
  confirmParticipant: (activityId: string, employeeId: string) => Promise<boolean>
  rejectParticipation: (participationId: string) => Promise<boolean>
  acceptParticipation: (participationId: string) => Promise<boolean>
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  loadingNotifications: boolean
  refreshNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
}

const ManagerContext = createContext<ManagerContextType | undefined>(undefined)

export function ManagerProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  
  const [myActivities, setMyActivities] = useState<Activity[]>([])
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  
  const [participations, setParticipations] = useState<Participation[]>([])
  const [loadingParticipations, setLoadingParticipations] = useState(false)
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  // Refresh activities
  const refreshActivities = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'MANAGER') return
    
    setLoadingActivities(true)
    try {
      const [myActs, pendingActs] = await Promise.all([
        activitiesAPI.getMyActivities(),
        activitiesAPI.getPendingActivities()
      ])
      setMyActivities(myActs)
      setPendingActivities(pendingActs)
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error)
    } finally {
      setLoadingActivities(false)
    }
  }, [isAuthenticated, user])

  // Get activity by ID
  const getActivityById = useCallback(async (id: string): Promise<Activity | null> => {
    try {
      const activity = await activitiesAPI.getActivityById(id)
      return activity
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité:', error)
      return null
    }
  }, [])

  // Update activity status
  const updateActivityStatus = useCallback(async (id: string, status: string): Promise<boolean> => {
    try {
      await activitiesAPI.updateActivityStatus(id, status)
      await refreshActivities()
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return false
    }
  }, [refreshActivities])

  // Get participations by activity
  const getParticipationsByActivity = useCallback((activityId: string): Participation[] => {
    return participations.filter(p => p.activityId === activityId)
  }, [participations])

  // Confirm participant (Manager creates participation)
  const confirmParticipant = useCallback(async (activityId: string, employeeId: string): Promise<boolean> => {
    if (!user?.id) return false
    
    try {
      await participationsAPI.createParticipation({
        activityId,
        employeeId,
        confirmedBy: user.id
      })
      
      // Refresh participations
      const allParticipations = await participationsAPI.getAllParticipations()
      setParticipations(allParticipations)
      
      return true
    } catch (error) {
      console.error('Erreur lors de la confirmation du participant:', error)
      return false
    }
  }, [user])

  // Reject participation (Manager rejects)
  const rejectParticipation = useCallback(async (participationId: string): Promise<boolean> => {
    try {
      await participationsAPI.updateParticipation(participationId, {
        status: 'REJECTED_BY_MANAGER'
      })
      
      // Refresh participations
      const allParticipations = await participationsAPI.getAllParticipations()
      setParticipations(allParticipations)
      
      return true
    } catch (error) {
      console.error('Erreur lors du rejet de la participation:', error)
      return false
    }
  }, [])

  // Accept participation (Employee accepts)
  const acceptParticipation = useCallback(async (participationId: string): Promise<boolean> => {
    try {
      await participationsAPI.acceptParticipation(participationId)
      
      // Refresh participations
      const allParticipations = await participationsAPI.getAllParticipations()
      setParticipations(allParticipations)
      
      return true
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la participation:', error)
      return false
    }
  }, [])

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    
    setLoadingNotifications(true)
    try {
      const [notifs, countData] = await Promise.all([
        notificationsAPI.getMyNotifications(),
        notificationsAPI.getUnreadCount()
      ])
      setNotifications(notifs)
      setUnreadCount(countData.count)
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }, [isAuthenticated])

  // Mark notification as read
  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      await notificationsAPI.markAsRead(id)
      await refreshNotifications()
      return true
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
      return false
    }
  }, [refreshNotifications])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      await notificationsAPI.markAllAsRead()
      await refreshNotifications()
      return true
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error)
      return false
    }
  }, [refreshNotifications])

  // Load initial data when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.role === 'MANAGER') {
      refreshActivities()
      refreshNotifications()
      
      // Load all participations
      participationsAPI.getAllParticipations()
        .then(setParticipations)
        .catch(err => console.error('Erreur lors du chargement des participations:', err))
    }
  }, [isAuthenticated, user, refreshActivities, refreshNotifications])

  // Poll notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'MANAGER') return
    
    const interval = setInterval(() => {
      refreshNotifications()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [isAuthenticated, user, refreshNotifications])

  return (
    <ManagerContext.Provider value={{
      myActivities,
      pendingActivities,
      loadingActivities,
      refreshActivities,
      getActivityById,
      updateActivityStatus,
      participations,
      loadingParticipations,
      getParticipationsByActivity,
      confirmParticipant,
      rejectParticipation,
      acceptParticipation,
      notifications,
      unreadCount,
      loadingNotifications,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
    }}>
      {children}
    </ManagerContext.Provider>
  )
}

export function useManager() {
  const context = useContext(ManagerContext)
  if (!context) {
    throw new Error('useManager must be used within a ManagerProvider')
  }
  return context
}
