
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sofa, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import AnimatedShapes from '@/components/hotel-vista/animated-shapes';
import { useToast } from '@/hooks/use-toast';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase/provider';

const roleRedirects: { [key: string]: string } = {
  admin: '/dashboard',
  reception: '/room-management',
  restaurant: '/restaurant',
  bar: '/bar-liquor',
  default: '/dashboard',
};

export default function LoginPage() {
  const [email, setEmail] = useState('hotel@gmail.com');
  const [password, setPassword] = useState('hotel@123');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!auth) {
        setError("Firebase not initialized");
        return;
    }

    setIsPending(true);
    setError('');

    initiateEmailSignIn(auth, email, password, (user, idTokenResult) => {
        setIsPending(false);
        if (user) {
          const claims = idTokenResult?.claims;
          const userRole = claims?.role || 'default';
          
          if (typeof window !== 'undefined') {
              localStorage.setItem('userRole', userRole as string);
              localStorage.setItem('activeUser', user.email || 'Unknown');
          }
          
          toast({
            title: 'Login Successful',
            description: `Welcome, ${user.email}!`,
          });
          
          router.push(roleRedirects[userRole as string] || roleRedirects.default);
        }
    }, (errorMessage) => {
        setIsPending(false);
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: errorMessage,
        });
    });
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-r from-blue-900 to-cyan-500 p-4 overflow-hidden">
      <AnimatedShapes />
      <Card className="w-full max-w-sm rounded-2xl border bg-white/50 p-8 shadow-2xl backdrop-blur-md animate-fade-in-down z-10">
        <CardHeader className="p-0 mb-8 items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/10 mb-4">
              <Sofa className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">Hotel Vista</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border-gray-300 bg-white/80 py-3 pl-10 text-black placeholder-gray-500 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border-gray-300 bg-white/80 py-3 pl-10 pr-10 text-black placeholder-gray-500 focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full rounded-lg bg-primary py-3 text-base font-bold text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/50" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              LOGIN
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
