"""
FastAPI REST service for Neosearch.
Exposes genre graph topology and cached Deezer track preview endpoints.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from neosearch.cache import track_cache
from neosearch.deezer import DeezerClient, build_fallback_tracks
from neosearch.graph import build_edges, compute_force_layout, get_genre_map, load_genres

app = FastAPI(
    title="Neosearch API",
    description="Music genre relationship graph and track preview discovery service.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

deezer = DeezerClient()


class GenreModel(BaseModel):
    id: str
    name: str
    popularity: int
    connections: List[str]


class GraphNodeModel(BaseModel):
    id: str
    name: str
    popularity: int
    x: float
    y: float


class GraphLinkModel(BaseModel):
    source: str
    target: str


class GraphResponse(BaseModel):
    nodes: List[GraphNodeModel]
    links: List[GraphLinkModel]


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "neosearch-api"}


@app.get("/api/genres", response_model=List[GenreModel])
def list_genres() -> List[GenreModel]:
    return [GenreModel(**g) for g in load_genres()]


@app.get("/api/graph", response_model=GraphResponse)
def get_graph() -> GraphResponse:
    genres = load_genres()
    coords = compute_force_layout(genres)
    nodes = [
        GraphNodeModel(
            id=g["id"],
            name=g["name"],
            popularity=g["popularity"],
            x=coords[g["id"]][0],
            y=coords[g["id"]][1],
        )
        for g in genres
    ]
    links = [GraphLinkModel(source=u, target=v) for u, v in build_edges(genres)]
    return GraphResponse(nodes=nodes, links=links)


@app.get("/api/genre/{genre_id}/tracks")
def get_genre_tracks(genre_id: str, limit: int = 12) -> Dict[str, Any]:
    genre = get_genre_map().get(genre_id)
    if not genre:
        raise HTTPException(status_code=404, detail=f"Genre '{genre_id}' not found.")

    cached = track_cache.get(genre_id)
    if cached:
        return {
            "genre_id": genre_id,
            "genre_name": genre["name"],
            "source": "cache",
            "tracks": cached[:limit],
        }

    tracks = deezer.search_tracks(genre["name"], limit=max(limit, 20))
    source = "deezer"
    if not tracks:
        tracks = build_fallback_tracks(genre_id, genre["name"], limit=20)
        source = "fallback"

    track_cache.set(genre_id, tracks)
    return {
        "genre_id": genre_id,
        "genre_name": genre["name"],
        "source": source,
        "tracks": tracks[:limit],
    }


@app.get("/api/cache/stats")
def cache_stats() -> Dict[str, Any]:
    return track_cache.stats()


@app.post("/api/cache/clear")
def clear_cache(genre_id: Optional[str] = None) -> Dict[str, Optional[str]]:
    track_cache.clear(genre_id)
    return {"status": "cleared", "genre_id": genre_id}
