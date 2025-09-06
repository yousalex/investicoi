import { Upload, Brain, Download } from 'lucide-react';
import { AnimatedTransition } from '@/components/AnimatedTransition';

interface HowItWorksSectionProps {
  show: boolean;
}

export const HowItWorksSection = ({ show }: HowItWorksSectionProps) => {
  const steps = [
    {
      number: "01",
      title: "Subes una imagen o escribes un tema",
      description: "Sube imágenes (PNG, JPG, WEBP), escribe un tema o pega una URL para comenzar tu investigación.",
      icon: <Upload size={32} />,
      color: "from-blue-400/60 to-blue-600/40"
    },
    {
      number: "02", 
      title: "IA analiza y genera contenido completo",
      description: "Nuestra inteligencia artificial analiza tu entrada y genera investigaciones detalladas, contenido SEO y enlaces relevantes.",
      icon: <Brain size={32} />,
      color: "from-purple-400/60 to-purple-600/40"
    },
    {
      number: "03",
      title: "Puedes copiar, exportar o ver enlaces útiles",
      description: "Obtén tu contenido listo para usar con enlaces a Wikipedia, Amazon, YouTube, Google Scholar y más.",
      icon: <Download size={32} />,
      color: "from-green-400/60 to-green-600/40"
    }
  ];

  return (
    <AnimatedTransition show={show} animation="slide-up" duration={600}>
      <div className="mt-32 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/0 via-muted/30 to-muted/0 rounded-3xl blur-xl opacity-50"></div>
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-1.5 bg-muted rounded-xl mb-4">
            <div className="bg-background px-4 py-2 rounded-lg shadow-sm">
              <Brain size={22} className="inline-block mr-2 text-primary" />
              <span className="font-semibold">Cómo Funciona</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, rápido y poderoso</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Transforma cualquier imagen o idea en contenido completo en solo 3 pasos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent z-0" />
              )}
              
              <div className="bg-background border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] relative z-10">
                <div className="text-center">
                  {/* Step number */}
                  <div className="text-6xl font-bold text-primary/20 mb-4">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br ${step.color} mb-6 mx-auto shadow-md`}>
                    {step.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold mb-4">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedTransition>
  );
};