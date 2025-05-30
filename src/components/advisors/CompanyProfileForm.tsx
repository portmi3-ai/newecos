import React, { useState, useEffect } from 'react';
import { CompanyProfile, FundingSeries, RevenueRange, ValuationRange, SalesMotion } from '../../types/advisorAgent';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { Save, RefreshCw } from 'lucide-react';

interface CompanyProfileFormProps {
  initialProfile?: Partial<CompanyProfile>;
  onSave: (profile: CompanyProfile) => Promise<void>;
  isLoading?: boolean;
}

const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({
  initialProfile,
  onSave,
  isLoading = false
}) => {
  const [profile, setProfile] = useState<Partial<CompanyProfile>>(initialProfile || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setProfile(prev => ({ ...prev, [name]: numValue }));
    }
  };

  const handleMetricsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    setProfile(prev => ({
      ...prev,
      keyMetrics: {
        ...(prev.keyMetrics || {}),
        [name]: isNaN(numValue) ? value : numValue
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Make sure all required fields are present
      const completeProfile = {
        name: profile.name || 'Unnamed Company',
        industry: profile.industry || 'Technology',
        description: profile.description || 'No description provided',
        foundingDate: profile.foundingDate || new Date().toISOString().split('T')[0],
        teamSize: profile.teamSize || 1,
        website: profile.website || '',
        location: profile.location || 'Remote',
        ...profile
      } as CompanyProfile;
      
      await onSave(completeProfile);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-bold text-gray-900">Company Profile</h2>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label="Company Name"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </div>
              <div>
                <Input
                  label="Industry"
                  name="industry"
                  value={profile.industry || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Description
              </label>
              <textarea
                name="description"
                value={profile.description || ''}
                onChange={handleChange}
                rows={3}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label="Founded Date"
                  name="foundingDate"
                  type="date"
                  value={profile.foundingDate || ''}
                  onChange={handleChange}
                  fullWidth
                />
              </div>
              <div>
                <Input
                  label="Team Size"
                  name="teamSize"
                  type="number"
                  min={1}
                  value={profile.teamSize || ''}
                  onChange={handleNumberChange}
                  fullWidth
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label="Website"
                  name="website"
                  type="text"
                  value={profile.website || ''}
                  onChange={handleChange}
                  fullWidth
                />
              </div>
              <div>
                <Input
                  label="Location"
                  name="location"
                  type="text"
                  value={profile.location || ''}
                  onChange={handleChange}
                  fullWidth
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Funding Stage
                </label>
                <select
                  name="fundingSeries"
                  value={profile.fundingSeries || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Funding Stage</option>
                  <option value="Bootstrap">Bootstrap</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C+">Series C+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Revenue Range
                </label>
                <select
                  name="revenueRange"
                  value={profile.revenueRange || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Revenue Range</option>
                  <option value="<$100K">&lt;$100K</option>
                  <option value="$100K-$1M">$100K-$1M</option>
                  <option value="$1M-$5M">$1M-$5M</option>
                  <option value="$5M-$20M">$5M-$20M</option>
                  <option value="$20M+">$20M+</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valuation Range
                </label>
                <select
                  name="valuation"
                  value={profile.valuation || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Valuation Range</option>
                  <option value="<$1M">&lt;$1M</option>
                  <option value="$1M-$5M">$1M-$5M</option>
                  <option value="$5M-$20M">$5M-$20M</option>
                  <option value="$20M-$100M">$20M-$100M</option>
                  <option value="$100M+">$100M+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Motion
                </label>
                <select
                  name="salesMotion"
                  value={profile.salesMotion || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Sales Motion</option>
                  <option value="Self-Serve">Self-Serve</option>
                  <option value="Inside Sales">Inside Sales</option>
                  <option value="Field Sales">Field Sales</option>
                  <option value="Channel Partners">Channel Partners</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            
            <div>
              <Input
                label="Target Market Size"
                name="targetMarketSize"
                type="text"
                placeholder="e.g., $30B"
                value={profile.targetMarketSize || ''}
                onChange={handleChange}
                fullWidth
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Key Metrics</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Input
                    label="Monthly Recurring Revenue ($)"
                    name="mrr"
                    type="number"
                    value={profile.keyMetrics?.mrr || ''}
                    onChange={handleMetricsChange}
                    fullWidth
                  />
                </div>
                <div>
                  <Input
                    label="MoM Growth Rate (%)"
                    name="growthRate"
                    type="number"
                    min={0}
                    max={100}
                    value={profile.keyMetrics?.growthRate || ''}
                    onChange={handleMetricsChange}
                    fullWidth
                  />
                </div>
                <div>
                  <Input
                    label="Customer Acquisition Cost ($)"
                    name="cac"
                    type="number"
                    min={0}
                    value={profile.keyMetrics?.cac || ''}
                    onChange={handleMetricsChange}
                    fullWidth
                  />
                </div>
                <div>
                  <Input
                    label="Lifetime Value ($)"
                    name="ltv"
                    type="number"
                    min={0}
                    value={profile.keyMetrics?.ltv || ''}
                    onChange={handleMetricsChange}
                    fullWidth
                  />
                </div>
                <div>
                  <Input
                    label="Churn Rate (%)"
                    name="churnRate"
                    type="number"
                    min={0}
                    max={100}
                    value={profile.keyMetrics?.churnRate || ''}
                    onChange={handleMetricsChange}
                    fullWidth
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              type="submit"
              isLoading={saving || isLoading}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Company Profile
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
};

export default CompanyProfileForm;