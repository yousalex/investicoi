import { useState } from 'react';
import { Check, Star, Brain, BadgeDollarSign, Building, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PayPalButton } from '@/components/PayPalButton';
import { PayPalProvider } from '@/components/PayPalProvider';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { plans } from '@/lib/planData.tsx'; // Updated import

const HowPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('semestral');
  const { toast } = useToast();

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    toast({
      title: "Plan seleccionado",
      description: `Has seleccionado el plan ${planId}. Procede con el pago para activarlo.`,
    });
  };

  const handlePaymentSuccess = (planId: string, details: Record<string, unknown>) => {
    toast({
      title: "¡Pago exitoso!",
      description: `Tu pago ha sido procesado correctamente. Tu plan ${planId} está ahora activo.`,
    });
    console.log('Payment successful for plan:', planId, details);
  };

  

  return (
    <PayPalProvider>
      <div className="relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/0 via-muted/50 to-muted/0 rounded-3xl blur-xl opacity-70"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          {/* Header Section */}
          <div className="text-center mb-16 pt-20">
            <div className="inline-flex items-center justify-center p-1.5 bg-muted rounded-xl mb-6">
              <div className="bg-background px-4 py-2 rounded-lg shadow-sm">
                <BadgeDollarSign size={22} className="inline-block mr-2 text-primary" />
                <span className="font-semibold">Planes y Precios</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Elige el plan perfecto para tus necesidades
            </h1>
            <p className="text-muted-foreground mt-3 max-w-3xl mx-auto">
              Comienza gratis y mejora según crece tu investigación con IA
            </p>
          </div>

          {/* Pricing Cards */}
          <AnimatedTransition show={true} animation="fade" duration={600}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`border relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] cursor-pointer ${
                    selectedPlan === plan.id ? 'ring-1 ring-primary/50' : ''
                  } ${plan.popular ? 'shadow-xl ring-1 ring-primary/50 scale-105 md:scale-110 z-10' : 'shadow-md hover:shadow-lg'}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute top-0 inset-x-0 flex justify-center">
                      <div className="px-4 py-1 bg-primary text-primary-foreground rounded-b-lg text-xs font-medium shadow-md">
                        Más Popular
                      </div>
                    </div>
                  )}
                  
                  <div className={`h-2 w-full bg-gradient-to-r ${plan.color}`} />
                  
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${plan.color} mb-4 shadow-md`}>
                      {plan.icon}
                    </div>
                    <CardTitle className="flex items-end gap-2">
                      <span>{plan.name}</span>
                    </CardTitle>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                    </div>
                    <CardDescription className="mt-3">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter className="pb-6">
                    {plan.id === 'gratuito' ? (
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlan(plan.id);
                        }}
                      >
                        Comenzar Gratis
                      </Button>
                    ) : (
                      <div className="w-full space-y-2">
                        <PayPalButton
                          planId={plan.id}
                          planName={plan.name}
                          amount={`${plan.price} USD`}
                          onSuccess={(details) => handlePaymentSuccess(plan.id, details)}
                        />
                        <Button 
                          className="w-full"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPlan(plan.id);
                          }}
                        >
                          Seleccionar Plan
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </AnimatedTransition>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-lg glass-panel">
              <h3 className="text-lg font-semibold mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-muted-foreground">Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplicarán en tu próximo ciclo de facturación.</p>
            </div>
            
            
            
            <div className="p-6 rounded-lg glass-panel">
              <h3 className="text-lg font-semibold mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-muted-foreground">Aceptamos todas las tarjetas de crédito principales, PayPal y para planes anuales.</p>
            </div>
            
            
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="glass-panel p-8 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-muted-foreground mb-6">
              Únete a miles de usuarios que ya están aprovechando el poder de la IA para sus investigaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full">
                Comenzar Gratis
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                Contactar Ventas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PayPalProvider>
  );
};

export default HowPage;