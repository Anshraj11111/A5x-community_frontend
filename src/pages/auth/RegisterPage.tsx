import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { useToast } from '@/store/uiStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { success, error } = useToast();
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === 'username'
      ? e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
      : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { error('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    try {
      const { user, token } = await authService.register(form.email, form.password, form.username, form.displayName);
      setAuth(user, token);
      success('Welcome to A5X Community!');
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Registration failed';
      error(msg);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Join A5X Community</h1>
          <p className="mt-2 text-sm text-muted-foreground">Be part of the A5X product ecosystem</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Display Name</label>
            <Input placeholder="Your name" value={form.displayName} onChange={set('displayName')} required minLength={2} maxLength={50} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <Input placeholder="yourhandle" value={form.username} onChange={set('username')} required minLength={3} maxLength={30} className="pl-7" />
            </div>
            <p className="text-xs text-muted-foreground">Lowercase letters, numbers, _ and - only</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
            <Input placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} className="pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
