import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useManager } from '../../context/ManagerContext'
import { useToast } from '../../../hooks/use-toast'
import StatusBadge from '../../components/shared/StatusBadge'
import { ArrowLeft, Check, X, Loader2, Users, Calendar, MapPin } from 'lucide-react'

interface Recommendation {
  _id: string
  employeeId: string
  employeeName: string
  employeeDepartment: string
  globalScore: number
  matchPercentage: number
  status: string
}

export default function ManagerActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { getActivityById, getParticipationsByActivity, confirmParticipant } = useManager()
  
  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [confirming, setConfirming] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    
    const loadActivity = async () => {
      setLoading(true)
      try {
        const act = await getActivityById(id)
        setActivity(act)
        
        // TODO: Load recommendations from AI module
        // For now, we'll show participations
        const participations = getParticipationsByActivity(id)
        console.log('Participations:', participations)
      } catch (error) {
        console.error('Erreur lors du chargement de l\'activité:', error)
        toast({
          title: 'Erreur',
          description: 'Impossible de charger l\'activité',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadActivity()
  }, [id, getActivityById, getParticipationsByActivity, toast])

  const handleConfirmParticipant = async (employeeId: string) => {
    if (!id) return
    
    setConfirming(employeeId)
    try {
      const success = await confirmParticipant(id, employeeId)
      if (success) {
        toast({
          title: 'Succès',
          description: 'Participant confirmé avec succès',
        })
        // Remove from recommendations
        setRecommendations(prev => prev.filter(r => r.employeeId !== employeeId))
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de confirmer le participant',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive'
      })
    } finally {
      setConfirming(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Activité non trouvée
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{activity.title}</h1>
          <p className="text-sm text-muted-foreground">{activity.description}</p>
        </div>
      </div>

      {/* Activity details */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Type</span>
          <div className="mt-1"><StatusBadge status={activity.type} /></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Places</span>
          <p className="mt-1 text-lg font-bold text-card-foreground">{activity.maxParticipants}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Date</span>
          <p className="mt-1 text-sm font-medium text-card-foreground">
            {new Date(activity.startDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Lieu</span>
          <p className="mt-1 text-sm font-medium text-card-foreground">{activity.location}</p>
        </div>
      </div>

      {/* Required skills */}
      {activity.requiredSkills && activity.requiredSkills.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground">Compétences requises</h3>
          <div className="flex flex-wrap gap-2">
            {activity.requiredSkills.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <span className="text-sm font-medium text-card-foreground">{s.skill_name}</span>
                <StatusBadge status={s.desired_level} />
                {s.weight && (
                  <span className="text-xs text-muted-foreground">({Math.round(s.weight * 100)}%)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current participations */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-card-foreground">
            Participants confirmés
          </h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Les participations confirmées apparaîtront ici.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Note: Les recommandations IA seront disponibles via le module Recommendations (collègue responsable)
          </p>
        </div>
      </div>

      {/* Recommendations placeholder */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-3 text-sm font-semibold text-card-foreground">
          Recommandations IA
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Les recommandations d'employés seront générées par le module IA (collègue responsable).
          <br />
          Une fois disponibles, vous pourrez confirmer les participants ici.
        </p>
      </div>
    </div>
  )
}
