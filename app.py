"""
Neosearch — Interactive Music Genre Graph & Audio Preview Explorer (Streamlit + Plotly).
"""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

import streamlit as st

from neosearch.cache import track_cache
from neosearch.deezer import DeezerClient, build_fallback_tracks
from neosearch.graph import build_plotly_graph, get_genre_map, load_genres

st.set_page_config(
    page_title="Neosearch — Music Genre Discovery Graph",
    page_icon="🎵",
    layout="wide",
)

deezer_client = DeezerClient()


def fetch_tracks_for_genre(genre_id: str, genre_name: str, limit: int = 8) -> Tuple[List[Dict[str, Any]], str]:
    cached = track_cache.get(genre_id)
    if cached:
        return cached[:limit], "cache"

    tracks = deezer_client.search_tracks(genre_name, limit=20)
    if tracks:
        track_cache.set(genre_id, tracks)
        return tracks[:limit], "deezer"

    fallback = build_fallback_tracks(genre_id, genre_name, limit=12)
    track_cache.set(genre_id, fallback)
    return fallback[:limit], "fallback"


def main() -> None:
    genres = load_genres()
    genre_map = get_genre_map()

    with st.sidebar:
        st.title("🎵 Neosearch")
        st.caption("Explore genre connections and listen to 30-second track previews via the Deezer API.")

        selected_id = st.selectbox(
            "Select Active Genre",
            options=[g["id"] for g in genres],
            format_func=lambda gid: genre_map[gid]["name"],
        )

        track_limit = st.slider("Tracks to load", min_value=3, max_value=15, value=6)

        custom_query = st.text_input(
            "Custom Artist / Keyword Search",
            placeholder="e.g. Gesaffelstein, Kavinsky, Aphex Twin...",
        )

        st.divider()
        stats = track_cache.stats()
        st.caption(
            f"TTL Cache: **{stats['cached_genres']}** genres ({stats['total_cached_tracks']} tracks cached)"
        )
        if st.button("Clear Track Cache", use_container_width=True):
            track_cache.clear()
            st.rerun()

    active_genre = genre_map[selected_id]
    neighbor_names = [
        genre_map[nid]["name"]
        for nid in active_genre.get("connections", [])
        if nid in genre_map
    ]

    col_graph, col_player = st.columns([1.45, 1], gap="large")

    with col_graph:
        st.subheader("Genre Relationship Graph")
        st.caption(
            "Yellow node = active genre · Cyan nodes = directly connected genres · Node size = popularity"
        )
        fig = build_plotly_graph(genres, selected_id=selected_id)
        st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

        m1, m2, m3 = st.columns(3)
        m1.metric("Active Genre", active_genre["name"])
        m2.metric("Popularity Score", f"{active_genre['popularity']} / 10")
        m3.metric("Direct Connections", str(len(neighbor_names)))

        st.markdown(
            "**Connected Genres:** " + (", ".join(f"`{n}`" for n in neighbor_names) or "None")
        )

    with col_player:
        if custom_query.strip():
            st.subheader(f"Search Results: '{custom_query.strip()}'")
            tracks = deezer_client.search_tracks(custom_query.strip(), limit=track_limit)
            source_label = "deezer"
        else:
            st.subheader(f"{active_genre['name']} — Audio Previews")
            tracks, source_label = fetch_tracks_for_genre(
                selected_id, active_genre["name"], limit=track_limit
            )

        st.caption(f"Data source: `{source_label.upper()}` (30s MP3 stream)")

        if not tracks:
            st.info("No preview tracks found for this query.")
        else:
            for idx, track in enumerate(tracks, start=1):
                with st.container(border=True):
                    st.markdown(f"**{idx}. {track['title']}** — *{track['artist']}*")
                    if track.get("album"):
                        st.caption(f"Album: {track['album']}")
                    if track.get("preview_url"):
                        st.audio(track["preview_url"], format="audio/mp3")


if __name__ == "__main__":
    main()
