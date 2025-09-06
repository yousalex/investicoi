import { Brain, BadgeDollarSign, Zap, Crown, Building } from 'lucide-react';

export const plans = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    price: '$0.00',
    period: 'USD',
    duration: 'Gratis para siempre',
    description: 'Perfecto para comenzar con investigación asistida por IA',
    popular: false,
    icon: <Brain size={24} />,
    color: 'from-blue-400/60 to-blue-600/40',
    features: [
      '3 búsquedas gratis por día',
      'Limitaciones'
    ],
    dailyUsage: 3 // Added for consistency with PricingPlans.tsx
  },
  {
    id: 'mensual',
    name: 'Mensual',
    price: '$3',
    period: 'USD/mes',
    duration: '1 mes',
    description: 'Para usuarios que necesitan acceso completo mensual',
    popular: false,
    icon: <BadgeDollarSign size={24} />,
    color: 'from-purple-400/60 to-purple-600/40',
    features: [
      '15 búsquedas al día',
      'Cadena de pensamiento y razonamiento',
      'Soporte técnico'
    ],
    dailyUsage: 15 // Added for consistency with PricingPlans.tsx
  },
  {
    id: 'trimestral',
    name: 'Trimestral',
    price: '$11.99',
    period: 'USD',
    duration: '3 meses',
    description: 'Descuento del 15% para uso trimestral',
    popular: false,
    icon: <Zap size={24} />,
    color: 'from-green-400/60 to-green-600/40',
    features: [
      '45 búsquedas al día',
      'Cadena de pensamiento y razonamiento',
      'Extracion',
      'Soporte técnico por oficales'
    ],
    dailyUsage: 45 // Added for consistency with PricingPlans.tsx
  },
  {
    id: 'semestral',
    name: 'Semestral',
    price: '$19.99',
    period: 'USD',
    duration: '6 meses',
    description: 'El mejor valor para usuarios frecuentes',
    popular: true,
    icon: <Crown size={24} />,
    color: 'from-indigo-400/60 to-indigo-600/40',
    features: [
      '80 búsquedas al día',
      'Todo el plan mensual y trimestral',
      '2 modelos de IA',
      'Investigación más precisa',
      'Soporte técnico por admis'
    ],
    dailyUsage: 80 // Added for consistency with PricingPlans.tsx
  },
  {
    id: 'anual',
    name: 'Anual',
    price: '$39.99',
    period: 'USD',
    duration: '12 meses',
    description: 'Máximo ahorro para usuarios profesionales',
    popular: false,
    icon: <Building size={24} />,
    color: 'from-orange-400/60 to-orange-600/40',
    features: [
      '150 búsquedas al día',
      'Todo el plan mensual, trimestral y semestral',
      'Soporte técnico por desarrollador o el creador'
    ],
    dailyUsage: 150 // Added for consistency with PricingPlans.tsx
  }
];