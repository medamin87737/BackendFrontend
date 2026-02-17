import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User, Department, Activity, Recommendation, Notification, QuestionCompetence } from '../types'

interface DataContextType {
  users: User[]
  departments: Department[]
  activities: Activity[]
  recommendations: Recommendation[]
  notifications: Notification[]
  questionCompetences: QuestionCompetence[]
  addUser: (user: User) => void
  updateUser: (user: User) => void
  deleteUser: (id: string) => void
  addDepartment: (dept: Department) => void
  updateDepartment: (dept: Department) => void
  deleteDepartment: (id: string) => void
  addActivity: (activity: Activity) => void
  updateActivity: (activity: Activity) => void
  deleteActivity: (id: string) => void
  updateRecommendation: (rec: Recommendation) => void
  markNotificationRead: (id: string) => void
  getUnreadCount: (userId: string) => number
  getUserNotifications: (userId: string) => Notification[]
  getActivityRecommendations: (activityId: string) => Recommendation[]
  getDepartmentName: (id: string) => string
}

const DataContext = createContext<DataContextType | undefined>(undefined)

function mapBackendActivityToUi(a: any): Activity {
  return {
    id: a?._id?.toString() ?? a?.id ?? crypto.randomUUID(),
    title: a?.title ?? '',
    description: a?.description ?? '',
    type: a?.type ?? 'training',
    required_skills: (a?.requiredSkills ?? []).map((s: any) => ({
      skill_name: s?.skill_name ?? '',
      desired_level: s?.desired_level ?? 'medium',
    })),
    seats: a?.maxParticipants ?? 0,
    date: a?.startDate ? new Date(a.startDate).toISOString() : new Date().toISOString(),
    duration: a?.duration ?? 'N/A',
    location: a?.location ?? 'N/A',
    priority: a?.priority ?? 'consolidate_medium',
    status: a?.status ?? 'open',
    created_by: a?.created_by ?? 'HR',
    assigned_manager: a?.assigned_manager,
    created_at: a?.createdAt ?? new Date().toISOString(),
    updated_at: a?.updatedAt ?? new Date().toISOString(),
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [questionCompetences] = useState<QuestionCompetence[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/activities')
      .then(res => res.ok ? res.json() : [])
      .then(data => setActivities(data.map(mapBackendActivityToUi)))
      .catch(err => console.error('Erreur fetch activités:', err))
  }, [])

  const addActivity = useCallback((a: Activity) => setActivities(prev => [a, ...prev]), [])
  const updateActivity = useCallback((a: Activity) => setActivities(prev => prev.map(x => x.id === a.id ? a : x)), [])
  const deleteActivity = useCallback((id: string) => setActivities(prev => prev.filter(x => x.id !== id)), [])

  return (
    <DataContext.Provider value={{
      users, departments, activities, recommendations, notifications, questionCompetences,
      addUser: () => {}, updateUser: () => {}, deleteUser: () => {},
      addDepartment: () => {}, updateDepartment: () => {}, deleteDepartment: () => {},
      addActivity, updateActivity, deleteActivity,
      updateRecommendation: () => {},
      markNotificationRead: () => {},
      getUnreadCount: () => 0,
      getUserNotifications: () => [],
      getActivityRecommendations: () => [],
      getDepartmentName: () => 'N/A',
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within a DataProvider')
  return context
}
