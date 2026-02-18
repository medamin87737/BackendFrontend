import { useState, useEffect } from 'react'
import { useManager } from '../../context/ManagerContext'
import { useToast } from '../../../hooks/use-toast'
import StatusBadge from '../../components/shared/StatusBadge'
import { Check, X, Loader2, AlertCircle } from 'lucide-react'

export default function ManagerValidations() {
  const { participations, myActivities, rejectParticipation, loadingParticipations } = useManager()
  const { toast } = useToast()
  const [processing, setProcessing] = useState<string | null>(null)

  // Filter participations for my activities that are pending
  const myActivityIds = myActivities.map(a => a._id)
  const pendingParticipations = participations.filter(
    p => myActivityIds.includes(p.activityId) && p.status === 'PENDING'
  )

  const handleReject = async (participationId: string) => {
    setProcessing(participationId)
    try {
      const success = await rejectParticipation(participationId)
      if (success) {
        toast({
          title: 'Succès',
          description: 'Participation rejetée',
        })
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de rejeter la participation',
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
      setProcessing(null)
    }
  }

  if (loadingParticipations) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Validations</h1>
        <p className="text-sm text-muted-foreground">
          {pendingParticipations.length} participation(s) en attente de validation
        </p>
      </div>

      {pendingParticipations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-12">
          <Check className="h-10 w-10 text-emerald-500" />
          <p className="text-sm text-muted-foreground">
            Toutes les participations ont été traitées
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pendingParticipations.map(participation => {
            const activity = myActivities.find(a => a._id === participation.activityId)
            
            return (
              <div key={participation._id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {participation.employeeId.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-card-foreground">
                        Employé: {participation.employeeId}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Participation en attente
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={participation.status} />
                </div>

                <div className="mt-3 rounded-lg bg-background p-3">
                  <span className="text-xs font-medium text-muted-foreground">Activité:</span>
                  <span className="ml-2 text-sm font-medium text-card-foreground">
                    {activity?.title ?? 'N/A'}
                  </span>
                </div>

                {participation.justification && (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    "{participation.justification}"
                  </p>
                )}

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-3">
                  <button
                    onClick={() => handleReject(participation._id)}
                    disabled={processing === participation._id}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent disabled:opacity-50"
                  >
                    {processing === participation._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Rejeter
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* All participations for my activities */}
      {participations.filter(p => myActivityIds.includes(p.activityId) && p.status !== 'PENDING').length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold text-card-foreground">
              Participations traitées
            </h3>
          </div>
          <div className="divide-y divide-border">
            {participations
              .filter(p => myActivityIds.includes(p.activityId) && p.status !== 'PENDING')
              .map(p => {
                const activity = myActivities.find(a => a._id === p.activityId)
                return (
                  <div key={p._id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {p.employeeId.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-card-foreground">
                          {p.employeeId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {activity?.title}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold text-blue-900">
              Workflow des participations
            </h4>
            <p className="text-xs text-blue-700">
              1. HR génère les recommandations IA
              <br />
              2. Manager confirme les participants (crée les participations)
              <br />
              3. Employés acceptent ou refusent
              <br />
              4. Manager gère les refus et sélectionne des remplaçants
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
