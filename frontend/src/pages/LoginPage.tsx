import { FormEvent, useState } from 'react'
import { ArrowRight, HandHelping, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound, Wrench } from 'lucide-react'
import { login } from '../lib/api'
import type { AuthUser } from '../types/api'

type LoginPageProps = { onLogin: (token: string, user: AuthUser) => void }

export function LoginPage({ onLogin }: LoginPageProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const demoAccounts = [
        { label: 'Admin', email: 'admin@coopserve.org', password: 'coopserve-admin', icon: ShieldCheck },
        { label: 'Provider', email: 'provider@coopserve.org', password: 'coopserve-provider', icon: Wrench },
        { label: 'Member', email: 'member@coopserve.org', password: 'coopserve', icon: UserRound },
    ]

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setIsSubmitting(true)
        try {
            const response = await login(email, password)
            onLogin(response.access_token, response.user)
        } catch {
            setError('That email and password do not match. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="login-shell">
            <section className="login-art" aria-label="CoopServe community illustration">
                <a className="brand login-brand" href="/"><span className="brand-mark"><HandHelping size={19} /></span><span>Coop<span>Serve</span></span></a>
                <div className="login-art-copy"><p className="eyebrow"><Sparkles size={15} /> Welcome back</p><h1>Good work starts with <em>showing up.</em></h1><p>Pick up where your community left off, or find the next small action worth sharing.</p></div>
                <div className="login-art-orbit orbit-one" /><div className="login-art-orbit orbit-two" /><div className="login-art-note"><strong>24</strong><span>active initiatives<br />moving forward</span></div>
            </section>
            <section className="login-panel"><div className="login-form-wrap"><p className="eyebrow">CoopServe access</p><h2>Welcome back.</h2><p className="login-subtitle">Sign in to open the workspace built for your role in the community.</p><div className="demo-accounts">{demoAccounts.map(({ label, email: demoEmail, password: demoPassword, icon: Icon }) => <button key={label} type="button" className="demo-account" onClick={() => { setEmail(demoEmail); setPassword(demoPassword); setError('') }}><Icon size={15} /><span>{label}</span><small>Use demo</small></button>)}</div><form onSubmit={handleSubmit}><label>Email address<div className="input-wrap"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div></label><label>Password<div className="input-wrap"><LockKeyhole size={17} /><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></div></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button login-submit" disabled={isSubmitting}>{isSubmitting ? 'Signing you in...' : 'Sign in'}<ArrowRight size={17} /></button></form><p className="login-helper">Choose a demo role above or use your CoopServe account.</p></div><footer className="login-footer"><span>Built for communities that care.</span><span>SIH 2026 · Bengaluru</span></footer></section>
        </main>
    )
}