export const fundingStrategyTemplates = [
  {
    id: 'funding-strategy-advisor',
    name: 'Funding Strategy Advisor',
    description: 'Guides users through funding strategy, valuation, and sales motion selection',
    industry: 'funding',
    level: 'executive',
    capabilities: ['funding-strategy', 'market-analysis', 'valuation-assessment'],
    features: [
      'Funding series selection guidance',
      'Revenue range analysis',
      'Valuation benchmarking',
      'Sales motion optimization'
    ],
    promptTemplate: `You are a Funding Strategy Advisor specialized in helping {{industry}} startups navigate funding options. 
Based on the company's profile, recommend appropriate funding strategies, valuation ranges, and sales approaches.

Company Information:
{{companyProfile}}

Current Market Conditions:
{{marketConditions}}

Please provide strategic funding recommendations including:
1. Appropriate funding series based on company stage and metrics
2. Realistic valuation range with justification
3. Optimal sales motion for current stage
4. Key metrics investors will focus on
5. Recommended fundraising timeline`,
    modelConfig: {
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 2048
    }
  }
];

export const investorMatchmakerTemplates = [
  {
    id: 'investor-matchmaker',
    name: 'Investor Matchmaker',
    description: 'Identifies ideal investors based on company profile and funding stage',
    industry: 'funding',
    level: 'specialized',
    capabilities: ['investor-search', 'fit-assessment', 'investor-ranking'],
    features: [
      'Investor database search',
      'Fit scoring algorithm',
      'Investment history analysis',
      'Portfolio company matching'
    ],
    promptTemplate: `You are an Investor Matchmaker Agent specialized in finding the ideal investors for {{industry}} startups.
Based on the company's profile and funding stage, identify and rank potential investors that would be a strong fit.

Company Information:
{{companyProfile}}

Funding Requirements:
{{fundingRequirements}}

Please provide a ranked list of potential investors including:
1. Investor name, firm, and type
2. Relevance score and justification
3. Recent similar investments
4. Typical check size and investment terms
5. Best approach for initial outreach`,
    modelConfig: {
      model: 'gpt-4',
      temperature: 0.2,
      maxTokens: 2048
    }
  }
];

export const outreachTemplates = [
  {
    id: 'outreach-engagement-agent',
    name: 'Investor Outreach Agent',
    description: 'Creates personalized investor communications and manages engagement',
    industry: 'funding',
    level: 'operational',
    capabilities: ['email-drafting', 'outreach-scheduling', 'response-tracking'],
    features: [
      'Personalized email drafting',
      'LinkedIn message creation',
      'Follow-up scheduling',
      'Response tracking'
    ],
    promptTemplate: `You are an Investor Outreach Agent specialized in crafting compelling communications to investors for {{industry}} startups.
Create a personalized outreach message based on the company profile and investor details.

Company Information:
{{companyProfile}}

Investor Details:
{{investorDetails}}

Please draft a personalized outreach message that:
1. Establishes a connection or common ground
2. Clearly articulates the company's value proposition
3. Demonstrates traction and market opportunity
4. Makes a specific, actionable ask
5. Provides a clear next step`,
    modelConfig: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1024
    }
  }
];

export const documentationTemplates = [
  {
    id: 'documentation-agent',
    name: 'Funding Documentation Agent',
    description: 'Creates and manages funding documents and investor data rooms',
    industry: 'funding',
    level: 'operational',
    capabilities: ['document-generation', 'data-room-management', 'document-sharing'],
    features: [
      'Pitch deck generation',
      'Executive summary creation',
      'Financial model templates',
      'Secure data room setup'
    ],
    promptTemplate: `You are a Documentation Agent specialized in creating professional funding documents for {{industry}} startups.
Generate a comprehensive {{documentType}} based on the company profile and funding strategy.

Company Information:
{{companyProfile}}

Funding Strategy:
{{fundingStrategy}}

Please create a detailed {{documentType}} that includes:
1. All necessary sections for this document type
2. Compelling narrative that highlights the company's strengths
3. Relevant metrics and data points for investors
4. Appropriate visuals and structure
5. Clear call to action`,
    modelConfig: {
      model: 'gpt-4',
      temperature: 0.4,
      maxTokens: 3072
    }
  }
];

export const marketIntelligenceTemplates = [
  {
    id: 'market-intelligence-agent',
    name: 'Market Intelligence Agent',
    description: 'Monitors competitors, market trends, and funding activities',
    industry: 'funding',
    level: 'specialized',
    capabilities: ['competitor-monitoring', 'market-trend-analysis', 'news-tracking'],
    features: [
      'Competitor funding alerts',
      'Market trend analysis',
      'News and social media monitoring',
      'Strategic insights generation'
    ],
    promptTemplate: `You are a Market Intelligence Agent specialized in monitoring the competitive landscape for {{industry}} startups.
Analyze recent market developments and provide strategic insights.

Company Information:
{{companyProfile}}

Recent Market Activity:
{{marketActivity}}

Please provide a comprehensive market intelligence report including:
1. Recent competitor funding rounds and implications
2. Emerging market trends and their impact on the company
3. New entrants or potential disruptors
4. Changes in customer behavior or preferences
5. Strategic recommendations based on these insights`,
    modelConfig: {
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 2048
    }
  }
];

export const getAllAdvisorTemplates = () => [
  ...fundingStrategyTemplates,
  ...investorMatchmakerTemplates,
  ...outreachTemplates,
  ...documentationTemplates,
  ...marketIntelligenceTemplates
];

export const getTemplateById = (id: string) => {
  return getAllAdvisorTemplates().find(template => template.id === id);
};