
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
import AnimatedShapes from '@/components/hotel-vista/animated-shapes';

const users = [
  { username: 'admin', password: 'admin', role: 'admin', redirect: '/' },
  { username: 'staff', password: 'staff', role: 'reception', redirect: '/room-management' },
  { username: 'hotel', password: 'hotel', role: 'restaurant', redirect: '/restaurant' },
  { username: 'bar', password: 'bar', role: 'bar', redirect: '/bar-liquor' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', user.role);
      }
      router.push(user.redirect);
    } else {
      setError('Invalid username or password');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userRole');
      }
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-r from-blue-900 to-cyan-500 p-4 overflow-hidden">
      <AnimatedShapes />
      <Card className="w-full max-w-sm rounded-2xl border bg-white/50 p-8 shadow-2xl backdrop-blur-md animate-fade-in-down z-10">
        <CardContent className="p-0">
          <div className="mb-8 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/10">
              <Sofa className="h-12 w-12 text-primary" />
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
                className="w-full rounded-lg border-gray-300 bg-white/80 py-3 pl-10 text-black placeholder-gray-500 focus:ring-2 focus:ring-primary"
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
                className="w-full rounded-lg border-gray-300 bg-white/80 py-3 pl-10 text-black placeholder-gray-500 focus:ring-2 focus:ring-primary"
              />
            </div>
             <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" className="border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"/>
                <Label htmlFor="remember" className="cursor-pointer text-gray-700">Remember me</Label>
              </div>
              <a href="#" className="text-gray-700 hover:text-primary">Forgot Password?</a>
            </div>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full rounded-lg bg-primary py-3 text-base font-bold text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/50">
              LOGIN
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
