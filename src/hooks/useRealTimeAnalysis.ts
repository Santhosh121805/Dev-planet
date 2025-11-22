import { useState, useEffect, useRef } from 'react';

export interface CodeMetrics {
  lines: number;
  functions: number;
  comments: number;
  complexity: number;
  language: string;
}

export interface CodeAnalysis {
  evolution_points: number;
  complexity_score: number;
  style_feedback: string;
  suggestions: string[];
  timestamp: string;
}

export interface SessionStats {
  sessions_today: number;
  total_achievements: number;
  total_evolution_points: number;
  current_streak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  timestamp: string;
}

export interface SessionConfig {
  planet_id: string;
  project_name: string;
  language: string;
}

export function useRealTimeAnalysis(userId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<CodeAnalysis | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    try {
      const wsUrl = `ws://localhost:8000/stream/ws/${userId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        fetchSessionStats();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'analysis_result':
              setLatestAnalysis(data.data);
              break;
            case 'achievement':
              setRecentAchievements(prev => [data.data, ...prev.slice(0, 4)]); // Keep last 5
              break;
            case 'session_stats':
              setSessionStats(data.data);
              break;
            default:
              console.log('📦 Received data:', data);
          }
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  };

  const fetchSessionStats = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/user/${userId}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setSessionStats(stats);
      }
    } catch (error) {
      console.error('❌ Failed to fetch session stats:', error);
      // Set mock data for demo
      setSessionStats({
        sessions_today: 3,
        total_achievements: 12,
        total_evolution_points: 847,
        current_streak: 5
      });
    }
  };

  const startSession = async (config: SessionConfig) => {
    try {
      const response = await fetch(`http://localhost:8000/api/coding/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          ...config
        }),
      });

      if (response.ok) {
        setSessionActive(true);
        console.log('🚀 Coding session started');
      }
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      // Set mock active state for demo
      setSessionActive(true);
    }
  };

  const endSession = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/coding/session/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      if (response.ok) {
        setSessionActive(false);
        console.log('🏁 Coding session ended');
        fetchSessionStats(); // Refresh stats
      }
    } catch (error) {
      console.error('❌ Failed to end session:', error);
      // Set mock inactive state for demo
      setSessionActive(false);
    }
  };

  const sendCodeAnalysis = async (metrics: CodeMetrics) => {
    if (!sessionActive) return;

    try {
      // Send via WebSocket if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'code_analysis',
          data: {
            user_id: userId,
            metrics,
            timestamp: new Date().toISOString()
          }
        }));
      } else {
        // Fallback to HTTP API
        const response = await fetch(`http://localhost:8000/api/coding/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            metrics,
            timestamp: new Date().toISOString()
          }),
        });

        if (response.ok) {
          const analysis = await response.json();
          setLatestAnalysis(analysis);
        }
      }
    } catch (error) {
      console.error('❌ Failed to send code analysis:', error);
      
      // Mock analysis for demo purposes
      const mockAnalysis: CodeAnalysis = {
        evolution_points: Math.floor(Math.random() * 20) + 5,
        complexity_score: Math.min(10, Math.max(1, metrics.complexity)),
        style_feedback: generateMockFeedback(metrics),
        suggestions: [
          "Consider adding more comments for clarity",
          "Good function structure detected",
          "Try to reduce cyclomatic complexity"
        ],
        timestamp: new Date().toISOString()
      };
      
      setLatestAnalysis(mockAnalysis);
    }
  };

  const generateMockFeedback = (metrics: CodeMetrics): string => {
    const feedbacks = [];
    
    if (metrics.comments > 0) feedbacks.push('clean');
    if (metrics.functions > 0) feedbacks.push('structured');
    if (metrics.complexity < 5) feedbacks.push('readable');
    if (metrics.lines < 20) feedbacks.push('concise');
    
    return feedbacks.length > 0 ? feedbacks.join(', ') : 'good effort';
  };

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId]);

  return {
    isConnected,
    sessionActive,
    sessionStats,
    latestAnalysis,
    recentAchievements,
    startSession,
    endSession,
    sendCodeAnalysis
  };
}