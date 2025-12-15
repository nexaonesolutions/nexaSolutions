import { LucideIcon } from 'lucide-react';

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isPremium?: boolean;
  buttonText: string;
}

export interface ServiceFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  avatarUrl: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
}