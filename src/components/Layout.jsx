import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  AGENT_MAGASIN: 'Agent Magasin',
  TECHNICIAN: 'Technicien',
  INFOLINE: 'Infoline',
}

const ROLE_COLORS = {
  ADMIN: 'bg-purple-100 text-purple-700',
  AGENT_MAGASIN: 'bg-blue-100 text-blue-700',
  TECHNICIAN: 'bg-orange-100 text-orange-700',
  INFOLINE: 'bg-teal-100 text-teal-700',
}

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">W</div>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-none">Wiki Repair</p>
              <p className="text-xs text-gray-400">Back Office</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem to="/"          label="Tableau de bord" icon="📊" />
          <NavItem to="/tickets"   label="Tickets"          icon="🎫" />
          {(user?.role === 'ADMIN' || user?.role === 'AGENT_MAGASIN') && (
            <NavItem to="/tickets/new" label="Nouveau Ticket" icon="➕" />
          )}
          {(user?.role === 'ADMIN' || user?.role === 'INFOLINE') && (
            <NavItem to="/devis" label="Devis" icon="📋" />
          )}
          {user?.role === 'ADMIN' && (
            <NavItem to="/users" label="Utilisateurs" icon="👥" />
          )}
          <NavItem to="/profile" label="Mon Profil" icon="👤" />
        </nav>

        {/* User info + logout */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="mb-2 px-1">
            <p className="text-xs font-semibold text-gray-700 truncate">{user?.fullName}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user?.role]}`}>
              {ROLE_LABELS[user?.role]}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-red-500 hover:text-red-700 px-1 py-1 transition"
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
