import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTicket, getDevisByTicket, createDevis, updateDevis, updateLigne, updateStatus } from '../api'
import StatusBadge from '../components/StatusBadge'

const inputCls = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full"

function emptyLigne() { return { description: '', quantite: 1, prixUnitaire: 0 } }

export default function DevisPage() {
  const { ticketId } = useParams()
  const [ticket, setTicket]   = useState(null)
  const [devisList, setDevis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [lignes, setLignes]       = useState([emptyLigne()])
  const [mainDoeuvre, setMO]      = useState(0)
  const [notes, setNotes]         = useState('')
  const [editingId, setEditingId] = useState(null)

  const load = async () => {
    const [tRes, dRes] = await Promise.all([getTicket(ticketId), getDevisByTicket(ticketId).catch(() => ({ data: [] }))])
    setTicket(tRes.data)
    setDevis(dRes.data)
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [ticketId])

  const setLigne = (i, k, v) => setLignes(ls => ls.map((l, idx) => idx === i ? { ...l, [k]: v } : l))
  const addLigne    = () => setLignes(ls => [...ls, emptyLigne()])
  const removeLigne = (i) => setLignes(ls => ls.filter((_, idx) => idx !== i))

  const totalPieces = lignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0), 0)
  const tva         = (totalPieces + Number(mainDoeuvre)) * 0.19
  const total       = totalPieces + Number(mainDoeuvre) + tva

  const loadEdit = (d) => {
    setEditingId(d.id)
    setLignes(d.lignes.length ? d.lignes.map(l => ({ description: l.description, quantite: l.quantite, prixUnitaire: l.prixUnitaire })) : [emptyLigne()])
    setMO(d.mainDoeuvre || 0)
    setNotes(d.notes || '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    const payload = { ticketId: Number(ticketId), lignes, mainDoeuvre: Number(mainDoeuvre), notes }
    try {
      if (editingId) { await updateDevis(editingId, payload) }
      else           { await createDevis(payload) }
      setSuccess('Devis sauvegardé !')
      setEditingId(null); setLignes([emptyLigne()]); setMO(0); setNotes('')
      await load()
    } catch (e) { setError(e.response?.data?.message || 'Erreur') }
  }

  const handleAcceptance = async (ligneId, acceptee) => {
    try { await updateLigne(ligneId, acceptee); await load() }
    catch (e) { setError(e.response?.data?.message || 'Erreur') }
  }

  const handleStatusChange = async (status) => {
    try { await updateStatus(ticketId, status); await load() }
    catch (e) { setError(e.response?.data?.message || 'Erreur statut') }
  }

  if (loading) return <p className="p-6 text-gray-400">Chargement...</p>

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/tickets/${ticketId}`} className="text-gray-400 hover:text-gray-600 text-sm">← Ticket</Link>
        <h1 className="text-xl font-bold text-gray-800">Devis — {ticket?.ticketNumber}</h1>
        {ticket && <StatusBadge status={ticket.status} />}
      </div>

      {error   && <p className="mb-3 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
      {success && <p className="mb-3 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">{success}</p>}

      {/* Devis form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          {editingId ? 'Modifier le devis' : 'Créer un devis'}
        </h2>

        {/* Lignes */}
        <div className="mb-4">
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium mb-1 px-1">
            <span className="col-span-5">Description</span>
            <span className="col-span-2">Qté</span>
            <span className="col-span-2">Prix unit. (DT)</span>
            <span className="col-span-2">Total HT</span>
            <span className="col-span-1"></span>
          </div>
          {lignes.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <input className={`col-span-5 ${inputCls}`} placeholder="Ex: Carte graphique GTX 1650" value={l.description} onChange={e => setLigne(i,'description',e.target.value)} />
              <input className={`col-span-2 ${inputCls}`} type="number" min="1" value={l.quantite} onChange={e => setLigne(i,'quantite',e.target.value)} />
              <input className={`col-span-2 ${inputCls}`} type="number" step="0.01" min="0" value={l.prixUnitaire} onChange={e => setLigne(i,'prixUnitaire',e.target.value)} />
              <span className="col-span-2 text-sm text-gray-700 font-medium px-1">
                {((Number(l.quantite)||0) * (Number(l.prixUnitaire)||0)).toFixed(2)} DT
              </span>
              <button type="button" onClick={() => removeLigne(i)} className="col-span-1 text-red-400 hover:text-red-600 text-lg">×</button>
            </div>
          ))}
          <button type="button" onClick={addLigne} className="text-xs text-green-600 hover:underline mt-1">+ Ajouter une ligne</button>
        </div>

        {/* Main d'oeuvre + notes */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Main d'œuvre (DT HT)</label>
            <input type="number" step="0.01" min="0" value={mainDoeuvre} onChange={e => setMO(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} className={inputCls} placeholder="Remarques..." />
          </div>
        </div>

        {/* Totals preview */}
        <div className="bg-gray-50 rounded-lg p-3 text-sm mb-4">
          <div className="flex justify-between text-gray-600"><span>Total pièces HT</span><span>{totalPieces.toFixed(2)} DT</span></div>
          <div className="flex justify-between text-gray-600"><span>Main d'œuvre HT</span><span>{Number(mainDoeuvre).toFixed(2)} DT</span></div>
          <div className="flex justify-between text-gray-600"><span>TVA (19%)</span><span>{tva.toFixed(2)} DT</span></div>
          <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 mt-1 pt-1"><span>Total TTC</span><span>{total.toFixed(2)} DT</span></div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition">
            {editingId ? 'Mettre à jour' : 'Créer le devis'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setLignes([emptyLigne()]); setMO(0); setNotes('') }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Devis history */}
      {devisList.map((d, idx) => (
        <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Devis #{idx + 1} — {new Date(d.createdAt).toLocaleString('fr-TN')}</h2>
            <button onClick={() => loadEdit(d)} className="text-xs text-blue-600 hover:underline">Modifier</button>
          </div>

          {/* Lignes with accept/refuse */}
          <table className="w-full text-sm mb-3">
            <thead className="text-xs text-gray-500 border-b border-gray-100">
              <tr>
                <th className="py-1 text-left">Description</th>
                <th className="py-1 text-center">Qté</th>
                <th className="py-1 text-right">Prix unit.</th>
                <th className="py-1 text-right">Total HT</th>
                <th className="py-1 text-center">Client</th>
              </tr>
            </thead>
            <tbody>
              {d.lignes.map(l => (
                <tr key={l.id} className="border-b border-gray-50">
                  <td className="py-1.5">{l.description}</td>
                  <td className="py-1.5 text-center">{l.quantite}</td>
                  <td className="py-1.5 text-right">{l.prixUnitaire?.toFixed(2)} DT</td>
                  <td className="py-1.5 text-right">{l.totalHT?.toFixed(2)} DT</td>
                  <td className="py-1.5 text-center">
                    {l.acceptee === true  && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Accepté</span>}
                    {l.acceptee === false && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Refusé</span>}
                    {l.acceptee === null  && (
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => handleAcceptance(l.id, true)}  className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-0.5 rounded">✓</button>
                        <button onClick={() => handleAcceptance(l.id, false)} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded">✗</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 mb-3">
            <div className="flex justify-between"><span>Pièces HT</span><span>{d.totalPiecesHT?.toFixed(2)} DT</span></div>
            <div className="flex justify-between"><span>Main d'œuvre</span><span>{d.mainDoeuvre?.toFixed(2)} DT</span></div>
            <div className="flex justify-between"><span>TVA 19%</span><span>{d.tva?.toFixed(2)} DT</span></div>
            <div className="flex justify-between font-bold text-gray-800 border-t mt-1 pt-1"><span>Total TTC</span><span>{d.montantTotal?.toFixed(2)} DT</span></div>
          </div>

          {/* Status shortcuts */}
          <div className="flex gap-2 flex-wrap">
            {['DEVIS_EN_ATTENTE','DEVIS_ENVOYE_CLIENT','DEVIS_ACCEPTE','DEVIS_REFUSE','TENTATIVE_REPARATION'].map(s => (
              <button key={s} onClick={() => handleStatusChange(s)}
                className={`text-xs px-3 py-1 rounded-full border transition ${ticket?.status === s ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
