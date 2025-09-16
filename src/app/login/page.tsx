
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BedDouble, LogIn } from 'lucide-react';

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
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <Card className="w-full max-w-md animate-fade-in-down shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 animate-pulse">
            <BedDouble className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight text-primary">
            Hotel Vista
          </CardTitle>
          <CardDescription className="text-lg">
            Welcome back. Please sign in to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-105"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-105"
              />
            </div>
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full text-lg transition-transform duration-300 hover:scale-105">
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
