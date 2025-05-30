// Advisor Agent Service for AgentEcos
// This service provides functionality for the AI-powered Advisor Agent Team

import { v4 as uuidv4 } from 'uuid';

// Types for advisor agents
export interface AdvisorAgent {
  id: string;
  name: string;
  role: AdvisorAgentRole;
  description: string;
  capabilities: string[];
  active: boolean;
  createdAt: string;
}

export type AdvisorAgentRole = 
  | 'funding-strategy-advisor'
  | 'investor-matchmaker'
  | 'outreach-engagement'
  | 'documentation-data-room'
  | 'competitor-intelligence';

export interface FundingStrategy {
  series: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'growth';
  revenueRange: string;
  valuation: string;
  salesMotion: 'self-serve' | 'inside-sales' | 'field-sales' | 'hybrid';
  sector: string;
  businessModel: string;
}

export interface InvestorProfile {
  id: string;
  name: string;
  firm?: string;
  investmentStage: string[];
  sectors: string[];
  portfolioCompanies?: string[];
  averageCheckSize?: string;
  location: string;
  contactInfo?: {
    email?: string;
    linkedin?: string;
  };
  fitScore: number;
  notes?: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  platform: 'email' | 'linkedin';
  variables: string[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'executive-summary' | 'pitch-deck' | 'one-pager' | 'financial-model' | 'cap-table' | 'due-diligence';
  template: string;
  variables: string[];
}

export interface CompetitorIntelligence {
  id: string;
  companyName: string;
  fundingHistory: {
    date: string;
    round: string;
    amount: string;
    investors: string[];
  }[];
  revenueModel: string;
  goToMarketStrategy: string;
  keyDifferentiators: string[];
  lastUpdated: string;
}

// Mock data for advisor agents
const mockAdvisorAgents: AdvisorAgent[] = [
  {
    id: 'advisor-1',
    name: 'Funding Strategy Advisor',
    role: 'funding-strategy-advisor',
    description: 'Guides users through selecting funding series, revenue range, valuation, and sales motion.',
    capabilities: [
      'Market data analysis',
      'Funding strategy recommendations',
      'Valuation benchmarking',
      'Sales motion optimization'
    ],
    active: true,
    createdAt: '2025-05-20T10:00:00Z'
  },
  {
    id: 'advisor-2',
    name: 'Investor Matchmaker',
    role: 'investor-matchmaker',
    description: 'Searches global databases for ideal angel investors and early-stage VCs based on company profile.',
    capabilities: [
      'Investor database search',
      'Fit scoring algorithm',
      'Sector-specific matching',
      'Investment history analysis'
    ],
    active: true,
    createdAt: '2025-05-20T11:00:00Z'
  },
  {
    id: 'advisor-3',
    name: 'Outreach & Engagement Agent',
    role: 'outreach-engagement',
    description: 'Drafts personalized outreach emails or LinkedIn messages to shortlisted investors.',
    capabilities: [
      'Personalized message generation',
      'Response tracking',
      'Meeting scheduling',
      'Follow-up automation'
    ],
    active: true,
    createdAt: '2025-05-21T09:00:00Z'
  },
  {
    id: 'advisor-4',
    name: 'Documentation & Data Room Agent',
    role: 'documentation-data-room',
    description: 'Generates and organizes essential funding documents and creates secure data rooms.',
    capabilities: [
      'Document generation',
      'Data room creation',
      'Document versioning',
      'Access control management'
    ],
    active: false,
    createdAt: '2025-05-22T14:00:00Z'
  },
  {
    id: 'advisor-5',
    name: 'Competitor & Market Intelligence Agent',
    role: 'competitor-intelligence',
    description: 'Continuously monitors competitor funding rounds, revenue models, and go-to-market moves.',
    capabilities: [
      'Competitor tracking',
      'Market trend analysis',
      'Strategic alerts',
      'Competitive advantage assessment'
    ],
    active: true,
    createdAt: '2025-05-23T10:00:00Z'
  }
];

// Mock funding strategies
const mockFundingStrategies: Record<string, string[]> = {
  'pre-seed': [
    'Focus on product vision and market opportunity',
    'Emphasize founding team credentials and domain expertise',
    'Target angel investors and pre-seed funds',
    'Aim for $250K-$1M raise with minimal viable product',
    'Prepare for high-risk, high-potential-return investment pitch'
  ],
  'seed': [
    'Demonstrate early product-market fit with initial users/customers',
    'Show clear path to revenue and growth metrics',
    'Target seed-stage VCs and strategic angels',
    'Aim for $1M-$3M raise with working product',
    'Focus on go-to-market strategy and initial traction'
  ],
  'series-a': [
    'Present significant traction and revenue growth',
    'Demonstrate scalable customer acquisition model',
    'Target established VCs with sector expertise',
    'Aim for $5M-$15M raise with proven business model',
    'Emphasize unit economics and path to profitability'
  ],
  'series-b': [
    'Show substantial revenue and growth rate',
    'Demonstrate market leadership position',
    'Target growth-stage VCs and strategic investors',
    'Aim for $15M-$30M raise for rapid scaling',
    'Focus on operational efficiency and market expansion'
  ],
  'series-c': [
    'Present established business with significant market share',
    'Demonstrate clear path to profitability',
    'Target late-stage VCs and pre-IPO investors',
    'Aim for $30M-$100M+ raise for market dominance',
    'Emphasize long-term competitive advantages and moats'
  ],
  'growth': [
    'Show mature business with strong financials',
    'Demonstrate international expansion potential',
    'Target private equity and strategic corporate investors',
    'Aim for $100M+ raise for market consolidation',
    'Focus on long-term value creation and exit strategy'
  ]
};

// Mock investor profiles
const mockInvestors: InvestorProfile[] = [
  {
    id: 'investor-1',
    name: 'Sarah Johnson',
    firm: 'Horizon Ventures',
    investmentStage: ['seed', 'series-a'],
    sectors: ['ai', 'saas', 'vertical-software'],
    portfolioCompanies: ['TechCorp', 'AI Solutions', 'DataFlow'],
    averageCheckSize: '$1M-$5M',
    location: 'San Francisco, CA',
    contactInfo: {
      email: 'sarah@horizonvc.com',
      linkedin: 'linkedin.com/in/sarahjohnson'
    },
    fitScore: 92,
    notes: 'Previously invested in AI-powered vertical SaaS companies'
  },
  {
    id: 'investor-2',
    name: 'Michael Chen',
    firm: 'Quantum Capital',
    investmentStage: ['pre-seed', 'seed'],
    sectors: ['ai', 'enterprise-software', 'developer-tools'],
    portfolioCompanies: ['CodeGenius', 'DevOpsAI', 'CloudScale'],
    averageCheckSize: '$250K-$1M',
    location: 'New York, NY',
    contactInfo: {
      email: 'michael@quantumcap.com',
      linkedin: 'linkedin.com/in/michaelchen'
    },
    fitScore: 87,
    notes: 'Technical background, looks for strong engineering teams'
  },
  {
    id: 'investor-3',
    name: 'Emily Rodriguez',
    firm: 'Catalyst Fund',
    investmentStage: ['seed', 'series-a', 'series-b'],
    sectors: ['saas', 'fintech', 'healthcare-it'],
    portfolioCompanies: ['HealthAI', 'FinanceFlow', 'MedTechSolutions'],
    averageCheckSize: '$2M-$10M',
    location: 'Boston, MA',
    contactInfo: {
      email: 'emily@catalystfund.com',
      linkedin: 'linkedin.com/in/emilyrodriguez'
    },
    fitScore: 78,
    notes: 'Interested in AI applications in regulated industries'
  },
  {
    id: 'investor-4',
    name: 'David Kim',
    firm: undefined,
    investmentStage: ['pre-seed', 'seed'],
    sectors: ['ai', 'consumer-tech', 'marketplaces'],
    portfolioCompanies: ['ConsumerAI', 'MarketMatch', 'RetailTech'],
    averageCheckSize: '$100K-$500K',
    location: 'Los Angeles, CA',
    contactInfo: {
      email: 'david.kim@angelinvestor.com',
      linkedin: 'linkedin.com/in/davidkim'
    },
    fitScore: 85,
    notes: 'Angel investor with successful exits in AI space'
  },
  {
    id: 'investor-5',
    name: 'Alexandra Peters',
    firm: 'Elevation Partners',
    investmentStage: ['series-a', 'series-b'],
    sectors: ['enterprise-software', 'ai', 'data-infrastructure'],
    portfolioCompanies: ['DataCore', 'EnterpriseAI', 'CloudInfra'],
    averageCheckSize: '$5M-$20M',
    location: 'San Francisco, CA',
    contactInfo: {
      email: 'alex@elevationvc.com',
      linkedin: 'linkedin.com/in/alexandrapeters'
    },
    fitScore: 90,
    notes: 'Strong network in enterprise software space'
  }
];

// Mock outreach templates
const mockOutreachTemplates: OutreachTemplate[] = [
  {
    id: 'template-1',
    name: 'Cold Email - Seed Stage',
    subject: 'AI-Powered {{sector}} Platform - {{companyName}} Seeking Seed Funding',
    body: `Dear {{investorName}},

I noticed your investments in {{portfolioCompanies}} and believe our AI-powered {{sector}} platform {{companyName}} would be of interest.

We're {{valueProposition}} and have achieved {{keyMetrics}} since launch.

Would you be open to a 30-minute call next week to discuss our {{series}} round?

Best regards,
{{founderName}}
{{founderTitle}}
{{companyName}}`,
    platform: 'email',
    variables: ['investorName', 'portfolioCompanies', 'sector', 'companyName', 'valueProposition', 'keyMetrics', 'series', 'founderName', 'founderTitle']
  },
  {
    id: 'template-2',
    name: 'LinkedIn Connection - Angel',
    subject: '',
    body: `Hi {{investorName}},

I'm the {{founderTitle}} of {{companyName}}, an AI-powered solution for {{sector}}. I noticed your investments in the space and would love to connect to share what we're building.

We've achieved {{keyMetrics}} and are preparing for our next funding round.

Looking forward to connecting,
{{founderName}}`,
    platform: 'linkedin',
    variables: ['investorName', 'founderTitle', 'companyName', 'sector', 'keyMetrics', 'founderName']
  },
  {
    id: 'template-3',
    name: 'Warm Introduction Email',
    subject: 'Intro: {{companyName}} (AI {{sector}} Platform) <> {{investorName}}',
    body: `Hi {{mutualConnection}},

Would you be willing to introduce me to {{investorName}} at {{investorFirm}}?

We're raising our {{series}} round for {{companyName}}, an AI-powered {{sector}} platform that {{valueProposition}}.

I've attached our one-pager and would appreciate the connection.

Thanks,
{{founderName}}`,
    platform: 'email',
    variables: ['mutualConnection', 'investorName', 'investorFirm', 'series', 'companyName', 'sector', 'valueProposition', 'founderName']
  }
];

// Mock document templates
const mockDocumentTemplates: DocumentTemplate[] = [
  {
    id: 'doc-1',
    name: 'Executive Summary Template',
    type: 'executive-summary',
    template: `# {{companyName}}: Executive Summary

## Overview
{{companyName}} is a {{companyDescription}} founded in {{foundingYear}}. We are {{valueProposition}}.

## Problem
{{problemStatement}}

## Solution
{{solutionDescription}}

## Market Opportunity
The {{sector}} market is valued at {{marketSize}} and growing at {{growthRate}}% annually.

## Traction
- {{keyMetric1}}
- {{keyMetric2}}
- {{keyMetric3}}

## Business Model
{{businessModelDescription}}

## Team
{{teamDescription}}

## Funding
We are raising {{fundingAmount}} in our {{series}} round to {{fundingUse}}.

## Contact
{{founderName}}, {{founderTitle}}
{{founderEmail}}
{{founderPhone}}`,
    variables: ['companyName', 'companyDescription', 'foundingYear', 'valueProposition', 'problemStatement', 'solutionDescription', 'sector', 'marketSize', 'growthRate', 'keyMetric1', 'keyMetric2', 'keyMetric3', 'businessModelDescription', 'teamDescription', 'fundingAmount', 'series', 'fundingUse', 'founderName', 'founderTitle', 'founderEmail', 'founderPhone']
  },
  {
    id: 'doc-2',
    name: 'Pitch Deck Template',
    type: 'pitch-deck',
    template: `# {{companyName}} Pitch Deck

## Slide 1: Cover
- {{companyName}}
- {{tagline}}
- {{date}}

## Slide 2: Problem
- {{problemPoint1}}
- {{problemPoint2}}
- {{problemPoint3}}

## Slide 3: Solution
- {{solutionDescription}}
- {{keyFeature1}}
- {{keyFeature2}}
- {{keyFeature3}}

## Slide 4: Market Opportunity
- Market size: {{marketSize}}
- Growth rate: {{growthRate}}%
- Target segment: {{targetSegment}}

## Slide 5: Product
- {{productDescription}}
- {{productScreenshot1}}
- {{productScreenshot2}}

## Slide 6: Traction
- {{tractionMetric1}}
- {{tractionMetric2}}
- {{tractionMetric3}}
- {{growthChart}}

## Slide 7: Business Model
- {{revenueModel}}
- {{pricingStrategy}}
- {{unitEconomics}}

## Slide 8: Go-to-Market
- {{gtmStrategy}}
- {{customerAcquisition}}
- {{salesProcess}}

## Slide 9: Competition
- {{competitiveAdvantage}}
- {{competitorComparison}}

## Slide 10: Team
- {{founderName1}}, {{founderTitle1}}, {{founderBackground1}}
- {{founderName2}}, {{founderTitle2}}, {{founderBackground2}}
- {{keyHire1}}, {{keyHireTitle1}}
- {{keyHire2}}, {{keyHireTitle2}}

## Slide 11: Financials
- {{financialProjections}}
- {{breakEvenPoint}}
- {{keyAssumptions}}

## Slide 12: Funding Ask
- Raising {{fundingAmount}} in {{series}} round
- Use of funds:
  - {{fundingUse1}}: {{fundingUsePercent1}}%
  - {{fundingUse2}}: {{fundingUsePercent2}}%
  - {{fundingUse3}}: {{fundingUsePercent3}}%

## Slide 13: Vision
- {{visionStatement}}
- {{futureMilestones}}

## Slide 14: Contact
- {{contactInformation}}
- {{companyWebsite}}`,
    variables: ['companyName', 'tagline', 'date', 'problemPoint1', 'problemPoint2', 'problemPoint3', 'solutionDescription', 'keyFeature1', 'keyFeature2', 'keyFeature3', 'marketSize', 'growthRate', 'targetSegment', 'productDescription', 'productScreenshot1', 'productScreenshot2', 'tractionMetric1', 'tractionMetric2', 'tractionMetric3', 'growthChart', 'revenueModel', 'pricingStrategy', 'unitEconomics', 'gtmStrategy', 'customerAcquisition', 'salesProcess', 'competitiveAdvantage', 'competitorComparison', 'founderName1', 'founderTitle1', 'founderBackground1', 'founderName2', 'founderTitle2', 'founderBackground2', 'keyHire1', 'keyHireTitle1', 'keyHire2', 'keyHireTitle2', 'financialProjections', 'breakEvenPoint', 'keyAssumptions', 'fundingAmount', 'series', 'fundingUse1', 'fundingUsePercent1', 'fundingUse2', 'fundingUsePercent2', 'fundingUse3', 'fundingUsePercent3', 'visionStatement', 'futureMilestones', 'contactInformation', 'companyWebsite']
  }
];

// Mock competitor intelligence
const mockCompetitorIntelligence: CompetitorIntelligence[] = [
  {
    id: 'comp-1',
    companyName: 'TechRival Inc.',
    fundingHistory: [
      {
        date: '2024-01-15',
        round: 'Series A',
        amount: '$8M',
        investors: ['Venture Partners', 'Tech Fund', 'Angel Group']
      },
      {
        date: '2023-03-10',
        round: 'Seed',
        amount: '$2M',
        investors: ['Seed Capital', 'Early Ventures']
      }
    ],
    revenueModel: 'SaaS subscription with tiered pricing',
    goToMarketStrategy: 'Product-led growth with freemium model',
    keyDifferentiators: [
      'Proprietary AI algorithm',
      'Enterprise security features',
      'Industry-specific templates'
    ],
    lastUpdated: '2025-05-15T10:00:00Z'
  },
  {
    id: 'comp-2',
    companyName: 'AI Solutions Ltd.',
    fundingHistory: [
      {
        date: '2024-04-20',
        round: 'Series B',
        amount: '$25M',
        investors: ['Growth Capital', 'Tech Ventures', 'Strategic Investor']
      },
      {
        date: '2023-06-05',
        round: 'Series A',
        amount: '$12M',
        investors: ['Early Growth Fund', 'AI Investors']
      },
      {
        date: '2022-09-15',
        round: 'Seed',
        amount: '$3M',
        investors: ['Seed Ventures', 'Angel Collective']
      }
    ],
    revenueModel: 'Enterprise licensing with professional services',
    goToMarketStrategy: 'Sales-led with industry-focused teams',
    keyDifferentiators: [
      'Comprehensive solution suite',
      'Advanced analytics dashboard',
      'White-glove customer success program'
    ],
    lastUpdated: '2025-05-18T14:30:00Z'
  }
];

// Pitch deck best practices
const pitchDeckBestPractices = [
  'Keep it concise - aim for 10-15 slides maximum',
  'Start with a compelling problem statement',
  'Clearly articulate your unique value proposition',
  'Include meaningful traction metrics',
  'Demonstrate deep market understanding',
  'Highlight your competitive advantages',
  'Present a clear business model',
  'Show realistic financial projections',
  'Feature a strong, complementary team',
  'Make a specific ask with use of funds',
  'Ensure professional, consistent design',
  'Focus on storytelling, not just facts'
];

// Executive summary best practices
const executiveSummaryBestPractices = [
  'Limit to 1-2 pages maximum',
  'Start with a compelling company overview',
  'Clearly define the problem and your solution',
  'Highlight your unique value proposition',
  'Include key traction metrics and milestones',
  'Briefly describe your target market and size',
  'Outline your business and revenue model',
  'Summarize your competitive advantage',
  "Focus on team's technical expertise and domain knowledge",
  'State your funding goals and use of capital',
  'Use clear, concise language without jargon',
  'Include contact information'
];

// Investor outreach best practices
const investorOutreachBestPractices = [
  'Research investors before reaching out',
  'Personalize each message with specific details',
  'Keep initial outreach brief and compelling',
  'Lead with your strongest metrics or achievements',
  'Reference portfolio companies or investment thesis',
  'Include a clear call-to-action',
  'Follow up respectfully if no response',
  'Leverage warm introductions whenever possible',
  'Avoid mass emails or generic templates',
  'Demonstrate knowledge of their investment focus',
  'Include a concise one-pager or executive summary',
  'Be transparent about your funding stage and goals'
];

// Service functions

// Get all advisor agents
export const getAdvisorAgents = async (): Promise<AdvisorAgent[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [...mockAdvisorAgents];
};

// Get advisor agent by ID
export const getAdvisorAgentById = async (id: string): Promise<AdvisorAgent | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const agent = mockAdvisorAgents.find(a => a.id === id);
  
  if (!agent) {
    return null;
  }
  
  return {...agent};
};

// Get funding strategy recommendations
export const getFundingStrategyRecommendations = async (
  series: FundingStrategy['series'],
  sector: string
): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return mockFundingStrategies[series] || [];
};

// Get matching investors
export const getMatchingInvestors = async (
  series: FundingStrategy['series'],
  sector: string,
  limit: number = 5
): Promise<InvestorProfile[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Filter investors by stage and sector
  const matchingInvestors = mockInvestors
    .filter(investor => 
      investor.investmentStage.includes(series) && 
      investor.sectors.some(s => s === sector || s === 'ai')
    )
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, limit);
  
  return matchingInvestors;
};

// Get outreach templates
export const getOutreachTemplates = async (
  platform: 'email' | 'linkedin' = 'email'
): Promise<OutreachTemplate[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return mockOutreachTemplates.filter(t => t.platform === platform);
};

// Generate personalized outreach message
export const generateOutreachMessage = async (
  templateId: string,
  variables: Record<string, string>
): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const template = mockOutreachTemplates.find(t => t.id === templateId);
  
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }
  
  let message = template.body;
  
  // Replace variables in template
  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return message;
};

// Get document templates
export const getDocumentTemplates = async (
  type?: DocumentTemplate['type']
): Promise<DocumentTemplate[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  if (type) {
    return mockDocumentTemplates.filter(t => t.type === type);
  }
  
  return mockDocumentTemplates;
};

// Generate document from template
export const generateDocument = async (
  templateId: string,
  variables: Record<string, string>
): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const template = mockDocumentTemplates.find(t => t.id === templateId);
  
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }
  
  let document = template.template;
  
  // Replace variables in template
  for (const [key, value] of Object.entries(variables)) {
    document = document.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return document;
};

// Get competitor intelligence
export const getCompetitorIntelligence = async (
  sector: string
): Promise<CompetitorIntelligence[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // In a real implementation, this would filter by sector
  return mockCompetitorIntelligence;
};

// Get pitch deck best practices
export const getPitchDeckBestPractices = async (): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return pitchDeckBestPractices;
};

// Get executive summary best practices
export const getExecutiveSummaryBestPractices = async (): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return executiveSummaryBestPractices;
};

// Get investor outreach best practices
export const getInvestorOutreachBestPractices = async (): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return investorOutreachBestPractices;
};

// Create a new advisor agent
export const createAdvisorAgent = async (agent: Omit<AdvisorAgent, 'id' | 'createdAt'>): Promise<AdvisorAgent> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newAgent: AdvisorAgent = {
    ...agent,
    id: `advisor-${uuidv4().substring(0, 8)}`,
    createdAt: new Date().toISOString()
  };
  
  // In a real implementation, this would save to a database
  mockAdvisorAgents.push(newAgent);
  
  return newAgent;
};

// Update an advisor agent
export const updateAdvisorAgent = async (id: string, updates: Partial<AdvisorAgent>): Promise<AdvisorAgent | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const index = mockAdvisorAgents.findIndex(a => a.id === id);
  
  if (index === -1) {
    return null;
  }
  
  mockAdvisorAgents[index] = {
    ...mockAdvisorAgents[index],
    ...updates
  };
  
  return {...mockAdvisorAgents[index]};
};

// Delete an advisor agent
export const deleteAdvisorAgent = async (id: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockAdvisorAgents.findIndex(a => a.id === id);
  
  if (index === -1) {
    return false;
  }
  
  mockAdvisorAgents.splice(index, 1);
  
  return true;
};

// Mock company data
const mockCompanyProfiles: Record<string, any> = {
  'user-1': {
    id: 'company-1',
    name: 'TechInnovate AI',
    description: 'AI-powered business process automation platform for enterprise customers',
    industry: 'Enterprise Software',
    location: 'San Francisco, CA',
    foundingDate: '2023-02-15',
    teamSize: 12,
    fundingSeries: 'seed',
    revenueRange: '$100K-$500K',
    keyMetrics: {
      mrr: 42000,
      growthRate: 18,
      cac: 3500,
      ltv: 28000,
      churnRate: 4.2
    },
    founders: [
      {
        name: 'Alex Chen',
        title: 'CEO',
        background: 'Former ML Research Lead at Google'
      },
      {
        name: 'Maria Rodriguez',
        title: 'CTO',
        background: 'Previously founded and sold DataTech Inc.'
      }
    ],
    website: 'https://techinnovate.ai'
  }
};

// Mock funding documents
const mockFundingDocuments = [
  {
    id: 'doc-001',
    name: 'TechInnovate AI - Executive Summary',
    type: 'Executive Summary',
    version: 1.0,
    status: 'Ready',
    createdAt: '2025-01-15T09:30:00Z',
    updatedAt: '2025-01-20T14:45:00Z',
    url: '/documents/exec-summary-v1.pdf'
  },
  {
    id: 'doc-002',
    name: 'TechInnovate AI - Pitch Deck',
    type: 'Pitch Deck',
    version: 2.1,
    status: 'Draft',
    createdAt: '2025-01-18T11:20:00Z',
    updatedAt: '2025-02-05T16:30:00Z',
    url: '/documents/pitch-deck-v2.pdf'
  },
  {
    id: 'doc-003',
    name: 'TechInnovate AI - Financial Projections',
    type: 'Financial Model',
    version: 1.2,
    status: 'Ready',
    createdAt: '2025-01-25T13:45:00Z',
    updatedAt: '2025-02-10T09:15:00Z',
    url: '/documents/financials-v1.xlsx'
  }
];

// Mock data rooms
const mockDataRooms = [
  {
    id: 'room-001',
    name: 'TechInnovate AI - Seed Round Data Room',
    description: 'Secure data room for seed investors',
    status: 'Active',
    accessCount: 8,
    documents: ['doc-001', 'doc-002', 'doc-003'],
    createdAt: '2025-02-15T10:00:00Z',
    updatedAt: '2025-03-01T16:20:00Z'
  }
];

// Mock competitors data
const mockCompetitors = [
  {
    id: 'comp-001',
    name: 'AutomateX',
    description: 'Enterprise automation platform with RPA capabilities',
    industry: 'Enterprise Software',
    location: 'Boston, MA',
    founded: '2020',
    website: 'https://automatex.com',
    keyDifferentiators: [
      'Strong RPA features',
      'Legacy system integration',
      'Industry templates'
    ],
    funding: {
      total: '$15M',
      lastRound: {
        type: 'Series A',
        date: '2024-07',
        amount: '$12M'
      }
    }
  },
  {
    id: 'comp-002',
    name: 'ProcessAI',
    description: 'AI-driven process mining and automation',
    industry: 'Enterprise Software',
    location: 'Austin, TX',
    founded: '2021',
    website: 'https://processai.tech',
    keyDifferentiators: [
      'Process mining technology',
      'Predictive analytics',
      'Self-optimizing workflows'
    ],
    funding: {
      total: '$8.5M',
      lastRound: {
        type: 'Seed+',
        date: '2024-03',
        amount: '$6.5M'
      }
    }
  },
  {
    id: 'comp-003',
    name: 'WorkflowGenius',
    description: 'No-code workflow automation for mid-market',
    industry: 'Business Software',
    location: 'New York, NY',
    founded: '2022',
    website: 'https://workflowgenius.io',
    keyDifferentiators: [
      'No-code interface',
      'Rapid implementation',
      'SMB focus'
    ],
    funding: {
      total: '$3.2M',
      lastRound: {
        type: 'Seed',
        date: '2023-11',
        amount: '$3.2M'
      }
    }
  }
];

// Implementation of missing functions

// Get company profile function
export const getCompanyProfile = async (userId: string): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockCompanyProfiles[userId] || null;
};

// Update company profile function
export const updateCompanyProfile = async (userId: string, profile: any): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  mockCompanyProfiles[userId] = {
    ...mockCompanyProfiles[userId],
    ...profile
  };
  return mockCompanyProfiles[userId];
};

// Generate funding strategy function
export const generateFundingStrategy = async (companyProfile: any): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const series = companyProfile.fundingSeries || 'seed';
  const industry = companyProfile.industry || 'Technology';
  const revenueRange = companyProfile.revenueRange || '$100K-$500K';
  
  // Generate a strategy based on company profile
  return {
    series: series,
    recommendedRaise: series === 'pre-seed' ? '$500K-$1M' : 
                      series === 'seed' ? '$1.5M-$3M' : 
                      series === 'series-a' ? '$8M-$12M' : 
                      '$15M+',
    valuation: series === 'pre-seed' ? '$3M-$5M' : 
              series === 'seed' ? '$8M-$15M' : 
              series === 'series-a' ? '$30M-$50M' : 
              '$60M+',
    recommendedInvestorTypes: series === 'pre-seed' || series === 'seed' ? 
                             ['Angel Investors', 'Seed Funds', 'Micro VCs'] : 
                             ['Institutional VCs', 'Strategic Investors'],
    keyMetricsToHighlight: [
      'MRR Growth Rate',
      'Customer Acquisition Cost',
      'Lifetime Value',
      'Expansion Revenue'
    ],
    pitchRecommendations: mockFundingStrategies[series] || [],
    industry: industry,
    revenueModel: 'SaaS Subscription',
    estimatedTimeToRaise: series === 'pre-seed' ? '2-3 months' : 
                          series === 'seed' ? '3-4 months' : 
                          '4-6 months'
  };
};

// Find matching investors function
export const findMatchingInvestors = async (companyProfile: any, criteria: any): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const series = companyProfile.fundingSeries || 'seed';
  const industry = companyProfile.industry || 'Technology';
  
  // Add match score to investors based on company profile
  return mockInvestors.map(investor => {
    // Calculate match score based on stage and sector match
    const stageMatch = investor.investmentStage.includes(series);
    const sectorMatch = investor.sectors.some(s => 
      s.toLowerCase().includes(industry.toLowerCase()) || 
      s === 'ai' || 
      s === 'saas'
    );
    
    const scoreMatch = stageMatch && sectorMatch ? 
      investor.fitScore : 
      stageMatch ? Math.floor(investor.fitScore * 0.8) : 
      sectorMatch ? Math.floor(investor.fitScore * 0.7) : 
      Math.floor(investor.fitScore * 0.5);
    
    return {
      ...investor,
      scoreMatch
    };
  }).sort((a, b) => b.scoreMatch - a.scoreMatch);
};

// Get funding documents function
export const getFundingDocuments = async (): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockFundingDocuments];
};

// Generate funding document function
export const generateFundingDocument = async (
  type: any, 
  name: string, 
  companyProfile: any
): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const documentId = `doc-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();
  
  const newDocument = {
    id: documentId,
    name: name,
    type: type,
    version: 1.0,
    status: 'Draft',
    createdAt: now,
    updatedAt: now,
    url: `/documents/${documentId}.pdf`
  };
  
  return newDocument;
};

// Get competitors function
export const getCompetitors = async (): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  return [...mockCompetitors];
};

// Get data rooms function
export const getDataRooms = async (): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [...mockDataRooms];
};

// Execute funding workflow function
export const executeFundingWorkflow = async (companyId: string): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const company = Object.values(mockCompanyProfiles).find(c => c.id === companyId);
  
  if (!company) {
    throw new Error(`Company ${companyId} not found`);
  }
  
  // Generate strategy, investors, documents, and data room
  const fundingStrategy = await generateFundingStrategy(company);
  const topInvestors = await findMatchingInvestors(company, {});
  
  const executiveSummary = {
    id: `doc-${Math.floor(1000 + Math.random() * 9000)}`,
    name: `${company.name} - Executive Summary`,
    type: 'Executive Summary',
    version: 1.0,
    status: 'Ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    url: '/documents/exec-summary-workflow.pdf'
  };
  
  const pitchDeck = {
    id: `doc-${Math.floor(1000 + Math.random() * 9000)}`,
    name: `${company.name} - Pitch Deck`,
    type: 'Pitch Deck',
    version: 1.0,
    status: 'Ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    url: '/documents/pitch-deck-workflow.pdf'
  };
  
  const dataRoom = {
    id: `room-${Math.floor(100 + Math.random() * 900)}`,
    name: `${company.name} - ${fundingStrategy.series.toUpperCase()} Data Room`,
    description: `Secure data room for ${fundingStrategy.series} investors`,
    status: 'Active',
    accessCount: 0,
    documents: [executiveSummary.id, pitchDeck.id],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return {
    fundingStrategy,
    topInvestors,
    documents: {
      executiveSummary,
      pitchDeck
    },
    dataRoom,
    competitors: mockCompetitors
  };
};

// Save investor function
export const saveInvestor = async (investor: any): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const existingIndex = mockInvestors.findIndex(i => i.id === investor.id);
  
  if (existingIndex >= 0) {
    mockInvestors[existingIndex] = {
      ...mockInvestors[existingIndex],
      ...investor
    };
    return mockInvestors[existingIndex];
  } else {
    const newInvestor = {
      ...investor,
      id: investor.id || `investor-${mockInvestors.length + 1}`,
      fitScore: investor.fitScore || Math.floor(70 + Math.random() * 30)
    };
    mockInvestors.push(newInvestor);
    return newInvestor;
  }
};

// Delete investor function
export const deleteInvestor = async (investorId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const existingIndex = mockInvestors.findIndex(i => i.id === investorId);
  
  if (existingIndex >= 0) {
    mockInvestors.splice(existingIndex, 1);
    return true;
  }
  
  return false;
};

// Export the service
export default {
  getAdvisorAgents,
  getAdvisorAgentById,
  getFundingStrategyRecommendations,
  getMatchingInvestors,
  getOutreachTemplates,
  generateOutreachMessage,
  getDocumentTemplates,
  generateDocument,
  getCompetitorIntelligence,
  getPitchDeckBestPractices,
  getExecutiveSummaryBestPractices,
  getInvestorOutreachBestPractices,
  createAdvisorAgent,
  updateAdvisorAgent,
  deleteAdvisorAgent,
  getCompanyProfile,
  updateCompanyProfile,
  generateFundingStrategy,
  findMatchingInvestors,
  getFundingDocuments,
  generateFundingDocument,
  getCompetitors,
  getDataRooms,
  executeFundingWorkflow,
  saveInvestor,
  deleteInvestor
};