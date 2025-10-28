import { FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface PiiItem {
  type: string;
  value: string;
}

interface PiiScanResultsProps {
  isOpen: boolean;
  onClose: () => void;
  results: PiiItem[];
  isScanning: boolean;
}

const PiiScanResults = ({ isOpen, onClose, results, isScanning }: PiiScanResultsProps) => {
  const hasPii = results.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {isScanning ? (
              <>
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Scanning for Sensitive Data...
              </>
            ) : hasPii ? (
              <>
                <FiAlertTriangle className="w-6 h-6 text-warning" />
                Sensitive Data Detected
              </>
            ) : (
              <>
                <FiCheckCircle className="w-6 h-6 text-success" />
                No Sensitive Data Found
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isScanning ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Analyzing your file for personally identifiable information...
              </p>
            </div>
          ) : hasPii ? (
            <>
              <div className="bg-warning/10 border border-warning rounded-lg p-4">
                <p className="text-sm text-warning font-medium mb-2">
                  ⚠️ Warning: {results.length} sensitive {results.length === 1 ? 'item' : 'items'} detected
                </p>
                <p className="text-xs text-muted-foreground">
                  Consider whether this information should be encrypted or stored securely.
                </p>
              </div>

              <div className="space-y-3">
                {results.map((item, index) => (
                  <div
                    key={index}
                    className="glass-effect rounded-lg p-4 flex items-start justify-between gap-4 hover:border-warning/50 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="mb-2">
                        {item.type}
                      </Badge>
                      <p className="text-sm text-foreground font-mono break-all">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-success/10 border border-success rounded-lg p-6 text-center">
              <FiCheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-sm text-success font-medium mb-1">
                All Clear!
              </p>
              <p className="text-xs text-muted-foreground">
                No personally identifiable information was detected in this file.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PiiScanResults;
