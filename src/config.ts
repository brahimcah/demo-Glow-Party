export type Party = 'beauty' | 'glow';
export type Choice = Party | 'undecided';
export type Media = { party: Party; src: string; alt: { ca: string; es: string } };
export type LocalizedText = { ca: string; es: string };
export type PackageId = 'basic' | 'medium' | 'premium';
export type Package = {
  id: PackageId;
  name: LocalizedText;
  featured?: boolean;
  price?: LocalizedText;
  duration?: LocalizedText;
  participants?: LocalizedText;
  included: LocalizedText[];
  extras: LocalizedText[];
};
export type Testimonial = {
  quote: LocalizedText;
  author: string;
  source?: string;
  verified: boolean;
};

export const config = {
  brandName: 'Beauty Party & Glow Party',
  instagramUrl: 'https://www.instagram.com/beautykidsparty28/',
  whatsappNumber: '',
  serviceArea: 'Terres de l’Ebre',
  experiences: {
    beauty: { name: 'Beauty Party', verifiedActivities: [] as string[] },
    glow: { name: 'Glow Party', verifiedActivities: [] as string[] },
  },
  authorizedMedia: [] as Media[],
  packages: [
    { id: 'basic', name: { ca: 'Bàsic', es: 'Básico' }, included: [], extras: [] },
    { id: 'medium', name: { ca: 'Mitjà', es: 'Medio' }, featured: true, included: [], extras: [] },
    { id: 'premium', name: { ca: 'Premium', es: 'Premium' }, included: [], extras: [] },
  ] as Package[],
  testimonials: [] as Testimonial[],
  demoMode: true,
  pendingDetails: ['Preus', 'Edats', 'Durada', 'Aforament', 'Activitats', 'Ubicació i desplaçaments', 'Menjar', 'Supervisió', 'Cancel·lacions'],
};
