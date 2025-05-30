import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { TrendingUp, DollarSign, BarChart3, Target, Calendar, ChevronRight } from 'lucide-react';

interface FundingStrategy {
  recommendedFundingSeries: string;
  valuationEstimate: string;
  recommendedRaise: string;
  timelineToRaise: string;
  keyMetricsToFocus: Array<{
    name: string;
    target: string;
    current: string | number;
  }>;
  pitchRecommendations: string[];
  marketAnalysis: {
    competitiveLandscape: string;
    marketGrowthRate: string;
    keyDifferentiators: string[];
  };
}

interface FundingStrategyCardProps {
  strategy: FundingStrategy;
  onRefresh?: () => void;
  onViewDetails?: () => void;
  isLoading?: boolean;
}

const FundingStrategyCard: React.FC<FundingStrategyCardProps> = ({
  strategy,
  onRefresh,
  onViewDetails,
  isLoading = false
}) => {
  return (
    <Card>
      <Card.Header className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mr-3">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Funding Strategy</h2>
          </div>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<TrendingUp className="h-4 w-4" />}
            onClick={onRefresh}
            isLoading={isLoading}
          >
            Refresh Analysis
          </Button>
        )}
      </Card.Header>
      
      <Card.Body>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-2">
                    <DollarSign className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-xs font-medium text-gray-500 uppercase">Funding Round</div>
                    <div className="text-lg font-semibold text-gray-900">{strategy.recommendedFundingSeries}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-xs font-medium text-gray-500 uppercase">Valuation</div>
                    <div className="text-lg font-semibold text-gray-900">{strategy.valuationEstimate}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-xs font-medium text-gray-500 uppercase">Target Raise</div>
                    <div className="text-lg font-semibold text-gray-900">{strategy.recommendedRaise}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-xs font-medium text-gray-500 uppercase">Timeline</div>
                    <div className="text-lg font-semibold text-gray-900">{strategy.timelineToRaise}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Key Metrics to Focus On</h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {strategy.keyMetricsToFocus.map((metric, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.target}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.current}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Pitch Recommendations</h3>
              <ul className="space-y-2">
                {strategy.pitchRecommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-800 text-xs font-medium mr-2 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Market Analysis</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Competitive Landscape</p>
                    <p className="mt-1 text-sm text-gray-600">{strategy.marketAnalysis.competitiveLandscape}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Market Growth Rate</p>
                    <p className="mt-1 text-sm text-gray-600">{strategy.marketAnalysis.marketGrowthRate}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Key Differentiators</p>
                  <ul className="mt-1 space-y-1">
                    {strategy.marketAnalysis.keyDifferentiators.map((differentiator, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                        {differentiator}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
      
      {onViewDetails && (
        <Card.Footer>
          <Button 
            variant="outline" 
            fullWidth
            rightIcon={<ChevronRight className="h-4 w-4" />}
            onClick={onViewDetails}
          >
            View Detailed Funding Strategy
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default FundingStrategyCard;