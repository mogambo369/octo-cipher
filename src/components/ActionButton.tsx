import { FiLoader } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

interface ActionButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
}

const ActionButton = ({ 
  onClick, 
  loading = false, 
  disabled = false, 
  children,
  variant = 'default'
}: ActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full py-6 text-lg font-bold relative overflow-hidden group
        ${variant === 'default' 
          ? 'bg-primary hover:bg-primary/90 glow-border' 
          : 'bg-secondary hover:bg-secondary/90'
        }
        transition-all duration-300 disabled:opacity-50
      `}
    >
      {loading && (
        <FiLoader className="w-5 h-5 mr-2 animate-spin" />
      )}
      {children}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </Button>
  );
};

export default ActionButton;
