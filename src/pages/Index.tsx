
import { useState, useEffect } from 'react';
import { useAnimateIn } from '@/lib/animations';
import { HeroSection } from '@/components/landing/HeroSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CallToAction } from '@/components/landing/CallToAction';
import { LoadingScreen } from '@/components/landing/LoadingScreen';
import UseCasesSection from '@/components/landing/UseCasesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ResearchSection } from '@/components/landing/ResearchSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const showHero = useAnimateIn(false, 300);
  const showHowItWorks = useAnimateIn(false, 600);
  const showUseCases = useAnimateIn(false, 900);
  const showPricing = useAnimateIn(false, 1200);
  const showTestimonials = useAnimateIn(false, 1500);
  const showCallToAction = useAnimateIn(false, 1800);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 left-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <div className="flex flex-col">
          {/* Hero Section */}
          <HeroSection showTitle={showHero} />
          
          {/* Research Tool Section */}
          <ResearchSection />
          
          {/* How It Works Section */}
          <HowItWorksSection show={showHowItWorks} />
          
          {/* Use Cases Section */}
          {/* <UseCasesSection show={showUseCases} /> */}
          
          {/* Pricing Section */}
          <PricingSection showPricing={showPricing} />
          
          {/* Testimonials Section */}
          {/* <TestimonialsSection showTestimonials={showTestimonials} /> */}
          
          {/* Call to Action */}
          <CallToAction show={showCallToAction} />
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
