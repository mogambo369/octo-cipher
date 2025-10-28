import { useState } from 'react';
import Dropzone from './Dropzone';
import PasswordInput from './PasswordInput';
import ActionButton from './ActionButton';
import { useEncryption } from '@/hooks/useEncryption';
import { FiCheckCircle } from 'react-icons/fi';

const DecryptView = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [decrypted, setDecrypted] = useState(false);

  const { loading, decryptFile } = useEncryption();

  const handleFileAccepted = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setDecrypted(false);
    }
  };

  const handleDecrypt = async () => {
    if (!file || !password) return;
    
    await decryptFile(file, password);
    setDecrypted(true);
    
    // Clear form after decryption
    setTimeout(() => {
      setFile(null);
      setPassword('');
      setDecrypted(false);
    }, 3000);
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
        <div className="glass-effect rounded-lg p-4 border border-secondary">
          <p className="text-sm text-center text-secondary">
            ✓ Decryption successful! Your files have been downloaded.
          </p>
        </div>
      )}
    </div>
  );
};

export default DecryptView;
