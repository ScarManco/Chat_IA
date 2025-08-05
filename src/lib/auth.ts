import { database, User } from './database';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private currentUser: User | null = null;
  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    // Check for stored session
    const storedUser = localStorage.getItem('rfid_user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (error) {
        localStorage.removeItem('rfid_user');
      }
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const user = database.authenticateUser(email, password);
      if (user) {
        this.currentUser = user;
        localStorage.setItem('rfid_user', JSON.stringify(user));
        this.notifyListeners();
        return { user, error: null };
      } else {
        return { user: null, error: 'Invalid email or password' };
      }
    } catch (error) {
      return { user: null, error: 'Authentication failed' };
    }
  }

  async signUp(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const user = database.createUser(email, password);
      this.currentUser = user;
      localStorage.setItem('rfid_user', JSON.stringify(user));
      this.notifyListeners();
      return { user, error: null };
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return { user: null, error: 'User with this email already exists' };
      }
      return { user: null, error: 'Registration failed' };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    this.currentUser = null;
    localStorage.removeItem('rfid_user');
    this.notifyListeners();
    return { error: null };
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  onAuthStateChange(callback: (state: AuthState) => void): () => void {
    this.listeners.push(callback);
    // Call immediately with current state
    callback({
      user: this.currentUser,
      isAuthenticated: this.isAuthenticated()
    });
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    const state: AuthState = {
      user: this.currentUser,
      isAuthenticated: this.isAuthenticated()
    };
    this.listeners.forEach(listener => listener(state));
  }
}

export const auth = new AuthManager();