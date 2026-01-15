import { useAuth } from '../context/AuthContext'

export function useApi(){
  const { token } = useAuth()
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

  const get = async (path) => {
    const r = await fetch(path, { headers })
    if (!r.ok) throw await r.json().catch(()=>({ message: 'Erreur réseau'}))
    return r.json()
  }
  const send = async (path, method, body) => {
    const r = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body)
    })
    const j = await r.json().catch(()=>({}))
    if (!r.ok) throw j
    return j
  }
  return { get, post: (p,b)=>send(p,'POST',b), del: (p)=>send(p,'DELETE') }
}
