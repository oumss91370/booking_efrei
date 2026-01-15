import { useEffect, useState } from 'react'
import { useApi } from '../lib/api'

export default function Bookings(){
  const api = useApi()
  const [rooms, setRooms] = useState([])
  const [roomId, setRoomId] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [msg, setMsg] = useState('')
  const [mine, setMine] = useState([])
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState(60) // minutes

  useEffect(()=>{
    const pad = (n) => String(n).padStart(2,'0')
    const toLocalInput = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    const startD = new Date(); startD.setMinutes(startD.getMinutes()+60)
    const endD = new Date(); endD.setMinutes(endD.getMinutes()+120)
    setStart(toLocalInput(startD)); setEnd(toLocalInput(endD))
    const pre = localStorage.getItem('selected_room_id')
    if (pre) {
      setRoomId(pre)
      localStorage.removeItem('selected_room_id')
    }
  },[])

  // helpers
  const toISO = (localStr) => new Date(localStr).toISOString()
  const pad = (n) => String(n).padStart(2,'0')
  const toLocalInput = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  const addMinutes = (localStr, minutes) => {
    const d = new Date(localStr)
    if (isNaN(d.getTime())) return localStr
    d.setMinutes(d.getMinutes() + minutes)
    return toLocalInput(d)
  }
  const ensureOrder = (s, e, keepDuration=true) => {
    const sd = new Date(s).getTime()
    const ed = new Date(e).getTime()
    if (isNaN(sd) || isNaN(ed)) return [s, e]
    if (ed <= sd) {
      const next = keepDuration ? addMinutes(s, duration) : addMinutes(s, 30)
      return [s, next]
    }
    return [s, e]
  }

  const onStartChange = (v) => {
    const newStart = v
    const newEnd = addMinutes(v, duration)
    const [s2, e2] = ensureOrder(newStart, newEnd)
    setStart(s2); setEnd(e2)
  }
  const onEndChange = (v) => {
    const [s2, e2] = ensureOrder(start, v)
    setStart(s2); setEnd(e2)
  }
  const changeDuration = (min) => {
    setDuration(min)
    if (start) setEnd(addMinutes(start, min))
  }

  const loadAvailableRooms = async ()=>{
    setLoading(true)
    try{
      const s = start? new Date(start).toISOString(): new Date(Date.now()+60*60*1000).toISOString()
      const e = end? new Date(end).toISOString(): new Date(Date.now()+2*60*60*1000).toISOString()
      const list = await api.get(`/api/rooms/available?start_time=${encodeURIComponent(s)}&end_time=${encodeURIComponent(e)}`)
      setRooms(list)
    } finally { setLoading(false) }
  }

  const createBooking = async (e)=>{
    e?.preventDefault(); setMsg('')
    try{
      const payload = {
        room_id: Number(roomId),
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
      }
      const r = await api.post('/api/bookings', payload)
      setMsg(`Réservation créée #${r.id}`)
      listMine()
    }catch(err){ setMsg(err.message||'Erreur') }
  }

  const listMine = async ()=>{
    const j = await api.get('/api/bookings/mine')
    setMine(j)
  }

  const cancel = async (id)=>{
    try{
      await api.del(`/api/bookings/${id}`)
      listMine()
    }catch(err){ alert(err.message||'Erreur annulation') }
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

  return (
    <div className="page-bookings">
      <div className="card">
        <div className="section-head">
          <h2>Choisir une salle disponible</h2>
          <span className="section-desc">Sélectionnez une fenêtre temporelle puis choisissez une salle</span>
        </div>
        <div className="date-bar" style={{marginBottom:8}}>
          <button className="nudge" onClick={()=>onStartChange(addMinutes(start, -15))}>-15m</button>
          <input className="input grow" type="datetime-local" value={start} onChange={e=>onStartChange(e.target.value)} />
          <button className="nudge" onClick={()=>onStartChange(addMinutes(start, 15))}>+15m</button>
          <span className="muted">durée</span>
          <select className="input" value={duration} onChange={e=>changeDuration(Number(e.target.value))}>
            <option value={30}>30m</option>
            <option value={60}>1h</option>
            <option value={90}>1h30</option>
            <option value={120}>2h</option>
          </select>
          <button className="nudge" onClick={()=>onEndChange(addMinutes(end, -15))}>-15m</button>
          <input className="input grow" type="datetime-local" value={end} onChange={e=>onEndChange(e.target.value)} />
          <button className="nudge" onClick={()=>onEndChange(addMinutes(end, 15))}>+15m</button>
          <button className="secondary" onClick={loadAvailableRooms} disabled={loading}>{loading? 'Chargement…':'Voir disponibles'}</button>
          <button className="secondary" onClick={presetNextHour}>Prochaine heure</button>
          <button className="secondary" onClick={presetMorning}>Matinée</button>
          <button className="secondary" onClick={presetAfternoon}>Après-midi</button>
        </div>
        <div className="grid grid-rooms">
          {rooms.map(r=> (
            <div className={`card-room ${String(roomId)===String(r.id)?'selected':''}`} key={r.id}>
              <div className="room-head">
                <div className="room-title">
                  <strong>{r.name}</strong>
                  <span className="muted">#{r.id}</span>
                </div>
                <div className="room-capacity">{r.capacity} places</div>
              </div>
              <div className="room-body">
                <div className="amenities">{(r.amenities||[]).length? r.amenities.join(', ') : '—'}</div>
              </div>
              <div className="room-actions">
                <button className="secondary" onClick={()=>setRoomId(r.id)}>Sélectionner</button>
                <button onClick={()=>{ setRoomId(r.id); createBooking(); }}>Réserver</button>
              </div>
            </div>
          ))}
          {!rooms.length && <div className="muted">Aucune salle chargée. Cliquez sur "Voir disponibles".</div>}
        </div>
        {msg && <div className="muted" style={{marginTop:8}}>{msg}</div>}
      </div>

      <div className="card">
        <div className="section-head">
          <h2>Créer une réservation (auth requis)</h2>
          <span className="section-desc">Vous pouvez aussi renseigner manuellement l’ID de salle</span>
        </div>
        <form onSubmit={createBooking} className="form">
          <input placeholder="room_id" type="number" value={roomId} onChange={e=>setRoomId(e.target.value)} required />
          <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} required />
          <input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} required />
          <button>Réserver</button>
        </form>
        {msg && <div className="muted" style={{marginTop:8}}>{msg}</div>}
      </div>

      <div className="card">
        <div className="section-head">
          <h2>Mes réservations</h2>
          <span className="section-desc">Liste de vos réservations actuelles</span>
        </div>
        <div className="row"><button onClick={listMine}>Rafraîchir</button></div>
        <div className="grid grid-bookings">
          {mine.map(b=> (
            <div className="card-booking" key={b.id}>
              <div className="booking-head">
                <div className="booking-title"><strong>Réservation #{b.id}</strong></div>
                <div className="booking-room">Salle: {b.room_name || b.rooms?.name || b.room_id}</div>
              </div>
              <div className="booking-body">
                <div className="muted">{new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}</div>
              </div>
              <div className="booking-actions">
                <button className="danger" onClick={()=>cancel(b.id)}>Annuler</button>
              </div>
            </div>
          ))}
          {!mine.length && <div className="muted">Aucune réservation pour le moment.</div>}
        </div>
      </div>
    </div>
  )
}
