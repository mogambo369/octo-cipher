import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction, TransactionInstruction, PublicKey } from '@solana/web3.js';
import CryptoJS from 'crypto-js';
import JSZip from 'jszip';
import { toast } from '@/hooks/use-toast';

export interface AdvancedSettings {
  smartCompression: boolean;
  encryptionMode: 'standard' | 'steganography';
  logProof: boolean;
}

export const useEncryption = () => {
  const [loading, setLoading] = useState(false);
  const { publicKey, sendTransaction } = useWallet();
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Calculate new dimensions (max 1920px)
          let width = img.width;
          let height = img.height;
          const maxSize = 1920;
          
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const encryptData = (data: string, password: string): string => {
    return CryptoJS.AES.encrypt(data, password).toString();
  };

  const decryptData = (encryptedData: string, password: string): string => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const calculateHash = (data: string): string => {
    return CryptoJS.SHA256(data).toString();
  };

  const logHashToSolana = async (hash: string): Promise<string | null> => {
    if (!publicKey || !sendTransaction) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to log proof on Solana',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const transaction = new Transaction();
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWvtrp5GhoG6PSdwp4'),
        data: Buffer.from(`OctoVault Hash: ${hash}`, 'utf8')
      });
      
      transaction.add(memoInstruction);
      
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    } catch (error) {
      console.error('Error logging to Solana:', error);
      toast({
        title: 'Transaction failed',
        description: 'Failed to log proof on Solana blockchain',
        variant: 'destructive'
      });
      return null;
    }
  };

  const encryptAndProcessFiles = async (
    files: File[],
    password: string,
    settings: AdvancedSettings
  ): Promise<void> => {
    setLoading(true);
    
    try {
      const zip = new JSZip();
      
      for (const file of files) {
        let fileData: Blob = file;
        
        // Apply compression if enabled and file is an image
        if (settings.smartCompression && file.type.startsWith('image/')) {
          toast({
            title: 'Compressing...',
            description: `Compressing ${file.name}...`
          });
          fileData = await compressImage(file);
        }
        
        // Read file as base64
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(fileData);
        });
        
        // Encrypt the data
        const encryptedData = encryptData(base64Data, password);
        zip.file(file.name, encryptedData);
      }
      
      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipData = await zipBlob.arrayBuffer();
      const zipBase64 = btoa(String.fromCharCode(...new Uint8Array(zipData)));
      
      let finalBlob: Blob;
      let fileName: string;
      
      if (settings.encryptionMode === 'steganography') {
        // TODO: Implement steganography
        // For now, just save as standard
        finalBlob = new Blob([zipBase64], { type: 'application/octet-stream' });
        fileName = 'encrypted.octovault';
      } else {
        finalBlob = new Blob([zipBase64], { type: 'application/octet-stream' });
        fileName = 'encrypted.octovault';
      }
      
      // Calculate hash for blockchain proof
      const fileHash = calculateHash(zipBase64);
      
      // Log to Solana if enabled
      let txSignature: string | null = null;
      if (settings.logProof && publicKey) {
        toast({
          title: 'Awaiting wallet approval...',
          description: 'Please approve the transaction in your wallet'
        });
        txSignature = await logHashToSolana(fileHash);
      }
      
      // Download the encrypted file
      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Encryption successful!',
        description: txSignature 
          ? 'File encrypted and proof logged on Solana' 
          : 'File encrypted successfully',
        action: txSignature ? (
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline"
          >
            View on Explorer
          </a>
        ) : undefined
      });
    } catch (error) {
      console.error('Encryption error:', error);
      toast({
        title: 'Encryption failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const decryptFile = async (file: File, password: string): Promise<{ files: Array<{ name: string; data: Blob }> } | null> => {
    setLoading(true);
    
    try {
      // Read encrypted file
      const reader = new FileReader();
      const encryptedData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(file);
      });
      
      // Convert from base64 to binary
      const binaryData = atob(encryptedData);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      
      // Load zip
      const zip = await JSZip.loadAsync(bytes);
      
      // Decrypt each file
      const decryptedFiles: Array<{ name: string; data: Blob }> = [];
      
      for (const fileName of Object.keys(zip.files)) {
        const encryptedContent = await zip.files[fileName].async('text');
        
        try {
          const decryptedBase64 = decryptData(encryptedContent, password);
          if (!decryptedBase64) {
            throw new Error('Invalid password');
          }
          
          // Convert base64 back to blob
          const byteCharacters = atob(decryptedBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray]);
          
          decryptedFiles.push({ name: fileName, data: blob });
        } catch (error) {
          throw new Error('Invalid password or corrupted file');
        }
      }
      
      // Download decrypted files
      decryptedFiles.forEach(({ name, data }) => {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
      
      toast({
        title: 'Decryption successful!',
        description: `${decryptedFiles.length} file(s) decrypted`
      });
      
      return { files: decryptedFiles };
    } catch (error) {
      console.error('Decryption error:', error);
      toast({
        title: 'Decryption failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    encryptAndProcessFiles,
    decryptFile
  };
};
