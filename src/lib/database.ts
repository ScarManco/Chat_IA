import localforage from 'localforage';
import bcrypt from 'bcryptjs';

// Configure localforage
localforage.config({
  name: 'RFIDInventoryDB',
  version: 1.0,
  storeName: 'rfid_data'
});

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Antenna {
  id: string;
  location_id: string;
  name: string;
  ip_address: string;
  port: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Sensor {
  id: string;
  antenna_id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Reading {
  id: string;
  sensor_id: string;
  tag_id: string;
  timestamp: string;
  signal_strength: number;
  data: any;
}

class LocalDatabase {
  private initialized = false;

  async init() {
    if (this.initialized) return;

    // Initialize with default admin user if no users exist
    const users = await this.getUsers();
    if (users.length === 0) {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@rfid.com',
        password_hash: await bcrypt.hash('admin123', 10),
        role: 'admin',
        created_at: new Date().toISOString()
      };
      await localforage.setItem('users', [adminUser]);
    }

    this.initialized = true;
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return (await localforage.getItem('users')) || [];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  async createUser(email: string, password: string, role: 'admin' | 'user' = 'user'): Promise<User> {
    const users = await this.getUsers();
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password_hash: await bcrypt.hash(password, 10),
      role,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    await localforage.setItem('users', users);
    return newUser;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? user : null;
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    return (await localforage.getItem('locations')) || [];
  }

  async createLocation(name: string, description: string): Promise<Location> {
    const locations = await this.getLocations();
    const newLocation: Location = {
      id: `location-${Date.now()}`,
      name,
      description,
      created_at: new Date().toISOString()
    };

    locations.push(newLocation);
    await localforage.setItem('locations', locations);
    return newLocation;
  }

  async updateLocation(id: string, updates: Partial<Omit<Location, 'id' | 'created_at'>>): Promise<Location> {
    const locations = await this.getLocations();
    const index = locations.findIndex(loc => loc.id === id);
    
    if (index === -1) {
      throw new Error('Location not found');
    }

    locations[index] = { ...locations[index], ...updates };
    await localforage.setItem('locations', locations);
    return locations[index];
  }

  async deleteLocation(id: string): Promise<void> {
    const locations = await this.getLocations();
    const filteredLocations = locations.filter(loc => loc.id !== id);
    await localforage.setItem('locations', filteredLocations);
  }

  // Antenna methods
  async getAntennas(): Promise<Antenna[]> {
    return (await localforage.getItem('antennas')) || [];
  }

  async getAntennasByLocation(locationId: string): Promise<Antenna[]> {
    const antennas = await this.getAntennas();
    return antennas.filter(antenna => antenna.location_id === locationId);
  }

  async createAntenna(locationId: string, name: string, ipAddress: string, port: number): Promise<Antenna> {
    const antennas = await this.getAntennas();
    const newAntenna: Antenna = {
      id: `antenna-${Date.now()}`,
      location_id: locationId,
      name,
      ip_address: ipAddress,
      port,
      status: 'active',
      created_at: new Date().toISOString()
    };

    antennas.push(newAntenna);
    await localforage.setItem('antennas', antennas);
    return newAntenna;
  }

  // Sensor methods
  async getSensors(): Promise<Sensor[]> {
    return (await localforage.getItem('sensors')) || [];
  }

  async getSensorsByAntenna(antennaId: string): Promise<Sensor[]> {
    const sensors = await this.getSensors();
    return sensors.filter(sensor => sensor.antenna_id === antennaId);
  }

  async createSensor(antennaId: string, name: string, type: string): Promise<Sensor> {
    const sensors = await this.getSensors();
    const newSensor: Sensor = {
      id: `sensor-${Date.now()}`,
      antenna_id: antennaId,
      name,
      type,
      status: 'active',
      created_at: new Date().toISOString()
    };

    sensors.push(newSensor);
    await localforage.setItem('sensors', sensors);
    return newSensor;
  }

  // Reading methods
  async getReadings(): Promise<Reading[]> {
    return (await localforage.getItem('readings')) || [];
  }

  async getReadingsBySensor(sensorId: string): Promise<Reading[]> {
    const readings = await this.getReadings();
    return readings.filter(reading => reading.sensor_id === sensorId);
  }

  async createReading(sensorId: string, tagId: string, signalStrength: number, data: any): Promise<Reading> {
    const readings = await this.getReadings();
    const newReading: Reading = {
      id: `reading-${Date.now()}`,
      sensor_id: sensorId,
      tag_id: tagId,
      timestamp: new Date().toISOString(),
      signal_strength: signalStrength,
      data
    };

    readings.push(newReading);
    await localforage.setItem('readings', readings);
    return newReading;
  }

  async saveReadings(readings: Reading[]): Promise<void> {
    await localforage.setItem('readings', readings);
  }

  async updateAntenna(id: string, updates: Partial<Omit<Antenna, 'id' | 'created_at'>>): Promise<Antenna> {
    const antennas = await this.getAntennas();
    const index = antennas.findIndex(antenna => antenna.id === id);
    
    if (index === -1) {
      throw new Error('Antenna not found');
    }

    antennas[index] = { ...antennas[index], ...updates };
    await localforage.setItem('antennas', antennas);
    return antennas[index];
  }

  async deleteAntenna(id: string): Promise<void> {
    const antennas = await this.getAntennas();
    const filteredAntennas = antennas.filter(antenna => antenna.id !== id);
    await localforage.setItem('antennas', filteredAntennas);
  }

  async updateSensor(id: string, updates: Partial<Omit<Sensor, 'id' | 'created_at'>>): Promise<Sensor> {
    const sensors = await this.getSensors();
    const index = sensors.findIndex(sensor => sensor.id === id);
    
    if (index === -1) {
      throw new Error('Sensor not found');
    }

    sensors[index] = { ...sensors[index], ...updates };
    await localforage.setItem('sensors', sensors);
    return sensors[index];
  }

  async deleteSensor(id: string): Promise<void> {
    const sensors = await this.getSensors();
    const filteredSensors = sensors.filter(sensor => sensor.id !== id);
    await localforage.setItem('sensors', filteredSensors);
  }
}

export const db = new LocalDatabase();