import { useEffect, useState, useCallback } from 'react'
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

const PAGE_SIZE_OPTIONS = [10, 25, 50]

export default function TicketList() {
  const { user } = useAuth()

  // ── Filters ──────────────────────────────────────────────────────────────
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('') // raw input before debounce

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage]         = useState(0)
  const [size, setSize]         = useState(10)
  const [totalPages, setTotalPages]   = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // ── Data ──────────────────────────────────────────────────────────────────
  const [tickets, setTickets]   = useState([])
  const [loading, setLoading]   = useState(true)

  // ── Debounce search input (500ms) ─────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(0) // reset to first page on new search
    }, 500)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reset to page 0 when status filter changes
  useEffect(() => {
    setPage(0)
  }, [statusFilter])

  // ── Fetch tickets from backend ────────────────────────────────────────────
  const fetchTickets = useCallback(() => {
    setLoading(true)
    const params = { page, size }
    if (search)       params.search = search
    if (statusFilter) params.status = statusFilter

    getTickets(params)
      .then(r => {
        setTickets(r.data.content)
        setTotalPages(r.data.totalPages)
        setTotalElements(r.data.totalElements)
      })
      .finally(() => setLoading(false))
  }, [page, size, search, statusFilter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // ── Pagination helpers ────────────────────────────────────────────────────
  const getPageNumbers = () => {
    const delta = 2
    const range = []
    for (let i = Math.max(0, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i)
    }
    return range
  }

  return (
    <div className="p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Tickets</h1>
          {!loading && (
            <p className="text-xs text-gray-400 mt-0.5">{totalElements} ticket(s) au total</p>
          )}
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'AGENT_MAGASIN') && (
          <Link to="/tickets/new"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + Nouveau Ticket
          </Link>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Rechercher (N°, client, marque)..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Tous les statuts</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Clear filters */}
        {(searchInput || statusFilter) && (
          <button
            onClick={() => { setSearchInput(''); setSearch(''); setStatusFilter(''); setPage(0) }}
            className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-3 py-2 rounded-lg transition"
          >
            ✕ Effacer les filtres
          </button>
        )}

        {/* Page size selector — pushed to the right */}
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <span>Lignes par page :</span>
          <select
            value={size}
            onChange={e => { setSize(Number(e.target.value)); setPage(0) }}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
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
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                    Aucun ticket trouvé
                  </td>
                </tr>
              )}
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-green-600 font-medium">{t.ticketNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{t.clientName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.clientType === 'ENTREPRISE'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {t.clientType === 'ENTREPRISE' ? 'Entreprise' : 'Particulier'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.productType} {t.brand}</td>
                  <td className="px-4 py-3 text-gray-500">{t.serviceType}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{t.technicianName || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(t.createdAt).toLocaleDateString('fr-TN')}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${t.id}`} className="text-green-600 hover:underline text-xs">
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination controls ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">

          {/* Info text */}
          <p className="text-xs text-gray-400">
            Page {page + 1} sur {totalPages} — {totalElements} ticket(s)
          </p>

          {/* Page buttons */}
          <div className="flex items-center gap-1">
            {/* First page */}
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="px-2 py-1.5 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              «
            </button>

            {/* Previous */}
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ‹ Préc
            </button>

            {/* Page numbers */}
            {getPageNumbers().map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-xs rounded border transition ${
                  p === page
                    ? 'bg-green-600 border-green-600 text-white font-semibold'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p + 1}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Suiv ›
            </button>

            {/* Last page */}
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="px-2 py-1.5 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
