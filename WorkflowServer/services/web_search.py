import httpx


async def search_serpapi(query: str, num: int = 5, api_key: str = None) -> str:
    from serpapi import GoogleSearch
    params = {"q": query, "api_key": api_key, "num": num}
    results = GoogleSearch(params).get_dict()
    snippets = [r.get("snippet", "") for r in results.get("organic_results", [])[:num]]
    return "\n".join(snippets)


async def search_brave(query: str, num: int = 5, api_key: str = None) -> str:
    url = "https://api.search.brave.com/res/v1/web/search"
    headers = {"Accept": "application/json", "X-Subscription-Token": api_key}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers, params={"q": query, "count": num})
        data = resp.json()
    results = data.get("web", {}).get("results", [])
    return "\n".join(r.get("description", "") for r in results[:num])


async def search_tavily(query: str, num: int = 5, api_key: str = None) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.tavily.com/search",
            json={
                "api_key": api_key,
                "query": query,
                "max_results": num,
                "search_depth": "basic",
            }
        )
        resp.raise_for_status()
        data = resp.json()
    results = data.get("results", [])
    return "\n".join(r.get("content", "") for r in results[:num])


async def web_search(query: str, engine: str = "tavily", api_key: str = None) -> str:
    if engine == "brave":
        return await search_brave(query, api_key=api_key)
    if engine == "tavily":
        return await search_tavily(query, api_key=api_key)
    return await search_serpapi(query, api_key=api_key)