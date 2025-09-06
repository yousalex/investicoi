import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  planId: string;
  planName: string;
  amount: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
}

export const PayPalButton = ({ planId, planName, amount, onSuccess, onError }: PayPalButtonProps) => {
  const { toast } = useToast();
  const [{ isPending }] = usePayPalScriptReducer();

  // Convert amount string like "$1.65 USD" to number
  const getNumericAmount = (amountStr: string): string => {
    const match = amountStr.match(/\$([0-9.]+)/);
    return match ? match[1] : "0.00";
  };

  const handleApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      console.log("Payment successful for plan:", planName, details);
      toast({
        title: "¡Pago exitoso!",
        description: `Has adquirido el plan ${planName} correctamente.`,
      });
      onSuccess?.(details);
    });
  };

  const handleError = (error: any) => {
    console.error('PayPal Error:', error);
    toast({
      title: "Error en el pago",
      description: "Hubo un problema procesando tu pago. Inténtalo de nuevo.",
      variant: "destructive",
    });
    onError?.(error);
  };

  const handleCancel = () => {
    toast({
      title: "Pago cancelado",
      description: "El proceso de pago fue cancelado.",
    });
  };

  if (isPending) {
    return <div className="h-12 bg-muted animate-pulse rounded-md"></div>;
  }

  return (
    <PayPalButtons
      style={{
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
        height: 48
      }}
      createOrder={(data, actions) => {
        const numericAmount = getNumericAmount(amount);
        
        return actions.order.create({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                value: numericAmount,
                currency_code: "USD",
              },
              description: `Plan ${planName}`,
            },
          ],
        });
      }}
      onApprove={handleApprove}
      onError={handleError}
      onCancel={handleCancel}
    />
  );
};

export default PayPalButton;