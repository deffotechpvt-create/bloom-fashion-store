import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/profile');
    } else {
      toast({
        title: 'Login failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your account to continue</p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {/* ✅ FIXED: Label and Forgot Password in correct position */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                      />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                {/* Sign Up */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary hover:underline font-medium">
                      Create one
                    </Link>
                  </p>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Trouble Signing In?</span>
                  </div>
                </div>

                {/* Forgot Password Button */}
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="w-full group flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border hover:border-primary/50 transition-all"
                >
                  <Lock className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Forgot Password?</span>{' '}
                    <span className="text-primary font-medium">Reset it instantly</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* ✅ Forgot Password Dialog */}
      <ForgotPasswordDialog
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default Login;
