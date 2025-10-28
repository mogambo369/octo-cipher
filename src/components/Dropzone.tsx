import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

interface DropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  label?: string;
}

const Dropzone = ({ onFilesAccepted, accept, multiple = true, label = "Drop files here or click to browse" }: DropzoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAccepted(acceptedFiles);
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple
  });

  return (
    <div
      {...getRootProps()}
      className={`
        glass-effect rounded-lg p-12 border-2 border-dashed cursor-pointer
        transition-all duration-300 hover:border-primary hover:glow-border
        ${isDragActive ? 'border-primary glow-border scale-[1.02]' : 'border-border'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <FiUpload className="w-16 h-16 text-primary animate-pulse" />
        <p className="text-lg text-foreground text-center font-medium">
          {isDragActive ? 'Drop the files here...' : label}
        </p>
        <p className="text-sm text-muted-foreground">
          {multiple ? 'Multiple files supported' : 'Single file only'}
        </p>
      </div>
    </div>
  );
};

export default Dropzone;
