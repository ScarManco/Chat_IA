import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Radio } from 'lucide-react';
import toast from 'react-hot-toast';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  useEffect(() => {
    const emailFilled = email.length > 0;
    const passwordFilled = password.length > 0;
    const progress = ((emailFilled ? 1 : 0) + (passwordFilled ? 1 : 0)) * 50;
    setFormProgress(progress);
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        toast.success('Check your email to confirm your account');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Successfully logged in');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const getBorderStyle = () => {
    return {
      background: `linear-gradient(to right, rgb(147, 51, 234) ${formProgress}%, transparent ${formProgress}%)`,
      padding: '2px',
      borderRadius: '1rem',
      transition: 'all 0.3s ease',
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div style={getBorderStyle()}>
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl p-10">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <Radio className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-center text-2xl font-bold text-purple-900 mb-2">
              RFID Inventory Control
            </h2>
          </div>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-base font-medium text-purple-700 mb-2">
                  Email
                </Label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border border-purple-200 placeholder-purple-400 text-purple-900 rounded-lg focus:outline-none focus:border-purple-500 text-base bg-white/80"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="block text-base font-medium text-purple-700 mb-2">
                  Contraseña
                </Label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 border border-purple-200 placeholder-purple-400 text-purple-900 rounded-lg focus:outline-none focus:border-purple-500 text-base bg-white/80"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:border-purple-700 transition-colors duration-200 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-600 hover:text-purple-500 text-base"
              >
                {isSignUp ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}