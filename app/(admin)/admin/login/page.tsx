'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication
    if (email === 'admin@hautique.com' && password === 'admin123') {
      localStorage.setItem('admin_auth', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold tracking-tighter mb-2">HAUTIQUE</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Admin Portal</p>
        </div>

        <Card className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold">Email Address</label>
              <Input
                type="email"
                placeholder="admin@hautique.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
              Authorized Personnel Only
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
