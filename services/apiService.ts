import { Fabric, Settings, Customer, Order, OrderItem, NewOrderItem, OrderSummary, FullOrderDetails, TailoringItem } from '../types';

// Helper function to handle API requests
const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      // Try to get a meaningful error from the response body
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore if the response is not JSON
      }
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`API request failed for URL: ${url}`, error);
    // Re-throw the error to be caught by the calling function
    throw error;
  }
};


export const apiService = {
  getSettings: (): Promise<Settings> => {
    return apiRequest<Settings>('/api.php?action=get_settings');
  },
  
  updateSettings: (newSettings: Settings): Promise<{ success: true }> => {
    return apiRequest<{ success: true }>('/api.php?action=update_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
  },
  
  getFabrics: (): Promise<Fabric[]> => {
    return apiRequest<Fabric[]>('/api.php?action=get_fabrics');
  },
  
  updateFabricPrice: (fabricId: number, newPrice: number): Promise<{ success: true } | { success: false, error: string }> => {
    return apiRequest<{ success: true } | { success: false, error:string }>('/api.php?action=update_fabric_price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fabric_id: fabricId, new_price: newPrice }),
    });
  },
  
  addOrder: async (orderData: { customer: Omit<Customer, 'id'>, items: NewOrderItem[] }): Promise<{ success: true, order_id: number } | { success: false, error: string }> => {
    return apiRequest<{ success: true, order_id: number } | { success: false, error:string }>('/api.php?action=add_order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
  },
  
  getOrders: (): Promise<OrderSummary[]> => {
    return apiRequest<OrderSummary[]>('/api.php?action=get_orders');
  },
  
  getOrderSummary: (orderId: number): Promise<FullOrderDetails | { error: string }> => {
    return apiRequest<FullOrderDetails | { error: string }>(`/api.php?action=get_order_summary&id=${orderId}`);
  },
  
  getTailoringDetails: (orderId: number): Promise<TailoringItem[] | { error: string }> => {
    return apiRequest<TailoringItem[] | { error: string }>(`/api.php?action=get_tailoring_details&id=${orderId}`);
  }
};
