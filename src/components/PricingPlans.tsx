
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { PayPalButton } from '@/components/PayPalButton';
import { PayPalProvider } from '@/components/PayPalProvider';

const plans = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    price: '$0.00 USD',
    duration: 'Gratis',
    dailyUsage: 3,
    description: 'Plan básico para comenzar',
    features: [
      '3 usos diarios',
      'Funcionalidades básicas',
      'Soporte por email'
    ],
    popular: false
  },
  {
    id: 'mensual',
    name: 'Mensual',
    price: '$3 USD',
    duration: '1 mes',
    dailyUsage: 15,
    description: 'Perfecto para uso regular',
    features: [
      '15 usos diarios',
      'Cadena de pensamiento y razonamiento',
      'Soporte técnico'
    ],
    popular: false
  },
  {
    id: 'trimestral',
    name: 'Trimestral',
    price: '$11.99 USD',
    duration: '3 meses',
    dailyUsage: 45,
    description: 'Ideal para proyectos a mediano plazo',
    features: [
      '45 usos diarios',
      'Cadena de pensamiento y razonamiento',
      'Extracion',
      'Soporte técnico por oficales'
    ],
    popular: true
  },
  {
    id: 'semestral',
    name: 'Semestral',
    price: '$19.99 USD',
    duration: '6 meses',
    dailyUsage: 80,
    description: 'Para uso intensivo profesional',
    features: [
      '80 usos diarios',
      'Todo el plan mensual y trimestral',
      '2 modelos de IA',
      'Investigación más precisa',
      'Soporte técnico por admis'
    ],
    popular: false
  },
  {
    id: 'anual',
    name: 'Anual',
    price: '$39.99 USD',
    duration: '12 meses',
    dailyUsage: 150,
    description: 'El mejor valor para empresas',
    features: [
      '150 usos diarios',
      'Todo el plan mensual, trimestral y semestral',
      'Soporte técnico por desarrollador o el creador'
    ],
    popular: false
  }
];

interface PricingPlansProps {
  currentPlan?: string;
  purchasedPlans?: string[];
  onSelectPlan?: (planId: string) => void;
  onPaymentSuccess?: (planId: string, details: any) => void;
}

export const PricingPlans = ({ currentPlan, purchasedPlans = [], onSelectPlan, onPaymentSuccess }: PricingPlansProps) => {
  
  const handlePaymentSuccess = (planId: string, details: any) => {
    console.log('Payment successful for plan:', planId, details);
    onPaymentSuccess?.(planId, details);
  };

  const isPlanPurchased = (planId: string) => {
    return planId === 'gratuito' || purchasedPlans.includes(planId);
  };

  return (
    <PayPalProvider>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${
            currentPlan === plan.id ? 'ring-2 ring-primary' : ''
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                <Star className="w-3 h-3 mr-1" />
                Más Popular
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              {plan.duration !== 'Gratis' && (
                <span className="text-muted-foreground">/{plan.duration}</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {plan.dailyUsage} usos diarios
            </div>
            {isPlanPurchased(plan.id) && plan.id !== 'gratuito' && (
              <Badge variant="secondary" className="mt-2">
                Plan Comprado
              </Badge>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            {currentPlan === plan.id ? (
              <Button 
                className="w-full"
                variant="secondary"
                disabled
              >
                Plan Actual
              </Button>
            ) : isPlanPurchased(plan.id) ? (
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => onSelectPlan?.(plan.id)}
              >
                Cambiar a este Plan
              </Button>
            ) : (
              <div className="space-y-2">
                <PayPalButton
                  planId={plan.id}
                  planName={plan.name}
                  amount={plan.price}
                  onSuccess={(details) => handlePaymentSuccess(plan.id, details)}
                />
                <Button 
                  className="w-full"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectPlan?.(plan.id)}
                >
                  Seleccionar Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        ))}
      </div>
    </PayPalProvider>
  );
};

export default PricingPlans;
