/**
 * API Service - Frontend communication with FastAPI backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface Genre {
  id: string;
  name: string;
  popularity: number;
  connections: string[];
  artists?: string[];
}

export interface GraphNode {
  id: string;
  name: string;
  popularity: number;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  strength: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Track {
  id: string;
  name: string;
  preview_url: string;
  duration_ms: number;
  popularity: number;
}

export interface GenreTrackResponse {
  genre_id: string;
  genre_name: string;
  tracks: Track[];
  count: number;
  source: 'spotify' | 'mock';
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all genres
   */
  async getGenres(): Promise<Genre[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/genres`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch genres:', error);
      throw error;
    }
  }

  /**
   * Get force-directed graph data
   */
  async getGraph(): Promise<GraphData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/graph`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch graph:', error);
      throw error;
    }
  }

  /**
   * Get tracks for a genre
   */
  async getGenreTracks(genreId: string, limit: number = 10): Promise<GenreTrackResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/genre/${genreId}/tracks?limit=${limit}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch tracks for genre ${genreId}:`, error);
      // Return mock fallback on error
      return {
        genre_id: genreId,
        genre_name: 'Unknown',
        tracks: [],
        count: 0,
        source: 'mock'
      };
    }
  }
}

export const apiService = new ApiService();
