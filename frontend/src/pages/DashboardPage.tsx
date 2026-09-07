import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, BarChart3, Check, ChevronRight, ClipboardList, HandHelping, Leaf, MapPin, Plus, Send, ShieldCheck, Sparkles, Star, UserCheck, Users, Wrench, X } from 'lucide-react'
import { apiOffline, createInitiative, getDashboardStats, getInitiatives, joinInitiative } from '../lib/api'
import type { DashboardStats, Initiative, InitiativeCreate, UserRole } from '../types/api'
import type { AuthUser } from '../types/api'

const categories = ['All initiatives', 'Environment', 'Education', 'Community care', 'Food security']
const sampleInitiatives: Initiative[] = [
    { id: 1, title: 'Restore the lake edge', description: 'Clear plastic waste and plant native reeds around the north bank.', category: 'Environment', location: 'Vijayanagar', organizer: 'Asha Collective', status: 'open', volunteer_goal: 30, volunteer_count: 18, created_at: '2026-09-05' },
    { id: 2, title: 'Saturday study circle', description: 'A weekly reading and maths circle for children in grades 5 to 8.', category: 'Education', location: 'Rajajinagar', organizer: 'Maya Foundation', status: 'in_progress', volunteer_goal: 12, volunteer_count: 9, created_at: '2026-09-04' },
    { id: 3, title: 'Neighbourhood pantry', description: 'Build a dependable food shelf for families between pay cycles.', category: 'Food security', location: 'Jayanagar', organizer: 'Open Table', status: 'open', volunteer_goal: 20, volunteer_count: 7, created_at: '2026-09-03' },
]
const sampleStats: DashboardStats = { active_initiatives: 24, community_members: 1248, volunteer_hours: 4860, neighborhoods: 18 }
const emptyForm: InitiativeCreate = { title: '', description: '', category: 'Community care', location: '', organizer: '', volunteer_goal: 10 }

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

const roleDetails: Record<UserRole, { eyebrow: string; title: string; intro: string; icon: typeof ShieldCheck }> = {
    admin: { eyebrow: 'Operations workspace', title: 'Keep every request moving.', intro: 'See the full service picture, coordinate providers, and keep response quality visible.', icon: ShieldCheck },
    service_provider: { eyebrow: 'Provider workspace', title: 'Your next good action.', intro: 'Manage assigned requests, update progress, and close the loop with the people you serve.', icon: Wrench },
    member: { eyebrow: 'Member workspace', title: 'Your community, in motion.', intro: 'Raise a request, follow its progress, and help make the service better with your feedback.', icon: Users },
}

const capabilityIcons = [ClipboardList, UserCheck, Check, Wrench, BarChart3, ClipboardList, Check, ShieldCheck, Star, Plus, ClipboardList, MapPin, Star]

export function DashboardPage({ user, onLogout }: { user: AuthUser | null; onLogout: () => void }) {
    const role = user?.role || 'member'
    const roleInfo = roleDetails[role]
    const RoleIcon = roleInfo.icon
    const [category, setCategory] = useState('All initiatives')
    const [initiatives, setInitiatives] = useState<Initiative[]>([])
    const [stats, setStats] = useState<DashboardStats>(sampleStats)
    const [isDemo, setIsDemo] = useState(false)
    const [loading, setLoading] = useState(true)
    const [notice, setNotice] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [joining, setJoining] = useState<Initiative | null>(null)
    const [form, setForm] = useState<InitiativeCreate>(emptyForm)

    useEffect(() => {
        setLoading(true)
        Promise.all([getInitiatives(category), getDashboardStats()])
            .then(([nextInitiatives, nextStats]) => { setInitiatives(nextInitiatives); setStats(nextStats); setIsDemo(apiOffline) })
            .catch(() => { setInitiatives(sampleInitiatives); setStats(sampleStats); setIsDemo(true) })
            .finally(() => setLoading(false))
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

    return (
        <main className="app-shell">
            <header className="topbar"><a className="brand" href="/"><span className="brand-mark"><HandHelping size={19} /></span><span>Coop<span>Serve</span></span></a><nav><a className="active" href="#discover">Discover</a><a href="#how-it-works">How it works</a><button className="profile-button" aria-label={`Sign out ${user?.email || 'your account'}`} onClick={onLogout}>{user?.email?.slice(0, 2).toUpperCase() || 'JS'}</button></nav></header>
            <section className="hero" id="discover"><div className="hero-copy"><p className="eyebrow"><RoleIcon size={15} /> {roleInfo.eyebrow}</p><h1>{roleInfo.title.split(' ').slice(0, -2).join(' ')}<br /><em>{roleInfo.title.split(' ').slice(-2).join(' ')}</em></h1><p className="hero-intro">{roleInfo.intro}</p><div className="hero-actions"><button className="primary-button" onClick={() => setShowCreate(true)}>{role === 'member' ? 'Raise a need' : role === 'admin' ? 'Review requests' : 'View assignments'} <Plus size={17} /></button><a className="text-button" href="#access">Your access <ChevronRight size={17} /></a></div></div><div className="hero-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="hero-stat"><span>{role === 'admin' ? 'Requests in view' : role === 'service_provider' ? 'Assigned today' : 'My requests'}</span><strong>{role === 'admin' ? '24' : role === 'service_provider' ? '08' : '03'}</strong><small>{role === 'admin' ? 'across the community' : role === 'service_provider' ? 'ready for your attention' : 'being looked after'}</small></div><div className="hero-leaf"><Leaf size={80} strokeWidth={1} /></div></div></section>
            <section className="access-section" id="access"><div className="section-heading"><div><p className="eyebrow">Your workspace</p><h2>What you can do</h2></div><span className="role-badge">{role.replace('_', ' ')}</span></div><div className="capability-grid">{(user?.capabilities || []).map((capability, index) => { const Icon = capabilityIcons[index % capabilityIcons.length]; return <button className="capability-card" key={capability}><span className="capability-icon"><Icon size={18} /></span><span>{capability}</span><ArrowUpRight size={15} /></button> })}</div></section>
            <section className="stats-strip"><div><strong>{stats.active_initiatives}</strong><span>Active initiatives</span></div><div><strong>{stats.community_members.toLocaleString()}</strong><span>People showing up</span></div><div><strong>{stats.volunteer_hours.toLocaleString()}</strong><span>Hours volunteered</span></div><div><strong>{stats.neighborhoods}</strong><span>Neighbourhoods connected</span></div></section>
            <section className="initiatives-section" id="initiatives"><div className="section-heading"><div><p className="eyebrow">The live board</p><h2>Ways to make a difference</h2></div><span className="live-indicator"><i /> Updated just now</span></div><div className="filter-row">{categories.map((item) => <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => setCategory(item)}>{item}</button>)}</div>{isDemo && <div className="demo-note">Showing sample initiatives while the API is offline.</div>}{loading ? <div className="loading-state">Loading the community board...</div> : <div className="initiative-grid">{displayedInitiatives.map((initiative) => <InitiativeCard key={initiative.id} initiative={initiative} onJoin={setJoining} />)}</div>}</section>
            <section className="callout" id="how-it-works"><div><p className="eyebrow">One good idea is enough</p><h2>Have a need your neighbourhood can solve?</h2><p>Put it on the board. Find the people, tools, and momentum to move it forward.</p></div><button className="light-button" onClick={() => setShowCreate(true)}>Start an initiative <Send size={16} /></button></section>
            <footer><div className="brand"><span className="brand-mark"><HandHelping size={17} /></span><span>Coop<span>Serve</span></span></div><span>Built for communities that care.</span><span>SIH 2026 · Bengaluru</span></footer>
            {notice && <div className="toast"><Check size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Close notification"><X size={16} /></button></div>}
            {showCreate && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowCreate(false)}><form className="modal" onSubmit={handleCreate}><div className="modal-heading"><div><p className="eyebrow">Put a need on the board</p><h2>Start an initiative</h2></div><button type="button" className="close-button" onClick={() => setShowCreate(false)}><X size={19} /></button></div><label>What needs doing?<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Restore the lake edge" /></label><label>Tell the neighbourhood why it matters<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What will success look like?" rows={3} /></label><div className="form-grid"><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Volunteers needed<input required type="number" min="1" value={form.volunteer_goal} onChange={(event) => setForm({ ...form, volunteer_goal: Number(event.target.value) })} /></label></div><div className="form-grid"><label>Neighbourhood<input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="e.g. Indiranagar" /></label><label>Organiser name<input required value={form.organizer} onChange={(event) => setForm({ ...form, organizer: event.target.value })} placeholder="Your name or group" /></label></div><button className="primary-button full-button">Publish initiative <ArrowUpRight size={17} /></button></form></div>}
            {joining && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setJoining(null)}><form className="modal compact-modal" onSubmit={handleJoin}><div className="modal-heading"><div><p className="eyebrow">Join the movement</p><h2>{joining.title}</h2></div><button type="button" className="close-button" onClick={() => setJoining(null)}><X size={19} /></button></div><p className="modal-copy">Leave your details and the organiser will share the next step with you.</p><label>Your name<input name="name" required minLength={2} placeholder="Aarav Sharma" /></label><label>Email address<input name="email" required type="email" placeholder="aarav@example.com" /></label><button className="primary-button full-button">Count me in <Users size={17} /></button></form></div>}
        </main>
    )
}
