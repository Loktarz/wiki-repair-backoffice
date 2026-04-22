import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getTicket, updateTicket } from '../api'
import { useAuth } from '../AuthContext'

const FAMILIES = ['IT', 'HIFI', 'Téléphonie']
const TYPES    = { IT: ['Desktop','Laptop','Serveur','Disque dur','Ecran','Clavier'], HIFI: ['Videoprojecteur','Haut parleur','Barre de son'], Téléphonie: ['Smartphone'] }
const SERVICES = ['Diagnostic','Réparation et dépannage','Montage et Installation','Récupération des données','Nettoyage et Entretien']

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

export default function EditTicket() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState(null)

  const isTech      = user?.role === 'TECHNICIAN'
  const isAgentOrAdmin = user?.role === 'AGENT_MAGASIN' || user?.role === 'ADMIN'

  useEffect(() => {
    getTicket(id).then(r => {
      const t = r.data
      setForm({
        clientType:         t.clientType        || 'PARTICULIER',
        clientName:         t.clientName        || '',
        clientPhone:        t.clientPhone       || '',
        clientEmail:        t.clientEmail       || '',
        clientAddress:      t.clientAddress     || '',
        clientCompany:      t.clientCompany     || '',
        productFamily:      t.productFamily     || '',
        productType:        t.productType       || '',
        brand:              t.brand             || '',
        designation:        t.designation       || '',
        reference:          t.reference         || '',
        serialNumber:       t.serialNumber      || '',
        machineState:       t.machineState      || '',
        accessories:        t.accessories       || '',
        problemDescription: t.problemDescription|| '',
        serviceType:        t.serviceType       || '',
        warrantyPieces:     t.warrantyPieces    || false,
        warrantyLabor:      t.warrantyLabor     || false,
        diagnosticNotes:    t.diagnosticNotes   || '',
      })
    }).finally(() => setFetching(false))
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await updateTicket(id, form)
      navigate(`/tickets/${id}`)
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <p className="p-6 text-gray-400">Chargement...</p>
  if (!form)    return <p className="p-6 text-red-500">Ticket introuvable.</p>

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/tickets/${id}`} className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
        <h1 className="text-xl font-bold text-gray-800">Modifier le Ticket</h1>
      </div>

      {error && <p className="mb-4 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Client info — agent + admin only ── */}
        {isAgentOrAdmin && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Informations Client</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type de client">
                <select value={form.clientType} onChange={e => set('clientType', e.target.value)} className={inputCls}>
                  <option value="PARTICULIER">Particulier</option>
                  <option value="ENTREPRISE">Entreprise</option>
                </select>
              </Field>
              <Field label="Nom complet / Raison sociale" required>
                <input required value={form.clientName} onChange={e => set('clientName', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Téléphone" required>
                <input
                  required
                  value={form.clientPhone}
                  onChange={e => set('clientPhone', e.target.value.replace(/[^0-9+]/g, ''))}
                  maxLength={12}
                  pattern="(\+216)?[0-9]{8}"
                  title="8 chiffres requis (ex: 55123456 ou +21655123456)"
                  placeholder="55123456"
                  className={inputCls}
                />
              </Field>
              <Field label="Email">
                <input type="email" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Adresse">
                <input value={form.clientAddress} onChange={e => set('clientAddress', e.target.value)} className={inputCls} />
              </Field>
              {form.clientType === 'ENTREPRISE' && (
                <Field label="Société">
                  <input value={form.clientCompany} onChange={e => set('clientCompany', e.target.value)} className={inputCls} />
                </Field>
              )}
            </div>
          </div>
        )}

        {/* ── Product info — agent + admin only ── */}
        {isAgentOrAdmin && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Produit</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Famille">
                <select value={form.productFamily} onChange={e => { set('productFamily', e.target.value); set('productType','') }} className={inputCls}>
                  <option value="">Sélectionner...</option>
                  {FAMILIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Type de produit">
                <select value={form.productType} onChange={e => set('productType', e.target.value)} className={inputCls}>
                  <option value="">Sélectionner...</option>
                  {(TYPES[form.productFamily] || []).map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Marque">
                <input value={form.brand} onChange={e => set('brand', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Désignation">
                <input value={form.designation} onChange={e => set('designation', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Référence">
                <input value={form.reference} onChange={e => set('reference', e.target.value)} className={inputCls} />
              </Field>
              <Field label="N° de série">
                <input value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} className={inputCls} />
              </Field>
              <Field label="État physique">
                <input value={form.machineState} onChange={e => set('machineState', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Accessoires fournis">
                <input value={form.accessories} onChange={e => set('accessories', e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>
        )}

        {/* ── Service — agent + admin only ── */}
        {isAgentOrAdmin && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Service demandé</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type de service">
                <select value={form.serviceType} onChange={e => set('serviceType', e.target.value)} className={inputCls}>
                  <option value="">Sélectionner...</option>
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <div className="flex items-center gap-6 mt-5">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.warrantyPieces} onChange={e => set('warrantyPieces', e.target.checked)} className="accent-green-600" />
                  Garantie pièces
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.warrantyLabor} onChange={e => set('warrantyLabor', e.target.checked)} className="accent-green-600" />
                  Garantie MO
                </label>
              </div>
              <div className="col-span-2">
                <Field label="Description du problème">
                  <textarea rows={3} value={form.problemDescription} onChange={e => set('problemDescription', e.target.value)}
                    className={inputCls} placeholder="Décrire la panne signalée par le client..." />
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* ── Diagnostic notes — technician + admin ── */}
        {(isTech || user?.role === 'ADMIN') && (
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <h2 className="text-sm font-semibold text-blue-700 mb-3">Notes de diagnostic</h2>
            <textarea
              rows={5}
              value={form.diagnosticNotes}
              onChange={e => set('diagnosticNotes', e.target.value)}
              className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="Décrire le diagnostic effectué, les tests réalisés, les pièces défectueuses identifiées..."
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link to={`/tickets/${id}`}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            Annuler
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
