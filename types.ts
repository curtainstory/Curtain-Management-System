
export enum Unit {
  CM = 'cm',
  METER = 'meter',
  INCH = 'inch',
  FEET = 'feet',
}

export interface Fabric {
  id: number;
  name: string;
  design_code: string;
  price_per_meter: number;
}

export interface Settings {
  stitching_price: number;
  extra_hem_cm: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  id: number;
  fabric_id: number;
  design_code: string;
  fabric_name: string;
  item_type: 'curtain' | 'other';
  length_cm: number;
  quantity: number;
  cost: number;
  fabric_used_m: number;
  order_id: number;
}

export type NewOrderItem = Omit<OrderItem, 'id' | 'order_id'>;

export interface Order {
  id: number;
  order_date: string;
  customer_id: number;
  total_cost: number;
}

export interface OrderSummary extends Order {
    customer_name: string;
}


export interface FullOrderDetails {
  order: Order;
  customer: Customer;
  items: OrderItem[];
}

export interface TailoringItem {
    design_code: string;
    length_cm: number;
    quantity: number;
}
