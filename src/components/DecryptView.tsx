import { useState } from 'react';
import Dropzone from './Dropzone';
import PasswordInput from './PasswordInput';
import ActionButton from './ActionButton';
import PiiScanResults from './PiiScanResults';
import { useEncryption } from '@/hooks/useEncryption';
import { supabase } from '@/integrations/supabase/client';
import { FiCheckCircle, FiShield } from 'react-icons/fi';
import { toast } from '@/hooks/use-toast';

interface PiiItem {
  type: string;
  value: string;
}

const DecryptView = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [decrypted, setDecrypted] = useState(false);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decryptedFileName, setDecryptedFileName] = useState<string>('');
  const [showPiiScan, setShowPiiScan] = useState(false);
  const [piiResults, setPiiResults] = useState<PiiItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const { loading, decryptFile } = useEncryption();

  const handleFileAccepted = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setDecrypted(false);
      setDecryptedText(null);
      setDecryptedFileName('');
    }
  };

  const isTextFile = (filename: string): boolean => {
    const textExtensions = ['.txt', '.md', '.csv', '.json', '.xml', '.log', '.html', '.css', '.js', '.ts', '.tsx', '.jsx'];
    return textExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const handleDecrypt = async () => {
    if (!file || !password) return;
    
    const result = await decryptFile(file, password);
    
    if (result && result.files.length > 0) {
      const firstFile = result.files[0];
      setDecryptedFileName(firstFile.name);
      
      // Check if it's a text file and store the content
      if (isTextFile(firstFile.name)) {
        try {
          const text = await firstFile.data.text();
          setDecryptedText(text);
          console.log('Decrypted text file, length:', text.length);
        } catch (error) {
          console.error('Failed to read text content:', error);
          setDecryptedText(null);
        }
      } else {
        setDecryptedText(null);
      }
      
      setDecrypted(true);
      
      // Auto-clear after 5 seconds
      setTimeout(() => {
        setFile(null);
        setPassword('');
        setDecrypted(false);
        setDecryptedText(null);
        setDecryptedFileName('');
      }, 5000);
    }
  };

  const handlePiiScan = async () => {
    if (!decryptedText) {
      toast({
        title: 'Cannot scan',
        description: 'PII scan is only available for text files',
        variant: 'destructive'
      });
      return;
    }

    setIsScanning(true);
    setShowPiiScan(true);
    setPiiResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('scan-pii', {
        body: { textContent: decryptedText }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const results = data?.piiResults || [];
      setPiiResults(results);
      
      toast({
        title: 'Scan complete',
        description: results.length > 0 
          ? `Found ${results.length} sensitive ${results.length === 1 ? 'item' : 'items'}`
          : 'No sensitive data detected',
        variant: results.length > 0 ? 'default' : 'default'
      });
    } catch (error) {
      console.error('PII scan error:', error);
      toast({
        title: 'Scan failed',
        description: error instanceof Error ? error.message : 'Failed to scan for sensitive data',
        variant: 'destructive'
      });
      setShowPiiScan(false);
    } finally {
      setIsScanning(false);
    }
  };

  const isValid = file && password;

  return (
    <div className="space-y-6">
      {!file ? (
        <Dropzone
          onFilesAccepted={handleFileAccepted}
          accept={{ 'application/octet-stream': ['.octovault'] }}
          multiple={false}
          label="Drop encrypted file here (.octovault)"
        />
      ) : (
        <div className="glass-effect rounded-lg p-6 text-center space-y-4">
          <FiCheckCircle className="w-12 h-12 text-secondary mx-auto" />
          <div>
            <p className="text-lg font-medium text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground">Ready to decrypt</p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-sm text-destructive hover:underline"
          >
            Remove file
          </button>
        </div>
      )}
      
      <PasswordInput
        password={password}
        setPassword={setPassword}
        showConfirm={false}
      />
      
      <ActionButton
        onClick={handleDecrypt}
        loading={loading}
        disabled={!isValid}
        variant="secondary"
      >
        {loading ? 'Decrypting...' : 'Decrypt File'}
      </ActionButton>
      
      {decrypted && (
        <div className="space-y-4">
          <div className="glass-effect rounded-lg p-4 border border-secondary">
            <p className="text-sm text-center text-secondary mb-2">
              ✓ Decryption successful! Your file{decryptedFileName && ` "${decryptedFileName}"`} has been downloaded.
            </p>
          </div>

          {decryptedText && (
            <div className="glass-effect rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Security Check</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Scan this text file for sensitive information like credit cards, phone numbers, or addresses.
              </p>
              <ActionButton
                onClick={handlePiiScan}
                loading={isScanning}
                disabled={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Scan for Sensitive Data'}
              </ActionButton>
            </div>
          )}
        </div>
      )}

      <PiiScanResults
        isOpen={showPiiScan}
        onClose={() => setShowPiiScan(false)}
        results={piiResults}
        isScanning={isScanning}
      />
    </div>
  );
};

export default DecryptView;
