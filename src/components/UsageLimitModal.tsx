import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, User, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'limit-reached' | 'auth-required';
}

export const UsageLimitModal = ({ isOpen, onClose, type }: UsageLimitModalProps) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/auth');
    onClose();
  };

  const handlePricingClick = () => {
    navigate('/profile');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'limit-reached' ? (
              <>
                <Zap className="h-5 w-5 text-warning" />
                Límite Alcanzado
              </>
            ) : (
              <>
                <User className="h-5 w-5 text-primary" />
                Inicia Sesión
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {type === 'limit-reached' ? (
              "Has alcanzado el límite de 3 búsquedas gratuitas. Para continuar utilizando la función de investigación de texto, por favor, elige uno de nuestros planes."
            ) : (
              "Para realizar más de una búsqueda, necesitas crear una cuenta. Es gratis y rápido."
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          {type === 'auth-required' && (
            <Button onClick={handleLoginClick} className="w-full">
              <User className="w-4 h-4 mr-2" />
              Iniciar Sesión / Registrarse
            </Button>
          )}
          
          <Button 
            onClick={handlePricingClick} 
            variant={type === 'limit-reached' ? 'default' : 'outline'}
            className="w-full"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Ver Planes de Pago
          </Button>
          
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};