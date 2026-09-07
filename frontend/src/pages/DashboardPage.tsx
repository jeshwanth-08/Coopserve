import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Check, ChevronRight, HandHelping, Leaf, MapPin, Plus, Send, Sparkles, Users, X } from 'lucide-react'
import { apiOffline, assignServiceRequest, createInitiative, createServiceRequest, getDashboardStats, getInitiatives, getServiceRequests, joinInitiative, updateServiceRequestStatus } from '../lib/api'
import type { DashboardStats, Initiative, InitiativeCreate, ServiceRequest, ServiceRequestCreate, ServiceRequestStatus } from '../types/api'

const categories = ['All initiatives', 'Environment', 'Education', 'Community care', 'Food security']
const sampleInitiatives: Initiative[] = [
    { id: 1, title: 'Restore the lake edge', description: 'Clear plastic waste and plant native reeds around the north bank.', category: 'Environment', location: 'Vijayanagar', organizer: 'Asha Collective', status: 'open', volunteer_goal: 30, volunteer_count: 18, created_at: '2026-09-05' },
    { id: 2, title: 'Saturday study circle', description: 'A weekly reading and maths circle for children in grades 5 to 8.', category: 'Education', location: 'Rajajinagar', organizer: 'Maya Foundation', status: 'in_progress', volunteer_goal: 12, volunteer_count: 9, created_at: '2026-09-04' },
    { id: 3, title: 'Neighbourhood pantry', description: 'Build a dependable food shelf for families between pay cycles.', category: 'Food security', location: 'Jayanagar', organizer: 'Open Table', status: 'open', volunteer_goal: 20, volunteer_count: 7, created_at: '2026-09-03' },
]
const sampleStats: DashboardStats = { active_initiatives: 24, community_members: 1248, volunteer_hours: 4860, neighborhoods: 18 }
const emptyForm: InitiativeCreate = { title: '', description: '', category: 'Community care', location: '', organizer: '', volunteer_goal: 10 }
const emptyRequest: ServiceRequestCreate = { issue_category: 'Plumbing', location: '', urgency: 'medium', description: '', requester_contact: '', image_url: null }

function formatStatus(status: Initiative['status']) {
    return status === 'in_progress' ? 'In progress' : status[0].toUpperCase() + status.slice(1)
}

function InitiativeCard({ initiative, onJoin }: { initiative: Initiative; onJoin: (initiative: Initiative) => void }) {
    const progress = Math.min(100, Math.round((initiative.volunteer_count / initiative.volunteer_goal) * 100))
    return (
        <article className="initiative-card group">
            <div className="flex items-start justify-between gap-4"><span className="category-pill">{initiative.category}</span><span className={`status status-${initiative.status}`}>{formatStatus(initiative.status)}</span></div>
            <h3>{initiative.title}</h3><p className="description">{initiative.description}</p>
            <div className="meta-row"><MapPin size={15} /> {initiative.location}<span className="dot" /> by {initiative.organizer}</div>
            <div className="progress-label"><span>{initiative.volunteer_count} joined</span><span>{initiative.volunteer_goal} needed</span></div>
            <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
            <button className="join-link" onClick={() => onJoin(initiative)} disabled={initiative.status === 'completed'}>Join this initiative <ArrowUpRight size={16} /></button>
        </article>
    )
}

function requestStatusLabel(status: ServiceRequestStatus) {
    return status === 'in_progress' ? 'In progress' : status[0].toUpperCase() + status.slice(1)
}

function ServiceRequestCard({ request, onAssign, onStatus }: { request: ServiceRequest; onAssign: (request: ServiceRequest) => void; onStatus: (request: ServiceRequest, status: ServiceRequestStatus) => void }) {
    return <article className="initiative-card request-card">
        <div className="flex items-start justify-between gap-4"><span className="category-pill">{request.issue_category}</span><span className={`status status-${request.status}`}>{requestStatusLabel(request.status)}</span></div>
        <h3>{request.location}</h3><p className="description">{request.description}</p>
        <div className="meta-row"><MapPin size={15} /> {request.urgency} urgency <span className="dot" /> {request.requester_contact}</div>
        <p className="assigned-copy">{request.assigned_to ? `Assigned to ${request.assigned_to}` : 'Awaiting a volunteer or admin assignment'}</p>
        <div className="request-actions"><button className="join-link" onClick={() => onAssign(request)} disabled={request.status === 'resolved'}>{request.assigned_to ? 'Reassign' : 'Assign volunteer'} <Users size={15} /></button><select aria-label={`Update status for ${request.location}`} value={request.status} onChange={(event) => onStatus(request, event.target.value as ServiceRequestStatus)}><option value="pending">Pending</option><option value="assigned">Assigned</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></div>
    </article>
}

export function DashboardPage() {
    const [category, setCategory] = useState('All initiatives')
    const [initiatives, setInitiatives] = useState<Initiative[]>([])
    const [stats, setStats] = useState<DashboardStats>(sampleStats)
    const [isDemo, setIsDemo] = useState(false)
    const [loading, setLoading] = useState(true)
    const [notice, setNotice] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [joining, setJoining] = useState<Initiative | null>(null)
    const [requests, setRequests] = useState<ServiceRequest[]>([])
    const [showRequest, setShowRequest] = useState(false)
    const [assigning, setAssigning] = useState<ServiceRequest | null>(null)
    const [form, setForm] = useState<InitiativeCreate>(emptyForm)
    const [requestForm, setRequestForm] = useState<ServiceRequestCreate>(emptyRequest)

    useEffect(() => {
        setLoading(true)
        Promise.all([getInitiatives(category), getDashboardStats()])
            .then(([nextInitiatives, nextStats]) => { setInitiatives(nextInitiatives); setStats(nextStats); setIsDemo(apiOffline) })
            .catch(() => { setInitiatives(sampleInitiatives); setStats(sampleStats); setIsDemo(true) })
            .finally(() => setLoading(false))
        getServiceRequests().then(setRequests).catch(() => setRequests([]))
    }, [category])

    const displayedInitiatives = useMemo(() => initiatives.length ? initiatives : sampleInitiatives, [initiatives])

    async function handleCreate(event: FormEvent) {
        event.preventDefault()
        try {
            const created = await createInitiative(form)
            setInitiatives((current) => [created, ...current]); setShowCreate(false); setForm(emptyForm)
            setNotice(apiOffline ? 'Saved on this device while the API is offline.' : 'Your initiative is live. Thank you for getting the first step moving.')
        } catch { setNotice('We could not publish this initiative. Please try again.') }
    }

    async function handleJoin(event: FormEvent) {
        event.preventDefault()
        if (!joining) return
        const data = new FormData(event.currentTarget as HTMLFormElement)
        try {
            const updated = await joinInitiative(joining.id, { volunteer_name: String(data.get('name')), volunteer_email: String(data.get('email')) })
            setInitiatives((current) => current.map((item) => item.id === updated.id ? updated : item)); setJoining(null)
            setNotice(apiOffline ? 'Your signup was saved on this device while the API is offline.' : 'You are on the team. The organizer will be in touch soon.')
        } catch { setNotice('We could not register you right now. Please try again.') }
    }

    async function handleRequest(event: FormEvent) {
        event.preventDefault()
        try {
            const created = await createServiceRequest(requestForm)
            setRequests((current) => [created, ...current]); setShowRequest(false); setRequestForm(emptyRequest)
            setNotice(apiOffline ? 'Your request is saved on this device and will sync when the API returns.' : 'Your personal request is now in the help queue.')
        } catch { setNotice('We could not save this request. Please try again.') }
    }

    async function handleAssign(event: FormEvent) {
        event.preventDefault()
        if (!assigning) return
        const data = new FormData(event.currentTarget as HTMLFormElement)
        try {
            const updated = await assignServiceRequest(assigning.id, { assigned_to: String(data.get('name')), assigned_contact: String(data.get('contact')) })
            setRequests((current) => current.map((item) => item.id === updated.id ? updated : item)); setAssigning(null)
            setNotice('Request assigned. The helper has a clear next step.')
        } catch { setNotice('We could not assign this request right now.') }
    }

    async function handleRequestStatus(request: ServiceRequest, status: ServiceRequestStatus) {
        try {
            const updated = await updateServiceRequestStatus(request.id, status)
            setRequests((current) => current.map((item) => item.id === updated.id ? updated : item))
        } catch { setNotice('We could not update that request status.') }
    }

    return (
        <main className="app-shell">
            <header className="topbar"><a className="brand" href="/"><span className="brand-mark"><HandHelping size={19} /></span><span>Coop<span>Serve</span></span></a><nav><a className="active" href="#discover">Discover</a><a href="#how-it-works">How it works</a><button className="profile-button" aria-label="Your profile">JS</button></nav></header>
            <section className="hero" id="discover"><div className="hero-copy"><p className="eyebrow"><Sparkles size={15} /> Local action, made visible</p><h1>Small acts.<br /><em>Shared impact.</em></h1><p className="hero-intro">CoopServe helps neighbours turn everyday needs into organised, measurable action.</p><div className="hero-actions"><button className="primary-button" onClick={() => setShowCreate(true)}>Raise a need <Plus size={17} /></button><a className="text-button" href="#initiatives">Explore initiatives <ChevronRight size={17} /></a></div></div><div className="hero-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="hero-stat"><span>Community pulse</span><strong>+28%</strong><small>more people helping this month</small></div><div className="hero-leaf"><Leaf size={80} strokeWidth={1} /></div></div></section>
            <section className="stats-strip"><div><strong>{stats.active_initiatives}</strong><span>Active initiatives</span></div><div><strong>{stats.community_members.toLocaleString()}</strong><span>People showing up</span></div><div><strong>{stats.volunteer_hours.toLocaleString()}</strong><span>Hours volunteered</span></div><div><strong>{stats.neighborhoods}</strong><span>Neighbourhoods connected</span></div></section>
            <section className="initiatives-section" id="initiatives"><div className="section-heading"><div><p className="eyebrow">The live board</p><h2>Ways to make a difference</h2></div><span className="live-indicator"><i /> Updated just now</span></div><div className="filter-row">{categories.map((item) => <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => setCategory(item)}>{item}</button>)}</div>{isDemo && <div className="demo-note">Showing sample initiatives while the API is offline.</div>}{loading ? <div className="loading-state">Loading the community board...</div> : <div className="initiative-grid">{displayedInitiatives.map((initiative) => <InitiativeCard key={initiative.id} initiative={initiative} onJoin={setJoining} />)}</div>}</section>
            <section className="callout" id="how-it-works"><div><p className="eyebrow">Personal help desk</p><h2>Need something fixed where you live?</h2><p>Share the details privately. A volunteer or admin can take ownership and keep the request moving.</p></div><button className="light-button" onClick={() => setShowRequest(true)}>Request help <Send size={16} /></button></section>
            <section className="initiatives-section requests-section" id="requests"><div className="section-heading"><div><p className="eyebrow">Admin view</p><h2>Personal service requests</h2></div><span className="live-indicator"><i /> {requests.length} open record{requests.length === 1 ? '' : 's'}</span></div>{requests.length ? <div className="initiative-grid">{requests.map((request) => <ServiceRequestCard key={request.id} request={request} onAssign={setAssigning} onStatus={handleRequestStatus} />)}</div> : <div className="empty-requests">No personal requests yet. They will appear here when a resident asks for help.</div>}</section>
            <footer><div className="brand"><span className="brand-mark"><HandHelping size={17} /></span><span>Coop<span>Serve</span></span></div><span>Built for communities that care.</span><span>SIH 2026 · Bengaluru</span></footer>
            {notice && <div className="toast"><Check size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Close notification"><X size={16} /></button></div>}
            {showCreate && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowCreate(false)}><form className="modal" onSubmit={handleCreate}><div className="modal-heading"><div><p className="eyebrow">Put a need on the board</p><h2>Start an initiative</h2></div><button type="button" className="close-button" onClick={() => setShowCreate(false)}><X size={19} /></button></div><label>What needs doing?<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Restore the lake edge" /></label><label>Tell the neighbourhood why it matters<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What will success look like?" rows={3} /></label><div className="form-grid"><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Volunteers needed<input required type="number" min="1" value={form.volunteer_goal} onChange={(event) => setForm({ ...form, volunteer_goal: Number(event.target.value) })} /></label></div><div className="form-grid"><label>Neighbourhood<input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="e.g. Indiranagar" /></label><label>Organiser name<input required value={form.organizer} onChange={(event) => setForm({ ...form, organizer: event.target.value })} placeholder="Your name or group" /></label></div><button className="primary-button full-button">Publish initiative <ArrowUpRight size={17} /></button></form></div>}
            {joining && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setJoining(null)}><form className="modal compact-modal" onSubmit={handleJoin}><div className="modal-heading"><div><p className="eyebrow">Join the movement</p><h2>{joining.title}</h2></div><button type="button" className="close-button" onClick={() => setJoining(null)}><X size={19} /></button></div><p className="modal-copy">Leave your details and the organiser will share the next step with you.</p><label>Your name<input name="name" required minLength={2} placeholder="Aarav Sharma" /></label><label>Email address<input name="email" required type="email" placeholder="aarav@example.com" /></label><button className="primary-button full-button">Count me in <Users size={17} /></button></form></div>}
            {showRequest && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowRequest(false)}><form className="modal" onSubmit={handleRequest}><div className="modal-heading"><div><p className="eyebrow">Personal service request</p><h2>Tell us what needs attention</h2></div><button type="button" className="close-button" onClick={() => setShowRequest(false)}><X size={19} /></button></div><div className="form-grid"><label>Issue category<select value={requestForm.issue_category} onChange={(event) => setRequestForm({ ...requestForm, issue_category: event.target.value })}><option>Plumbing</option><option>Electrical</option><option>Cleaning</option><option>Safety</option><option>Other</option></select></label><label>Urgency<select value={requestForm.urgency} onChange={(event) => setRequestForm({ ...requestForm, urgency: event.target.value as ServiceRequestCreate['urgency'] })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label></div><label>Room or location<input required minLength={2} value={requestForm.location} onChange={(event) => setRequestForm({ ...requestForm, location: event.target.value })} placeholder="e.g. Block B, Room 204" /></label><label>What is happening?<textarea required minLength={10} value={requestForm.description} onChange={(event) => setRequestForm({ ...requestForm, description: event.target.value })} placeholder="Describe the issue and what help is needed" rows={4} /></label><label>Your phone or email<input required minLength={5} value={requestForm.requester_contact} onChange={(event) => setRequestForm({ ...requestForm, requester_contact: event.target.value })} placeholder="you@example.com or +91..." /></label><label>Image placeholder<input value={requestForm.image_url ?? ''} onChange={(event) => setRequestForm({ ...requestForm, image_url: event.target.value || null })} placeholder="Optional image URL" /></label><button className="primary-button full-button">Submit request <ArrowUpRight size={17} /></button></form></div>}
            {assigning && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setAssigning(null)}><form className="modal compact-modal" onSubmit={handleAssign}><div className="modal-heading"><div><p className="eyebrow">Admin assignment</p><h2>{assigning.location}</h2></div><button type="button" className="close-button" onClick={() => setAssigning(null)}><X size={19} /></button></div><label>Volunteer or team name<input name="name" required minLength={2} defaultValue={assigning.assigned_to ?? ''} placeholder="e.g. Ravi Kumar" /></label><label>Contact<input name="contact" required minLength={5} defaultValue={assigning.assigned_contact ?? ''} placeholder="ravi@example.com" /></label><button className="primary-button full-button">Assign request <Users size={17} /></button></form></div>}
        </main>
    )
}
