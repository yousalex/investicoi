import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Type, Link, Sparkles, CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { FormattedResearchResult } from './FormattedResearchResult';

const formatObjectToString = (obj: any, indent = 0): string => {
  const indentStr = '  '.repeat(indent);
  const nextIndentStr = '  '.repeat(indent + 1);

  if (typeof obj !== 'object' || obj === null) {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return `[
${obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        return `${nextIndentStr}${formatObjectToString(item, indent + 1)}`;
      }
      return `${nextIndentStr}${String(item)}`;
    }).join(',\n')}
${indentStr}]`;
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';

  return `{\n${entries.map(([key, value]) => {
    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const formattedValue = formatObjectToString(value, indent + 1);
    return `${nextIndentStr}${formattedKey}: ${formattedValue}`;
  }).join(',\n')}
${indentStr}}`;
};

export const ResearchSection = () => {
  const [activeTab, setActiveTab] = useState('image');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const { profile, user } = useAuth();
  const isFreePlan = profile?.plan === 'gratuito';

  useEffect(() => {
    if (isFreePlan) {
      setUrlInput(''); // Clear url input if user is on free plan
    }
  }, [isFreePlan]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        toast.success('Imagen seleccionada correctamente');
      } else {
        toast.error('Por favor selecciona una imagen válida (PNG, JPG, WEBP)');
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSections([]);
    
    try {
      const formData = new FormData();
      
      formData.append('method', activeTab);
      formData.append('method_description', 'Elige tu método de investigación');
      
      if (activeTab === 'image' && selectedFile) {
        formData.append('image', selectedFile);
        formData.append('type', 'image');
      } else if (activeTab === 'text' && textInput.trim()) {
        formData.append('text', textInput);
        formData.append('type', 'text');
      } else if (activeTab === 'url' && urlInput.trim()) {
        if (isFreePlan) {
          toast.error('La investigación por URL no está disponible en el plan gratuito.');
          setIsLoading(false);
          return;
        }
        formData.append('url', urlInput);
        formData.append('type', 'url');
      } else {
        toast.error('Por favor completa los campos requeridos');
        setIsLoading(false);
        return;
      }
      const uid = user?.id || profile?.id;
      if (uid) {
        formData.append('user_id', uid);
      }

      const response = await fetch('http://localhost:5678/webhook/enviar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseText = await response.text();
        
        try {
          let jsonResponse = JSON.parse(responseText);
          if (typeof jsonResponse === 'string') {
            jsonResponse = JSON.parse(jsonResponse);
          }

          // Handle simple message responses from n8n
          if (typeof jsonResponse === 'object' && jsonResponse !== null && !Array.isArray(jsonResponse)) {
            let message = null;
            if (jsonResponse.Message && typeof jsonResponse.Message === 'string') {
              message = jsonResponse.Message;
            } else if (jsonResponse.message && typeof jsonResponse.message === 'string') {
              message = jsonResponse.message;
            } else if (jsonResponse.error && typeof jsonResponse.error === 'string') {
              message = jsonResponse.error;
            } else if (jsonResponse.output && typeof jsonResponse.output === 'string') {
              message = jsonResponse.output;
            } else if (jsonResponse.output && typeof jsonResponse.output === 'object' && jsonResponse.output.mensaje && typeof jsonResponse.output.mensaje === 'string') {
              message = jsonResponse.output.mensaje;
            } else if (Object.keys(jsonResponse).length === 1 && typeof Object.values(jsonResponse)[0] === 'string') {
              message = Object.values(jsonResponse)[0];
            }

            if (message) {
              setSections([{ title: 'Respuesta del Servidor', content: message }]);
              if (message.toLowerCase().includes('error') || message.toLowerCase().includes('agotó') || message.toLowerCase().includes('agotado')) {
                toast.error(message);
              } else {
                toast.info(message);
              }
              setIsLoading(false);
              return;
            }
          }

          const researchData = jsonResponse[0]?.Output || jsonResponse[0]?.output;
          console.log("researchData:", researchData); // DEBUG

          const newSections = [];

          if (researchData) {
            const chainOfThought = researchData['chain_of_thought'] || researchData['Chain Of Thought'];
            if (chainOfThought) {
              newSections.push({ title: 'chain_of_thought', content: chainOfThought });
            }

            const summary = researchData['resumen_de_razonamiento'] || researchData['Resumen De Razonamiento'];
            if (summary) {
              newSections.push({ title: 'resumen_de_razonamiento', content: summary });
            }

            const infoExt = researchData['Information Extracted'] || researchData['Information_extracted'];
            if (infoExt) {
              newSections.push({ title: 'Information_extracted', content: infoExt });
            }

            const webLinks = researchData['Web Links'] || researchData['web_links'];
            if (webLinks && webLinks.length > 0) {
              newSections.push({ title: 'web_links', content: webLinks });
            }

            const videoLinks = researchData['Video Links'] || researchData['video_links'];
            if (videoLinks && videoLinks.length > 0) {
              newSections.push({ title: 'video_links', content: videoLinks });
            }

            const blogLinks = researchData['Blog Links'] || researchData['blog_links'];
            if (blogLinks && blogLinks.length > 0) {
              newSections.push({ title: 'blog_links', content: blogLinks });
            }

            const noticiaLinks = researchData['Noticia Links'] || researchData['noticia_links'];
            if (noticiaLinks && noticiaLinks.length > 0) {
              newSections.push({ title: 'noticia_links', content: noticiaLinks });
            }

            const socialLinks = researchData['RedesSocial Links'] || researchData['redessocial_links'] || researchData['RedesSocial_links'];
            console.log("Social Links Found:", socialLinks); // DEBUG
            if (socialLinks && socialLinks.length > 0) {
              newSections.push({ title: 'redessocial_links', content: socialLinks });
            }

            const totals = researchData['Totals'] || researchData['totals'];
            if (totals) {
              newSections.push({ title: 'totals', content: totals });
            }

            // Keep the old ones too
            if (researchData['detailed_description']) {
              newSections.push({ title: 'detailed_description', content: researchData['detailed_description'] });
            }
            if (researchData['texto_redactado']) {
              newSections.push({ title: 'texto_redactado', content: researchData['texto_redactado'] });
            }
          }


          if (newSections.length > 0) {
            setSections(newSections);
            toast.success('¡Investigación generada exitosamente!');
          } else {
            // Fallback for unexpected structures, but avoid showing raw JSON if it's a simple message.
            const fallbackMessage = formatObjectToString(jsonResponse);
            setSections([{ title: 'Respuesta Recibida', content: fallbackMessage }]);
            console.log("Unexpected response structure: ", jsonResponse);
          }
          
        } catch (e) {
          setSections([{ title: 'Error', content: 'Error al procesar la respuesta del servidor. La respuesta no es un JSON válido.' }]);
          toast.error('Error al procesar la respuesta del servidor.');
          console.error("JSON Parsing Error:", e);
          console.error("Response Text:", responseText);
        }
        
        // Reset form only on successful complex response
        if(sections.length > 0 && sections[0].title !== 'Respuesta del Servidor' && sections[0].title !== 'Error') {
            setSelectedFile(null);
            setTextInput('');
            setUrlInput('');
        }

      } else {
        const errorText = await response.text();
        toast.error(`Error al enviar la investigación: ${errorText}`);
        setSections([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = sections.map(section => {
        if (typeof section.content === 'string') {
          return `${section.title}\n${section.content}`;
        } else if (Array.isArray(section.content)) {
          return `${section.title}\n${section.content.map(link => `${link.title}: ${link.link}`).join('\n')}`;
        }
        return '';
      }).join('\n\n');
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Respuesta copiada al portapapeles');
    } catch (error) {
      toast.error('Error al copiar al portapapeles');
    }
  };

  return (
    <div className="mt-16 mb-32">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-1.5 bg-muted rounded-xl mb-4">
            <div className="bg-background px-4 py-2 rounded-lg shadow-sm">
              <Sparkles size={22} className="inline-block mr-2 text-primary" />
              <span className="font-semibold">Herramienta en Acción</span>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Comienza tu investigación con IA
          </h2>
          <p className="text-muted-foreground">
            Sube una imagen, escribe un tema o pega una URL para generar contenido completo
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Elige tu método de investigación</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Upload size={16} />
                  Imagen
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type size={16} />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2" disabled={isFreePlan}>
                  <Link size={16} />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="image" className="mt-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="mb-4 text-muted-foreground">
                      Arrastra una imagen aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Formatos soportados: PNG, JPG, WEBP
                    </p>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Seleccionar Imagen
                    </Button>
                    {selectedFile && (
                      <p className="mt-2 text-sm text-primary">
                        ✓ {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Escribe el tema que quieres investigar... por ejemplo: 'cangrejo de herradura', 'inteligencia artificial', 'recetas mexicanas'"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Describe cualquier tema y obtendrás investigación completa con enlaces relevantes
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="url" className="mt-6">
                <div className="space-y-4">
                  <Input
                    placeholder="https://ejemplo.com/articulo-interesante"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    type="url"
                    disabled={isFreePlan}
                  />
                  <p className="text-sm text-muted-foreground">
                    Pega cualquier URL y obtendrás análisis, resumen y contenido relacionado
                  </p>
                </div>
              </TabsContent>

              <div className="mt-6 flex justify-center">
                <Button 
                  size="lg" 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 py-6 text-base font-medium"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generar Investigación
                    </>
                  )}
                </Button>
              </div>

              {/* Caja de Respuesta del Webhook */}
              {sections.length > 0 && (
                <div className="mt-8 animate-fade-in">
                  <FormattedResearchResult sections={sections} userPlan={profile?.plan || ''} />
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};