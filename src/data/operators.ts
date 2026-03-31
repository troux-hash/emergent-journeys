export interface Room {
  name: string;
  description: string;
  pricePerNight: number;
  currency: string;
  maxGuests: number;
}

export interface Operator {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  location: {
    address: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  website: string;
  priceRange: string;
  starRating: number;
  yearsOperating: number;
  heroImage: string;
  images: string[];
  checkIn: string;
  checkOut: string;
  currenciesAccepted: string[];
  paymentAccepted: string[];
  sustainability: {
    solarPowered: boolean;
    localHirePercent: number;
    communityPercent: number;
    waterConservation: boolean;
  };
  amenities: string[];
  rooms: Room[];
  socialLinks: {
    instagram?: string;
    tripadvisor?: string;
  };
}

export const operators: Operator[] = [
  {
    slug: "yokan-lodge",
    name: "Yokan Lodge",
    tagline: "Where the river meets the Atlantic",
    description:
      "A boutique eco-lodge on the banks of the Casamance River in southern Senegal. Yokan Lodge offers an intimate, culturally immersive experience — locally built, solar-powered, and deeply connected to the surrounding Diola communities. Eleven years of quiet excellence, now ready to be discovered.",
    location: {
      address: "Casamance River, Ziguinchor Region",
      city: "Ziguinchor",
      country: "Senegal",
      lat: 12.5681,
      lng: -16.264,
    },
    phone: "+221 77 123 4567",
    email: "stay@yokanlodge.com",
    website: "https://yokanlodge.com",
    priceRange: "$80–$220",
    starRating: 4,
    yearsOperating: 11,
    heroImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    ],
    checkIn: "14:00",
    checkOut: "11:00",
    currenciesAccepted: ["XOF", "EUR", "USD"],
    paymentAccepted: ["Cash", "Bank Transfer", "Wave Mobile Money"],
    sustainability: {
      solarPowered: true,
      localHirePercent: 95,
      communityPercent: 10,
      waterConservation: true,
    },
    amenities: [
      "Solar-powered electricity",
      "River-view terraces",
      "Traditional Diola cuisine",
      "Guided cultural tours",
      "Kayak & pirogue excursions",
      "Wi-Fi in common areas",
      "Airport transfer available",
    ],
    rooms: [
      {
        name: "River View Bungalow",
        description: "Thatched-roof bungalow with private terrace overlooking the Casamance River.",
        pricePerNight: 120,
        currency: "USD",
        maxGuests: 2,
      },
      {
        name: "Garden Suite",
        description: "Spacious suite set among tropical gardens with outdoor shower.",
        pricePerNight: 160,
        currency: "USD",
        maxGuests: 3,
      },
      {
        name: "Family Pavilion",
        description: "Two-bedroom pavilion with shared living area, ideal for families.",
        pricePerNight: 220,
        currency: "USD",
        maxGuests: 5,
      },
    ],
    socialLinks: {
      instagram: "https://instagram.com/yokanlodge",
      tripadvisor: "https://tripadvisor.com/yokanlodge",
    },
  },
  {
    slug: "keza-house",
    name: "Keza House",
    tagline: "Kigali's best-kept secret",
    description:
      "A design-forward boutique guesthouse in the hills of Kigali. Keza House blends Rwandan craftsmanship with contemporary comfort — every piece of furniture locally made, every meal sourced from neighbourhood farms. Intimate, intentional, and impossible to find online.",
    location: {
      address: "KG 9 Ave, Kiyovu",
      city: "Kigali",
      country: "Rwanda",
      lat: -1.9536,
      lng: 29.8728,
    },
    phone: "+250 78 234 5678",
    email: "hello@kezahouse.rw",
    website: "https://kezahouse.rw",
    priceRange: "$90–$180",
    starRating: 4,
    yearsOperating: 5,
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
    ],
    checkIn: "15:00",
    checkOut: "10:00",
    currenciesAccepted: ["RWF", "USD", "EUR"],
    paymentAccepted: ["Cash", "Bank Transfer", "MTN Mobile Money"],
    sustainability: {
      solarPowered: true,
      localHirePercent: 100,
      communityPercent: 15,
      waterConservation: true,
    },
    amenities: [
      "100% locally made furniture",
      "Farm-to-table dining",
      "Rooftop terrace with city views",
      "Complimentary Rwandan coffee",
      "Curated neighbourhood walking tours",
      "Wi-Fi throughout",
      "Laundry service",
    ],
    rooms: [
      {
        name: "Hilltop Room",
        description: "Bright room with panoramic views of the Kigali hills.",
        pricePerNight: 90,
        currency: "USD",
        maxGuests: 2,
      },
      {
        name: "Artisan Suite",
        description: "Handcrafted interiors with king bed and private balcony.",
        pricePerNight: 140,
        currency: "USD",
        maxGuests: 2,
      },
      {
        name: "The Residence",
        description: "Two-room suite with living area, ideal for extended stays.",
        pricePerNight: 180,
        currency: "USD",
        maxGuests: 4,
      },
    ],
    socialLinks: {
      instagram: "https://instagram.com/kezahouse",
    },
  },
  {
    slug: "baobab-beach",
    name: "Baobab Beach Lodge",
    tagline: "Where the baobabs meet the Indian Ocean",
    description:
      "A barefoot-luxury lodge on Kenya's south coast, tucked between ancient baobab trees and a pristine stretch of Indian Ocean beach. Run by a Kenyan-Italian family for eight years, Baobab Beach Lodge is the kind of place travellers describe as life-changing — and then can never find again online.",
    location: {
      address: "Diani Beach Road",
      city: "Diani",
      country: "Kenya",
      lat: -4.3477,
      lng: 39.5682,
    },
    phone: "+254 72 345 6789",
    email: "book@baobabbeachlodge.com",
    website: "https://baobabbeachlodge.com",
    priceRange: "$100–$280",
    starRating: 5,
    yearsOperating: 8,
    heroImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
      "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800&q=80",
    ],
    checkIn: "14:00",
    checkOut: "11:00",
    currenciesAccepted: ["KES", "USD", "EUR"],
    paymentAccepted: ["Cash", "M-Pesa", "Bank Transfer", "Visa/Mastercard"],
    sustainability: {
      solarPowered: true,
      localHirePercent: 90,
      communityPercent: 12,
      waterConservation: true,
    },
    amenities: [
      "Beachfront access",
      "Solar-heated water",
      "Swahili cooking classes",
      "Snorkelling & diving excursions",
      "Mangrove conservation tours",
      "Wi-Fi in main lodge",
      "Complimentary beach bicycles",
    ],
    rooms: [
      {
        name: "Ocean Banda",
        description: "Open-air banda steps from the beach with ocean sounds all night.",
        pricePerNight: 100,
        currency: "USD",
        maxGuests: 2,
      },
      {
        name: "Baobab Suite",
        description: "Spacious suite nestled under a 500-year-old baobab tree.",
        pricePerNight: 180,
        currency: "USD",
        maxGuests: 3,
      },
      {
        name: "Beach House",
        description: "Two-bedroom private house with direct beach access and personal cook.",
        pricePerNight: 280,
        currency: "USD",
        maxGuests: 6,
      },
    ],
    socialLinks: {
      instagram: "https://instagram.com/baobabbeachlodge",
      tripadvisor: "https://tripadvisor.com/baobabbeachlodge",
    },
  },
];

export const getOperatorBySlug = (slug: string): Operator | undefined =>
  operators.find((op) => op.slug === slug);
