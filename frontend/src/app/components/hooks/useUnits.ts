import { useState, useEffect, useCallback, useRef } from 'react'
import { Unit, Alert } from '../types'
import { apiFetch } from './apiUtils'
import { useAuth } from '../AuthContext'

export const useUnits = (orgId?: string) => {
  const { user, token } = useAuth()
  const [units, setUnits] = useState<Unit[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const fetchUnits = useCallback(async () => {
    if (!token) return; // Guard: No token, no poll
    try {
      // Security Guard: Prevent non-ROOT users from accessing other orgs
      if (orgId && user && user.role !== 'ROOT' && orgId !== user.org_id) {
        throw new Error('Security Error: Unauthorized organization access attempt.')
      }

      const endpoint = orgId ? `/api/orgs/${orgId}/units` : '/api/units'
      const response = await apiFetch(endpoint)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result: Unit[] = await response.json()
      setUnits(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setUnits([]) // Clear stale data on error
      setAlerts([])
    }
  }, [orgId, user, token])

  const fetchAlerts = useCallback(async () => {
    if (!token) return; // Guard: No token, no poll
    try {
      const response = await apiFetch('/api/alerts')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result: Alert[] = await response.json()
      setAlerts(result)
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    }
  }, [token])

  useEffect(() => {
    if (!token) return;

    const initFetch = async () => {
      await Promise.all([fetchUnits(), fetchAlerts()])
      setLoading(false)
    }
    
    initFetch()
    
    const interval = setInterval(() => {
      fetchUnits()
      fetchAlerts()
    }, 1000) // Poll every 1 second

    return () => {
      clearInterval(interval)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [fetchUnits, fetchAlerts, token])

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const response = await apiFetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      } as any)
      if (!response.ok) {
        throw new Error('Failed to acknowledge alert')
      }
      // Update local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, acknowledged: true }
          : alert
      ))
    } catch (err) {
      console.error('Failed to acknowledge alert:', err)
    }
  }, [])

  return {
    units,
    alerts,
    loading,
    error,
    isConnected,
    refetchUnits: fetchUnits,
    refetchAlerts: fetchAlerts,
    acknowledgeAlert
  }
}
