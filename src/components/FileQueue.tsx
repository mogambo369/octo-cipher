import { FiFile, FiX } from 'react-icons/fi';

interface FileQueueProps {
  files: File[];
  onRemove: (index: number) => void;
}

const FileQueue = ({ files, onRemove }: FileQueueProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Files ({files.length})
      </h3>
      {files.map((file, index) => (
        <div
          key={index}
          className="glass-effect rounded-lg p-4 flex items-center justify-between gap-4 hover:border-primary/50 transition-all"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FiFile className="w-5 h-5 text-secondary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onRemove(index)}
            className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FileQueue;
