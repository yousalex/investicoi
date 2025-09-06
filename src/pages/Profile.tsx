import { useAuth } from '@/contexts/AuthContext';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, CreditCard, BarChart3, Calendar, Settings, Edit, Lock, Mail, ArrowUp, Clock } from 'lucide-react';
import PricingPlans from '@/components/PricingPlans';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, profile, refreshProfile, canUseService } = useAuth();
  const { toast } = useToast();
  const [showPlans, setShowPlans] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [purchasedPlans, setPurchasedPlans] = useState<string[]>([]);

  // Load purchased plans from localStorage on component mount
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`purchased_plans_${user.id}`);
      if (stored) {
        setPurchasedPlans(JSON.parse(stored));
      }
    }
  }, [user?.id]);

  // Save purchased plans to localStorage
  const savePurchasedPlans = (plans: string[]) => {
    if (user?.id) {
      localStorage.setItem(`purchased_plans_${user.id}`, JSON.stringify(plans));
      setPurchasedPlans(plans);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    try {
      // Allow changing to any purchased plan or free plan
      const { data, error } = await supabase.functions.invoke('update-user-plan', {
        body: {
          planId,
          paymentDetails: { type: 'plan_change' }
        }
      });

      if (error) {
        console.error("Error updating plan:", error);
        toast({
          title: "Error al cambiar plan",
          description: "Hubo un error al cambiar el plan. Inténtalo de nuevo.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Plan actualizado",
        description: `Has cambiado al plan ${planId} exitosamente.`,
      });

      await refreshProfile();
    } catch (error) {
      console.error("Error in handleSelectPlan:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al cambiar el plan. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async (planId: string, details: any) => {
    console.log("Payment successful for plan:", planId, details);
    
    try {
      // Update the user's plan in Supabase
      const { data, error } = await supabase.functions.invoke('update-user-plan', {
        body: {
          planId,
          paymentDetails: details
        }
      });

      if (error) {
        console.error("Error updating plan:", error);
        toast({
          title: "Error al actualizar plan",
          description: "El pago fue exitoso pero hubo un error al actualizar tu plan. Contacta soporte.",
          variant: "destructive",
        });
        return;
      }

      // Add the plan to purchased plans list
      const updatedPurchasedPlans = [...purchasedPlans];
      if (!updatedPurchasedPlans.includes(planId)) {
        updatedPurchasedPlans.push(planId);
        savePurchasedPlans(updatedPurchasedPlans);
      }

      toast({
        title: "¡Pago exitoso!",
        description: `Tu pago ha sido procesado correctamente. Tu plan ${planId} está ahora activo.`,
      });

      // Refresh the profile to show updated data
      await refreshProfile();
      
    } catch (error) {
      console.error("Error in handlePaymentSuccess:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu pago. Contacta soporte.",
        variant: "destructive",
      });
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nuevo email.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email actualizado",
        description: "Se ha enviado un email de confirmación a tu nueva dirección.",
      });
      setIsChangingEmail(false);
      setNewEmail('');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden o están vacías.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente.",
      });
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            {!user ? "Debes iniciar sesión para ver tu perfil." : ""}
          </p>
          {user && !profile && (
            <Button onClick={refreshProfile} variant="outline">
              Recargar Perfil
            </Button>
          )}
        </div>
      </div>
    );
  }

  const getPlanLimits = () => {
    switch (profile.plan) {
      case 'gratuito': return { limit: 3, price: 'Gratis', duration: '' };
      case 'mensual': return { limit: 15, price: '3 USD', duration: '1 mes' };
      case 'trimestral': return { limit: 45, price: '$11.99 USD', duration: '3 meses' };
      case 'semestral': return { limit: 80, price: '$19.99 USD', duration: '6 meses' };
      case 'anual': return { limit: 150, price: '$39.99 USD', duration: '12 meses' };
      default: return { limit: 3, price: 'Gratis', duration: '' };
    }
  };

  const { limit, price, duration } = getPlanLimits();
  const usagePercentage = (profile.daily_usage_count / limit) * 100;

  // Calculate days remaining for the plan
  const getDaysRemaining = () => {
    if (!profile.plan_expires_at || profile.plan === 'gratuito') return null;
    const expirationDate = new Date(profile.plan_expires_at);
    const currentDate = new Date();
    const diffTime = expirationDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Mi Perfil
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Gestiona tu cuenta y monitorea tu uso de Cortex
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <Dialog open={isChangingEmail} onOpenChange={setIsChangingEmail}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar Email</DialogTitle>
                      <DialogDescription>
                        Se enviará un email de confirmación a tu nueva dirección.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-email">Nuevo Email</Label>
                        <Input
                          id="new-email"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="nuevo@email.com"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsChangingEmail(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleChangeEmail}>
                        Actualizar Email
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Contraseña</p>
                  <p className="font-medium">••••••••</p>
                </div>
                <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Lock className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar Contraseña</DialogTitle>
                      <DialogDescription>
                        Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nueva contraseña"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirmar contraseña"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleChangePassword}>
                        Actualizar Contraseña
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">ID de Usuario</p>
                <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                  {profile.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Miembro desde</p>
                <p className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plan Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={profile.plan === 'gratuito' ? 'secondary' : 'default'} className="text-sm">
                  Plan {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
                </Badge>
                <div className="text-right">
                  <span className="font-semibold">{price}</span>
                  {duration && <p className="text-xs text-muted-foreground">{duration}</p>}
                </div>
              </div>
              
              {profile.plan_expires_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Expira el</p>
                  <p className="font-medium">
                    {new Date(profile.plan_expires_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}

              {daysRemaining !== null && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {daysRemaining} días restantes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {daysRemaining <= 7 ? 'Tu plan expira pronto' : 'de tu plan actual'}
                    </p>
                  </div>
                </div>
              )}

              {purchasedPlans.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Planes Comprados:</p>
                  <div className="flex flex-wrap gap-1">
                    {purchasedPlans.map((planId) => (
                      <Badge key={planId} variant="outline" className="text-xs">
                        {planId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowPlans(!showPlans)}
                >
                  {showPlans ? 'Ocultar Planes' : 'Cambiar Plan'}
                </Button>
                {profile.plan === 'gratuito' && (
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => setShowPlans(true)}
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Mejorar Plan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Uso Diario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usos consumidos</span>
                  <span>{profile.daily_usage_count} / {limit}</span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Último reinicio</p>
                <p className="font-medium">
                  {new Date(profile.last_usage_reset).toLocaleDateString('es-ES')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{profile.daily_usage_count}</p>
                  <p className="text-sm text-muted-foreground">Usos hoy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{limit - profile.daily_usage_count}</p>
                  <p className="text-sm text-muted-foreground">Restantes</p>
                </div>
              </div>
              {daysRemaining !== null && (
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <p className="text-lg font-bold text-primary">{daysRemaining}</p>
                  <p className="text-sm text-muted-foreground">días restantes</p>
                </div>
              )}
              <Button onClick={refreshProfile} variant="outline" className="w-full">
                Actualizar Datos
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Plans Section */}
        {showPlans && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold gradient-text mb-4">
                Planes Disponibles
              </h2>
              <p className="text-xl text-muted-foreground">
                Elige el plan que mejor se adapte a tus necesidades
              </p>
            </div>
            <PricingPlans 
              currentPlan={profile.plan} 
              purchasedPlans={purchasedPlans}
              onSelectPlan={handleSelectPlan}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
