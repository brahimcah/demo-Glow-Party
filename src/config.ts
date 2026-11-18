export type Party = 'beauty' | 'glow';
export type Choice = Party | 'undecided';
export type Media = { party: Party; src: string; alt: { ca: string; es: string } };

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
  demoMode: true,
  pendingDetails: ['Preus', 'Edats', 'Durada', 'Aforament', 'Activitats', 'Ubicació i desplaçaments', 'Menjar', 'Supervisió', 'Cancel·lacions'],
};
