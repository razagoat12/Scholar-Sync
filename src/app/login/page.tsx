'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with that email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled for this project yet.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function LoginPage() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signIn') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push('/browse');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8">
        <h1 className="font-display text-3xl font-semibold text-ink mb-1 text-center">
          {mode === 'signIn' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm text-muted text-center mb-8">
          {mode === 'signIn'
            ? 'Sign in to view your saved scholarships'
            : 'Save scholarships and track deadlines'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink mb-1.5">
              <Mail className="w-4 h-4" strokeWidth={2} />
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-lime text-ink placeholder-muted"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink mb-1.5">
              <Lock className="w-4 h-4" strokeWidth={2} />
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-lime text-ink placeholder-muted"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-danger font-medium">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl bg-lime hover:bg-lime-400 text-base transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />}
            {submitting ? 'Please wait...' : mode === 'signIn' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-muted text-center mt-6">
          {mode === 'signIn' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'signIn' ? 'signUp' : 'signIn');
              setError(null);
            }}
            className="font-semibold text-lime hover:underline cursor-pointer"
          >
            {mode === 'signIn' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  );
}
