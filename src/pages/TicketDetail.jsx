import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTicket, updateStatus, assignTechnician, assignInfoline, getUsersByRole, deleteTicket, getTicketHistory } from '../api'
import { useAuth } from '../AuthContext'
import StatusBadge from '../components/StatusBadge'

const ROLE_TRANSITIONS = {
  AGENT_MAGASIN: ['DEPOSE_MAGASIN','FICHE_REPARATION_IMPRIMEE','DIAGNOSTIC_EN_ATTENTE','PRET_RETRAIT','LIVRE_CLIENT'],
  TECHNICIAN:    ['EN_DIAGNOSTIC','DIAGNOSTIC_TERMINE','TENTATIVE_REPARATION','ATTENTE_PIECE','PIECE_RECUE','EN_REPARATION','REPARATION_TERMINEE','REPARATION_IMPOSSIBLE'],
  INFOLINE:      ['DEVIS_EN_ATTENTE','DEVIS_ENVOYE_CLIENT','DEVIS_ACCEPTE','DEVIS_REFUSE'],
  ADMIN:         ['DEPOSE_MAGASIN','FICHE_REPARATION_IMPRIMEE','DIAGNOSTIC_EN_ATTENTE','EN_DIAGNOSTIC','DIAGNOSTIC_TERMINE','DEVIS_EN_ATTENTE','DEVIS_ENVOYE_CLIENT','DEVIS_ACCEPTE','DEVIS_REFUSE','TENTATIVE_REPARATION','ATTENTE_PIECE','PIECE_RECUE','EN_REPARATION','REPARATION_TERMINEE','PRET_RETRAIT','LIVRE_CLIENT','REPARATION_IMPOSSIBLE'],
}

function Row({ label, value }) {
  return (
    <div className="flex py-2 border-b border-gray-50 text-sm">
      <span className="w-44 text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value || '—'}</span>
    </div>
  )
}

export default function TicketDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ticket, setTicket]       = useState(null)
  const [technicians, setTechs]     = useState([])
  const [infolines, setInfolines]   = useState([])
  const [selectedTech, setSelTech]  = useState('')
  const [selectedInfo, setSelInfo]  = useState('')
  const [selectedStatus, setSelStatus] = useState('')
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [history, setHistory]     = useState([])

  const load = () => getTicket(id).then(r => setTicket(r.data))
  const loadHistory = () => getTicketHistory(id).then(r => setHistory(r.data)).catch(() => {})

  useEffect(() => {
    Promise.all([
      load(),
      loadHistory(),
      getUsersByRole('TECHNICIAN').then(r => setTechs(r.data)),
      getUsersByRole('INFOLINE').then(r => setInfolines(r.data)),
    ])
      .finally(() => setLoading(false))
  }, [id])

  const handleStatus = async () => {
    if (!selectedStatus) return
    try {
      const r = await updateStatus(id, selectedStatus)
      setTicket(r.data); setSelectedStatus(''); setError('')
      loadHistory()
    } catch (e) { setError(e.response?.data?.message || 'Erreur statut') }
  }

  const handleAssign = async () => {
    if (!selectedTech) return
    try {
      const r = await assignTechnician(id, selectedTech)
      setTicket(r.data); setError('')
    } catch (e) { setError(e.response?.data?.message || 'Erreur assignation') }
  }

  const handleAssignInfoline = async () => {
    if (!selectedInfo) return
    try {
      const r = await assignInfoline(id, selectedInfo)
      setTicket(r.data); setError('')
    } catch (e) { setError(e.response?.data?.message || 'Erreur assignation infoline') }
  }

  const handlePrint = () => {
    const w = window.open('', '_blank')
    w.document.write(`
      <html><head><title>Fiche - ${ticket.ticketNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
        h1 { font-size: 20px; border-bottom: 2px solid #18a34a; padding-bottom: 8px; margin-bottom: 20px; }
        h2 { font-size: 13px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 8px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
        .row { display: flex; gap: 8px; font-size: 13px; padding: 4px 0; border-bottom: 1px solid #eee; }
        .label { color: #777; min-width: 140px; }
        .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: bold; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; }
        .logo { font-size: 22px; font-weight: bold; color: #18a34a; }
        .sub { font-size: 11px; color: #999; margin-top: 2px; }
        .ticket-no { font-size: 28px; font-weight: bold; font-family: monospace; color: #18a34a; }
        .section { margin-top: 20px; }
        @media print { body { padding: 16px; } }
      </style></head><body>
      <div class="header">
        <div><div class="logo">Wiki Repair</div><div class="sub">Fiche de réparation</div></div>
        <div style="text-align:right">
          <div class="ticket-no">${ticket.ticketNumber}</div>
          <div class="sub">Créé le ${new Date(ticket.createdAt).toLocaleDateString('fr-TN')}</div>
        </div>
      </div>

      <div class="section">
        <h2>Client</h2>
        <div class="row"><span class="label">Nom</span><span>${ticket.clientName || '—'}</span></div>
        <div class="row"><span class="label">Téléphone</span><span>${ticket.clientPhone || '—'}</span></div>
        <div class="row"><span class="label">Email</span><span>${ticket.clientEmail || '—'}</span></div>
        <div class="row"><span class="label">Type</span><span>${ticket.clientType === 'ENTREPRISE' ? 'Entreprise' : 'Particulier'}</span></div>
        ${ticket.clientCompany ? `<div class="row"><span class="label">Société</span><span>${ticket.clientCompany}</span></div>` : ''}
        ${ticket.clientAddress ? `<div class="row"><span class="label">Adresse</span><span>${ticket.clientAddress}</span></div>` : ''}
      </div>

      <div class="section">
        <h2>Appareil</h2>
        <div class="row"><span class="label">Famille</span><span>${ticket.productFamily || '—'}</span></div>
        <div class="row"><span class="label">Type</span><span>${ticket.productType || '—'}</span></div>
        <div class="row"><span class="label">Marque</span><span>${ticket.brand || '—'}</span></div>
        <div class="row"><span class="label">Désignation</span><span>${ticket.designation || '—'}</span></div>
        <div class="row"><span class="label">Référence</span><span>${ticket.reference || '—'}</span></div>
        <div class="row"><span class="label">N° de série</span><span>${ticket.serialNumber || '—'}</span></div>
        <div class="row"><span class="label">État physique</span><span>${ticket.machineState || '—'}</span></div>
        <div class="row"><span class="label">Accessoires</span><span>${ticket.accessories || '—'}</span></div>
      </div>

      <div class="section">
        <h2>Service</h2>
        <div class="row"><span class="label">Service</span><span>${ticket.serviceType || '—'}</span></div>
        <div class="row"><span class="label">Problème décrit</span><span>${ticket.problemDescription || '—'}</span></div>
        <div class="row"><span class="label">Garantie pièces</span><span>${ticket.warrantyPieces ? 'Oui' : 'Non'}</span></div>
        <div class="row"><span class="label">Garantie MO</span><span>${ticket.warrantyLabor ? 'Oui' : 'Non'}</span></div>
      </div>

      <div class="section">
        <h2>Intervenants</h2>
        <div class="row"><span class="label">Agent magasin</span><span>${ticket.agentMagasinName || '—'}</span></div>
        <div class="row"><span class="label">Technicien</span><span>${ticket.technicianName || '—'}</span></div>
        <div class="row"><span class="label">Infoline</span><span>${ticket.infolineName || '—'}</span></div>
      </div>

      ${ticket.diagnosticNotes ? `
      <div class="section">
        <h2>Notes de diagnostic</h2>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:12px;font-size:13px;">
          ${ticket.diagnosticNotes}
        </div>
      </div>` : ''}

      <div style="margin-top:40px;border-top:1px solid #eee;padding-top:16px;display:flex;justify-content:space-between;font-size:11px;color:#aaa;">
        <span>Wiki Repair — Fiche générée le ${new Date().toLocaleString('fr-TN')}</span>
        <span>Statut actuel : ${ticket.status}</span>
      </div>
      <script>window.onload = () => { window.print(); }</script>
      </body></html>
    `)
    w.document.close()
  }

  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce ticket ?')) return
    await deleteTicket(id)
    navigate('/tickets')
  }

  if (loading) return <p className="p-6 text-gray-400">Chargement...</p>
  if (!ticket)  return <p className="p-6 text-red-500">Ticket introuvable.</p>

  const allowedStatuses = ROLE_TRANSITIONS[user?.role] || []

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/tickets" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
        <h1 className="text-xl font-bold text-gray-800 font-mono">{ticket.ticketNumber}</h1>
        <StatusBadge status={ticket.status} />
        <div className="ml-auto flex gap-2">
          <button onClick={handlePrint}
            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1 rounded-lg">
            🖨️ Imprimer
          </button>
          {(user?.role === 'ADMIN' || user?.role === 'AGENT_MAGASIN' || user?.role === 'TECHNICIAN') && (
            <Link to={`/tickets/${id}/edit`}
              className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1 rounded-lg">
              ✏️ Modifier
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg">
              Supprimer
            </button>
          )}
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Client</h2>
          <Row label="Type"      value={ticket.clientType === 'ENTREPRISE' ? 'Entreprise' : 'Particulier'} />
          <Row label="Nom"       value={ticket.clientName} />
          <Row label="Téléphone" value={ticket.clientPhone} />
          <Row label="Email"     value={ticket.clientEmail} />
          <Row label="Adresse"   value={ticket.clientAddress} />
          <Row label="Société"   value={ticket.clientCompany} />
        </div>

        {/* Produit */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Produit</h2>
          <Row label="Famille"     value={ticket.productFamily} />
          <Row label="Type"        value={ticket.productType} />
          <Row label="Marque"      value={ticket.brand} />
          <Row label="Désignation" value={ticket.designation} />
          <Row label="Référence"   value={ticket.reference} />
          <Row label="N° Série"    value={ticket.serialNumber} />
          <Row label="État"        value={ticket.machineState} />
          <Row label="Accessoires" value={ticket.accessories} />
        </div>

        {/* Service & Garantie */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Service & Garantie</h2>
          <Row label="Service"      value={ticket.serviceType} />
          <Row label="Problème"     value={ticket.problemDescription} />
          <Row label="Garan. pièces" value={ticket.warrantyPieces ? 'Oui' : 'Non'} />
          <Row label="Garan. MO"    value={ticket.warrantyLabor  ? 'Oui' : 'Non'} />
        </div>

        {/* Intervenants */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Intervenants</h2>
          <Row label="Agent Magasin" value={ticket.agentMagasinName} />
          <Row label="Infoline"      value={ticket.infolineName} />
          <Row label="Technicien"    value={ticket.technicianName} />
          <Row label="Créé le"       value={new Date(ticket.createdAt).toLocaleString('fr-TN')} />
          <Row label="Mis à jour"    value={ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString('fr-TN') : '—'} />
        </div>

        {/* Diagnostic notes */}
        {ticket.diagnosticNotes && (
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 md:col-span-2">
            <h2 className="text-sm font-semibold text-blue-700 mb-2">Notes de diagnostic</h2>
            <p className="text-sm text-blue-800">{ticket.diagnosticNotes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {/* Status update */}
            {allowedStatuses.length > 0 && (
              <div className="flex gap-2">
                <select
                  value={selectedStatus} onChange={e => setSelStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Changer le statut...</option>
                  {allowedStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={handleStatus}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition">
                  Appliquer
                </button>
              </div>
            )}

            {/* Assign technician */}
            {(user?.role === 'ADMIN' || user?.role === 'AGENT_MAGASIN') && (
              <div className="flex gap-2">
                <select
                  value={selectedTech} onChange={e => setSelTech(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Assigner technicien...</option>
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
                <button onClick={handleAssign}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">
                  Assigner
                </button>
              </div>
            )}

            {/* Assign infoline */}
            {(user?.role === 'ADMIN' || user?.role === 'AGENT_MAGASIN') && (
              <div className="flex gap-2">
                <select
                  value={selectedInfo} onChange={e => setSelInfo(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Assigner infoline...</option>
                  {infolines.map(i => <option key={i.id} value={i.id}>{i.fullName}</option>)}
                </select>
                <button onClick={handleAssignInfoline}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg transition">
                  Assigner
                </button>
              </div>
            )}

            {/* Link to devis */}
            {(user?.role === 'ADMIN' || user?.role === 'INFOLINE') && (
              <Link to={`/devis/${id}`}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded-lg transition">
                📋 Gérer le devis
              </Link>
            )}
          </div>
        </div>
        {/* Status History */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:col-span-2">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Historique des statuts</h2>
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={h.id} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${i === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    {i < history.length - 1 && <div className="w-0.5 h-6 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">{h.newStatusLabel}</span>
                      {h.oldStatusLabel && (
                        <span className="text-xs text-gray-400">← {h.oldStatusLabel}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {h.changedAt} · <span className="text-gray-500">{h.changedByName}</span>
                      <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{h.changedByRole}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
