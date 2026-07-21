export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  academic_field: string;
  education_level: string;
  country: string;
  deadline: string;
  description: string;
  application_link: string;
  
  // Optional enhanced fields for better UX
  funding_type?: 'Full Ride' | 'Partial' | 'Tuition' | 'Other' | string;
  amount?: number; // In USD or local currency
  currency?: string; // USD, EUR, GBP, etc.
  tags?: string[]; // custom tags for discovery
  requirements?: string[]; // e.g., ["essay", "gre", "ielts", "gpa_3.5+"]
  coverage?: string[]; // e.g., ["tuition", "living_expenses", "travel"]
  open_to_international?: boolean;
  featured?: boolean; // Highlight in recommendations
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date
}
