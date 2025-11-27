"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  NanswapCurrencies,
  NanswapEstimate,
  NanswapLimits,
  NanswapOrder,
  NanswapCreateOrderRequest,
} from "@/lib/nanswap-types"

// Fetch currencies
async function fetchCurrencies(): Promise<NanswapCurrencies> {
  const response = await fetch("/api/nanswap/currencies")
  if (!response.ok) throw new Error("Failed to fetch currencies")
  return response.json()
}

export function useNanswapCurrencies() {
  return useQuery({
    queryKey: ["nanswap-currencies"],
    queryFn: fetchCurrencies,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  })
}

// Fetch estimate
async function fetchEstimate(from: string, to: string, amount: number): Promise<NanswapEstimate> {
  const params = new URLSearchParams({ from, to, amount: amount.toString() })
  const response = await fetch(`/api/nanswap/estimate?${params}`)
  if (!response.ok) throw new Error("Failed to fetch estimate")
  return response.json()
}

export function useNanswapEstimate(from: string, to: string, amount: number, enabled = true) {
  return useQuery({
    queryKey: ["nanswap-estimate", from, to, amount],
    queryFn: () => fetchEstimate(from, to, amount),
    enabled: enabled && !!from && !!to && amount > 0,
    // staleTime: 1000 * 30, // 30 seconds (default 0)
    gcTime: 1000 * 60, // Keep recent estimates cached for 1 minute
    placeholderData: (previousData) => previousData, // Keep previous data while loading new
  })
}

// Fetch reverse estimate
async function fetchEstimateReverse(from: string, to: string, amount: number): Promise<NanswapEstimate> {
  const params = new URLSearchParams({ from, to, amount: amount.toString() })
  const response = await fetch(`/api/nanswap/estimate-reverse?${params}`)
  if (!response.ok) throw new Error("Failed to fetch reverse estimate")
  return response.json()
}

export function useNanswapEstimateReverse(from: string, to: string, amount: number, enabled = true) {
  return useQuery({
    queryKey: ["nanswap-estimate-reverse", from, to, amount],
    queryFn: () => fetchEstimateReverse(from, to, amount),
    enabled: enabled && !!from && !!to && amount > 0,
    // staleTime: 1000 * 30, // 30 seconds (default 0)
  })
}

// Fetch limits
async function fetchLimits(from: string, to: string): Promise<NanswapLimits> {
  const params = new URLSearchParams({ from, to })
  const response = await fetch(`/api/nanswap/limits?${params}`)
  if (!response.ok) throw new Error("Failed to fetch limits")
  return response.json()
}

export function useNanswapLimits(from: string, to: string) {
  return useQuery({
    queryKey: ["nanswap-limits", from, to],
    queryFn: () => fetchLimits(from, to),
    enabled: !!from && !!to,
    staleTime: 1000 * 60 * 10, // 10 minutes - limits don't change often
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  })
}

// Create order
async function createOrder(orderData: NanswapCreateOrderRequest): Promise<NanswapOrder> {
  const response = await fetch("/api/nanswap/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create order")
  }
  return response.json()
}

export function useCreateNanswapOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      // Prefetch the order status
      queryClient.setQueryData(["nanswap-order", order.id], order)
    },
  })
}

// Fetch order status
async function fetchOrder(id: string): Promise<NanswapOrder> {
  const params = new URLSearchParams({ id })
  const response = await fetch(`/api/nanswap/order?${params}`)
  if (!response.ok) throw new Error("Failed to fetch order")
  return response.json()
}

export function useNanswapOrder(id: string | null, refetchInterval?: number) {
  return useQuery({
    queryKey: ["nanswap-order", id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
    refetchInterval: refetchInterval,
  })
}
