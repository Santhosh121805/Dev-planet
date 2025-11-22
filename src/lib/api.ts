/**
 * Planet Code Forge API Client
 * Frontend service for connecting to the backend
 */

const API_BASE_URL = 'http://localhost:8000/api';
const WS_BASE_URL = 'ws://localhost:8000';

export interface User {
  id: string;
  username: string;
  display_name?: string;
  wallet_address?: string;
  email?: string;
  created_at: string;
  planets_count: number;
}

export interface Planet {
  id: string;
  name: string;
  planet_type: string;
  evolution_stage: string;
  atmosphere: string;
  terrain: string;
  primary_color: string;
  secondary_color: string;
  algorithm_mastery: number;
  web_development_skill: number;
  api_design_discipline: number;
  devops_maturity: number;
  security_awareness: number;
  evolution_points: number;
  total_code_time: number;
  last_activity: string;
  created_at: string;
  visual_preview_url?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
  wallet_address?: string;
}

export interface AnalysisResult {
  skill_deltas: Record<string, number>;
  coding_style: string;
  language: string;
  behavioral_patterns: Record<string, number>;
  evolution_points: number;
  session_quality: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  rarity: string;
  unlocked_at: string;
}

class PlanetForgeAPI {
  private baseUrl = API_BASE_URL;
  private wsUrl = WS_BASE_URL;
  private token: string | null = null;
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    // Load token from localStorage if available
    this.token = localStorage.getItem('planet_forge_token');
  }

  // Authentication
  async login(credentials: {
    wallet_address?: string;
    email?: string;
    username: string;
    signature?: string;
    password?: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data: AuthResponse = await response.json();
    this.token = data.access_token;
    localStorage.setItem('planet_forge_token', this.token);
    
    return data;
  }

  async register(credentials: {
    wallet_address?: string;
    email?: string;
    username: string;
    signature?: string;
    password?: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }

    const data: AuthResponse = await response.json();
    this.token = data.access_token;
    localStorage.setItem('planet_forge_token', this.token);
    
    return data;
  }

  async getProfile(): Promise<User> {
    const response = await this.authenticatedRequest('/auth/profile');
    return response.json();
  }

  logout() {
    this.token = null;
    localStorage.removeItem('planet_forge_token');
    this.disconnectWebSocket();
  }

  // Planets
  async getPlanets(): Promise<Planet[]> {
    const response = await this.authenticatedRequest('/planet');
    return response.json();
  }

  async createPlanet(planetData: { name: string; planet_type?: string }): Promise<Planet> {
    const response = await this.authenticatedRequest('/planet', {
      method: 'POST',
      body: JSON.stringify(planetData),
    });
    return response.json();
  }

  async getPlanet(planetId: string): Promise<Planet> {
    const response = await this.authenticatedRequest(`/planet/${planetId}`);
    return response.json();
  }

  async getPlanetStats(planetId: string) {
    const response = await this.authenticatedRequest(`/planet/${planetId}/stats`);
    return response.json();
  }

  async getPlanetVisual(planetId: string, format = 'svg', size = 512) {
    const response = await this.authenticatedRequest(`/planet/${planetId}/visual?format=${format}&size=${size}`);
    return response.json();
  }

  // Evolution and Achievements
  async getEvolutionEvents(planetId: string) {
    const response = await this.authenticatedRequest(`/evolution/events/${planetId}`);
    return response.json();
  }

  async getAchievements(planetId: string): Promise<Achievement[]> {
    const response = await this.authenticatedRequest(`/evolution/achievements/${planetId}`);
    return response.json();
  }

  // Real-time WebSocket connection
  connectWebSocket(
    userId: string,
    onMessage: (data: any) => void,
    onError?: (error: Event) => void
  ): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected');
      return;
    }

    const wsUrl = `${this.wsUrl}/stream/ws/${userId}`;
    this.websocket = new WebSocket(wsUrl);

    this.websocket.onopen = () => {
      console.log('🚀 Planet Forge WebSocket connected');
      this.reconnectAttempts = 0;
      
      // Start heartbeat
      this.startHeartbeat();
    };

    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) onError(error);
    };

    this.websocket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(userId, onMessage, onError);
    };
  }

  private attemptReconnect(
    userId: string,
    onMessage: (data: any) => void,
    onError?: (error: Event) => void
  ): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connectWebSocket(userId, onMessage, onError);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private startHeartbeat(): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage({
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      });
      
      // Send heartbeat every 30 seconds
      setTimeout(() => this.startHeartbeat(), 30000);
    }
  }

  sendWebSocketMessage(message: any): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Send code analysis data
  sendCodeAnalysis(metrics: {
    lines: number;
    functions: number;
    comments: number;
    complexity: number;
    language: string;
  }): void {
    this.sendWebSocketMessage({
      type: 'code_analysis',
      metrics,
      timestamp: new Date().toISOString()
    });
  }

  // Start/end coding sessions
  startSession(sessionData: {
    planet_id: string;
    project_name?: string;
    language?: string;
  }): void {
    this.sendWebSocketMessage({
      type: 'start_session',
      ...sessionData,
      timestamp: new Date().toISOString()
    });
  }

  endSession(duration_seconds: number): void {
    this.sendWebSocketMessage({
      type: 'end_session',
      duration_seconds,
      timestamp: new Date().toISOString()
    });
  }

  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  // Helper method for authenticated requests
  private async authenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      this.logout();
      throw new Error('Authentication expired. Please login again.');
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export a singleton instance
export const planetForgeAPI = new PlanetForgeAPI();