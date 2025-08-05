import { db, User } from './database';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

class AuthService {
  private currentSession: AuthSession | null = null;
  private listeners: ((session: AuthSession | null) => void)[] = [];

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    const sessionData = localStorage.getItem('auth_session');
    if (sessionData) {
      try {
        this.currentSession = JSON.parse(sessionData);
      } catch (error) {
        localStorage.removeItem('auth_session');
      }
    }
  }

  private saveSession(session: AuthSession | null) {
    if (session) {
      localStorage.setItem('auth_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('auth_session');
    }
    this.currentSession = session;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentSession));
  }

  async signIn(email: string, password: string): Promise<{ user?: AuthUser; error?: string }> {
    try {
      await db.init();
      const user = await db.verifyPassword(email, password);
      
      if (!user) {
        return { error: 'Invalid email or password' };
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      const session: AuthSession = {
        user: authUser,
        token: `token-${Date.now()}`
      };

      this.saveSession(session);
      return { user: authUser };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  }

  async signUp(email: string, password: string): Promise<{ user?: AuthUser; error?: string }> {
    try {
      await db.init();
      const newUser = await db.createUser(email, password);
      
      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      };

      const session: AuthSession = {
        user: authUser,
        token: `token-${Date.now()}`
      };

      this.saveSession(session);
      return { user: authUser };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign up failed' };
    }
  }

  async signOut(): Promise<void> {
    this.saveSession(null);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentSession?.user || null;
  }

  getSession(): AuthSession | null {
    return this.currentSession;
  }

  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
    this.listeners.push(callback);
    // Call immediately with current state
    callback(this.currentSession);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

export const auth = new AuthService();