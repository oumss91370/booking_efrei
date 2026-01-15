import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../lib/api'

export default function Auth(){
  const { login, logout, user } = useAuth()
  const api = useApi()
  const [reg, setReg] = useState({ email:'', username:'', password:'' })
  const [log, setLog] = useState({ email:'', password:'' })
  const [msg, setMsg] = useState('')

  const onRegister = async (e) => {
    e.preventDefault()
    setMsg('')
    try{
      const res = await api.post('/api/auth/register', reg)
      login(res.token, res.user || { email: reg.email })
      setMsg('Compte créé et connecté.')
    }catch(err){ setMsg(err.message||'Erreur') }
  }
  const onLogin = async (e) => {
    e.preventDefault()
    setMsg('')
    try{
      const res = await api.post('/api/auth/login', log)
      login(res.token, res.user || { email: log.email })
      setMsg('Connecté.')
    }catch(err){ setMsg(err.message||'Erreur') }
  }

  return (
    <div className="page-auth">
      <div className="card">
        <h2>Inscription</h2>
        <form onSubmit={onRegister} className="form">
          <input placeholder="email" type="email" value={reg.email} onChange={e=>setReg(v=>({...v,email:e.target.value}))} required />
          <input placeholder="username" value={reg.username} onChange={e=>setReg(v=>({...v,username:e.target.value}))} required />
          <input placeholder="password" type="password" value={reg.password} onChange={e=>setReg(v=>({...v,password:e.target.value}))} required />
          <button>Créer le compte</button>
        </form>
      </div>
      <div className="card">
        <h2>Connexion</h2>
        <form onSubmit={onLogin} className="form">
          <input placeholder="email" type="email" value={log.email} onChange={e=>setLog(v=>({...v,email:e.target.value}))} required />
          <input placeholder="password" type="password" value={log.password} onChange={e=>setLog(v=>({...v,password:e.target.value}))} required />
          <button>Se connecter</button>
        </form>
      </div>
      <div className="card">
        <h2>Session</h2>
        <div className="row">
          <div>{user?.email || 'Non connecté'}</div>
          <button className="secondary" onClick={logout}>Déconnexion</button>
        </div>
        {msg && <div className="muted" style={{marginTop:8}}>{msg}</div>}
      </div>
    </div>
  )
}
