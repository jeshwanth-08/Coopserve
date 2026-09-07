from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.initiative import Initiative, InitiativeStatus, VolunteerSignup
from app.schemas.initiative import DashboardStats, InitiativeCreate, InitiativeRead, VolunteerSignupCreate

router = APIRouter(prefix="/initiatives", tags=["initiatives"])


@router.get("", response_model=list[InitiativeRead])
async def list_initiatives(
    category: str | None = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
) -> list[Initiative]:
    query = select(Initiative).order_by(Initiative.created_at.desc())
    if category and category != "All initiatives":
        query = query.where(Initiative.category == category)
    return list((await session.scalars(query)).all())


@router.post("", response_model=InitiativeRead, status_code=status.HTTP_201_CREATED)
async def create_initiative(
    payload: InitiativeCreate, session: AsyncSession = Depends(get_db_session)
) -> Initiative:
    initiative = Initiative(**payload.model_dump())
    session.add(initiative)
    await session.commit()
    await session.refresh(initiative)
    return initiative


@router.get("/stats/summary", response_model=DashboardStats)
async def dashboard_stats(session: AsyncSession = Depends(get_db_session)) -> DashboardStats:
    initiatives = (await session.scalars(select(Initiative))).all()
    active = [item for item in initiatives if item.status != InitiativeStatus.COMPLETED]
    return DashboardStats(
        active_initiatives=len(active),
        community_members=sum(item.volunteer_count for item in initiatives),
        volunteer_hours=sum(item.volunteer_count for item in initiatives) * 4,
        neighborhoods=len({item.location for item in initiatives}),
    )


@router.post("/{initiative_id}/join", response_model=InitiativeRead)
async def join_initiative(
    initiative_id: int,
    payload: VolunteerSignupCreate,
    session: AsyncSession = Depends(get_db_session),
) -> Initiative:
    initiative = await session.get(Initiative, initiative_id)
    if initiative is None:
        raise HTTPException(status_code=404, detail="Initiative not found")
    if initiative.status == InitiativeStatus.COMPLETED:
        raise HTTPException(status_code=409, detail="This initiative is already completed")
    duplicate = await session.scalar(
        select(VolunteerSignup).where(
            VolunteerSignup.initiative_id == initiative_id,
            VolunteerSignup.volunteer_email == payload.volunteer_email,
        )
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="You have already joined this initiative")
    session.add(VolunteerSignup(initiative_id=initiative_id, **payload.model_dump()))
    initiative.volunteer_count += 1
    if initiative.volunteer_count >= initiative.volunteer_goal:
        initiative.status = InitiativeStatus.IN_PROGRESS
    await session.commit()
    await session.refresh(initiative)
    return initiative

