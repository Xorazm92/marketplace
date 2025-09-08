import apiClient from '../lib/api-client';
import type { EventType } from '../types/product';

export interface EventTypeResponse {
  event_types: EventType[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class EventTypeAPI {
  private client = apiClient;

  async getAllEventTypes(): Promise<EventType[]> {
    try {
      const response = await this.client.get<EventTypeResponse>('/event-types');
      return response.event_types || [];
    } catch (error) {
      console.error('Error fetching event types:', error);
      throw error;
    }
  }

  async getEventTypeById(id: number): Promise<EventType> {
    try {
      const response = await this.client.get<EventType>(`/event-types/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching event type:', error);
      throw error;
    }
  }

  async createEventType(data: Omit<EventType, 'id'>): Promise<EventType> {
    try {
      const response = await this.client.post<EventType>('/event-types', data);
      return response;
    } catch (error) {
      console.error('Error creating event type:', error);
      throw error;
    }
  }

  async updateEventType(id: number, data: Partial<EventType>): Promise<EventType> {
    try {
      const response = await this.client.put<EventType>(`/event-types/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating event type:', error);
      throw error;
    }
  }

  async deleteEventType(id: number): Promise<void> {
    try {
      await this.client.delete(`/event-types/${id}`);
    } catch (error) {
      console.error('Error deleting event type:', error);
      throw error;
    }
  }
}

export const eventTypeAPI = new EventTypeAPI();
export default eventTypeAPI;
