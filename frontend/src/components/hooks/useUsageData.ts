import { useState, useEffect, useCallback, useMemo } from 'react'
import { UsageData } from '../types'

// Type for raw log data from backend API
interface RawLogData {
  timestamp: string
  cpu: number
  ram: number
  gpu: string | number | object | null
  gpu_load?: number
  temperature?: number
  network_rx?: number
  network_tx?: number
  unit_id?: string
}

interface UseUsageDataReturn {
  data: UsageData[]
  loading: boolean
  error: string | null
  refetch: () => void
  selectedUnitId: string | null
  setSelectedUnitId: (id: string | null) => void
  filteredData: UsageData[]
}

export const useUsageData = (): UseUsageDataReturn => {
  const [data, setData] = useState<UsageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      // Use Next.js API routes instead of direct backend calls
      const endpoint = selectedUnitId 
        ? `/api/units/${selectedUnitId}` 
        : '/api/logs'

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const logs: RawLogData[] = await response.json()

      if (logs.length === 0) {
        console.warn('No logs received from backend')
      } else {
        console.log(`Received ${logs.length} log entries`)
      }

      // Process GPU data to extract load for charting
      const processedLogs: UsageData[] = logs.map(log => {
        let gpu_load = 0

        if (log.gpu_load !== undefined && log.gpu_load !== null) {
          // Use the already parsed gpu_load from API
          gpu_load = typeof log.gpu_load === 'number' ? log.gpu_load : 0
        } else if (log.gpu !== undefined && log.gpu !== null) {
          // Handle different GPU data formats
          const gpuData = log.gpu
          if (typeof gpuData === 'number') {
            // Direct numeric value (from unit submissions)
            gpu_load = gpuData
          } else if (typeof gpuData === 'string') {
            // Parse from raw GPU data string if API parsing failed
            // Look for "GPU Usage: X%" pattern
            if (gpuData.includes('GPU Usage: ')) {
              try {
                const usageMatch = gpuData.split('GPU Usage: ')[1].split('%')[0].trim()
                gpu_load = parseFloat(usageMatch)
              } catch {
                // Silently fail and use 0
                gpu_load = 0
              }
            }
          } else if (typeof gpuData === 'object' && gpuData !== null) {
            // Handle object format (from GPU monitoring)
            const gpuObj = gpuData as Record<string, unknown>
            gpu_load = (gpuObj.overall_gpu_usage as number) || (gpuObj.gpu_load as number) || 0
          }
        }

        return {
          ...log,
          gpu_load: gpu_load || 0,
          unit_id: log.unit_id || 'local' // Default to 'local' if unit_id is missing
        } as UsageData
      })

      setData(processedLogs)
      setLoading(false)
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(`Failed to connect to backend. Make sure the backend is running. Error: ${err}`)
      setLoading(false)
    }
  }, [selectedUnitId])

  const filteredData = useMemo(() => {
    // When no unit is selected, return all units data (aggregated)
    // When a unit is selected, return individual unit data (already filtered by API)
    return data
  }, [data])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 1000) // Update every 1 second
    return () => clearInterval(interval)
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    selectedUnitId,
    setSelectedUnitId,
    filteredData
  }
}