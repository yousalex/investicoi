
import { Brain, BadgeDollarSign, Building, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Link } from 'react-router-dom';

interface PricingSectionProps {
  showPricing: boolean;
}

export const PricingSection = ({ showPricing }: PricingSectionProps) => {
  const pricingPlans = [
    {
      name: "Gratuito",
      price: "$0.00",
      period: "USD",
      description: "Perfecto para comenzar con investigación asistida por IA",
      features: [
        "3 búsquedas gratis por día",
        "Análisis básico de imágenes",
        "Generación de contenido básico",
        "Enlaces relevantes limitados",
        "Soporte por comunidad"
      ],
      icon: <Brain size={24} />,
      color: "from-blue-400/60 to-blue-600/40",
      buttonText: "Empezar Gratis",
      buttonVariant: "outline"
    },
    {
      name: "Mensual",
      price: "$3",
      period: "USD/mes",
      description: "Para usuarios que necesitan acceso completo mensual",
      features: [
        "15 búsquedas al día",
        "Cadena de pensamiento y razonamiento",
        "Soporte técnico"
      ],
      icon: <BadgeDollarSign size={24} />,
      color: "from-purple-400/60 to-purple-600/40",
      buttonText: "Mejorar Plan",
      buttonVariant: "default",
      popular: true
    },
    {
      name: "Anual",
      price: "$39.99",
      period: "USD/año",
      description: "El mejor valor para usuarios frecuentes",
      features: [
        "150 búsquedas al día",
        "Todo el plan mensual, trimestral y semestral",
        "Soporte técnico por desarrollador o el creador"
      ],
      icon: <Building size={24} />,
      color: "from-indigo-400/60 to-indigo-600/40",
      buttonText: "Mejor Valor",
      buttonVariant: "default"
    }
  ];

  return (
    <AnimatedTransition show={showPricing} animation="slide-up" duration={600}>
      <div className="mt-32 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/0 via-muted/50 to-muted/0 rounded-3xl blur-xl opacity-70"></div>
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-1.5 bg-muted rounded-xl mb-4">
            <div className="bg-background px-4 py-2 rounded-lg shadow-sm">
              <BadgeDollarSign size={22} className="inline-block mr-2 text-primary" />
              <span className="font-semibold">Planes y Precios</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Elige el plan perfecto para tus necesidades</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Comienza gratis y mejora según crece tu investigación con IA
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={`border relative overflow-hidden ${plan.popular ? 'shadow-xl ring-1 ring-primary/50 scale-105 md:scale-110 z-10' : 'shadow-md hover:shadow-lg'} transition-all duration-300 hover:translate-y-[-4px]`}>
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
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-6">
                <Link to="/planes-de-pago" className="w-full">
                  <Button className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90' : ''}`} variant={plan.buttonVariant as "default" | "outline"}>
                    {plan.buttonText}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AnimatedTransition>
  );
};
