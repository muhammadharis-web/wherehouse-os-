export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
export type ShipmentStatus = "label_created" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "failed" | "returned_to_sender";
export type SLATier = "same-day" | "next-day" | "2-day" | "3-day" | "standard";
export type AgentType = "routing" | "monitor" | "rerouting" | "communication" | "prediction" | "cost_optimizer" | "orchestrator";
export type EventType = "order_placed" | "shipment_created" | "shipment_routed" | "delay_detected" | "reroute_initiated" | "notification_sent" | "delivery_prediction" | "cost_analysis";
export type NotificationChannel = "email" | "sms" | "push";
export type NotificationType = "shipped" | "out_for_delivery" | "delayed" | "rerouted" | "delivered";

export interface OrderItem {
  sku: string;
  qty: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  customer_id: string;
  items: OrderItem[];
  shipping_address: Address;
  sla_tier: SLATier;
  promised_delivery: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  fulfillment_center_id: string;
  carrier: string;
  service: string;
  tracking_number: string;
  status: ShipmentStatus;
  estimated_delivery: string;
  actual_delivery?: string;
  routing_cost: number;
  risk_score?: number;
  created_at: string;
  updated_at: string;
}

export interface FulfillmentCenter {
  id: string;
  name: string;
  location: Address;
  capacity: number;
  stock: Record<string, number>;
}

export interface CarrierRate {
  carrier: string;
  service: string;
  rate: number;
  sla_hours: number;
}

export interface AgentEvent {
  id: string;
  event_type: EventType;
  agent_type: AgentType;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
  timestamp: string;
}

export interface Notification {
  id: string;
  shipment_id: string;
  channel: NotificationChannel;
  type: NotificationType;
  sent_at: string;
  delivered: boolean;
}

export interface KPIResponse {
  on_time_delivery_rate: number;
  wismo_ticket_rate: number;
  proactive_detection_rate: number;
  carrier_rate_savings_pct: number;
  failed_delivery_rate: number;
  avg_routing_latency_ms: number;
  rerouting_success_rate: number;
}

export interface CarrierPerformance {
  carrier: string;
  on_time_pct: number;
  total_shipments: number;
  avg_cost: number;
  avg_delivery_hours: number;
}

export interface WebhookOrderPlacedPayload {
  order_id: string;
  customer_id: string;
  items: OrderItem[];
  shipping_address: Address;
  sla_tier: SLATier;
  promised_delivery: string;
}

export interface WebhookResponse {
  job_id: string;
  status: "processing";
  message: string;
}

export interface WSShipmentEvent {
  event: string;
  order_id: string;
  shipment_id?: string;
  data: Record<string, unknown>;
}
