/**
 * Real-time code analysis hook
 * Manages WebSocket connection and code analysis streaming
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { planetForgeAPI, AnalysisResult, Achievement } from '@/lib/api';

export interface CodeMetrics {
  lines: number;
  functions: number;
  comments: number;
  complexity: number;
  language: string;
}

export interface SessionData {
  planet_id: string;
  project_name?: string;
  language?: string;
}

export interface RealTimeUpdate {
  type: 'analysis_result' | 'achievement_unlocked' | 'planet_evolution' | 'session_started' | 'session_ended' | 'connected' | 'error';
  data?: any;
  timestamp: string;
}

export function useRealTimeAnalysis(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const sessionStartTime = useRef<Date | null>(null);
  const analysisCount = useRef(0);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((data: any) => {
    const update: RealTimeUpdate = {
      type: data.type,
      data: data,
      timestamp: data.timestamp || new Date().toISOString()
    };

    setUpdates(prev => [...prev.slice(-49), update]); // Keep last 50 updates

    switch (data.type) {
      case 'connected':
        setIsConnected(true);
        setConnectionError(null);
        console.log('🌟 Planet Forge analysis stream connected!');
        break;

      case 'analysis_result':
        setLatestAnalysis(data.result);
        analysisCount.current++;
        console.log(`📊 Analysis #${analysisCount.current} completed in ${data.latency_ms}ms`);
        break;

      case 'achievement_unlocked':
        const achievement = data.achievement;
        setRecentAchievements(prev => [achievement, ...prev.slice(0, 9)]); // Keep last 10
        console.log(`🏆 Achievement unlocked: ${achievement.title} (+${achievement.points} points)`);
        break;

      case 'planet_evolution':
        console.log(`🚀 Planet evolved! +${data.points_earned} evolution points`);
        break;

      case 'session_started':
        setSessionActive(true);
        sessionStartTime.current = new Date();
        console.log('🎯 Coding session started');
        break;

      case 'session_ended':
        setSessionActive(false);
        sessionStartTime.current = null;
        analysisCount.current = 0;
        console.log('📊 Coding session ended');
        break;

      case 'error':
        console.error('❌ Stream error:', data.message);
        setConnectionError(data.message);
        break;
    }
  }, []);

  const handleError = useCallback((error: Event) => {
    setIsConnected(false);
    setConnectionError('WebSocket connection error');
    console.error('WebSocket error:', error);
  }, []);

  // Connect/disconnect WebSocket
  useEffect(() => {
    if (!userId) {
      return;
    }

    planetForgeAPI.connectWebSocket(userId, handleMessage, handleError);
    
    return () => {
      planetForgeAPI.disconnectWebSocket();
      setIsConnected(false);
    };
  }, [userId, handleMessage, handleError]);

  // API methods
  const startSession = useCallback((sessionData: SessionData) => {
    if (!isConnected) {
      throw new Error('WebSocket not connected');
    }
    
    planetForgeAPI.startSession(sessionData);
  }, [isConnected]);

  const endSession = useCallback(() => {
    if (!sessionActive || !sessionStartTime.current) {
      return;
    }

    const duration = Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000);
    planetForgeAPI.endSession(duration);
  }, [sessionActive]);

  const sendCodeAnalysis = useCallback((metrics: CodeMetrics) => {
    if (!isConnected) {
      console.warn('Cannot send analysis: WebSocket not connected');
      return;
    }

    planetForgeAPI.sendCodeAnalysis(metrics);
  }, [isConnected]);

  // Auto-end session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionActive) {
        endSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionActive, endSession]);

  // Session stats
  const sessionDuration = sessionStartTime.current 
    ? Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000)
    : 0;
    
  const sessionStats = {
    duration: sessionDuration,
    analysisCount: analysisCount.current,
    avgAnalysisTime: analysisCount.current > 0 
      ? sessionDuration / analysisCount.current 
      : 0
  };

  return {
    // Connection state
    isConnected,
    connectionError,
    
    // Session state
    sessionActive,
    sessionStats,
    
    // Real-time data
    updates,
    latestAnalysis,
    recentAchievements,
    
    // Actions
    startSession,
    endSession,
    sendCodeAnalysis,
    
    // Utilities
    clearUpdates: () => setUpdates([]),
    clearAchievements: () => setRecentAchievements([])
  };
}