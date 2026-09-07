export type HealthResponse = { status: 'ok'; service: string }

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
