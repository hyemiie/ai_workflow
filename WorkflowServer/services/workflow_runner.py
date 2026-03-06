from services.embeddings   import embed_texts
from services.vector_store import query_collection
from services.llm          import call_llm
from services.web_search   import web_search
from core.security         import decrypt_value


def _find_node(nodes: list[dict], node_type: str) -> dict | None:
    for n in nodes:
        if n.get("type") == node_type:
            return n
    return None


def _get_cfg(node: dict) -> dict:
    return node.get("data", {})


def _decrypt_key(cfg: dict, field: str) -> str | None:
    """Decrypt a sensitive field from node config. Returns None if missing or redacted."""
    raw = cfg.get(field, "")
    if not raw or raw == "********":
        return None
    return decrypt_value(raw)


async def run_workflow(workflow: dict, query: str) -> str:
    nodes: list[dict] = workflow.get("nodes", [])
    context     = ""
    web_context = ""

    kb_node = _find_node(nodes, "knowledge")
    if kb_node:
        cfg        = _get_cfg(kb_node)
        collection = cfg.get("collection")
        emb_model  = cfg.get("embModel", "gemini-embedding")

        if not collection:
            return "Knowledge Base error: no document uploaded. Please upload a file first."

        query_emb = (await embed_texts([query], emb_model))[0]
        chunks    = query_collection(collection, query_emb, n_results=5)
        context   = "\n\n".join(chunks)

  
    ws_node = _find_node(nodes, "websearch")

    llm_node = _find_node(nodes, "llm")
    if not llm_node:
        return "No LLM node found in the workflow."

    llm_cfg  = _get_cfg(llm_node)
    llm_web  = llm_cfg.get("webSearch", False)

    if ws_node:
        ws_cfg  = _get_cfg(ws_node)
        engine  = ws_cfg.get("engine", "serpapi")
        ws_key  = _decrypt_key(ws_cfg, "apiKey")

        if not ws_key:
            return "Web Search error: no API key provided in the Web Search node."

        web_context = await web_search(query, engine=engine, api_key=ws_key)

    elif llm_web:
        engine  = llm_cfg.get("engine", llm_cfg.get("searchEngine", "serpapi"))

        ws_key  = _decrypt_key(llm_cfg, "serpApi") or _decrypt_key(llm_cfg, "webSearchApiKey")

        if not ws_key:
            return "Web Search error: no API key provided in the LLM node's web search config."

        web_context = await web_search(query, engine=engine, api_key=ws_key)

    model = llm_cfg.get("model", "").strip()
    if not model:
        return "LLM error: no model selected in the LLM node."

    api_key = _decrypt_key(llm_cfg, "apiKey")
    if not api_key:
        return "LLM error: no API key provided in the LLM node."

    temperature   = float(llm_cfg.get("temperature", 0.7))
    system_prompt = llm_cfg.get(
        "prompt",
        "You are a helpful assistant.\nCONTEXT: {context}\nWEB RESULTS: {web_results}\nUser Query: {query}"
    )

    full_prompt = (
        system_prompt
        .replace("{context}",     context)
        .replace("{web_results}", web_context)
        .replace("{query}",       query)
    )

    try:
        answer = await call_llm(
            full_prompt,
            model=model,
            temperature=temperature,
            api_key=api_key,
        )
    except Exception as e:
        return f"LLM error: {str(e)}"

    return answer