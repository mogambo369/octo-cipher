import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWallet } from '@solana/wallet-adapter-react';

export interface AdvancedSettings {
  smartCompression: boolean;
  encryptionMode: 'standard' | 'steganography';
  logProof: boolean;
}

interface SettingsPanelProps {
  settings: AdvancedSettings;
  onChange: (settings: AdvancedSettings) => void;
}

const SettingsPanel = ({ settings, onChange }: SettingsPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { connected } = useWallet();

  return (
    <div className="glass-effect rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
      >
        <span className="font-semibold text-foreground">Advanced Settings</span>
        {isExpanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-6 border-t border-border">
          {/* Smart Compression */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="compression">Smart Compression</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <FiInfo className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Compress images before encryption to reduce file size</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="compression"
              checked={settings.smartCompression}
              onCheckedChange={(checked) => onChange({ ...settings, smartCompression: checked })}
            />
          </div>

          {/* Encryption Mode */}
          <div className="space-y-3">
            <Label>Encryption Mode</Label>
            <RadioGroup
              value={settings.encryptionMode}
              onValueChange={(value: 'standard' | 'steganography') =>
                onChange({ ...settings, encryptionMode: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="font-normal cursor-pointer">
                  Standard Encryption (.octovault)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="steganography" id="steganography" />
                <Label htmlFor="steganography" className="font-normal cursor-pointer">
                  Steganography (hide in .png)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Web3 Proof */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="web3-proof" className={!connected ? 'text-muted-foreground' : ''}>
                Log Proof on Solana Devnet
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <FiInfo className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      {connected
                        ? 'Record a cryptographic hash of your encrypted file on the Solana blockchain'
                        : 'Connect a wallet to enable this feature'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="web3-proof"
              checked={settings.logProof}
              disabled={!connected}
              onCheckedChange={(checked) => onChange({ ...settings, logProof: checked })}
            />
          </div>

          {!connected && settings.logProof && (
            <p className="text-xs text-warning">Connect a wallet to enable blockchain proof logging</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
