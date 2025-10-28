import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletConnector = () => {
  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-lg !transition-all !duration-300 hover:glow-border" />
    </div>
  );
};

export default WalletConnector;
