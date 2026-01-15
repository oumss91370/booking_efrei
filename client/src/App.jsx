import { Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import Auth from './pages/Auth'
import Rooms from './pages/Rooms'
import Bookings from './pages/Bookings'

export default function App(){
  return (
    <div className="app">
      <Nav />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/bookings" element={<Bookings />} />
        </Routes>
      </div>
    </div>
  )
}
