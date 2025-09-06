import { Facebook, Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-6 text-center md:text-left">
            <a 
              href="/terminos-y-privacidad" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Términos y Privacidad
            </a>
            <a 
              href="/contacto" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contacto
            </a>
          </div>
          
          {/* Social Media */}
          <div className="flex gap-4">
            <a 
              href="https://www.facebook.com/share/1B288wC6e4/" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a 
              href="https://youtube.com/@investicia?si=bijh7USIX1Z_etaw" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Youtube"
            >
              <Youtube size={20} />
            </a>
            <a 
              href="https://www.instagram.com/investic.ia?igsh=MXRrdWMxamQzeGV0Nw==" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-muted-foreground text-sm">
          © 2025 ponjs. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};