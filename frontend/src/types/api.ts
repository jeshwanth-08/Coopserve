export type HealthResponse = { status: 'ok'; service: string }

export type UserRole = 'admin' | 'service_provider' | 'member'

export type AuthUser = { email: string; name: string; role: UserRole; capabilities: string[] }

export type LoginResponse = { access_token: string; token_type: 'bearer'; user: AuthUser }

export type InitiativeStatus = 'open' | 'in_progress' | 'completed'

export type Initiative = {
    id: number
    title: string
    description: string
    category: string
    location: string
    organizer: string
    status: InitiativeStatus
    volunteer_goal: number
    volunteer_count: number
    created_at: string
}

export type DashboardStats = {
    active_initiatives: number
    community_members: number
    volunteer_hours: number
    neighborhoods: number
}

export type InitiativeCreate = Omit<Initiative, 'id' | 'status' | 'volunteer_count' | 'created_at'>
