
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sofa, User, Lock } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      router.push('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#0a192f] to-[#1e3a8a] p-4 text-white">
      <Card className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg animate-fade-in-down">
        <CardContent className="p-0">
          <div className="mb-8 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-400/50 bg-cyan-400/10">
              <Sofa className="h-12 w-12 text-cyan-400" />
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-lg border-none bg-blue-900/50 py-3 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border-none bg-blue-900/50 py-3 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400"
              />
            </div>
             <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" className="border-gray-400 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400"/>
                <Label htmlFor="remember" className="cursor-pointer text-gray-300">Remember me</Label>
              </div>
              <a href="#" className="text-gray-300 hover:text-cyan-400">Forgot Password?</a>
            </div>
            {error && <p className="text-center text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full rounded-lg bg-cyan-500 py-3 text-base font-bold text-white transition-all hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/50">
              LOGIN
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
