import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface TestimonialsSectionProps {
  showTestimonials: boolean;
}

export const TestimonialsSection = ({ showTestimonials }: TestimonialsSectionProps) => {
  const testimonials = [
    {
      quote: "¡Ha revolucionado completamente cómo gestiono mis investigaciones!",
      name: "María C.",
      role: "Investigadora",
      rating: 5
    },
    {
      quote: "La IA me ha ahorrado horas innumerables generando contenido.",
      name: "Carlos R.",
      role: "Desarrollador",
      rating: 5
    },
    {
      quote: "Finalmente tengo una forma de convertir imágenes en información útil.",
      name: "Ana S.",
      role: "Creadora de Contenido",
      rating: 4
    },
    {
      quote: "Los enlaces automáticos a fuentes académicas son increíbles.",
      name: "Dr. Luis M.",
      role: "Investigador",
      rating: 5
    },
    {
      quote: "La generación de contenido SEO desde una imagen es genial.",
      name: "Elena P.",
      role: "Líder de Marketing",
      rating: 4
    },
    {
      quote: "Puedo investigar cualquier tema visual en segundos.",
      name: "Roberto L.",
      role: "Analista de Datos",
      rating: 5
    },
    {
      quote: "Es como tener un asistente de IA que funciona exactamente como quiero.",
      name: "Rafael O.",
      role: "Fundador de Startup",
      rating: 5
    },
    {
      quote: "Las herramientas han transformado cómo presento datos complejos.",
      name: "David K.",
      role: "Científico de Datos",
      rating: 4
    },
    {
      quote: "Nunca he estado más organizada. Todo está a un clic de distancia.",
      name: "Nicole F.",
      role: "Asistente Ejecutiva",
      rating: 5
    },
    {
      quote: "Las recomendaciones de IA son sorprendentemente precisas y útiles.",
      name: "Tomás J.",
      role: "Investigador",
      rating: 4
    },
    {
      quote: "Mi productividad se ha duplicado desde que uso esta plataforma.",
      name: "Sofía R.",
      role: "Gerente de Proyecto",
      rating: 5
    },
    {
      quote: "La integración con otras herramientas hace mi flujo de trabajo perfecto.",
      name: "Alex C.",
      role: "Diseñador de Producto",
      rating: 5
    }
  ];

  // Component to render star ratings
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };

  return (
    <AnimatedTransition show={showTestimonials} animation="slide-up" duration={600}>
      <div className="py-16 md:py-24">
        <div className="flex flex-col items-center gap-2 mb-12 text-center">
          <h2 className="text-4xl font-bold text-blue-600 md:text-8xl">
            Confiado por investigadores<br />
            y creadores en todas partes.
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border border-border/50 p-6 rounded-lg shadow-sm h-full">
              <StarRating rating={testimonial.rating} />
              <p className="text-lg font-medium mb-4">{testimonial.quote}</p>
              <div className="mt-4">
                <p className="font-bold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AnimatedTransition>
  );
};