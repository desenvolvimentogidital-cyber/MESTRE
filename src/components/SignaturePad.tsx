
import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';
import { Trash2, Check } from 'lucide-react';

interface SignaturePadProps {
  open: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
}

export function SignaturePad({ open, onClose, onSave }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => sigCanvas.current?.clear();
  const save = () => {
    if (sigCanvas.current?.isEmpty()) return;
    onSave(sigCanvas.current?.toDataURL() || '');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle>Assinatura Digital</DialogTitle>
        </DialogHeader>
        <div className="bg-white rounded-lg border-2 border-primary/10 overflow-hidden">
          <SignatureCanvas 
            ref={sigCanvas}
            penColor="black"
            canvasProps={{ width: 450, height: 200, className: 'sigCanvas' }}
          />
        </div>
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" size="sm" onClick={clear} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Limpar
          </Button>
          <div className="flex gap-2">
             <DialogClose>
                <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
             </DialogClose>
             <Button size="sm" onClick={save} className="gap-2 bg-primary text-primary-foreground font-bold">
               <Check className="w-4 h-4" />
               Confirmar
             </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
