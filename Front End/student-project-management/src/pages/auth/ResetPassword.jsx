import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">Set New Password</h2>
        <p className="text-xs text-gray-500 mt-1">Please enter a strong new password for your account</p>
      </div>

      {success ? (
        <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-gray-900">Password Reset Successful!</h4>
          <p className="text-xs text-gray-600 mt-1">Redirecting to login page...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={error}
            required
          />
          <Button type="submit" variant="primary" className="w-full py-2.5">
            Update Password
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};
