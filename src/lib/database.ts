import { supabase } from './supabase';

// Database interface types
export interface Location {
  id: string;
  name: string;
  map_url?: string;
  created_at: string;
}

export interface Antenna {
  id: string;
  location_id: string;
  name: string;
  position_x: number;
  position_y: number;
  created_at: string;
}

export interface Sensor {
  id: string;
  location_id: string;
  name: string;
  type: string;
  position_x: number;
  position_y: number;
  created_at: string;
}

export interface Reading {
  id: string;
  antenna_id: string;
  sensor_id: string;
  value: any;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

class DatabaseManager {
  // Location methods
  async getLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createLocation(name: string, mapUrl?: string): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert({ name, map_url: mapUrl })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteLocation(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Antenna methods
  async getAntennas(locationId?: string): Promise<Antenna[]> {
    let query = supabase
      .from('antennas')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createAntenna(locationId: string, name: string, positionX: number, positionY: number): Promise<Antenna> {
    const { data, error } = await supabase
      .from('antennas')
      .insert({
        location_id: locationId,
        name,
        position_x: positionX,
        position_y: positionY
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Sensor methods
  async getSensors(locationId?: string): Promise<Sensor[]> {
    let query = supabase
      .from('sensors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createSensor(locationId: string, name: string, type: string, positionX: number, positionY: number): Promise<Sensor> {
    const { data, error } = await supabase
      .from('sensors')
      .insert({
        location_id: locationId,
        name,
        type,
        position_x: positionX,
        position_y: positionY
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Reading methods
  async getReadings(antennaId?: string, sensorId?: string): Promise<Reading[]> {
    let query = supabase
      .from('readings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (antennaId && sensorId) {
      query = query.eq('antenna_id', antennaId).eq('sensor_id', sensorId);
    } else if (antennaId) {
      query = query.eq('antenna_id', antennaId);
    } else if (sensorId) {
      query = query.eq('sensor_id', sensorId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createReading(antennaId: string, sensorId: string, value: any): Promise<Reading> {
    const { data, error } = await supabase
      .from('readings')
      .insert({
        antenna_id: antennaId,
        sensor_id: sensorId,
        value
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Create singleton instance
export const database = new DatabaseManager();