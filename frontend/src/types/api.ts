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

export type ServiceRequestStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved'

export type ServiceRequest = {
    id: number
    issue_category: string
    location: string
    urgency: 'low' | 'medium' | 'high' | 'critical'
    description: string
    requester_contact: string
    image_url: string | null
    status: ServiceRequestStatus
    assigned_to: string | null
    assigned_contact: string | null
    created_at: string
    updated_at: string
}

export type ServiceRequestCreate = Omit<ServiceRequest, 'id' | 'status' | 'assigned_to' | 'assigned_contact' | 'created_at' | 'updated_at'>
