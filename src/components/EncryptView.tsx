import { useState } from 'react';
import Dropzone from './Dropzone';
import FileQueue from './FileQueue';
import PasswordInput from './PasswordInput';
import SettingsPanel, { AdvancedSettings } from './SettingsPanel';
import ActionButton from './ActionButton';
import { useEncryption } from '@/hooks/useEncryption';

const EncryptView = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settings, setSettings] = useState<AdvancedSettings>({
    smartCompression: true,
    encryptionMode: 'standard',
    logProof: false
  });

  const { loading, encryptAndProcessFiles } = useEncryption();

  const handleFilesAccepted = (newFiles: File[]) => {
    setFiles([...files, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleEncrypt = async () => {
    if (files.length === 0) {
      return;
    }
    if (!password) {
      return;
    }
    if (password !== confirmPassword) {
      return;
    }
    
    await encryptAndProcessFiles(files, password, settings);
    
    // Clear form after successful encryption
    setFiles([]);
    setPassword('');
    setConfirmPassword('');
  };

  const isValid = files.length > 0 && password && password === confirmPassword;

  return (
    <div className="space-y-6">
      <Dropzone onFilesAccepted={handleFilesAccepted} />
      
      <FileQueue files={files} onRemove={handleRemoveFile} />
      
      <PasswordInput
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showConfirm={true}
      />
      
      <SettingsPanel settings={settings} onChange={setSettings} />
      
      <ActionButton
        onClick={handleEncrypt}
        loading={loading}
        disabled={!isValid}
      >
        {loading ? 'Encrypting...' : 'Encrypt Files'}
      </ActionButton>
    </div>
  );
};

export default EncryptView;
