import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ✅ Password Strength Component
const PasswordStrength = ({ password }: { password: string }) => {
  if (!password || password.length === 0) {
    return null;
  }

  const getStrength = () => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();

  const getStrengthConfig = () => {
    switch (strength) {
      case 1:
        return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
      case 2:
        return { label: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-500' };
      case 3:
        return { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
      case 4:
        return { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-500' };
      case 5:
        return { label: 'Very Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
      default:
        return { label: '', color: 'bg-muted', textColor: 'text-muted-foreground' };
    }
  };

  const config = getStrengthConfig();

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-all ${level <= strength ? config.color : 'bg-muted'
              }`}
          />
        ))}
      </div>
      {config.label && (
        <p className={`text-xs font-medium ${config.textColor}`}>
          {config.label}
        </p>
      )}
    </div>
  );
};

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const api = useApi();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // ✅ Direct API call to signup endpoint
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      if (response.data.success) {
        toast({
          title: 'Account created! 🎉',
          description: 'Welcome to ATELIER. Please sign in to continue.',
        });
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup failed',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
              <h1 className="text-3xl font-semibold text-foreground mb-2">Create Account</h1>
              <p className="text-muted-foreground">Join ATELIER for exclusive access</p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Email */}
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

                {/* Password with Strength Indicator */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="new-password"
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
                  <PasswordStrength password={password} />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-1"
                    >
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-500">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-red-500">Passwords don't match</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || password !== confirmPassword || password.length < 6}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                      />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Signup;
