import Database from 'better-sqlite3';

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
  password_hash: string;
  created_at: string;
}

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    this.db = new Database('rfid_system.db');
    this.initializeTables();
  }

  private initializeTables() {
    // Create users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create locations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        map_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create antennas table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS antennas (
        id TEXT PRIMARY KEY,
        location_id TEXT NOT NULL,
        name TEXT NOT NULL,
        position_x REAL NOT NULL,
        position_y REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE
      )
    `);

    // Create sensors table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sensors (
        id TEXT PRIMARY KEY,
        location_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        position_x REAL NOT NULL,
        position_y REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE
      )
    `);

    // Create readings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS readings (
        id TEXT PRIMARY KEY,
        antenna_id TEXT NOT NULL,
        sensor_id TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (antenna_id) REFERENCES antennas (id) ON DELETE CASCADE,
        FOREIGN KEY (sensor_id) REFERENCES sensors (id) ON DELETE CASCADE
      )
    `);

    // Create default admin user
    this.createDefaultUser();
  }

  private createDefaultUser() {
    const existingUser = this.db.prepare('SELECT id FROM users WHERE email = ?').get('admin@rfid.com');
    if (!existingUser) {
      const userId = this.generateId();
      this.db.prepare(`
        INSERT INTO users (id, email, password_hash)
        VALUES (?, ?, ?)
      `).run(userId, 'admin@rfid.com', 'admin123'); // In production, this should be properly hashed
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // User methods
  authenticateUser(email: string, password: string): User | null {
    const user = this.db.prepare('SELECT * FROM users WHERE email = ? AND password_hash = ?').get(email, password) as User;
    return user || null;
  }

  createUser(email: string, password: string): User {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password_hash)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, email, password);
    return { id, email, password_hash: password, created_at: new Date().toISOString() };
  }

  // Location methods
  getLocations(): Location[] {
    return this.db.prepare('SELECT * FROM locations ORDER BY created_at DESC').all() as Location[];
  }

  createLocation(name: string, mapUrl?: string): Location {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO locations (id, name, map_url)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, name, mapUrl || null);
    return { id, name, map_url: mapUrl, created_at: new Date().toISOString() };
  }

  deleteLocation(id: string): boolean {
    const result = this.db.prepare('DELETE FROM locations WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Antenna methods
  getAntennas(locationId?: string): Antenna[] {
    if (locationId) {
      return this.db.prepare('SELECT * FROM antennas WHERE location_id = ? ORDER BY created_at DESC').all(locationId) as Antenna[];
    }
    return this.db.prepare('SELECT * FROM antennas ORDER BY created_at DESC').all() as Antenna[];
  }

  createAntenna(locationId: string, name: string, positionX: number, positionY: number): Antenna {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO antennas (id, location_id, name, position_x, position_y)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, locationId, name, positionX, positionY);
    return { id, location_id: locationId, name, position_x: positionX, position_y: positionY, created_at: new Date().toISOString() };
  }

  // Sensor methods
  getSensors(locationId?: string): Sensor[] {
    if (locationId) {
      return this.db.prepare('SELECT * FROM sensors WHERE location_id = ? ORDER BY created_at DESC').all(locationId) as Sensor[];
    }
    return this.db.prepare('SELECT * FROM sensors ORDER BY created_at DESC').all() as Sensor[];
  }

  createSensor(locationId: string, name: string, type: string, positionX: number, positionY: number): Sensor {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO sensors (id, location_id, name, type, position_x, position_y)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, locationId, name, type, positionX, positionY);
    return { id, location_id: locationId, name, type, position_x: positionX, position_y: positionY, created_at: new Date().toISOString() };
  }

  // Reading methods
  getReadings(antennaId?: string, sensorId?: string): Reading[] {
    let query = 'SELECT * FROM readings';
    const params: string[] = [];
    
    if (antennaId && sensorId) {
      query += ' WHERE antenna_id = ? AND sensor_id = ?';
      params.push(antennaId, sensorId);
    } else if (antennaId) {
      query += ' WHERE antenna_id = ?';
      params.push(antennaId);
    } else if (sensorId) {
      query += ' WHERE sensor_id = ?';
      params.push(sensorId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const readings = this.db.prepare(query).all(...params) as Reading[];
    return readings.map(reading => ({
      ...reading,
      value: JSON.parse(reading.value as string)
    }));
  }

  createReading(antennaId: string, sensorId: string, value: any): Reading {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO readings (id, antenna_id, sensor_id, value)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, antennaId, sensorId, JSON.stringify(value));
    return { id, antenna_id: antennaId, sensor_id: sensorId, value, created_at: new Date().toISOString() };
  }

  close() {
    this.db.close();
  }
}

// Create singleton instance
export const database = new DatabaseManager();