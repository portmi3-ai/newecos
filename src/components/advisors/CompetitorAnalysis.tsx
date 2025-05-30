import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Globe, Layers, TrendingUp, PlusCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { CompetitorInfo } from '../../types/advisorAgent';

interface CompetitorAnalysisProps {
  competitors: CompetitorInfo[];
  onAddCompetitor?: () => void;
  onViewCompetitor?: (competitorId: string) => void;
  onTrackNews?: (competitorId: string) => void;
  isLoading?: boolean;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({
  competitors,
  onAddCompetitor,
  onViewCompetitor,
  onTrackNews,
  isLoading = false
}) => {
  const [expandedCompetitors, setExpandedCompetitors] = useState<Set<string>>(new Set());

  const toggleExpand = (competitorId: string) => {
    const newExpanded = new Set(expandedCompetitors);
    if (newExpanded.has(competitorId)) {
      newExpanded.delete(competitorId);
    } else {
      newExpanded.add(competitorId);
    }
    setExpandedCompetitors(newExpanded);
  };

  return (
    <Card>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Competitor Analysis</h2>
        {onAddCompetitor && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<PlusCircle className="h-4 w-4" />}
            onClick={onAddCompetitor}
          >
            Add Competitor
          </Button>
        )}
      </Card.Header>
      
      <Card.Body className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : competitors.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No competitors added</h3>
            <p className="text-gray-500 mb-6">
              Add competitors to track their funding, products, and market movements.
            </p>
            {onAddCompetitor && (
              <Button
                variant="primary"
                leftIcon={<PlusCircle className="h-4 w-4" />}
                onClick={onAddCompetitor}
              >
                Add Competitor
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {competitors.map((competitor) => (
              <div key={competitor.id} className="px-6 py-4">
                <div 
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleExpand(competitor.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 text-lg font-medium">
                        {competitor.name.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">{competitor.name}</h3>
                        {competitor.website && (
                          <a 
                            href={competitor.website.startsWith('http') ? competitor.website : `https://${competitor.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="ml-2 text-gray-400 hover:text-gray-500"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">{competitor.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {competitor.funding?.lastRound && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Last Funding</div>
                        <div className="text-sm font-medium text-gray-900">
                          {competitor.funding.lastRound.amount} ({competitor.funding.lastRound.type})
                        </div>
                      </div>
                    )}
                    
                    {expandedCompetitors.has(competitor.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedCompetitors.has(competitor.id) && (
                  <div className="mt-4 pl-14">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Differentiators</h4>
                        <ul className="space-y-1">
                          {competitor.keyDifferentiators.map((diff, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center">
                              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                              {diff}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Company Info</h4>
                        <div className="space-y-1 text-sm">
                          {competitor.foundedYear && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Founded</span>
                              <span className="text-gray-900">{competitor.foundedYear}</span>
                            </div>
                          )}
                          {competitor.headcount && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Headcount</span>
                              <span className="text-gray-900">{competitor.headcount}</span>
                            </div>
                          )}
                          {competitor.revenue && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Revenue</span>
                              <span className="text-gray-900">{competitor.revenue}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {competitor.recentNews && competitor.recentNews.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent News</h4>
                        <div className="space-y-3">
                          {competitor.recentNews.map((news, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm">
                              <div className="flex justify-between">
                                <div className="font-medium text-gray-900">{news.title}</div>
                                <div className="text-xs text-gray-500">{news.date}</div>
                              </div>
                              <p className="mt-1 text-gray-600">{news.summary}</p>
                              {news.url && (
                                <a
                                  href={news.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center text-xs text-primary-600 hover:text-primary-500"
                                >
                                  Read More <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-between">
                      {onViewCompetitor && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewCompetitor(competitor.id);
                          }}
                        >
                          View Full Analysis
                        </Button>
                      )}
                      
                      {onTrackNews && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<TrendingUp className="h-4 w-4" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTrackNews(competitor.id);
                          }}
                        >
                          Track News
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default CompetitorAnalysis;