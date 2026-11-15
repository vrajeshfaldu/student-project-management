import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">Reset Your Password</h2>
        <p className="text-xs text-gray-500 mt-1">
          Enter your registered email address to receive reset instructions
        </p>
      </div>

      {submitted ? (
        <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-gray-900">Check Your Email</h4>
          <p className="text-xs text-gray-600 mt-1">
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <Link
            to="/reset-password"
            className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
          >
            Proceed to Set New Password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="student@spm.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full py-2.5">
            Send Reset Link
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
