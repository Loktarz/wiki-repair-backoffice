import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTickets } from '../api'
import { useAuth } from '../AuthContext'
import StatusBadge from '../components/StatusBadge'

const PHASES = [
  { key: 'Pré-réception', color: 'bg-gray-400',   text: 'text-gray-700',   bar: 'bg-gray-400' },
  { key: 'Diagnostic',    color: 'bg-blue-400',    text: 'text-blue-700',   bar: 'bg-blue-400' },
  { key: 'Devis',         color: 'bg-yellow-400',  text: 'text-yellow-700', bar: 'bg-yellow-400' },
  { key: 'Réparation',    color: 'bg-orange-400',  text: 'text-orange-700', bar: 'bg-orange-400' },
  { key: 'Livraison',     color: 'bg-green-400',   text: 'text-green-700',  bar: 'bg-green-500' },
  { key: 'Cas spécial',   color: 'bg-red-400',     text: 'text-red-700',    bar: 'bg-red-400' },
]

function getPhase(status) {
  if (['EN_ATTENTE_DEPOT','DEPOSE_MAGASIN','FICHE_REPARATION_IMPRIMEE'].includes(status)) return 'Pré-réception'
  if (['DIAGNOSTIC_EN_ATTENTE','EN_DIAGNOSTIC','DIAGNOSTIC_TERMINE'].includes(status)) return 'Diagnostic'
  if (['DEVIS_EN_ATTENTE','DEVIS_ENVOYE_CLIENT','DEVIS_ACCEPTE','DEVIS_REFUSE'].includes(status)) return 'Devis'
  if (['TENTATIVE_REPARATION','ATTENTE_PIECE','PIECE_RECUE','EN_REPARATION','REPARATION_TERMINEE'].includes(status)) return 'Réparation'
  if (['PRET_RETRAIT','LIVRE_CLIENT'].includes(status)) return 'Livraison'
  return 'Cas spécial'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTickets().then(r => setTickets(r.data)).finally(() => setLoading(false))
  }, [])

  const byPhase = tickets.reduce((acc, t) => {
    const p = getPhase(t.status); acc[p] = (acc[p] || 0) + 1; return acc
  }, {})

  const maxVal = Math.max(...PHASES.map(p => byPhase[p.key] || 0), 1)
  const recent = [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-1">Tableau de bord</h1>
      <p className="text-sm text-gray-500 mb-6">Bonjour, {user?.fullName} 👋</p>

      {loading ? <p className="text-gray-400 text-sm">Chargement...</p> : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="rounded-xl p-4 bg-green-600 text-white col-span-2 md:col-span-1 lg:col-span-1">
              <p className="text-3xl font-bold">{tickets.length}</p>
              <p className="text-sm mt-0.5 opacity-80">Total tickets</p>
            </div>
            {PHASES.slice(0,5).map(p => (
              <div key={p.key} className={`rounded-xl p-4 bg-white border border-gray-100 shadow-sm`}>
                <p className={`text-2xl font-bold ${p.text}`}>{byPhase[p.key] || 0}</p>
                <p className="text-xs mt-0.5 text-gray-500">{p.key}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Répartition par phase</h2>
            <div className="space-y-3">
              {PHASES.map(p => {
                const val = byPhase[p.key] || 0
                const pct = maxVal > 0 ? (val / maxVal) * 100 : 0
                return (
                  <div key={p.key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-28 flex-shrink-0">{p.key}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div
                        className={`h-5 rounded-full ${p.bar} transition-all duration-700 flex items-center justify-end pr-2`}
                        style={{ width: `${Math.max(pct, val > 0 ? 4 : 0)}%` }}
                      >
                        {val > 0 && <span className="text-white text-xs font-bold">{val}</span>}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 w-4">{val}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent tickets */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Tickets récents</h2>
              <Link to="/tickets" className="text-xs text-green-600 hover:underline">Voir tout →</Link>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">N° Ticket</th>
                  <th className="px-4 py-2 text-left">Client</th>
                  <th className="px-4 py-2 text-left">Produit</th>
                  <th className="px-4 py-2 text-left">Statut</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Aucun ticket</td></tr>
                )}
                {recent.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <Link to={`/tickets/${t.id}`} className="text-green-600 font-mono font-medium hover:underline">
                        {t.ticketNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{t.clientName || '—'}</td>
                    <td className="px-4 py-2 text-gray-600">{t.productType} {t.brand}</td>
                    <td className="px-4 py-2"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleDateString('fr-TN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
