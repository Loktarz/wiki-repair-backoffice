import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { changePassword } from '../api'

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
const ROLE_LABELS = { ADMIN:'Administrateur', AGENT_MAGASIN:'Agent Magasin', TECHNICIAN:'Technicien', INFOLINE:'Infoline' }

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm]   = useState({ currentPassword:'', newPassword:'' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handlePwd = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    try {
      await changePassword(form)
      setSuccess('Mot de passe modifié avec succès.')
      setForm({ currentPassword:'', newPassword:'' })
    } catch (e) { setError(e.response?.data?.message || 'Erreur') }
  }

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Mon Profil</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.fullName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">{ROLE_LABELS[user?.role]}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Changer le mot de passe</h2>
        {error   && <p className="mb-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        {success && <p className="mb-3 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}
        <form onSubmit={handlePwd} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe actuel</label>
            <input required type="password" value={form.currentPassword} onChange={e => setForm(f=>({...f,currentPassword:e.target.value}))} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nouveau mot de passe</label>
            <input required type="password" value={form.newPassword} onChange={e => setForm(f=>({...f,newPassword:e.target.value}))} className={inputCls} />
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition">
            Mettre à jour
          </button>
        </form>
      </div>
    </div>
  )
}
