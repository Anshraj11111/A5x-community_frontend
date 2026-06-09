import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminStore } from '@/store/adminStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Only founder & co_founder can use this portal
const FOUNDER_ROLES = new Set(['founder', 'co_founder', 'admin']);

export default function FounderLoginPage() {
  const navigate = useNavigate();
  const { setAdminAuth, clearAdminAuth } = useAdminStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });

      const { user, token } = data.data;

      if (!FOUNDER_ROLES.has(user.role)) {
        setError('Access denied. This portal is for founders and admins only.');
        setIsLoading(false);
        return;
      }

      clearAdminAuth();
      localStorage.setItem('token', token);

      setAdminAuth(
        {
          _id:         user._id,
          name:        user.displayName,
          email:       user.email,
          role:        user.role,
          avatar:      user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
          lastLogin:   new Date().toISOString(),
          permissions: ['*'],
        },
        token
      );

      // Redirect to admin founders desk
      navigate('/admin/founders', { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Invalid email or password';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* subtle grid bg */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00FF88] to-emerald-400 shadow-[0_0_30px_rgba(0,255,136,0.3)]">
              <Zap className="h-7 w-7 text-black" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Founder's Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">A5X Community · Founders Only</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="founder@a5x.in"
                value={form.email}
                onChange={handleChange('email')}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange('password')}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-[#00FF88] text-black hover:bg-[#00FF88]/90" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Enter Founder Portal'}
            </Button>
          </form>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Restricted to accounts with <span className="font-mono font-bold text-[#00FF88]">founder</span> or <span className="font-mono font-bold text-[#00FF88]">admin</span> role</span>
          </div>
        </div>
      </div>
    </div>
  );
}
