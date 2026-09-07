from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.service_request import ServiceRequest, ServiceRequestStatus
from app.schemas.service_request import (
    ServiceRequestAssignment,
    ServiceRequestCreate,
    ServiceRequestRead,
    ServiceRequestStatusUpdate,
)

router = APIRouter(prefix="/service-requests", tags=["service requests"])


@router.get("", response_model=list[ServiceRequestRead])
async def list_service_requests(session: AsyncSession = Depends(get_db_session)) -> list[ServiceRequest]:
    query = select(ServiceRequest).order_by(ServiceRequest.created_at.desc())
    return list((await session.scalars(query)).all())


@router.post("", response_model=ServiceRequestRead, status_code=status.HTTP_201_CREATED)
async def create_service_request(
    payload: ServiceRequestCreate, session: AsyncSession = Depends(get_db_session)
) -> ServiceRequest:
    service_request = ServiceRequest(**payload.model_dump())
    session.add(service_request)
    await session.commit()
    await session.refresh(service_request)
    return service_request


@router.post("/{request_id}/assign", response_model=ServiceRequestRead)
async def assign_service_request(
    request_id: int,
    payload: ServiceRequestAssignment,
    session: AsyncSession = Depends(get_db_session),
) -> ServiceRequest:
    service_request = await session.get(ServiceRequest, request_id)
    if service_request is None:
        raise HTTPException(status_code=404, detail="Service request not found")
    if service_request.status == ServiceRequestStatus.RESOLVED:
        raise HTTPException(status_code=409, detail="A resolved request cannot be assigned")
    service_request.assigned_to = payload.assigned_to
    service_request.assigned_contact = payload.assigned_contact
    service_request.status = ServiceRequestStatus.ASSIGNED
    await session.commit()
    await session.refresh(service_request)
    return service_request


@router.patch("/{request_id}/status", response_model=ServiceRequestRead)
async def update_service_request_status(
    request_id: int,
    payload: ServiceRequestStatusUpdate,
    session: AsyncSession = Depends(get_db_session),
) -> ServiceRequest:
    service_request = await session.get(ServiceRequest, request_id)
    if service_request is None:
        raise HTTPException(status_code=404, detail="Service request not found")
    service_request.status = payload.status
    await session.commit()
    await session.refresh(service_request)
    return service_request