import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTickets } from '../api'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../AuthContext'

const ALL_STATUSES = [
  'EN_ATTENTE_DEPOT','DEPOSE_MAGASIN','FICHE_REPARATION_IMPRIMEE',
  'DIAGNOSTIC_EN_ATTENTE','EN_DIAGNOSTIC','DIAGNOSTIC_TERMINE',
  'DEVIS_EN_ATTENTE','DEVIS_ENVOYE_CLIENT','DEVIS_ACCEPTE','DEVIS_REFUSE',
  'TENTATIVE_REPARATION','ATTENTE_PIECE','PIECE_RECUE','EN_REPARATION','REPARATION_TERMINEE',
  'PRET_RETRAIT','LIVRE_CLIENT','REPARATION_IMPOSSIBLE',
]

export default function TicketList() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    getTickets().then(r => setTickets(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = tickets.filter(t => {
    const matchSearch = !search ||
      t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      t.brand?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Tickets</h1>
        {(user?.role === 'ADMIN' || user?.role === 'AGENT_MAGASIN') && (
          <Link to="/tickets/new"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + Nouveau Ticket
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text" placeholder="Rechercher (N°, client, marque)..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Tous les statuts</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="text-gray-400 text-sm p-6">Chargement...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left">N° Ticket</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Type client</th>
                <th className="px-4 py-3 text-left">Produit</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Technicien</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400">Aucun ticket trouvé</td></tr>
              )}
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-green-600 font-medium">{t.ticketNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{t.clientName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.clientType === 'ENTREPRISE' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {t.clientType === 'ENTREPRISE' ? 'Entreprise' : 'Particulier'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.productType} {t.brand}</td>
                  <td className="px-4 py-3 text-gray-500">{t.serviceType}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{t.technicianName || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleDateString('fr-TN')}</td>
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${t.id}`} className="text-green-600 hover:underline text-xs">Voir →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
