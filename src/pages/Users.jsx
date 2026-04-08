import { useEffect, useState } from 'react'
import { getUsers, createUser, updateRole, deleteUser } from '../api'

const ROLES = ['ADMIN','AGENT_MAGASIN','TECHNICIAN','INFOLINE']
const ROLE_LABELS = { ADMIN:'Administrateur', AGENT_MAGASIN:'Agent Magasin', TECHNICIAN:'Technicien', INFOLINE:'Infoline' }
const ROLE_COLORS = { ADMIN:'bg-purple-100 text-purple-700', AGENT_MAGASIN:'bg-blue-100 text-blue-700', TECHNICIAN:'bg-orange-100 text-orange-700', INFOLINE:'bg-teal-100 text-teal-700' }
const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"

export default function Users() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fullName:'', email:'', password:'', phone:'', role:'AGENT_MAGASIN' })

  const load = () => getUsers().then(r => setUsers(r.data))
  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCreate = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    try {
      await createUser(form)
      setSuccess(`Utilisateur ${form.fullName} créé !`)
      setShowForm(false); setForm({ fullName:'', email:'', password:'', phone:'', role:'AGENT_MAGASIN' })
      load()
    } catch (e) { setError(e.response?.data?.message || 'Erreur création') }
  }

  const handleRoleChange = async (id, role) => {
    try { await updateRole(id, role); load() }
    catch (e) { setError(e.response?.data?.message || 'Erreur') }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer ${name} ?`)) return
    try { await deleteUser(id); load() }
    catch (e) { setError(e.response?.data?.message || 'Erreur suppression') }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Utilisateurs</h1>
        <button onClick={() => setShowForm(s => !s)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          {showForm ? 'Annuler' : '+ Nouvel utilisateur'}
        </button>
      </div>

      {error   && <p className="mb-3 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
      {success && <p className="mb-3 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">{success}</p>}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Créer un compte</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom complet *</label>
              <input required value={form.fullName} onChange={e => set('fullName',e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => set('email',e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe *</label>
              <input required type="password" value={form.password} onChange={e => set('password',e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
              <input value={form.phone} onChange={e => set('phone',e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rôle *</label>
              <select required value={form.role} onChange={e => set('role',e.target.value)} className={inputCls}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">
            Créer
          </button>
        </form>
      )}

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <p className="p-6 text-gray-400 text-sm">Chargement...</p> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Téléphone</th>
                <th className="px-4 py-3 text-left">Rôle</th>
                <th className="px-4 py-3 text-left">Créé le</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.fullName}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${ROLE_COLORS[u.role]}`}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('fr-TN')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(u.id, u.fullName)}
                      className="text-xs text-red-400 hover:text-red-600 transition">
                      Supprimer
                    </button>
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
