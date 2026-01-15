import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../lib/api'

export default function Rooms(){
  const api = useApi()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [form, setForm] = useState({ name:'', capacity:1, amenities:'' })
  const [msg, setMsg] = useState('')
  // Filters / sorting
  const [q, setQ] = useState('')
  const [capMin, setCapMin] = useState('')
  const [capMax, setCapMax] = useState('')
  const [amenitiesFilter, setAmenitiesFilter] = useState('')
  const [sort, setSort] = useState('name_asc')

  useEffect(()=>{
    const now = new Date()
    const s = new Date(now.getTime()+60*60*1000).toISOString().slice(0,16)
    const e = new Date(now.getTime()+2*60*60*1000).toISOString().slice(0,16)
    setStart(s); setEnd(e)
  },[])

  const listAll = async ()=>{
    const j = await api.get('/api/rooms')
    setRooms(j)
  }
  const listAvailable = async ()=>{
    const s = start? new Date(start).toISOString(): new Date(Date.now()+60*60*1000).toISOString()
    const e = end? new Date(end).toISOString(): new Date(Date.now()+2*60*60*1000).toISOString()
    const j = await api.get(`/api/rooms/available?start_time=${encodeURIComponent(s)}&end_time=${encodeURIComponent(e)}`)
    setRooms(j)
  }
  const presetNextHour = ()=>{
    const now=new Date(); const s=new Date(now.getTime()+60*60*1000); const e=new Date(now.getTime()+2*60*60*1000)
    setStart(s.toISOString().slice(0,16)); setEnd(e.toISOString().slice(0,16))
  }
  const presetMorning = ()=>{
    const d=new Date(); d.setHours(9,0,0,0); const e=new Date(); e.setHours(12,0,0,0)
    setStart(d.toISOString().slice(0,16)); setEnd(e.toISOString().slice(0,16))
  }
  const presetAfternoon = ()=>{
    const d=new Date(); d.setHours(14,0,0,0); const e=new Date(); e.setHours(18,0,0,0)
    setStart(d.toISOString().slice(0,16)); setEnd(e.toISOString().slice(0,16))
  }
  const copyId = async (id)=>{
    try{ await navigator.clipboard.writeText(String(id)) }catch{}
  }
  const goBook = (id)=>{
    localStorage.setItem('selected_room_id', String(id))
    navigate('/bookings')
  }
  const createRoom = async (e)=>{
    e.preventDefault(); setMsg('')
    try{
      const payload = {
        name: form.name,
        capacity: Number(form.capacity),
        amenities: form.amenities.split(',').map(s=>s.trim()).filter(Boolean)
      }
      const r = await api.post('/api/rooms', payload)
      setMsg(`Salle créée #${r.id}`)
      listAll()
    }catch(err){ setMsg(err.message||'Erreur') }
  }

  return (
    <div className="page-rooms">
      <div className="card">
        <h2>Parcourir</h2>
        <div className="row" style={{marginBottom:8}}>
          <button onClick={listAll}>Toutes les salles</button>
          <button onClick={listAvailable}>Salles disponibles</button>
          <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} />
          <input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} />
          <button className="secondary" onClick={presetNextHour}>Prochaine heure</button>
          <button className="secondary" onClick={presetMorning}>Matinée</button>
          <button className="secondary" onClick={presetAfternoon}>Après-midi</button>
        </div>
        <div className="row" style={{marginBottom:8}}>
          <input placeholder="Rechercher (nom)" value={q} onChange={e=>setQ(e.target.value)} />
          <input type="number" min="1" placeholder="Capacité min" value={capMin} onChange={e=>setCapMin(e.target.value)} />
          <input type="number" min="1" placeholder="Capacité max" value={capMax} onChange={e=>setCapMax(e.target.value)} />
          <input placeholder="Équipements requis (séparés par virgule)" value={amenitiesFilter} onChange={e=>setAmenitiesFilter(e.target.value)} />
          <select value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="name_asc">Nom (A→Z)</option>
            <option value="name_desc">Nom (Z→A)</option>
            <option value="cap_asc">Capacité (↑)</option>
            <option value="cap_desc">Capacité (↓)</option>
          </select>
          <button className="secondary" onClick={()=>{ setQ(''); setCapMin(''); setCapMax(''); setAmenitiesFilter(''); setSort('name_asc'); }}>Réinitialiser</button>
        </div>
        <div className="muted" style={{margin:"6px 0"}}>{rooms.length} salle(s)</div>
        {(()=>{
          const min = capMin ? Number(capMin) : null
          const max = capMax ? Number(capMax) : null
          const reqAmenities = amenitiesFilter.split(',').map(s=>s.trim()).filter(Boolean).map(s=>s.toLowerCase())
          const filtered = rooms.filter(r=>{
            if (q && !String(r.name||'').toLowerCase().includes(q.toLowerCase())) return false
            if (min!==null && Number(r.capacity)<min) return false
            if (max!==null && Number(r.capacity)>max) return false
            if (reqAmenities.length){
              const have = (r.amenities||[]).map(a=>String(a).toLowerCase())
              const hasAll = reqAmenities.every(a=> have.includes(a))
              if (!hasAll) return false
            }
            return true
          }).sort((a,b)=>{
            if (sort==='name_asc') return String(a.name||'').localeCompare(String(b.name||''))
            if (sort==='name_desc') return String(b.name||'').localeCompare(String(a.name||''))
            if (sort==='cap_asc') return Number(a.capacity)-Number(b.capacity)
            if (sort==='cap_desc') return Number(b.capacity)-Number(a.capacity)
            return 0
          })
          return (
            <div className="grid grid-rooms">
              {filtered.map(r=> (
                <div className="card-room" key={r.id}>
                  <div className="room-head">
                    <div className="room-title">
                      <strong>{r.name}</strong>
                      <span className="muted">#{r.id}</span>
                    </div>
                    <div className="room-capacity">{r.capacity} places</div>
                  </div>
                  <div className="room-body">
                    {(r.amenities||[]).length ? (
                      <div className="badges">
                        {(r.amenities||[]).map((a,i)=> <span className="badge" key={i}>{a}</span>)}
                      </div>
                    ) : <span className="muted">Aucun équipement</span>}
                  </div>
                  <div className="room-actions">
                    <button className="secondary" onClick={()=>copyId(r.id)}>Copier l'ID</button>
                    <button onClick={()=>goBook(r.id)}>Réserver</button>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </div>

      <div className="card">
        <h2>Créer une salle (auth requis)</h2>
        <form onSubmit={createRoom} className="form">
          <input placeholder="Nom" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} required />
          <input type="number" min="1" placeholder="Capacité" value={form.capacity} onChange={e=>setForm(v=>({...v,capacity:e.target.value}))} required />
          <input placeholder="Équipements (séparés par virgule)" value={form.amenities} onChange={e=>setForm(v=>({...v,amenities:e.target.value}))} />
          <button>Créer</button>
        </form>
        {msg && <div className="muted" style={{marginTop:8}}>{msg}</div>}
      </div>
    </div>
  )
}
