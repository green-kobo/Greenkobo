import { useState, type FormEvent } from 'react';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { inputClass, labelClass, primaryButtonClass } from '@/lib/styles';

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);

  const isSignUp = mode === 'signup';

  const resetAndClose = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setCreated(false);
    setMode('signin');
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = isSignUp ? await signUp(email.trim(), password) : await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (isSignUp) {
      setCreated(true);
      return;
    }
    resetAndClose();
  };

  return (
    <Modal open={open} title={isSignUp ? 'Create your account' : 'Welcome back'} onClose={resetAndClose}>
      {created ? (
        <div className="space-y-4 text-center">
          <p className="rounded-2xl bg-brand-50 p-4 text-sm font-medium text-brand-800">
            Your GreenKobo account is ready. You can now track your kobo and cash-outs.
          </p>
          <button type="button" onClick={resetAndClose} className={`${primaryButtonClass} w-full`}>
            Continue
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className={labelClass}>
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="auth-password" className={labelClass}>
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full`}>
            {submitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Login'}
          </button>

          <p className="text-center text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : 'New to GreenKobo?'}{' '}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode(isSignUp ? 'signin' : 'signup');
              }}
              className="font-bold text-brand-700 hover:underline"
            >
              {isSignUp ? 'Login' : 'Create an account'}
            </button>
          </p>
        </form>
      )}
    </Modal>
  );
}
