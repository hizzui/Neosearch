"""
Genre Track Cache Manager - Prevents requerying Spotify, serves from cache
"""
import time
from typing import Dict, List, Optional
import asyncio
from datetime import datetime, timedelta

class GenreTrackCache:
    """
    Cache system for Spotify tracks by genre.
    - Stores fetched tracks for 30 minutes
    - Serves incrementally (prevents duplicate requests)
    - Thread-safe with asyncio locks
    """
    
    def __init__(self, ttl_minutes: int = 30):
        self.cache: Dict[str, Dict] = {}
        self.ttl = timedelta(minutes=ttl_minutes)
        self.locks: Dict[str, asyncio.Lock] = {}
    
    def _get_lock(self, genre_id: str) -> asyncio.Lock:
        """Get or create lock for genre"""
        if genre_id not in self.locks:
            self.locks[genre_id] = asyncio.Lock()
        return self.locks[genre_id]
    
    def is_cached(self, genre_id: str) -> bool:
        """Check if genre is in cache and not expired"""
        if genre_id not in self.cache:
            return False
        
        cached_data = self.cache[genre_id]
        if datetime.now() > cached_data["expires_at"]:
            del self.cache[genre_id]
            return False
        
        return True
    
    def get_cached(self, genre_id: str) -> Optional[List[Dict]]:
        """Get cached tracks for a genre"""
        if self.is_cached(genre_id):
            return self.cache[genre_id]["tracks"]
        return None
    
    def set_cached(self, genre_id: str, tracks: List[Dict]) -> None:
        """Store tracks in cache with TTL"""
        self.cache[genre_id] = {
            "tracks": tracks,
            "expires_at": datetime.now() + self.ttl,
            "cached_at": datetime.now(),
            "count": len(tracks)
        }
        print(f"💾 Cached {len(tracks)} tracks for genre {genre_id} (expires in {self.ttl.total_seconds()/60:.0f}m)")
    
    def get_cache_info(self, genre_id: str) -> Dict:
        """Get cache metadata"""
        if genre_id in self.cache:
            data = self.cache[genre_id]
            return {
                "cached": True,
                "count": data["count"],
                "cached_at": data["cached_at"].isoformat(),
                "expires_at": data["expires_at"].isoformat()
            }
        return {"cached": False}
    
    def clear(self, genre_id: Optional[str] = None) -> None:
        """Clear cache for all or specific genre"""
        if genre_id:
            if genre_id in self.cache:
                del self.cache[genre_id]
            print(f"🗑️  Cleared cache for {genre_id}")
        else:
            self.cache.clear()
            print(f"🗑️  Cleared all cache")
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        total_tracks = sum(data["count"] for data in self.cache.values())
        return {
            "cached_genres": len(self.cache),
            "total_cached_tracks": total_tracks,
            "genres": list(self.cache.keys())
        }


# Global cache instance
genre_cache = GenreTrackCache(ttl_minutes=30)
