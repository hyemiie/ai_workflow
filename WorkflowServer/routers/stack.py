import copy
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from core.db import get_db
from core.security import encrypt_value
from models.stack import Stack
from models.user import User
from schemas.stack import StackCreate, StackUpdate, StackOut
from routers.auth import get_current_user

router = APIRouter(prefix="/stacks", tags=["Stacks"])

_SENSITIVE_FIELDS = ("apiKey", "serpApi")


def _encrypt_workflow(workflow: dict, existing_workflow: dict = None) -> dict:
 
    workflow = copy.deepcopy(workflow)
    existing_nodes = {
        n["id"]: n
        for n in (existing_workflow or {}).get("nodes", [])
    }
    for node in workflow.get("nodes", []):
        data = node.get("data", {})
        for field in _SENSITIVE_FIELDS:
            val = data.get(field, "")
            if not val:
                continue
            if val == "********":
                existing_data = existing_nodes.get(node["id"], {}).get("data", {})
                data[field] = existing_data.get(field, "")
            else:
                data[field] = encrypt_value(val)
    return workflow


def _redact_workflow(workflow: dict) -> dict:
    """Replace sensitive fields with '********' before returning to frontend."""
    workflow = copy.deepcopy(workflow)
    for node in workflow.get("nodes", []):
        data = node.get("data", {})
        for field in _SENSITIVE_FIELDS:
            if data.get(field):
                data[field] = "********"
    return workflow


@router.get("/", response_model=list[StackOut])
async def list_stacks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Stack)
        .where(Stack.owner_id == current_user.id)
        .order_by(Stack.created_at.desc())
    )

    stacks = result.scalars().all()
    for stack in stacks:
        stack.workflow = _redact_workflow(stack.workflow)
    return stacks


@router.post("/", response_model=StackOut, status_code=201)
async def create_stack(
    payload: StackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stack = Stack(**payload.model_dump(), owner_id=current_user.id)
    db.add(stack)
    await db.commit()
    await db.refresh(stack)
    return stack


@router.get("/{stack_id}", response_model=StackOut)
async def get_stack(
    stack_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stack = await db.get(Stack, stack_id)
    if not stack or stack.owner_id != current_user.id:
        raise HTTPException(404, "Stack not found")
    stack.workflow = _redact_workflow(stack.workflow)
    return stack


@router.patch("/{stack_id}", response_model=StackOut)
async def update_stack(
    stack_id: str,
    payload: StackUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stack = await db.get(Stack, stack_id)
    if not stack or stack.owner_id != current_user.id:
        raise HTTPException(404, "Stack not found")

    data = payload.model_dump(exclude_none=True)

    if "workflow" in data:
        data["workflow"] = _encrypt_workflow(data["workflow"], existing_workflow=stack.workflow)

    for k, v in data.items():
        setattr(stack, k, v)

    await db.commit()
    await db.refresh(stack)

    stack.workflow = _redact_workflow(stack.workflow)
    return stack


@router.delete("/{stack_id}", status_code=204)
async def delete_stack(
    stack_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stack = await db.get(Stack, stack_id)
    if not stack or stack.owner_id != current_user.id:
        raise HTTPException(404, "Stack not found")
    await db.execute(delete(Stack).where(Stack.id == stack_id))
    await db.commit()