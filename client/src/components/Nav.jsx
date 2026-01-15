import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav(){
  const { user, logout } = useAuth()
  return (
    <header className="header">
      <h1>EasyBooking</h1>
      <nav className="nav">
        <NavLink to="/auth" className={({isActive})=> isActive? 'active':''}>Auth</NavLink>
        <NavLink to="/rooms" className={({isActive})=> isActive? 'active':''}>Salles</NavLink>
        <NavLink to="/bookings" className={({isActive})=> isActive? 'active':''}>Réservations</NavLink>
      </nav>
      <div className="user">
        {user?.email ? (
          <>
            <span>{user.email}</span>
            <button className="secondary" onClick={logout}>Déconnexion</button>
          </>
        ) : (
          <span>Non connecté</span>
        )}
      </div>
    </header>
  )
}
