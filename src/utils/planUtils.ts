import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

type PlanId = 'gratuito' | 'mensual' | 'trimestral' | 'semestral' | 'anual';

interface ToastFunctions {
  toast: ({ title, description, variant }: { title: string; description: string; variant?: "default" | "destructive" }) => void;
}

export const handlePaymentSuccess = async (
  planId: PlanId,
  details: any,
  user: User | null,
  toast: ToastFunctions['toast'],
  refreshProfile: () => void
) => {
  console.log('handlePaymentSuccess called with:', { planId, details, user, toast, refreshProfile });

  if (!user) {
    toast({ title: "Error", description: "Debes iniciar sesión para comprar un plan.", variant: "destructive" });
    console.log('Error: User not logged in.');
    return;
  }

  const planDurations: { [key: string]: number } = {
    mensual: 30,
    trimestral: 90,
    semestral: 180,
    anual: 365,
  };

  const durationInDays = planDurations[planId];
  if (!durationInDays) {
    toast({ title: "Error", description: "Plan inválido.", variant: "destructive" });
    console.log('Error: Invalid planId.', planId);
    return;
  }

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + durationInDays);

  console.log('Updating Supabase profile...', { planId, expirationDate: expirationDate.toISOString(), userId: user.id });
  const { error } = await supabase
    .from('profiles')
    .update({ plan: planId, plan_expires_at: expirationDate.toISOString() })
    .eq('id', user.id);

  if (error) {
    toast({ title: "Error al actualizar el plan", description: error.message, variant: "destructive" });
    console.error('Supabase update error:', error);
  } else {
    toast({
      title: "¡Pago exitoso!",
      description: `Tu plan ${planId} está ahora activo hasta el ${expirationDate.toLocaleDateString('es-ES')}.`,
    });
    console.log('Supabase update successful. Calling refreshProfile().');
    refreshProfile();
  }
};