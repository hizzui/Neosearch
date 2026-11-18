"""
Deezer public API client for fetching genre tracks and 30-second MP3 preview URLs.
Falls back to sample streamable tracks if the network or external API is unreachable.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List

import requests

logger = logging.getLogger("neosearch.deezer")


class DeezerClient:
    BASE_URL = "https://api.deezer.com"
    TIMEOUT_SEC = 6

    def search_tracks(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Query Deezer `/search` and return normalized track records with preview URLs."""
        try:
            resp = requests.get(
                f"{self.BASE_URL}/search",
                params={"q": query, "limit": max(limit, 25), "output": "json"},
                timeout=self.TIMEOUT_SEC,
            )
            if resp.status_code != 200:
                logger.warning("Deezer API returned status %d for query=%s", resp.status_code, query)
                return []

            raw_items = resp.json().get("data", [])
            tracks: List[Dict[str, Any]] = []

            for item in raw_items:
                preview = item.get("preview")
                if not preview:
                    continue

                artist_name = item.get("artist", {}).get("name", "Unknown Artist")
                album = item.get("album", {})
                tracks.append(
                    {
                        "id": str(item.get("id")),
                        "title": item.get("title", "Untitled"),
                        "artist": artist_name,
                        "album": album.get("title", ""),
                        "cover_url": album.get("cover_medium", ""),
                        "preview_url": preview,
                        "duration_sec": int(item.get("duration", 30)),
                        "rank": int(item.get("rank", 0)),
                    }
                )
                if len(tracks) >= limit:
                    break

            return tracks
        except requests.RequestException as exc:
            logger.warning("Deezer request failed for '%s': %s", query, exc)
            return []


def build_fallback_tracks(genre_id: str, genre_name: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Return streamable fallback tracks when offline or rate-limited."""
    base_num = int(genre_id) if genre_id.isdigit() else 0
    return [
        {
            "id": f"demo-{genre_id}-{idx}",
            "title": f"{genre_name} Session #{idx + 1}",
            "artist": f"{genre_name} Collective",
            "album": "Offline Discovery Mix",
            "cover_url": "",
            "preview_url": (
                f"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-{(base_num + idx) % 16 + 1}.mp3"
            ),
            "duration_sec": 30,
            "rank": 50000 - (idx * 1500),
        }
        for idx in range(limit)
    ]
