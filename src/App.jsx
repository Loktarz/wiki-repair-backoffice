import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TicketList from './pages/TicketList'
import TicketDetail from './pages/TicketDetail'
import CreateTicket from './pages/CreateTicket'
import EditTicket from './pages/EditTicket'
import DevisPage from './pages/DevisPage'
import Users from './pages/Users'
import Profile from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute><Layout /></ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="tickets"          element={<TicketList />} />
            <Route path="tickets/new"      element={
              <ProtectedRoute roles={['ADMIN','AGENT_MAGASIN']}><CreateTicket /></ProtectedRoute>
            } />
            <Route path="tickets/:id"      element={<TicketDetail />} />
            <Route path="tickets/:id/edit" element={<EditTicket />} />
            <Route path="devis/:ticketId"  element={
              <ProtectedRoute roles={['ADMIN','INFOLINE']}><DevisPage /></ProtectedRoute>
            } />
            <Route path="devis"            element={<TicketList />} />
            <Route path="users"            element={
              <ProtectedRoute roles={['ADMIN']}><Users /></ProtectedRoute>
            } />
            <Route path="profile"          element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
