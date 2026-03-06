import chromadb
from chromadb.config import Settings as ChromaSettings

_client = chromadb.Client(ChromaSettings(anonymized_telemetry=False))


def get_or_create_collection(name: str):
    return _client.get_or_create_collection(name)


def add_chunks(
    collection_name: str,
    chunks: list[str],
    embeddings: list[list[float]],
    doc_id: str,
):
    col = get_or_create_collection(collection_name)
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    col.add(documents=chunks, embeddings=embeddings, ids=ids)


def query_collection(
    collection_name: str,
    query_embedding: list[float],
    n_results: int = 5,
) -> list[str]:
    col = get_or_create_collection(collection_name)
    results = col.query(query_embeddings=[query_embedding], n_results=n_results)
    return results["documents"][0] if results["documents"] else []


def delete_collection(collection_name: str):
    try:
        _client.delete_collection(collection_name)
    except Exception:
        pass