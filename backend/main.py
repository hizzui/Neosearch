from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

from models import Genre, GraphData, GraphNode, GraphLink
from data import GENRES_DATA, get_genre, get_all_genres
from services.deezer import DeezerService
from cache_manager import genre_cache
import json
from pathlib import Path

# Initialize Deezer service (always works - free API)
deezer_service = DeezerService()

app = FastAPI(
    title="Every Noise Brutalist Discovery Engine API",
    description="FastAPI backend for genre force-directed graph",
    version="1.0.0"
)

# CORS middleware - allow frontend to call
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:3004",
        "http://127.0.0.1:3005",
        "https://neosearchs.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== HEALTH CHECK ====================
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "online", "service": "Every Noise Deezer API"}

# ==================== GENRES ENDPOINTS ====================
@app.get("/api/genres", response_model=list[Genre])
async def get_genres():
    """Get all 16 genres with connections"""
    return [
        Genre(
            id=g["id"],
            name=g["name"],
            popularity=g["popularity"],
            connections=g["connections"]
        )
        for g in get_all_genres()
    ]

@app.get("/api/genre/{genre_id}", response_model=Genre)
async def get_genre_by_id(genre_id: str):
    """Get single genre by ID"""
    genre = get_genre(genre_id)
    if not genre:
        return JSONResponse(
            status_code=404, 
            content={"error": f"Genre {genre_id} not found"}
        )
    return Genre(**genre)

@app.get("/api/genre/{genre_id}/artists")
async def get_genre_artists(genre_id: str, limit: int = 10):
    """Get artists for a genre - this endpoint is deprecated"""
    return JSONResponse(
        status_code=503,
        content={"message": "Artists endpoint retired - use /api/genre/{genre_id}/tracks for Deezer tracks"}
    )

# Genre ID to Spotify Category ID mapping (Legacy - keeping for reference)
# These endpoints now return 403 Forbidden with Client Credentials
# See: https://github.com/spotify/web-api/issues/...
GENRE_TO_SPOTIFY_CATEGORY = {
    # Keeping for historical reference - DO NOT USE
    # Spotify browse endpoints require User context, not just app credentials
}

@app.get("/api/genre/{genre_id}/tracks")
async def get_genre_tracks(genre_id: str, limit: int = 20):
    """
    Get tracks for a genre using DEEZER API (free, reliable, 100% preview URLs)
    
    🎵 STRATEGY: Deezer Free API
    - 100% tracks have preview_url (30s MP3)
    - No authentication required
    - No rate limiting for discovery
    - Global music catalog
    - Always works
    
    Architecture:
    1. Check cache first (30min TTL)
    2. If miss, fetch from Deezer with timeout
    3. If Deezer fails, use demo fallback
    4. Cache for "next" button pagination
    """
    import asyncio
    
    genre = get_genre(genre_id)
    if not genre:
        return JSONResponse(
            status_code=404, 
            content={"error": f"Genre {genre_id} not found"}
        )
    
    # 1️⃣ CHECK CACHE FIRST (super fast)
    cached_tracks = genre_cache.get_cached(genre_id)
    if cached_tracks:
        print(f"[CACHE] Serving {len(cached_tracks[:limit])} cached tracks for {genre['name']}")
        return {
            "genre_id": genre_id,
            "genre_name": genre["name"],
            "tracks": cached_tracks[:limit],
            "count": len(cached_tracks[:limit]),
            "source": "cache",
            "total_available": len(cached_tracks),
            "provider": "deezer"
        }
    
    # 2️⃣ FETCH FROM DEEZER (Most Reliable)
    if deezer_service:
        try:
            loop = asyncio.get_event_loop()
            
            # Fetch 50 tracks for pagination support
            print(f"[DEEZER] Fetching {genre['name']} from Deezer...")
            tracks = await asyncio.wait_for(
                loop.run_in_executor(
                    None,
                    lambda: deezer_service.search_by_genre_keyword(genre["name"], limit=50)
                ),
                timeout=10.0  # 10 second timeout
            )
            
            if tracks and len(tracks) > 0:
                # Cache the full batch
                genre_cache.set_cached(genre_id, tracks)
                print(f"[OK] Got {len(tracks)} tracks from Deezer")
                
                return {
                    "genre_id": genre_id,
                    "genre_name": genre["name"],
                    "tracks": tracks[:limit],
                    "count": len(tracks[:limit]),
                    "source": "deezer",
                    "total_available": len(tracks),
                    "provider": "deezer"
                }
        
        except asyncio.TimeoutError:
            print(f"[WARN] Deezer timeout for {genre['name']}")
        except Exception as e:
            print(f"[WARN] Deezer error: {e}")
    
    # 3️⃣ FALLBACK: DEMO DATA
    print(f"[FALLBACK] Using demo data for {genre['name']}")
    
    demo_tracks = [
        {
            "id": f"demo-{genre_id}-{i}",
            "name": f"{genre['name']} - Demo Track {i + 1}",
            "artists": ["Demo Music"],
            "preview_url": f"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-{(int(genre_id) + i) % 16 + 1}.mp3",
            "duration_ms": 180000,
            "popularity": 70,
            "uri": f"demo:track:{genre_id}:{i}"
        }
        for i in range(min(limit + 30, 50))  # Cache 50 for pagination
    ]
    
    genre_cache.set_cached(genre_id, demo_tracks)
    
    return {
        "genre_id": genre_id,
        "genre_name": genre["name"],
        "tracks": demo_tracks[:limit],
        "count": len(demo_tracks[:limit]),
        "source": "demo",
        "total_available": len(demo_tracks),
        "provider": "deezer (fallback to demo)"
    }


@app.get("/api/cache/stats")
async def get_cache_stats():
    """Get cache statistics"""
    return genre_cache.get_stats()


@app.post("/api/cache/clear")
async def clear_cache(genre_id: Optional[str] = None):
    """Clear cache for a genre or all"""
    genre_cache.clear(genre_id)
    return {"status": "cleared", "genre_id": genre_id}

# ==================== GRAPH ENDPOINTS ====================
@app.get("/api/graph", response_model=GraphData)
async def get_graph():
    """Get complete force-directed graph data"""
    
    # Build nodes
    nodes = [
        GraphNode(
            id=g["id"],
            name=g["name"],
            popularity=g["popularity"]
        )
        for g in get_all_genres()
    ]
    
    # Build links
    links = []
    seen_connections = set()
    
    for genre in get_all_genres():
        for target_id in genre["connections"]:
            # Create bidirectional link key
            link_key = tuple(sorted([genre["id"], target_id]))
            
            if link_key not in seen_connections:
                links.append(
                    GraphLink(
                        source=genre["id"],
                        target=target_id,
                        strength=1.0
                    )
                )
                seen_connections.add(link_key)
    
    return GraphData(nodes=nodes, links=links)

@app.get("/api/relationships")
async def get_relationships():
    """Get all genre relationships with strength values"""
    relationships = []
    seen = set()
    
    for genre in get_all_genres():
        for target_id in genre["connections"]:
            key = tuple(sorted([genre["id"], target_id]))
            if key not in seen:
                relationships.append({
                    "source": genre["id"],
                    "target": target_id,
                    "strength": 1.0
                })
                seen.add(key)
    
    return {"relationships": relationships, "count": len(relationships)}

# ==================== AUDIO ENDPOINTS ====================
# (Use /api/genre/{genre_id}/tracks endpoint for audio data - tracks endpoint provides Deezer previews)

# ==================== ROOT ====================
@app.get("/")
async def root():
    """API root with status"""
    return {
        "name": "Every Noise Brutalist Discovery Engine",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "services": {
            "spotify": {
                "available": False,
                "note": "Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to enable"
            }
        }
    }

# ==================== ERROR HANDLERS ====================
@app.exception_handler(404)
async def not_found(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Not found"}
    )

@app.exception_handler(500)
async def internal_error(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
