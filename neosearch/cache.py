"""
In-memory TTL cache for genre track lookups.
Avoids hitting the external Deezer search endpoint repeatedly for the same genre.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional


class TrackCache:
    def __init__(self, ttl_minutes: int = 30) -> None:
        self._store: Dict[str, Dict[str, Any]] = {}
        self._ttl = timedelta(minutes=ttl_minutes)

    def get(self, key: str) -> Optional[List[Dict[str, Any]]]:
        entry = self._store.get(key)
        if not entry:
            return None

        if datetime.now() >= entry["expires_at"]:
            self._store.pop(key, None)
            return None

        return entry["tracks"]

    def set(self, key: str, tracks: List[Dict[str, Any]]) -> None:
        now = datetime.now()
        self._store[key] = {
            "tracks": tracks,
            "cached_at": now,
            "expires_at": now + self._ttl,
        }

    def clear(self, key: Optional[str] = None) -> None:
        if key:
            self._store.pop(key, None)
        else:
            self._store.clear()

    def stats(self) -> Dict[str, Any]:
        active_keys = [k for k in list(self._store) if self.get(k) is not None]
        total_tracks = sum(len(self._store[k]["tracks"]) for k in active_keys)
        return {
            "cached_genres": len(active_keys),
            "total_cached_tracks": total_tracks,
            "keys": active_keys,
        }


track_cache = TrackCache(ttl_minutes=30)
