import type { DashboardStats, Initiative, InitiativeCreate, LoginResponse } from '../types/api'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'
const STORAGE_KEY = 'coopserve-offline-initiatives'
export const AUTH_TOKEN_KEY = 'coopserve-auth-token'
export let apiOffline = false

class ApiResponseError extends Error {
  constructor(public status: number) {
    super(`API request failed: ${status}`)
  }
}

const offlineSeed: Initiative[] = [
  { id: 1, title: 'Fix the leaking tap in Room 204', description: 'The tap has been overflowing since this morning and needs a local repair volunteer.', category: 'Community care', location: 'Block B, Room 204', organizer: 'Resident association', status: 'open', volunteer_goal: 1, volunteer_count: 0, created_at: '2026-09-05' },
  { id: 2, title: 'Restore the lake edge', description: 'Clear plastic waste and plant native reeds around the north bank.', category: 'Environment', location: 'Vijayanagar', organizer: 'Asha Collective', status: 'open', volunteer_goal: 30, volunteer_count: 18, created_at: '2026-09-05' },
  { id: 3, title: 'Saturday study circle', description: 'A weekly reading and maths circle for children in grades 5 to 8.', category: 'Education', location: 'Rajajinagar', organizer: 'Maya Foundation', status: 'in_progress', volunteer_goal: 12, volunteer_count: 9, created_at: '2026-09-04' },
]

function offlineInitiatives(): Initiative[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offlineSeed))
    return offlineSeed
  }
  try { return JSON.parse(stored) as Initiative[] } catch { return offlineSeed }
}

function saveOfflineInitiatives(initiatives: Initiative[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initiatives))
}

async function remoteFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers } })
  if (!response.ok) throw new ApiResponseError(response.status)
  return response.json() as Promise<T>
}

function markOffline() { apiOffline = true }

export function login(email: string, password: string) {
  return remoteFetch<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export async function getInitiatives(category?: string) {
  try {
    const result = await remoteFetch<Initiative[]>(`/initiatives${category && category !== 'All initiatives' ? `?category=${encodeURIComponent(category)}` : ''}`)
    apiOffline = false
    return result
  } catch (error) {
    if (error instanceof ApiResponseError) throw error
    markOffline()
    const result = offlineInitiatives()
    return category && category !== 'All initiatives' ? result.filter((item) => item.category === category) : result
  }
}

export async function getDashboardStats() {
  try { const result = await remoteFetch<DashboardStats>('/initiatives/stats/summary'); apiOffline = false; return result } catch (error) {
    if (error instanceof ApiResponseError) throw error
    markOffline()
    const initiatives = offlineInitiatives()
    return { active_initiatives: initiatives.filter((item) => item.status !== 'completed').length, community_members: initiatives.reduce((total, item) => total + item.volunteer_count, 0), volunteer_hours: initiatives.reduce((total, item) => total + item.volunteer_count, 0) * 4, neighborhoods: new Set(initiatives.map((item) => item.location)).size }
  }
}

export async function createInitiative(payload: InitiativeCreate) {
  try { const result = await remoteFetch<Initiative>('/initiatives', { method: 'POST', body: JSON.stringify(payload) }); apiOffline = false; return result } catch (error) {
    if (error instanceof ApiResponseError) throw error
    markOffline()
    const created: Initiative = { ...payload, id: Date.now(), status: 'open', volunteer_count: 0, created_at: new Date().toISOString() }
    saveOfflineInitiatives([created, ...offlineInitiatives()])
    return created
  }
}

export async function joinInitiative(id: number, payload: { volunteer_name: string; volunteer_email: string }) {
  try { const result = await remoteFetch<Initiative>(`/initiatives/${id}/join`, { method: 'POST', body: JSON.stringify(payload) }); apiOffline = false; return result } catch (error) {
    if (error instanceof ApiResponseError) throw error
    markOffline()
    const initiatives = offlineInitiatives()
    const initiative = initiatives.find((item) => item.id === id)
    if (!initiative) throw new Error('Initiative not found')
    const updated = { ...initiative, volunteer_count: initiative.volunteer_count + 1, status: initiative.volunteer_count + 1 >= initiative.volunteer_goal ? 'in_progress' as const : initiative.status }
    saveOfflineInitiatives(initiatives.map((item) => item.id === id ? updated : item))
    return updated
  }
}
