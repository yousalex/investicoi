import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

export const ChangeEmailModal = ({ isOpen, onClose, currentEmail }: ChangeEmailModalProps) => {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    // Lógica para cambiar el correo
    console.log('Cambiando a:', newEmail, 'con contraseña:', password);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Correo Electrónico</DialogTitle>
          <DialogDescription>
            Introduce tu nuevo correo y tu contraseña para confirmar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="current-email">Correo Actual</Label>
            <Input id="current-email" value={currentEmail} disabled />
          </div>
          <div>
            <Label htmlFor="new-email">Nuevo Correo</Label>
            <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};