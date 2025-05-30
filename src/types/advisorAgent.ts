import { Agent } from './agent';

export type FundingSeries = 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C+' | 'Bootstrap';
export type RevenueRange = '<$100K' | '$100K-$1M' | '$1M-$5M' | '$5M-$20M' | '$20M+';
export type ValuationRange = '<$1M' | '$1M-$5M' | '$5M-$20M' | '$20M-$100M' | '$100M+';
export type SalesMotion = 'Self-Serve' | 'Inside Sales' | 'Field Sales' | 'Channel Partners' | 'Hybrid';
export type InvestorType = 'Angel' | 'Pre-Seed Fund' | 'Seed Fund' | 'VC (Early Stage)' | 'VC (Growth)' | 'Strategic';
export type DocumentType = 'Executive Summary' | 'Pitch Deck' | 'One-Pager' | 'Financial Model' | 'Cap Table' | 'Due Diligence Checklist';

export interface CompanyProfile {
  name: string;
  industry: string;
  description: string;
  foundingDate: string;
  teamSize: number;
  website: string;
  location: string;
  fundingSeries?: FundingSeries;
  revenueRange?: RevenueRange;
  valuation?: ValuationRange;
  salesMotion?: SalesMotion;
  targetMarketSize?: string;
  keyMetrics?: Record<string, string | number>;
}

export interface Investor {
  id: string;
  name: string;
  type: InvestorType;
  firm?: string;
  location: string;
  interests: string[];
  portfolioCompanies: string[];
  preferredCheckSize: string;
  linkedInUrl?: string;
  twitterUrl?: string;
  email?: string;
  investmentThesis?: string;
  recentDeals?: string[];
  scoreMatch?: number; // 0-100 score of match fit
  outreachStatus?: 'Not Started' | 'Email Sent' | 'Responded' | 'Meeting Scheduled' | 'Passed' | 'Interested';
  notes?: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  placeholders: string[]; // Like {{investor_name}}, {{company_name}}, etc.
  platform: 'Email' | 'LinkedIn' | 'Twitter';
  createdAt: string;
  updatedAt: string;
}

export interface OutreachMessage {
  id: string;
  investorId: string;
  templateId: string;
  subject: string;
  body: string;
  platform: 'Email' | 'LinkedIn' | 'Twitter';
  status: 'Draft' | 'Sent' | 'Opened' | 'Replied';
  sentAt?: string;
  openedAt?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundingDocument {
  id: string;
  type: DocumentType;
  name: string;
  description?: string;
  content: string;
  version: string;
  status: 'Draft' | 'Ready' | 'Shared';
  createdAt: string;
  updatedAt: string;
  sharedWith?: string[]; // investor IDs
}

export interface DataRoom {
  id: string;
  name: string;
  description?: string;
  documents: string[]; // document IDs
  accessUrl: string;
  accessCode?: string;
  investors: string[]; // investor IDs with access
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorInfo {
  id: string;
  name: string;
  website: string;
  description: string;
  foundedYear?: number;
  headcount?: number;
  funding?: {
    totalRaised: string;
    lastRound: {
      type: FundingSeries;
      amount: string;
      date: string;
      investors: string[];
    }
  };
  revenue?: RevenueRange;
  valuation?: ValuationRange;
  keyDifferentiators: string[];
  strengths: string[];
  weaknesses: string[];
  recentNews?: {
    date: string;
    title: string;
    url: string;
    summary: string;
  }[];
  products: string[];
  targetMarkets: string[];
  createdAt: string;
  updatedAt: string;
}

// Specific advisor agent types
export interface FundingStrategyAgent extends Agent {
  capabilities: ['funding-strategy', 'market-analysis', 'valuation-assessment'];
  preferences?: {
    preferredFundingSources: string[];
    riskTolerance: 'Low' | 'Medium' | 'High';
    targetInvestorTypes: InvestorType[];
  };
}

export interface InvestorMatchmakerAgent extends Agent {
  capabilities: ['investor-search', 'fit-assessment', 'investor-ranking'];
  preferences?: {
    geographicFocus: string[];
    minimumPortfolioSize: number;
    sectorsOfInterest: string[];
  };
}

export interface OutreachAgent extends Agent {
  capabilities: ['email-drafting', 'outreach-scheduling', 'response-tracking'];
  preferences?: {
    communicationStyle: 'Formal' | 'Conversational' | 'Direct';
    followUpFrequency: 'Low' | 'Medium' | 'High';
    preferredPlatforms: ('Email' | 'LinkedIn' | 'Twitter')[];
  };
}

export interface DocumentationAgent extends Agent {
  capabilities: ['document-generation', 'data-room-management', 'document-sharing'];
  preferences?: {
    documentFormats: ('PDF' | 'DOCX' | 'PPTX' | 'XLSX')[];
    sharingPreferences: 'Restricted' | 'Moderate' | 'Open';
    autoUpdateFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Manual';
  };
}

export interface MarketIntelligenceAgent extends Agent {
  capabilities: ['competitor-monitoring', 'market-trend-analysis', 'news-tracking'];
  preferences?: {
    alertFrequency: 'Daily' | 'Weekly' | 'Real-time';
    competitorsToTrack: string[];
    newsSources: string[];
  };
}

export interface AdvisorAgentWorkflow {
  id: string;
  name: string;
  description: string;
  steps: {
    id: string;
    agentId: string;
    action: string;
    inputMapping?: Record<string, string>;
    outputMapping?: Record<string, string>;
    conditions?: {
      condition: string;
      nextStepId: string;
    }[];
    defaultNextStepId?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}