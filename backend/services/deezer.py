"""
Deezer API Service - Free music discovery with preview URLs
No authentication required for public data
"""

import requests
from typing import List, Dict
import os

class DeezerService:
    """
    Wrapper for Deezer Web API
    100% free, no rate limit issues for discovery use
    """
    
    BASE_URL = "https://api.deezer.com"
    TIMEOUT = 5
    
    def search_by_genre_keyword(self, keyword: str, limit: int = 50) -> List[Dict]:
        """Search for tracks by genre keyword"""
        try:
            print(f"🔍 Searching Deezer for: {keyword}")
            
            url = f"{self.BASE_URL}/search"
            params = {
                "q": keyword,
                "limit": limit,
                "output": "json"
            }
            
            response = requests.get(url, params=params, timeout=self.TIMEOUT)
            
            if response.status_code != 200:
                print(f"❌ Deezer search failed: {response.status_code}")
                return []
            
            data = response.json()
            tracks = data.get("data", [])
            
            print(f"✅ Found {len(tracks)} tracks on Deezer")
            
            # Filter for tracks with preview
            result = []
            for track in tracks:
                preview_url = track.get("preview")
                if preview_url:
                    result.append({
                        "id": track.get("id"),
                        "name": track.get("title"),
                        "artists": [track.get("artist", {}).get("name", "Unknown")],
                        "preview_url": preview_url,
                        "duration_ms": (track.get("duration", 0) * 1000),
                        "popularity": track.get("rank", 50) // 1000,
                        "uri": f"deezer:track:{track.get('id')}",
                        "album": track.get("album", {}).get("title", ""),
                        "image_url": track.get("album", {}).get("cover_medium", "")
                    })
            
            playable = sum(1 for t in result if t.get("preview_url"))
            print(f"   {playable} tracks with preview_url available")
            
            return result
            
        except Exception as e:
            print(f"❌ Deezer search error: {e}")
            return []
    
    def search_playlist(self, playlist_query: str, limit: int = 50) -> List[Dict]:
        """Search for playlist and get tracks from it"""
        try:
            print(f"🎵 Searching Deezer playlists for: {playlist_query}")
            
            # Search for playlists
            url = f"{self.BASE_URL}/search/playlist"
            params = {
                "q": playlist_query,
                "limit": 1,
                "output": "json"
            }
            
            response = requests.get(url, params=params, timeout=self.TIMEOUT)
            
            if response.status_code != 200:
                return []
            
            playlists = response.json().get("data", [])
            
            if not playlists:
                print(f"❌ No playlists found for: {playlist_query}")
                return []
            
            playlist_id = playlists[0]["id"]
            playlist_name = playlists[0]["title"]
            print(f"✅ Using playlist: {playlist_name}")
            
            # Get tracks from playlist
            playlist_url = f"{self.BASE_URL}/playlist/{playlist_id}/tracks"
            playlist_response = requests.get(playlist_url, params={"limit": limit, "output": "json"}, timeout=self.TIMEOUT)
            
            tracks_data = playlist_response.json().get("data", [])
            
            result = []
            for track in tracks_data:
                preview_url = track.get("preview")
                if preview_url:
                    result.append({
                        "id": track.get("id"),
                        "name": track.get("title"),
                        "artists": [track.get("artist", {}).get("name", "Unknown")],
                        "preview_url": preview_url,
                        "duration_ms": (track.get("duration", 0) * 1000),
                        "popularity": track.get("rank", 50) // 1000,
                        "uri": f"deezer:track:{track.get('id')}",
                        "album": track.get("album", {}).get("title", ""),
                        "image_url": track.get("album", {}).get("cover_medium", "")
                    })
            
            return result
            
        except Exception as e:
            print(f"❌ Deezer playlist search error: {e}")
            return []
    
    def health_check(self) -> bool:
        """Verify Deezer API is accessible"""
        try:
            response = requests.get(f"{self.BASE_URL}/search", params={"q": "test", "limit": 1}, timeout=3)
            return response.status_code == 200
        except:
            return False
