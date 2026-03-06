import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.db import get_db
from models.document import Document
from schemas.document import DocumentOut
from services.pdf_extractor import extract_text, chunk_text
from services.embeddings    import embed_texts
from services.vector_store  import add_chunks, delete_collection

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload_document(
    stack_id:  str        = Form(...),
    node_id:   str        = Form(...),
    emb_model: str        = Form("gemini-embedding"),
    file:      UploadFile = File(...),
    db:        AsyncSession = Depends(get_db),
):
    raw        = await file.read()
    text       = extract_text(raw)
    chunks     = chunk_text(text)
    embeddings = await embed_texts(chunks, emb_model)

    doc_id     = str(uuid.uuid4())
    collection = f"{stack_id}_{node_id}"  
    add_chunks(collection, chunks, embeddings, doc_id)

    doc = Document(
        id=doc_id, stack_id=stack_id, node_id=node_id,
        filename=file.filename, content=text,
        chunk_count=len(chunks), collection=collection,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.get("/{stack_id}", response_model=list[DocumentOut])
async def list_documents(stack_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.stack_id == stack_id))
    return result.scalars().all()


@router.delete("/{doc_id}", status_code=204)
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    delete_collection(doc.collection)
    await db.delete(doc)
    await db.commit()