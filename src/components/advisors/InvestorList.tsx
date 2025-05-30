import React, { useState } from 'react';
import { Investor, InvestorType } from '../../types/advisorAgent';
import Card from '../common/Card';
import Button from '../common/Button';
import { ArrowUpRight, Mail, MessageSquare, Star, Filter, Search, Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InvestorListProps {
  investors: Investor[];
  onSendEmail?: (investorId: string) => void;
  onSendLinkedIn?: (investorId: string) => void;
  onAddToFavorites?: (investorId: string) => void;
  onAddInvestor?: () => void;
  isLoading?: boolean;
}

const InvestorList: React.FC<InvestorListProps> = ({
  investors,
  onSendEmail,
  onSendLinkedIn,
  onAddToFavorites,
  onAddInvestor,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<InvestorType | ''>('');
  const [sortBy, setSortBy] = useState<'match' | 'name' | 'firm'>('match');
  
  const filteredInvestors = investors
    .filter(investor => 
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (investor.firm && investor.firm.toLowerCase().includes(searchTerm.toLowerCase())) ||
      investor.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(investor => filterType ? investor.type === filterType : true)
    .sort((a, b) => {
      if (sortBy === 'match') {
        return (b.scoreMatch || 0) - (a.scoreMatch || 0);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'firm') {
        return (a.firm || '').localeCompare(b.firm || '');
      }
      return 0;
    });

  return (
    <Card>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Investors</h2>
        <div className="flex space-x-2">
          {onAddInvestor && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={onAddInvestor}
            >
              Add Investor
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Users className="h-4 w-4" />}
          >
            Import Investors
          </Button>
        </div>
      </Card.Header>
      
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 sm:px-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search investors..."
              className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as InvestorType | '')}
              >
                <option value="">All Types</option>
                <option value="Angel">Angel</option>
                <option value="Pre-Seed Fund">Pre-Seed Fund</option>
                <option value="Seed Fund">Seed Fund</option>
                <option value="VC (Early Stage)">VC (Early Stage)</option>
                <option value="VC (Growth)">VC (Growth)</option>
                <option value="Strategic">Strategic</option>
              </select>
            </div>
            
            <select
              className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'match' | 'name' | 'firm')}
            >
              <option value="match">Sort by Match</option>
              <option value="name">Sort by Name</option>
              <option value="firm">Sort by Firm</option>
            </select>
          </div>
        </div>
      </div>
      
      <Card.Body className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredInvestors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investors found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType
                ? "We couldn't find any investors matching your search criteria."
                : "You haven't added any investors yet."}
            </p>
            {onAddInvestor && (
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={onAddInvestor}
              >
                Add Your First Investor
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredInvestors.map((investor) => (
              <li key={investor.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-lg font-medium">
                        {investor.name.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">{investor.name}</h3>
                        {investor.scoreMatch && (
                          <div className="ml-2 bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {investor.scoreMatch}% Match
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        {investor.firm && (
                          <span className="mr-2 font-medium">{investor.firm}</span>
                        )}
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                          {investor.type}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{investor.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {investor.email && onSendEmail && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Mail className="h-4 w-4" />}
                        onClick={() => onSendEmail(investor.id)}
                      >
                        Email
                      </Button>
                    )}
                    
                    {investor.linkedInUrl && onSendLinkedIn && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<MessageSquare className="h-4 w-4" />}
                        onClick={() => onSendLinkedIn(investor.id)}
                      >
                        LinkedIn
                      </Button>
                    )}
                    
                    {onAddToFavorites && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Star className="h-4 w-4" />}
                        onClick={() => onAddToFavorites(investor.id)}
                      >
                        Save
                      </Button>
                    )}
                    
                    <Link to={`/advisor/investors/${investor.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<ArrowUpRight className="h-4 w-4" />}
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {investor.interests.slice(0, 3).map((interest, idx) => (
                      <span key={idx} className="bg-gray-100 text-xs px-2 py-0.5 rounded">
                        {interest}
                      </span>
                    ))}
                    {investor.interests.length > 3 && (
                      <span className="text-gray-500 text-xs">+{investor.interests.length - 3} more</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 text-sm">
                  {investor.outreachStatus && (
                    <div className="mt-1">
                      <span className="text-gray-500">Status: </span>
                      <span className={`${
                        investor.outreachStatus === 'Not Started' ? 'text-gray-600' :
                        investor.outreachStatus === 'Email Sent' ? 'text-blue-600' :
                        investor.outreachStatus === 'Responded' ? 'text-green-600' :
                        investor.outreachStatus === 'Meeting Scheduled' ? 'text-purple-600' :
                        investor.outreachStatus === 'Passed' ? 'text-red-600' :
                        investor.outreachStatus === 'Interested' ? 'text-emerald-600' :
                        'text-gray-600'
                      }`}>
                        {investor.outreachStatus}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
};

export default InvestorList;