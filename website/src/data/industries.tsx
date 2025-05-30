// Remove: import React from 'react';
import type { Industry } from '../types/agent';

export const industries: Industry[] = [
  {
    id: 'funding',
    name: 'Funding Advisory',
    description: 'AI agents for funding strategy, investor matchmaking, and fundraising assistance.',
    icon: () => <span className="material-icons">attach_money</span>,
    bgColor: 'bg-emerald-600',
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Agents for property listings, buyer/seller matching, and market analysis.',
    icon: () => <span className="material-icons">home</span>,
    bgColor: 'bg-blue-600',
  },
  {
    id: 'fintech',
    name: 'Fintech',
    description: 'Financial analysis, risk assessment, and personalized financial advice agents.',
    icon: () => <span className="material-icons">attach_money</span>,
    bgColor: 'bg-green-600',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Patient engagement, care coordination, and medical information agents.',
    icon: () => <span className="material-icons">health_and_safety</span>,
    bgColor: 'bg-red-600',
  },
  {
    id: 'senior-living',
    name: 'Senior Living',
    description: 'Care management, family communication, and wellness monitoring agents.',
    icon: () => <span className="material-icons">elderly</span>,
    bgColor: 'bg-purple-600',
  },
  {
    id: 'telecommunications',
    name: 'Telecommunications',
    description: 'Customer support, service optimization, and network analysis agents.',
    icon: () => <span className="material-icons">cell_tower</span>,
    bgColor: 'bg-orange-600',
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Learning management, content creation, and student engagement agents.',
    icon: () => <span className="material-icons">school</span>,
    bgColor: 'bg-indigo-600',
  },
  {
    id: 'retail',
    name: 'Retail',
    description: 'Inventory management, customer service, and sales optimization agents.',
    icon: () => <span className="material-icons">shopping_cart</span>,
    bgColor: 'bg-pink-600',
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Production monitoring, quality control, and supply chain management agents.',
    icon: () => <span className="material-icons">precision_manufacturing</span>,
    bgColor: 'bg-yellow-600',
  },
  {
    id: 'logistics',
    name: 'Logistics & Transport',
    description: 'Route optimization, delivery tracking, and fleet management agents.',
    icon: () => <span className="material-icons">local_shipping</span>,
    bgColor: 'bg-emerald-600',
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    description: 'Reservation management, customer service, and experience personalization agents.',
    icon: () => <span className="material-icons">hotel</span>,
    bgColor: 'bg-cyan-600',
  },
  {
    id: 'legal',
    name: 'Legal Services',
    description: 'Document analysis, case management, and legal research agents.',
    icon: () => <span className="material-icons">gavel</span>,
    bgColor: 'bg-amber-600',
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Crop monitoring, weather analysis, and farm management agents.',
    icon: () => <span className="material-icons">grass</span>,
    bgColor: 'bg-lime-600',
  },
  {
    id: 'energy',
    name: 'Energy & Utilities',
    description: 'Resource monitoring, optimization, and maintenance management agents.',
    icon: () => <span className="material-icons">bolt</span>,
    bgColor: 'bg-yellow-700',
  },
  {
    id: 'government',
    name: 'Government',
    description: 'Public service, compliance, and citizen engagement agents.',
    icon: () => <span className="material-icons">account_balance</span>,
    bgColor: 'bg-slate-600',
  },
  {
    id: 'insurance',
    name: 'Insurance',
    description: 'Claims processing, risk assessment, and policy management agents.',
    icon: () => <span className="material-icons">security</span>,
    bgColor: 'bg-sky-600',
  },
  {
    id: 'custom',
    name: 'Custom Solution',
    description: 'Build a completely custom AI agent tailored to your specific business needs.',
    icon: () => <span className="material-icons">settings</span>,
    bgColor: 'bg-gray-600',
  },
];

export const getIndustryById = (id: string): Industry | undefined => {
  return industries.find(industry => industry.id === id);
};

export const getIndustryColor = (industryId: string): string => {
  const industry = getIndustryById(industryId);
  return industry ? industry.bgColor : 'bg-gray-600';
};