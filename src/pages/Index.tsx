import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WalletConnector from '@/components/WalletConnector';
import EncryptView from '@/components/EncryptView';
import DecryptView from '@/components/DecryptView';
import { FiShield, FiLock, FiUnlock } from 'react-icons/fi';

const Index = () => {
  const [activeTab, setActiveTab] = useState('encrypt');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-border">
                <FiShield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gradient tracking-tight">
                  OCTOVAULT
                </h1>
                <p className="text-sm text-muted-foreground">
                  Military-Grade Encryption with Blockchain Proof
                </p>
              </div>
            </div>
            <WalletConnector />
          </div>

          <div className="glass-effect rounded-lg p-6">
            <p className="text-foreground leading-relaxed">
              Secure your files with AES-256 encryption and optionally log proof-of-existence on the Solana blockchain. 
              Your files never leave your device - all encryption happens locally in your browser.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 glass-effect p-1">
              <TabsTrigger 
                value="encrypt" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:glow-border"
              >
                <FiLock className="w-4 h-4 mr-2" />
                Encrypt
              </TabsTrigger>
              <TabsTrigger 
                value="decrypt"
                className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:glow-border"
              >
                <FiUnlock className="w-4 h-4 mr-2" />
                Decrypt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="encrypt" className="space-y-6">
              <EncryptView />
            </TabsContent>

            <TabsContent value="decrypt" className="space-y-6">
              <DecryptView />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>🔒 End-to-end encrypted • 🌐 Blockchain verified • 🔐 Zero knowledge architecture</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
