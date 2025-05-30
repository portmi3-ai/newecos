import React, { useState, useEffect } from 'react';
import { DollarSign, Briefcase, Users, FileText, Target, RefreshCw, BarChart, Play } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CompanyProfileForm from '../components/advisors/CompanyProfileForm';
import FundingStrategyCard from '../components/advisors/FundingStrategyCard';
import InvestorList from '../components/advisors/InvestorList';
import FundingDocuments from '../components/advisors/FundingDocuments';
import CompetitorAnalysis from '../components/advisors/CompetitorAnalysis';
import type { CompanyProfile, Investor, FundingDocument, DocumentType, CompetitorInfo, DataRoom } from '../types/advisorAgent';
import { 
  getCompanyProfile, 
  updateCompanyProfile, 
  generateFundingStrategy, 
  findMatchingInvestors,
  getFundingDocuments,
  generateFundingDocument,
  getCompetitors,
  getDataRooms,
  executeFundingWorkflow
} from '../services/advisorAgentService';

// Create a type stub for '../../types/advisorAgent' if missing.
// Example:
// export type CompanyProfile = any;
// export type Investor = any;
// export type FundingDocument = any;
// export type DocumentType = any;
// export type CompetitorInfo = any;
// export type DataRoom = any;

const FundingAdvisorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'investors' | 'documents' | 'competitors'>('overview');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [fundingStrategy, setFundingStrategy] = useState<any | null>(null);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [documents, setDocuments] = useState<FundingDocument[]>([]);
  const [dataRooms, setDataRooms] = useState<DataRoom[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorInfo[]>([]);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
  const [isLoadingInvestors, setIsLoadingInvestors] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false);
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load company profile
        setIsLoadingProfile(true);
        const profile = await getCompanyProfile('user-1');
        setCompanyProfile(profile);
        setIsLoadingProfile(false);
        
        // Only load the rest of the data if there's a profile
        if (profile) {
          // Load funding strategy
          setIsLoadingStrategy(true);
          const strategy = await generateFundingStrategy(profile);
          setFundingStrategy(strategy);
          setIsLoadingStrategy(false);
          
          // Load investors
          setIsLoadingInvestors(true);
          const matchingInvestors = await findMatchingInvestors(profile, {});
          setInvestors(matchingInvestors);
          setIsLoadingInvestors(false);
          
          // Load documents
          setIsLoadingDocuments(true);
          const fundingDocuments = await getFundingDocuments();
          setDocuments(fundingDocuments);
          const rooms = await getDataRooms();
          setDataRooms(rooms);
          setIsLoadingDocuments(false);
          
          // Load competitors
          setIsLoadingCompetitors(true);
          const competitorData = await getCompetitors();
          setCompetitors(competitorData);
          setIsLoadingCompetitors(false);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const handleSaveProfile = async (profile: CompanyProfile) => {
    try {
      const updatedProfile = await updateCompanyProfile('user-1', profile);
      setCompanyProfile(updatedProfile);
      
      // Refresh funding strategy
      setIsLoadingStrategy(true);
      const strategy = await generateFundingStrategy(updatedProfile);
      setFundingStrategy(strategy);
      setIsLoadingStrategy(false);
      
      // Refresh investors
      setIsLoadingInvestors(true);
      const matchingInvestors = await findMatchingInvestors(updatedProfile, {});
      setInvestors(matchingInvestors);
      setIsLoadingInvestors(false);
      
      setActiveTab('overview');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleRefreshStrategy = async () => {
    if (!companyProfile) return;
    
    try {
      setIsLoadingStrategy(true);
      const strategy = await generateFundingStrategy(companyProfile);
      setFundingStrategy(strategy);
    } catch (error) {
      console.error('Error refreshing strategy:', error);
    } finally {
      setIsLoadingStrategy(false);
    }
  };

  const handleFindInvestors = async () => {
    if (!companyProfile) return;
    
    try {
      setIsLoadingInvestors(true);
      const matchingInvestors = await findMatchingInvestors(companyProfile, {});
      setInvestors(matchingInvestors);
    } catch (error) {
      console.error('Error finding investors:', error);
    } finally {
      setIsLoadingInvestors(false);
    }
  };

  const handleGenerateDocument = async (type: DocumentType) => {
    if (!companyProfile) return;
    
    try {
      setIsLoadingDocuments(true);
      const documentName = `${companyProfile.name} - ${type}`;
      const newDocument = await generateFundingDocument(type, documentName, companyProfile);
      setDocuments([...documents, newDocument]);
    } catch (error) {
      console.error('Error generating document:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleRunFullWorkflow = async () => {
    if (!companyProfile) return;
    
    try {
      setIsRunningWorkflow(true);
      const result = await executeFundingWorkflow('company-1');
      
      // Update states with workflow results
      setFundingStrategy(result.fundingStrategy);
      setInvestors(result.topInvestors);
      setDocuments([...documents, result.documents.executiveSummary, result.documents.pitchDeck]);
      setDataRooms([...dataRooms, result.dataRoom]);
      setCompetitors(result.competitors);
      
      // Switch to overview tab
      setActiveTab('overview');
    } catch (error) {
      console.error('Error running workflow:', error);
    } finally {
      setIsRunningWorkflow(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Funding Advisor</h1>
        <p className="mt-2 text-gray-600">
          Get strategic funding advice, investor matching, and document preparation for your fundraising journey
        </p>
      </div>

      <div className="mb-6 bg-white border border-gray-200 rounded-lg">
        <div className="sm:hidden">
          <select
            className="block w-full focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            title="Investor Type Selector"
          >
            <option value="overview">Overview</option>
            <option value="profile">Company Profile</option>
            <option value="investors">Investors</option>
            <option value="documents">Documents</option>
            <option value="competitors">Competitors</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <DollarSign className={`mr-2 h-5 w-5 ${activeTab === 'overview' ? 'text-primary-500' : 'text-gray-400'}`} />
                Overview
              </span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <Briefcase className={`mr-2 h-5 w-5 ${activeTab === 'profile' ? 'text-primary-500' : 'text-gray-400'}`} />
                Company Profile
              </span>
            </button>
            <button
              onClick={() => setActiveTab('investors')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'investors'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <Users className={`mr-2 h-5 w-5 ${activeTab === 'investors' ? 'text-primary-500' : 'text-gray-400'}`} />
                Investors
              </span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'documents'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <FileText className={`mr-2 h-5 w-5 ${activeTab === 'documents' ? 'text-primary-500' : 'text-gray-400'}`} />
                Documents
              </span>
            </button>
            <button
              onClick={() => setActiveTab('competitors')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'competitors'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center">
                <Target className={`mr-2 h-5 w-5 ${activeTab === 'competitors' ? 'text-primary-500' : 'text-gray-400'}`} />
                Competitors
              </span>
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {!companyProfile ? (
            <Card>
              <Card.Body className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Profile Found</h3>
                <p className="text-gray-500 mb-6">
                  Start by creating your company profile to receive personalized funding advice.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setActiveTab('profile')}
                >
                  Create Company Profile
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <Card.Header>
                    <h2 className="text-xl font-bold text-gray-900">Company Overview</h2>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{companyProfile.name}</h3>
                        <p className="text-gray-600 mt-1">{companyProfile.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Industry</p>
                          <p className="mt-1 text-sm text-gray-900">{companyProfile.industry}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="mt-1 text-sm text-gray-900">{companyProfile.location}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Founded</p>
                          <p className="mt-1 text-sm text-gray-900">{companyProfile.foundingDate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Team Size</p>
                          <p className="mt-1 text-sm text-gray-900">{companyProfile.teamSize}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Current Stage</p>
                          <p className="mt-1 text-sm text-gray-900">{companyProfile.fundingSeries || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Revenue Range</p>
                          <p className="mt-1 text-sm text-gray-900">{companyProfile.revenueRange || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      {companyProfile.keyMetrics && Object.keys(companyProfile.keyMetrics).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Metrics</h4>
                          <div className="bg-gray-50 rounded-md p-3 grid grid-cols-2 gap-3">
                            {Object.entries(companyProfile.keyMetrics).map(([key, value]) => (
                              <div key={key}>
                                <p className="text-xs font-medium text-gray-500 uppercase">{formatMetricName(key)}</p>
                                <p className="text-sm font-medium text-gray-900">{formatMetricValue(key, value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      variant="outline"
                      leftIcon={<Briefcase className="h-4 w-4" />}
                      onClick={() => setActiveTab('profile')}
                    >
                      Edit Company Profile
                    </Button>
                  </Card.Footer>
                </Card>
                
                <Card>
                  <Card.Header>
                    <h2 className="text-xl font-bold text-gray-900">Funding Advisor</h2>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Our AI funding advisor team can help you prepare for your next funding round. 
                        Run a complete funding workflow to get strategic recommendations.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-gray-200 rounded-md p-3">
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 text-primary-500 mr-2" />
                            <h3 className="font-medium text-gray-900">Funding Strategy</h3>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Get tailored funding series, valuation, and pitch recommendations
                          </p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-md p-3">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-primary-500 mr-2" />
                            <h3 className="font-medium text-gray-900">Investor Matching</h3>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Find investors that match your industry, stage, and company profile
                          </p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-md p-3">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-primary-500 mr-2" />
                            <h3 className="font-medium text-gray-900">Document Generation</h3>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Create executive summaries, pitch decks, and financial models
                          </p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-md p-3">
                          <div className="flex items-center">
                            <Target className="h-5 w-5 text-primary-500 mr-2" />
                            <h3 className="font-medium text-gray-900">Competitor Analysis</h3>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Track competitor funding, products, and market movements
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      variant="primary"
                      fullWidth
                      leftIcon={<Play className="h-4 w-4" />}
                      onClick={handleRunFullWorkflow}
                      isLoading={isRunningWorkflow}
                    >
                      Run Full Funding Workflow
                    </Button>
                  </Card.Footer>
                </Card>
              </div>
              
              {fundingStrategy && (
                <FundingStrategyCard
                  strategy={fundingStrategy}
                  onRefresh={handleRefreshStrategy}
                  onViewDetails={() => {}}
                  isLoading={isLoadingStrategy}
                />
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {investors.length > 0 && (
                  <div className="lg:col-span-1">
                    <Card>
                      <Card.Header className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Top Investors</h2>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<RefreshCw className="h-4 w-4" />}
                          onClick={handleFindInvestors}
                          isLoading={isLoadingInvestors}
                        >
                          Refresh
                        </Button>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <ul className="divide-y divide-gray-200">
                          {investors.slice(0, 3).map((investor) => (
                            <li key={investor.id} className="px-6 py-4 hover:bg-gray-50">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-lg font-medium">
                                    {investor.name.charAt(0)}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <h3 className="text-lg font-medium text-gray-900">{investor.name}</h3>
                                  <div className="flex items-center text-sm text-gray-500">
                                    {investor.firm && (
                                      <span className="mr-2 font-medium">{investor.firm}</span>
                                    )}
                                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                                      {investor.type}
                                    </span>
                                  </div>
                                </div>
                                {investor.scoreMatch && (
                                  <div className="ml-auto bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    {investor.scoreMatch}% Match
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </Card.Body>
                      <Card.Footer>
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => setActiveTab('investors')}
                        >
                          View All Investors
                        </Button>
                      </Card.Footer>
                    </Card>
                  </div>
                )}
                
                {documents.length > 0 && (
                  <div className="lg:col-span-1">
                    <Card>
                      <Card.Header className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Recent Documents</h2>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<FileText className="h-4 w-4" />}
                          onClick={() => setActiveTab('documents')}
                        >
                          View All
                        </Button>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <ul className="divide-y divide-gray-200">
                          {documents.slice(0, 3).map((document) => (
                            <li key={document.id} className="px-6 py-4 hover:bg-gray-50">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <FileText className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="ml-4">
                                  <h3 className="text-sm font-medium text-gray-900">{document.name}</h3>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <span>{document.type}</span>
                                    <span className="mx-1">•</span>
                                    <span>v{document.version}</span>
                                    <span className="mx-1">•</span>
                                    <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="ml-auto">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    document.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                    document.status === 'Ready' ? 'bg-green-100 text-green-800' :
                                    document.status === 'Shared' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {document.status}
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </Card.Body>
                      <Card.Footer>
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => setActiveTab('documents')}
                        >
                          Manage Documents
                        </Button>
                      </Card.Footer>
                    </Card>
                  </div>
                )}
              </div>
              
              {competitors.length > 0 && (
                <div>
                  <Card>
                    <Card.Header className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-900">Competitor Insights</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<BarChart className="h-4 w-4" />}
                        onClick={() => setActiveTab('competitors')}
                      >
                        Full Analysis
                      </Button>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="divide-y divide-gray-200">
                        {competitors.slice(0, 2).map((competitor) => (
                          <div key={competitor.id} className="px-6 py-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 text-lg font-medium">
                                    {competitor.name.charAt(0)}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="flex items-center">
                                    <h3 className="text-lg font-medium text-gray-900">{competitor.name}</h3>
                                  </div>
                                  <div className="mt-1 text-sm text-gray-500">{competitor.description}</div>
                                </div>
                              </div>
                              
                              {competitor.funding?.lastRound && (
                                <div className="text-right">
                                  <div className="text-xs text-gray-500">Last Funding</div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {competitor.funding.lastRound.amount} ({competitor.funding.lastRound.type})
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => setActiveTab('competitors')}
                      >
                        View All Competitors
                      </Button>
                    </Card.Footer>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <CompanyProfileForm
          initialProfile={companyProfile || undefined}
          onSave={handleSaveProfile}
          isLoading={isLoadingProfile}
        />
      )}

      {activeTab === 'investors' && (
        <>
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={handleFindInvestors}
              isLoading={isLoadingInvestors}
            >
              Refresh Investor Matches
            </Button>
          </div>
          <InvestorList
            investors={investors}
            onSendEmail={(investorId) => {
              console.log(`Send email to ${investorId}`);
            }}
            onSendLinkedIn={(investorId) => {
              console.log(`Send LinkedIn message to ${investorId}`);
            }}
            onAddToFavorites={(investorId) => {
              console.log(`Add ${investorId} to favorites`);
            }}
            onAddInvestor={() => {
              console.log('Add new investor');
            }}
            isLoading={isLoadingInvestors}
          />
        </>
      )}

      {activeTab === 'documents' && (
        <FundingDocuments
          documents={documents}
          dataRooms={dataRooms}
          onGenerateDocument={handleGenerateDocument}
          onViewDocument={(documentId) => {
            console.log(`View document ${documentId}`);
          }}
          onEditDocument={(documentId) => {
            console.log(`Edit document ${documentId}`);
          }}
          onShareDocument={(documentId) => {
            console.log(`Share document ${documentId}`);
          }}
          onCreateDataRoom={() => {
            console.log('Create new data room');
          }}
          onViewDataRoom={(dataRoomId) => {
            console.log(`View data room ${dataRoomId}`);
          }}
          isLoading={isLoadingDocuments}
        />
      )}

      {activeTab === 'competitors' && (
        <CompetitorAnalysis
          competitors={competitors}
          onAddCompetitor={() => {
            console.log('Add new competitor');
          }}
          onViewCompetitor={(competitorId) => {
            console.log(`View competitor ${competitorId}`);
          }}
          onTrackNews={(competitorId) => {
            console.log(`Track news for ${competitorId}`);
          }}
          isLoading={isLoadingCompetitors}
        />
      )}
    </div>
  );
};

// Helper function to format metric names
const formatMetricName = (key: string): string => {
  switch (key) {
    case 'mrr': return 'MRR';
    case 'arr': return 'ARR';
    case 'growthRate': return 'Growth Rate';
    case 'cac': return 'CAC';
    case 'ltv': return 'LTV';
    case 'churnRate': return 'Churn Rate';
    default: return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
};

// Helper function to format metric values
const formatMetricValue = (key: string, value: string | number): string => {
  if (typeof value === 'number') {
    switch (key) {
      case 'mrr':
      case 'arr':
      case 'cac':
      case 'ltv':
        return `$${value.toLocaleString()}`;
      case 'growthRate':
      case 'churnRate':
        return `${value}%`;
      default:
        return value.toString();
    }
  }
  return value;
};

export default FundingAdvisorPage;