import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, KeyRound, ArrowRight, Shield, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ForgotPasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'email' | 'otp' | 'success';

const OTPInput = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        onChange(otp.join(''));
    }, [otp, onChange]);

    useEffect(() => {
        if (value === '') {
            setOtp(['', '', '', '', '', '']);
        }
    }, [value]);

    const handleChange = (index: number, val: string) => {
        if (!/^\d*$/.test(val)) return;

        const newOtp = [...otp];
        newOtp[index] = val.slice(-1);
        setOtp(newOtp);

        if (val && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        const newOtp = [...otp];

        pastedData.forEach((char, i) => {
            if (/^\d$/.test(char) && i < 6) {
                newOtp[i] = char;
            }
        });

        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold bg-input text-foreground border-2 border-border rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    autoFocus={index === 0}
                />
            ))}
        </div>
    );
};



const PasswordStrength = ({ password }: { password: string }) => {
    // ✅ EARLY RETURN - Don't render anything if password is empty
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



// ✅ Main Component
const ForgotPasswordDialog = ({ isOpen, onClose }: ForgotPasswordDialogProps) => {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [forgetPassword, setForgetPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { forgotPassword, resetPassword } = useAuth();
    const { toast } = useToast();
    // Reset state when dialog closes
    const handleClose = () => {
        setStep('email');
        setEmail('');
        setOtp('');
        setForgetPassword('');
        setConfirmPassword('');
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    // Step 1: Send OTP to email
    const handleSendOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsLoading(true);

        const result = await forgotPassword(email);

        if (result.success) {
            toast({
                title: 'OTP Sent! 📧',
                description: 'Check your email for the verification code.',
            });
            setStep('otp');
        } else {
            toast({
                title: 'Failed to send OTP',
                description: result.error || 'Please try again.',
                variant: 'destructive',
            });
        }

        setIsLoading(false);
    };

    // Step 2: Verify OTP and reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate passwords match
        if (forgetPassword !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please make sure both passwords are the same.',
                variant: 'destructive',
            });
            return;
        }

        // Validate password length
        if (forgetPassword.length < 6) {
            toast({
                title: 'Password too short',
                description: 'Password must be at least 6 characters.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        const result = await resetPassword(email, otp, forgetPassword);

        if (result.success) {
            toast({
                title: 'Password Reset Successful! 🎉',
                description: 'You can now login with your new password.',
            });
            setStep('success');

            // Auto close after 2 seconds
            setTimeout(() => {
                handleClose();
            }, 2000);
        } else {
            toast({
                title: 'Reset Failed',
                description: result.error || 'Invalid or expired OTP.',
                variant: 'destructive',
            });
        }

        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Dialog */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-card rounded-2xl border border-border shadow-[var(--shadow-elevated)] w-full max-w-md overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary to-teal-glow p-6 relative">
                                <button
                                    onClick={handleClose}
                                    className="absolute right-4 top-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                                        {step === 'email' && <KeyRound className="w-6 h-6 text-primary-foreground" />}
                                        {step === 'otp' && <Shield className="w-6 h-6 text-primary-foreground" />}
                                        {step === 'success' && <CheckCircle2 className="w-6 h-6 text-primary-foreground" />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-primary-foreground">
                                            {step === 'email' && 'Forgot Password?'}
                                            {step === 'otp' && 'Verify & Reset'}
                                            {step === 'success' && 'All Set!'}
                                        </h2>
                                        <p className="text-sm text-primary-foreground/80">
                                            {step === 'email' && "We'll send you a verification code"}
                                            {step === 'otp' && 'Enter the code and set new password'}
                                            {step === 'success' && 'Your password has been reset'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    {/* Step 1: Email Input */}
                                    {step === 'email' && (
                                        <motion.form
                                            key="email-step"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            onSubmit={handleSendOTP}
                                            className="space-y-5"
                                        >
                                            {/* Info Message */}
                                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                                                <p className="text-xs text-muted-foreground text-center">
                                                    We'll send a 6-digit verification code to your email
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="forgot-email" className="text-sm font-medium">
                                                    Email Address
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                                    <Input
                                                        id="forgot-email"
                                                        type="email"
                                                        placeholder="you@example.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="pl-10 h-11 bg-background/50 border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                                        required
                                                        autoFocus
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground pl-1">
                                                    Enter the email associated with your account
                                                </p>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-11 bg-gradient-to-r from-primary to-teal-glow hover:opacity-90 transition-opacity"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <motion.span
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                            className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                                                        />
                                                        Sending Code...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        Send Verification Code
                                                        <ArrowRight className="w-4 h-4" />
                                                    </span>
                                                )}
                                            </Button>

                                            {/* Back to Login */}
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Back to Login
                                            </button>
                                        </motion.form>
                                    )}

                                    {/* Step 2: OTP & New Password */}
                                    {step === 'otp' && (
                                        <motion.form
                                            key="otp-step"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            onSubmit={handleResetPassword}
                                            className="space-y-5"
                                        >
                                            {/* Email Info */}
                                            <div className="bg-gradient-to-r from-primary/10 to-teal/10 border border-primary/20 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                            <Mail className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Code sent to</p>
                                                            <p className="text-sm font-medium text-foreground">{email}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setStep('email')}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        Change
                                                    </button>
                                                </div>
                                            </div>

                                            {/* OTP Input - Individual Boxes */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Verification Code</Label>
                                                <OTPInput value={otp} onChange={setOtp} />
                                                <div className="flex items-center justify-between px-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        ⏱️ Code expires in 10 minutes
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={handleSendOTP}
                                                        disabled={isLoading}
                                                        className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                                                    >
                                                        Resend Code
                                                    </button>
                                                </div>
                                            </div>

                                            {/* New Password with Strength Indicator */}
                                            <div className="space-y-2">
                                                <Label htmlFor="new-password">New Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                    <Input
                                                        id="new-password"
                                                        name="new-password-reset"
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        placeholder="Enter new password"
                                                        value={forgetPassword}
                                                        onChange={(e) => setForgetPassword(e.target.value)}
                                                        className="pl-10 pr-10 h-11 bg-background/50"
                                                        autoComplete="new-password"   // ✅ Add this
                                                        data-lpignore="true"  // ✅ Add this (for LastPass)
                                                        data-form-type="other"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                <PasswordStrength password={forgetPassword} />
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                    <Input
                                                        id="confirm-password"
                                                        name="confirm-password-reset"  // ✅ Add unique name
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        placeholder="Confirm new password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="pl-10 pr-10 h-11 bg-background/50"
                                                        autoComplete="new-password"  // ✅ Change from "off" to "new-password"
                                                        data-lpignore="true"
                                                        data-form-type="other"
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
                                                        {forgetPassword === confirmPassword ? (
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
                                                className="w-full h-11 bg-gradient-to-r from-primary to-teal-glow hover:opacity-90 transition-opacity"
                                                disabled={isLoading || forgetPassword !== confirmPassword || otp.length !== 6}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <motion.span
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                            className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                                                        />
                                                        Resetting Password...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        Reset Password
                                                        <Shield className="w-4 h-4" />
                                                    </span>
                                                )}
                                            </Button>
                                        </motion.form>
                                    )}

                                    {/* Step 3: Success */}
                                    {step === 'success' && (
                                        <motion.div
                                            key="success-step"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-8"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                                className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center"
                                            >
                                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                                            </motion.div>
                                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                                Password Reset Successfully!
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                You can now login with your new password
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ForgotPasswordDialog;
