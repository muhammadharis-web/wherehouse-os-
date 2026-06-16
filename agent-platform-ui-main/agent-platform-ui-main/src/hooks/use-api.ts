"use client"

import { useEffect, useRef, useState } from "react"
import { ApiError } from "@/lib/api"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(fetcher: () => Promise<T>, _deps: unknown[] = []) {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: true, error: null })
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const data = await fetcherRef.current()
        if (!cancelled) setState({ data, loading: false, error: null })
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : "Something went wrong"
          setState({ data: null, loading: false, error: message })
        }
      }
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, _deps)

  const refetch = () => {
    fetcherRef.current().then((data) => {
      setState({ data, loading: false, error: null })
    }).catch((err) => {
      const message = err instanceof ApiError ? err.message : "Something went wrong"
      setState({ data: null, loading: false, error: message })
    })
  }

  return { ...state, refetch }
}
