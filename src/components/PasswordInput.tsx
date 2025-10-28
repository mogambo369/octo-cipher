import { useState, useEffect } from 'react';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PasswordInputProps {
  password: string;
  setPassword: (password: string) => void;
  confirmPassword?: string;
  setConfirmPassword?: (password: string) => void;
  showConfirm?: boolean;
}

const PasswordInput = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showConfirm = true
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    // Calculate password strength
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    setStrength(score);
  }, [password]);

  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-destructive';
    if (strength <= 3) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthText = () => {
    if (strength <= 1) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2">
          <FiLock className="w-4 h-4" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10 bg-input border-border focus:border-primary focus:ring-primary"
            placeholder="Enter encryption password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        </div>
        {password && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                  style={{ width: `${(strength / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{getStrengthText()}</span>
            </div>
          </div>
        )}
      </div>

      {showConfirm && setConfirmPassword && (
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-input border-border focus:border-primary focus:ring-primary"
            placeholder="Confirm your password"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
