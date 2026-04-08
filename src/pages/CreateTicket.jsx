import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createTicket } from '../api'

const FAMILIES = ['IT', 'HIFI', 'Téléphonie']
const TYPES    = { IT: ['Desktop','Laptop','Serveur','Disque dur','Ecran','Clavier'], HIFI: ['Videoprojecteur','Haut parleur','Barre de son'], Téléphonie: ['Smartphone'] }
const SERVICES = ['Diagnostic','Réparation et dépannage','Montage et Installation','Récupération des données','Nettoyage et Entretien']

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

export default function CreateTicket() {
  const navigate = useNavigate()
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    clientType: 'PARTICULIER', clientName: '', clientPhone: '', clientEmail: '', clientAddress: '', clientCompany: '',
    productFamily: '', productType: '', brand: '', designation: '', reference: '', serialNumber: '',
    problemDescription: '', accessories: '', machineState: '',
    warrantyPieces: false, warrantyLabor: false,
    serviceType: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await createTicket(form)
      navigate(`/tickets/${res.data.id}`)
    } catch (e) { setError(e.response?.data?.message || 'Erreur lors de la création') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/tickets" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
        <h1 className="text-xl font-bold text-gray-800">Nouveau Ticket</h1>
      </div>

      {error && <p className="mb-4 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Informations Client</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type de client" required>
              <select value={form.clientType} onChange={e => set('clientType', e.target.value)} className={inputCls}>
                <option value="PARTICULIER">Particulier</option>
                <option value="ENTREPRISE">Entreprise</option>
              </select>
            </Field>
            <Field label="Nom complet / Raison sociale" required>
              <input required value={form.clientName} onChange={e => set('clientName', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Téléphone" required>
              <input required value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} className={inputCls} />
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

        {/* Produit */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Produit</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Famille" required>
              <select required value={form.productFamily} onChange={e => { set('productFamily', e.target.value); set('productType','') }} className={inputCls}>
                <option value="">Sélectionner...</option>
                {FAMILIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Type de produit" required>
              <select required value={form.productType} onChange={e => set('productType', e.target.value)} className={inputCls}>
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
              <input value={form.machineState} onChange={e => set('machineState', e.target.value)} className={inputCls} placeholder="Ex: Bon état, rayures..." />
            </Field>
            <Field label="Accessoires fournis">
              <input value={form.accessories} onChange={e => set('accessories', e.target.value)} className={inputCls} placeholder="Ex: Chargeur, souris..." />
            </Field>
          </div>
        </div>

        {/* Service */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Service demandé</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type de service" required>
              <select required value={form.serviceType} onChange={e => set('serviceType', e.target.value)} className={inputCls}>
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
                Garantie main d'œuvre
              </label>
            </div>
            <div className="col-span-2">
              <Field label="Description du problème" required>
                <textarea required rows={3} value={form.problemDescription} onChange={e => set('problemDescription', e.target.value)}
                  className={inputCls} placeholder="Décrire la panne signalée par le client..." />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/tickets" className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Annuler</Link>
          <button type="submit" disabled={loading}
            className="px-6 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
            {loading ? 'Création...' : 'Créer le ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
