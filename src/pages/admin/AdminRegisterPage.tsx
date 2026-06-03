import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminStore } from '@/store/adminStore';
import { ADMIN_ACCESS_CODE } from '@/lib/adminConstants';
import { cn } from '@/lib/utils';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const { setAdminAuth } = useAdminStore();

  const [step, setStep] = useState<'code' | 'details'>('code');
  const [form, setForm] = useState({
    accessCode: '',
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setError('');
  };

  // Step 1 — Verify access code (client-side gate)
  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));

    if (form.accessCode !== ADMIN_ACCESS_CODE) {
      setError('Invalid admin access code. Registration is restricted.');
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    setStep('details');
  };

  // Step 2 — Register via real backend, then log in
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.displayName.trim().length < 2) { setError('Display name must be at least 2 characters.'); return; }
    if (form.username.trim().length < 3)    { setError('Username must be at least 3 characters.'); return; }
    if (!form.email.includes('@'))           { setError('Enter a valid email address.'); return; }
    if (form.password.length < 8)           { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }

    setIsLoading(true);
    try {
      // Register the account
      await axios.post(`${API_URL}/auth/register`, {
        displayName: form.displayName.trim(),
        username:    form.username.trim().toLowerCase(),
        email:       form.email.toLowerCase().trim(),
        password:    form.password,
      });

      // Auto-login after registration
      const { data: loginData } = await axios.post(`${API_URL}/auth/login`, {
        email:    form.email.toLowerCase().trim(),
        password: form.password,
      });

      const { user, token } = loginData.data;

      // Confirm the registered account has an admin/moderator role
      // (In most cases a fresh account won't be admin yet — admin must set role in DB)
      const adminUser = {
        _id:         user._id,
        name:        user.displayName,
        email:       user.email,
        role:        (user.role === 'admin' || user.role === 'moderator') ? user.role : 'moderator' as const,
        avatar:      user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        lastLogin:   new Date().toISOString(),
        permissions: user.role === 'admin' ? ['*'] : ['content', 'reports'],
      };

      localStorage.setItem('token', token);
      setAdminAuth(adminUser, token);
      setSuccess(true);
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground">Account Created</h2>
          <p className="text-sm text-muted-foreground">Redirecting to Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00FF88] to-emerald-400 shadow-[0_0_30px_rgba(0,255,136,0.3)]">
              <Shield className="h-7 w-7 text-black" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Admin Account</h1>
          <p className="text-sm text-muted-foreground mt-1">A5X Community · Restricted Registration</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['Access Code', 'Account Details'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0',
                (i === 0 && step === 'code') || (i === 1 && step === 'details')
                  ? 'bg-primary text-black'
                  : i === 0 && step === 'details'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground'
              )}>
                {i === 0 && step === 'details' ? '✓' : i + 1}
              </div>
              <span className={cn('text-xs font-medium',
                step === (i === 0 ? 'code' : 'details') ? 'text-foreground' : 'text-muted-foreground')}>
                {label}
              </span>
              {i === 0 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">

          {/* ── STEP 1: Access Code ── */}
          {step === 'code' && (
            <form onSubmit={handleCodeVerify} className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-sm font-medium text-foreground">Enter Admin Access Code</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Admin registration requires a valid access code.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Access Code</label>
                <div className="relative">
                  <Input
                    type={showCode ? 'text' : 'password'}
                    placeholder="Enter access code"
                    value={form.accessCode}
                    onChange={set('accessCode')}
                    required
                    autoFocus
                    className="pr-10 text-center tracking-widest font-mono text-lg"
                  />
                  <button type="button" onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>
          )}

          {/* ── STEP 2: Account Details ── */}
          {step === 'details' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  placeholder="Your full name"
                  value={form.displayName}
                  onChange={set('displayName')}
                  required minLength={2}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Username</label>
                <Input
                  placeholder="username (no spaces)"
                  value={form.username}
                  onChange={set('username')}
                  required minLength={3}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="admin@a5x.community"
                  value={form.email}
                  onChange={set('email')}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={set('password')}
                    required minLength={8}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={cn('h-1 flex-1 rounded-full transition-all',
                        form.password.length >= i * 2
                          ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-yellow-400' : i <= 3 ? 'bg-blue-400' : 'bg-primary'
                          : 'bg-secondary'
                      )} />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    required
                    className={cn('pr-10',
                      form.confirmPassword && form.password !== form.confirmPassword && 'border-destructive/50'
                    )}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              <button type="button" onClick={() => { setStep('code'); setError(''); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← Back to access code
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            After registration, an existing admin must set your role to{' '}
            <span className="font-mono text-primary">admin</span> in MongoDB.
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link to="/admin/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
