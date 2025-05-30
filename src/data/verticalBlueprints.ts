import { VerticalHierarchy } from '../types/agent';

export const verticalBlueprints: VerticalHierarchy[] = [
  // Funding Advisory Vertical
  {
    industryId: 'funding',
    roles: [
      {
        id: 'funding-executive-director',
        name: 'Funding Advisory Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of all funding advisory operations',
          'Resource allocation across funding specialties',
          'Performance monitoring and optimization',
          'Strategic investor relationship management',
          'Funding strategy alignment with business goals',
          'Cross-agent coordination and workflow optimization'
        ]
      },
      {
        id: 'funding-strategy-manager',
        name: 'Funding Strategy Manager',
        level: 'management',
        reportsTo: 'funding-executive-director',
        responsibilities: [
          'Oversee funding strategy development',
          'Coordinate market analysis and valuation activities',
          'Ensure funding recommendations align with market conditions',
          'Monitor funding performance metrics',
          'Implement best practices for funding strategy',
          'Lead strategy sessions with executive teams'
        ]
      },
      {
        id: 'investor-relations-manager',
        name: 'Investor Relations Manager',
        level: 'management',
        reportsTo: 'funding-executive-director',
        responsibilities: [
          'Manage investor database and matchmaking process',
          'Oversee investor outreach and communication strategies',
          'Coordinate investor meetings and follow-ups',
          'Track investor engagement metrics',
          'Develop investor relationship management protocols',
          'Ensure compliance with investment regulations'
        ]
      },
      {
        id: 'funding-strategy-specialist',
        name: 'Funding Strategy Advisor',
        level: 'specialized',
        reportsTo: 'funding-strategy-manager',
        responsibilities: [
          'Create personalized funding recommendations',
          'Analyze company metrics and market conditions',
          'Develop valuation models and benchmarks',
          'Generate funding strategy reports',
          'Assess funding options based on company stage',
          'Provide advice on optimal funding timing'
        ]
      },
      {
        id: 'investor-matchmaker',
        name: 'Investor Matchmaker',
        level: 'specialized',
        reportsTo: 'investor-relations-manager',
        responsibilities: [
          'Search investor databases for ideal matches',
          'Score and rank potential investors',
          'Analyze investor portfolios and preferences',
          'Create investor shortlists for specific companies',
          'Monitor investor activity and trends',
          'Update investor profiles with latest information'
        ]
      },
      {
        id: 'outreach-specialist',
        name: 'Outreach & Engagement Specialist',
        level: 'operational',
        reportsTo: 'investor-relations-manager',
        responsibilities: [
          'Draft personalized investor outreach messages',
          'Schedule and manage communication sequences',
          'Track investor responses and engagement',
          'Coordinate meeting scheduling and follow-ups',
          'Prepare pre-meeting briefing materials',
          'Optimize outreach based on response analytics'
        ]
      },
      {
        id: 'documentation-specialist',
        name: 'Documentation & Data Room Specialist',
        level: 'operational',
        reportsTo: 'funding-strategy-manager',
        responsibilities: [
          'Generate funding documents and presentations',
          'Create and maintain secure data rooms',
          'Manage document versions and updates',
          'Customize documents for specific investors',
          'Track document engagement metrics',
          'Ensure compliance and security of shared materials'
        ]
      },
      {
        id: 'market-intelligence-analyst',
        name: 'Market & Competitor Intelligence Analyst',
        level: 'specialized',
        reportsTo: 'funding-strategy-manager',
        responsibilities: [
          'Monitor competitor funding activities',
          'Track industry trends and market movements',
          'Analyze funding news and announcements',
          'Generate competitive intelligence reports',
          'Provide market insights for funding strategies',
          'Alert team to relevant market developments'
        ]
      }
    ]
  },
  // Real Estate Vertical
  {
    industryId: 'real-estate',
    roles: [
      {
        id: 're-executive-director',
        name: 'Real Estate Executive Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of all real estate operations',
          'Resource allocation across departments',
          'Performance monitoring and optimization',
          'Strategic market positioning',
          'Approval of high-value property transactions',
          'Partnership development with key stakeholders'
        ]
      },
      {
        id: 're-listing-manager',
        name: 'Listing Department Manager',
        level: 'management',
        reportsTo: 're-executive-director',
        responsibilities: [
          'Oversee property listing creation and management',
          'Coordinate listing team activities',
          'Ensure listing quality and optimization',
          'Monitor market trends for listing strategy',
          'Implement pricing strategies based on market analysis',
          'Review and approve listing content before publication'
        ]
      },
      {
        id: 're-client-relations',
        name: 'Client Relations Manager',
        level: 'management',
        reportsTo: 're-executive-director',
        responsibilities: [
          'Manage client relationships and satisfaction',
          'Oversee communication strategies',
          'Handle escalated client issues',
          'Develop client retention programs',
          'Implement feedback collection and analysis systems',
          'Design personalized client experience journeys'
        ]
      },
      {
        id: 're-market-analyst',
        name: 'Market Analysis Specialist',
        level: 'specialized',
        reportsTo: 're-listing-manager',
        responsibilities: [
          'Analyze real estate market trends',
          'Generate pricing recommendations',
          'Identify emerging market opportunities',
          'Create market reports for clients and agents',
          'Develop valuation models for different property types',
          'Monitor competitor pricing and strategies'
        ]
      },
      {
        id: 're-content-creator',
        name: 'Property Content Creator',
        level: 'operational',
        reportsTo: 're-listing-manager',
        responsibilities: [
          'Create compelling property descriptions',
          'Optimize listing content for search',
          'Generate property highlight summaries',
          'Adapt content for different platforms',
          'Create virtual tour narratives',
          'Develop neighborhood and amenity descriptions'
        ]
      },
      {
        id: 're-client-comms',
        name: 'Client Communication Agent',
        level: 'operational',
        reportsTo: 're-client-relations',
        responsibilities: [
          'Manage routine client communications',
          'Send updates and notifications',
          'Answer frequently asked questions',
          'Schedule appointments and showings',
          'Follow up after property viewings',
          'Send personalized property recommendations'
        ]
      }
    ]
  },

  // Fintech Vertical
  {
    industryId: 'fintech',
    roles: [
      {
        id: 'fin-director',
        name: 'Financial Services Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of financial services',
          'Regulatory compliance management',
          'Risk assessment and mitigation',
          'Service portfolio development',
          'Capital allocation and budget management',
          'Strategic partnership development'
        ]
      },
      {
        id: 'fin-investment-manager',
        name: 'Investment Services Manager',
        level: 'management',
        reportsTo: 'fin-director',
        responsibilities: [
          'Oversee investment advisory services',
          'Monitor portfolio performance',
          'Develop investment strategies',
          'Manage investment team',
          'Review and approve investment recommendations',
          'Research emerging asset classes and vehicles'
        ]
      },
      {
        id: 'fin-risk-manager',
        name: 'Risk Management Lead',
        level: 'management',
        reportsTo: 'fin-director',
        responsibilities: [
          'Develop risk assessment frameworks',
          'Monitor security and compliance',
          'Implement risk mitigation strategies',
          'Create risk reports',
          'Design stress testing scenarios',
          'Monitor market conditions for emerging risks'
        ]
      },
      {
        id: 'fin-advisor',
        name: 'Investment Advisor Agent',
        level: 'specialized',
        reportsTo: 'fin-investment-manager',
        responsibilities: [
          'Provide personalized investment advice',
          'Create investment proposals',
          'Monitor client portfolios',
          'Generate performance reports',
          'Rebalance portfolios based on market conditions',
          'Implement tax-efficient investment strategies'
        ]
      },
      {
        id: 'fin-analyst',
        name: 'Financial Analyst',
        level: 'specialized',
        reportsTo: 'fin-investment-manager',
        responsibilities: [
          'Analyze market trends and opportunities',
          'Evaluate investment performance',
          'Research investment vehicles',
          'Generate financial forecasts',
          'Conduct fundamental and technical analysis',
          'Create sector and asset class reports'
        ]
      },
      {
        id: 'fin-compliance',
        name: 'Compliance Monitor',
        level: 'specialized',
        reportsTo: 'fin-risk-manager',
        responsibilities: [
          'Ensure regulatory compliance',
          'Monitor transactions for suspicious activity',
          'Generate compliance reports',
          'Keep track of regulatory changes',
          'Conduct internal compliance audits',
          'Develop compliance training materials'
        ]
      },
      {
        id: 'fin-transaction',
        name: 'Transaction Processor',
        level: 'operational',
        reportsTo: 'fin-risk-manager',
        responsibilities: [
          'Process financial transactions',
          'Verify transaction details',
          'Flag suspicious activities',
          'Generate transaction receipts',
          'Reconcile transaction records',
          'Handle transaction error resolution'
        ]
      }
    ]
  },

  // Healthcare Vertical
  {
    industryId: 'healthcare',
    roles: [
      {
        id: 'hc-director',
        name: 'Healthcare Operations Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of healthcare services',
          'Resource allocation and optimization',
          'Compliance with healthcare regulations',
          'Quality of care monitoring',
          'Strategic partnership development',
          'Budget management and cost optimization'
        ]
      },
      {
        id: 'hc-patient-manager',
        name: 'Patient Services Manager',
        level: 'management',
        reportsTo: 'hc-director',
        responsibilities: [
          'Oversee patient engagement services',
          'Develop patient communication strategies',
          'Monitor patient satisfaction',
          'Implement service improvements',
          'Manage patient feedback systems',
          'Design patient education initiatives'
        ]
      },
      {
        id: 'hc-clinical-manager',
        name: 'Clinical Information Manager',
        level: 'management',
        reportsTo: 'hc-director',
        responsibilities: [
          'Manage clinical data processing',
          'Ensure accuracy of medical information',
          'Develop information workflows',
          'Coordinate with medical staff',
          'Implement clinical decision support systems',
          'Ensure data privacy and security compliance'
        ]
      },
      {
        id: 'hc-communication',
        name: 'Patient Communication Agent',
        level: 'operational',
        reportsTo: 'hc-patient-manager',
        responsibilities: [
          'Send appointment reminders',
          'Provide pre and post appointment instructions',
          'Answer common patient questions',
          'Collect patient feedback',
          'Relay non-critical messages between patients and providers',
          'Send health education materials'
        ]
      },
      {
        id: 'hc-care-coordinator',
        name: 'Care Plan Coordinator',
        level: 'specialized',
        reportsTo: 'hc-patient-manager',
        responsibilities: [
          'Track care plan adherence',
          'Send medication reminders',
          'Coordinate between providers',
          'Update care plans based on progress',
          'Monitor patient-reported outcomes',
          'Identify care plan optimization opportunities'
        ]
      },
      {
        id: 'hc-records',
        name: 'Medical Records Processor',
        level: 'operational',
        reportsTo: 'hc-clinical-manager',
        responsibilities: [
          'Organize and categorize medical records',
          'Generate summary reports',
          'Extract relevant information',
          'Maintain data integrity',
          'Identify missing information',
          'Support data migration and integration'
        ]
      },
      {
        id: 'hc-scheduler',
        name: 'Appointment Scheduler',
        level: 'operational',
        reportsTo: 'hc-patient-manager',
        responsibilities: [
          'Manage appointment bookings',
          'Handle scheduling changes',
          'Optimize provider schedules',
          'Send scheduling notifications',
          'Minimize gaps in schedules',
          'Prioritize urgent appointments'
        ]
      }
    ]
  },

  // Senior Living Vertical
  {
    industryId: 'senior-living',
    roles: [
      {
        id: 'sl-director',
        name: 'Senior Care Director',
        level: 'executive',
        responsibilities: [
          'Oversee all senior care operations',
          'Develop care standards and protocols',
          'Manage resource allocation',
          'Ensure quality of care and compliance',
          'Strategic planning for resident needs',
          'Coordinate with healthcare partners'
        ]
      },
      {
        id: 'sl-care-manager',
        name: 'Care Services Manager',
        level: 'management',
        reportsTo: 'sl-director',
        responsibilities: [
          'Manage daily care operations',
          'Supervise care coordinators',
          'Implement care protocols',
          'Monitor care quality',
          'Resolve complex care issues',
          'Develop staff training programs'
        ]
      },
      {
        id: 'sl-family-manager',
        name: 'Family Relations Manager',
        level: 'management',
        reportsTo: 'sl-director',
        responsibilities: [
          'Develop family communication strategies',
          'Handle escalated family concerns',
          'Coordinate family involvement',
          'Organize family events',
          'Create family education programs',
          'Measure and improve family satisfaction'
        ]
      },
      {
        id: 'sl-wellness-coordinator',
        name: 'Wellness Coordinator',
        level: 'specialized',
        reportsTo: 'sl-care-manager',
        responsibilities: [
          'Monitor resident health metrics',
          'Coordinate wellness activities',
          'Track medication adherence',
          'Generate wellness reports',
          'Identify early health concerns',
          'Develop personalized wellness plans'
        ]
      },
      {
        id: 'sl-daily-care',
        name: 'Daily Care Assistant',
        level: 'operational',
        reportsTo: 'sl-care-manager',
        responsibilities: [
          'Send daily care reminders',
          'Record care activities',
          'Notify staff of issues',
          'Generate daily care reports',
          'Track routine care completions',
          'Support activities of daily living'
        ]
      },
      {
        id: 'sl-family-comms',
        name: 'Family Communication Agent',
        level: 'operational',
        reportsTo: 'sl-family-manager',
        responsibilities: [
          'Send regular family updates',
          'Share photos and activity information',
          'Answer family questions',
          'Schedule family calls and visits',
          'Notify families of important changes',
          'Collect family feedback and preferences'
        ]
      },
      {
        id: 'sl-social',
        name: 'Social Engagement Coordinator',
        level: 'operational',
        reportsTo: 'sl-care-manager',
        responsibilities: [
          'Schedule social activities',
          'Personalize activity recommendations',
          'Track participation and engagement',
          'Facilitate social connections',
          'Identify isolation risk factors',
          'Develop group and individual activities'
        ]
      }
    ]
  },

  // Telecommunications Vertical
  {
    industryId: 'telecommunications',
    roles: [
      {
        id: 'telecom-director',
        name: 'Telecom Services Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of telecommunications services',
          'Service portfolio development',
          'Resource allocation',
          'Performance monitoring',
          'Technology adoption strategy',
          'Competitive positioning'
        ]
      },
      {
        id: 'telecom-customer-manager',
        name: 'Customer Service Manager',
        level: 'management',
        reportsTo: 'telecom-director',
        responsibilities: [
          'Manage customer support operations',
          'Develop service protocols',
          'Monitor customer satisfaction',
          'Implement service improvements',
          'Handle escalated customer issues',
          'Design support workflows'
        ]
      },
      {
        id: 'telecom-network-manager',
        name: 'Network Operations Manager',
        level: 'management',
        reportsTo: 'telecom-director',
        responsibilities: [
          'Oversee network monitoring',
          'Coordinate issue resolution',
          'Implement performance optimizations',
          'Plan capacity improvements',
          'Develop maintenance schedules',
          'Ensure network security'
        ]
      },
      {
        id: 'telecom-support',
        name: 'Customer Support Agent',
        level: 'operational',
        reportsTo: 'telecom-customer-manager',
        responsibilities: [
          'Handle customer inquiries',
          'Troubleshoot common issues',
          'Process service requests',
          'Provide product information',
          'Document customer interactions',
          'Route complex issues appropriately'
        ]
      },
      {
        id: 'telecom-retention',
        name: 'Customer Retention Specialist',
        level: 'specialized',
        reportsTo: 'telecom-customer-manager',
        responsibilities: [
          'Identify retention risks',
          'Develop retention offers',
          'Handle cancellation requests',
          'Analyze churn patterns',
          'Create win-back campaigns',
          'Monitor customer satisfaction indicators'
        ]
      },
      {
        id: 'telecom-network-analyst',
        name: 'Network Performance Analyst',
        level: 'specialized',
        reportsTo: 'telecom-network-manager',
        responsibilities: [
          'Monitor network performance metrics',
          'Identify optimization opportunities',
          'Generate performance reports',
          'Recommend infrastructure improvements',
          'Analyze traffic patterns',
          'Predict capacity requirements'
        ]
      },
      {
        id: 'telecom-outage',
        name: 'Outage Detection Agent',
        level: 'operational',
        reportsTo: 'telecom-network-manager',
        responsibilities: [
          'Monitor for service disruptions',
          'Coordinate initial response',
          'Generate outage reports',
          'Notify affected customers',
          'Track resolution progress',
          'Create post-incident analysis'
        ]
      }
    ]
  },
  
  // Retail Vertical
  {
    industryId: 'retail',
    roles: [
      {
        id: 'retail-director',
        name: 'Retail Operations Director',
        level: 'executive',
        responsibilities: [
          'Strategic retail business oversight',
          'Multi-channel sales strategy',
          'Margin and profitability management',
          'Brand and customer experience direction',
          'Vendor relationship management',
          'New market and product expansion planning'
        ]
      },
      {
        id: 'retail-inventory-manager',
        name: 'Inventory Management Lead',
        level: 'management',
        reportsTo: 'retail-director',
        responsibilities: [
          'Inventory strategy and optimization',
          'Supply chain coordination',
          'Stock level management',
          'Seasonal planning',
          'Warehouse operations oversight',
          'Inventory forecasting system management'
        ]
      },
      {
        id: 'retail-customer-manager',
        name: 'Customer Experience Manager',
        level: 'management',
        reportsTo: 'retail-director',
        responsibilities: [
          'Customer service oversight',
          'Shopping experience optimization',
          'Customer feedback integration',
          'Loyalty program management',
          'Customer journey mapping',
          'Service recovery protocol development'
        ]
      },
      {
        id: 'retail-stock-monitor',
        name: 'Stock Monitoring Agent',
        level: 'operational',
        reportsTo: 'retail-inventory-manager',
        responsibilities: [
          'Real-time inventory tracking',
          'Low stock alerts',
          'Reorder recommendations',
          'Inventory reports',
          'Stock discrepancy identification',
          'Inventory location optimization'
        ]
      },
      {
        id: 'retail-demand-forecast',
        name: 'Demand Forecasting Specialist',
        level: 'specialized',
        reportsTo: 'retail-inventory-manager',
        responsibilities: [
          'Sales trend analysis',
          'Seasonal demand prediction',
          'Inventory level optimization',
          'Purchase recommendation',
          'Event impact forecasting',
          'Pricing elasticity modeling'
        ]
      },
      {
        id: 'retail-support',
        name: 'Customer Support Agent',
        level: 'operational',
        reportsTo: 'retail-customer-manager',
        responsibilities: [
          'Customer inquiry handling',
          'Order status updates',
          'Return processing assistance',
          'Product information provision',
          'Customer complaint resolution',
          'Post-purchase follow-up'
        ]
      },
      {
        id: 'retail-recommender',
        name: 'Product Recommendation Specialist',
        level: 'specialized',
        reportsTo: 'retail-customer-manager',
        responsibilities: [
          'Personalized product suggestions',
          'Cross-selling and up-selling',
          'Customer preference analysis',
          'Product bundle creation',
          'Purchase pattern identification',
          'New product introduction targeting'
        ]
      }
    ]
  },

  // Education Vertical
  {
    industryId: 'education',
    roles: [
      {
        id: 'edu-director',
        name: 'Education Services Director',
        level: 'executive',
        responsibilities: [
          'Educational program strategy',
          'Learning outcome optimization',
          'Resource allocation',
          'Quality standards development',
          'Educational technology adoption',
          'Institutional partnership management'
        ]
      },
      {
        id: 'edu-learning-manager',
        name: 'Learning Experience Manager',
        level: 'management',
        reportsTo: 'edu-director',
        responsibilities: [
          'Curriculum development oversight',
          'Learning methodology implementation',
          'Student experience optimization',
          'Learning tools integration',
          'Assessment strategy development',
          'Learning pathway design'
        ]
      },
      {
        id: 'edu-admin-manager',
        name: 'Administrative Services Manager',
        level: 'management',
        reportsTo: 'edu-director',
        responsibilities: [
          'Administrative process oversight',
          'Record keeping systems',
          'Scheduling and logistics',
          'Reporting and analytics',
          'Regulatory compliance management',
          'Staff resource coordination'
        ]
      },
      {
        id: 'edu-tutor',
        name: 'Virtual Learning Tutor',
        level: 'specialized',
        reportsTo: 'edu-learning-manager',
        responsibilities: [
          'Personalized tutoring sessions',
          'Concept explanations',
          'Practice problem generation',
          'Learning progress assessment',
          'Learning style adaptation',
          'Knowledge gap identification'
        ]
      },
      {
        id: 'edu-content-creator',
        name: 'Educational Content Creator',
        level: 'specialized',
        reportsTo: 'edu-learning-manager',
        responsibilities: [
          'Learning material development',
          'Multimedia content creation',
          'Curriculum alignment',
          'Content differentiation for learning styles',
          'Interactive exercise design',
          'Assessment question development'
        ]
      },
      {
        id: 'edu-scheduler',
        name: 'Scheduling Assistant',
        level: 'operational',
        reportsTo: 'edu-admin-manager',
        responsibilities: [
          'Class and event scheduling',
          'Calendar management',
          'Resource booking',
          'Schedule conflict resolution',
          'Attendance tracking',
          'Schedule optimization'
        ]
      },
      {
        id: 'edu-progress',
        name: 'Progress Tracking Agent',
        level: 'operational',
        reportsTo: 'edu-learning-manager',
        responsibilities: [
          'Student progress monitoring',
          'Performance analysis',
          'Intervention flagging',
          'Progress reporting',
          'Learning analytics',
          'Achievement milestone tracking'
        ]
      }
    ]
  },
  
  // Logistics Vertical
  {
    industryId: 'logistics',
    roles: [
      {
        id: 'log-director',
        name: 'Logistics Operations Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of logistics operations',
          'Supply chain optimization strategy',
          'Resource allocation and planning',
          'Performance and efficiency monitoring',
          'Partner relationship management',
          'Cost management and optimization'
        ]
      },
      {
        id: 'log-transport-manager',
        name: 'Transportation Manager',
        level: 'management',
        reportsTo: 'log-director',
        responsibilities: [
          'Transport operations oversight',
          'Fleet management coordination',
          'Route planning strategy',
          'Transportation cost optimization',
          'Carrier relationship management',
          'Compliance with transportation regulations'
        ]
      },
      {
        id: 'log-warehouse-manager',
        name: 'Warehouse Operations Manager',
        level: 'management',
        reportsTo: 'log-director',
        responsibilities: [
          'Warehouse operations oversight',
          'Inventory management systems',
          'Warehouse staffing and productivity',
          'Facility optimization',
          'Safety protocol implementation',
          'Order fulfillment process management'
        ]
      },
      {
        id: 'log-route-optimizer',
        name: 'Route Optimization Specialist',
        level: 'specialized',
        reportsTo: 'log-transport-manager',
        responsibilities: [
          'Route planning and optimization',
          'Delivery scheduling',
          'Traffic pattern analysis',
          'Fuel consumption optimization',
          'Multi-stop route efficiency',
          'Alternative route generation during disruptions'
        ]
      },
      {
        id: 'log-fleet-monitor',
        name: 'Fleet Monitoring Agent',
        level: 'operational',
        reportsTo: 'log-transport-manager',
        responsibilities: [
          'Vehicle location tracking',
          'Maintenance schedule monitoring',
          'Driver performance tracking',
          'Fuel consumption monitoring',
          'Vehicle utilization reporting',
          'Incident and delay tracking'
        ]
      },
      {
        id: 'log-inventory-control',
        name: 'Inventory Control Specialist',
        level: 'specialized',
        reportsTo: 'log-warehouse-manager',
        responsibilities: [
          'Inventory accuracy maintenance',
          'Stock level optimization',
          'Warehouse space utilization',
          'Inventory forecasting',
          'Cycle count scheduling',
          'Inventory reporting and analytics'
        ]
      },
      {
        id: 'log-shipment-tracker',
        name: 'Shipment Tracking Agent',
        level: 'operational',
        reportsTo: 'log-warehouse-manager',
        responsibilities: [
          'Order status monitoring',
          'Shipment updates and notifications',
          'Delivery exception handling',
          'Proof of delivery processing',
          'Customer delivery communications',
          'Tracking data analysis and reporting'
        ]
      }
    ]
  },
  
  // Hospitality Vertical
  {
    industryId: 'hospitality',
    roles: [
      {
        id: 'hosp-director',
        name: 'Hospitality Services Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of guest experience',
          'Service standard development',
          'Resource allocation and budgeting',
          'Property management strategy',
          'Brand experience leadership',
          'Revenue optimization strategy'
        ]
      },
      {
        id: 'hosp-guest-manager',
        name: 'Guest Experience Manager',
        level: 'management',
        reportsTo: 'hosp-director',
        responsibilities: [
          'Guest service program oversight',
          'Service quality monitoring',
          'Guest feedback integration',
          'Service recovery procedures',
          'Staff training program development',
          'Guest loyalty initiatives'
        ]
      },
      {
        id: 'hosp-operations-manager',
        name: 'Operations Manager',
        level: 'management',
        reportsTo: 'hosp-director',
        responsibilities: [
          'Daily operations oversight',
          'Staff scheduling and coordination',
          'Facility maintenance management',
          'Inventory and supply management',
          'Operational efficiency improvements',
          'Safety and security procedures'
        ]
      },
      {
        id: 'hosp-concierge',
        name: 'Virtual Concierge',
        level: 'specialized',
        reportsTo: 'hosp-guest-manager',
        responsibilities: [
          'Personalized recommendations',
          'Local attraction information',
          'Reservation assistance',
          'Special request handling',
          'Guest preference tracking',
          'Transportation arrangements'
        ]
      },
      {
        id: 'hosp-booking',
        name: 'Reservation Management Agent',
        level: 'operational',
        reportsTo: 'hosp-operations-manager',
        responsibilities: [
          'Booking processing and confirmation',
          'Availability management',
          'Rate and package information',
          'Modification and cancellation handling',
          'Upselling and cross-selling',
          'Group booking coordination'
        ]
      },
      {
        id: 'hosp-guest-comms',
        name: 'Guest Communication Agent',
        level: 'operational',
        reportsTo: 'hosp-guest-manager',
        responsibilities: [
          'Pre-arrival communications',
          'In-stay updates and information',
          'Post-stay follow-up',
          'Guest inquiry handling',
          'Feedback collection',
          'Service issue resolution'
        ]
      },
      {
        id: 'hosp-revenue',
        name: 'Revenue Optimization Specialist',
        level: 'specialized',
        reportsTo: 'hosp-director',
        responsibilities: [
          'Dynamic pricing implementation',
          'Demand forecasting',
          'Competitive rate analysis',
          'Revenue performance reporting',
          'Channel distribution strategy',
          'Promotion and package creation'
        ]
      }
    ]
  },
  
  // Legal Services Vertical
  {
    industryId: 'legal',
    roles: [
      {
        id: 'legal-director',
        name: 'Legal Services Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of legal services',
          'Practice area development',
          'Resource allocation and workload management',
          'Compliance and ethics program leadership',
          'Client relationship management strategy',
          'Risk management policy development'
        ]
      },
      {
        id: 'legal-case-manager',
        name: 'Case Management Lead',
        level: 'management',
        reportsTo: 'legal-director',
        responsibilities: [
          'Case workflow oversight',
          'Caseload distribution and monitoring',
          'Deadline and calendar management',
          'Case progress reporting',
          'Client communication protocols',
          'Case documentation standards'
        ]
      },
      {
        id: 'legal-research-manager',
        name: 'Legal Research Manager',
        level: 'management',
        reportsTo: 'legal-director',
        responsibilities: [
          'Research methodology development',
          'Information resource management',
          'Research quality control',
          'Knowledge management systems',
          'Research team coordination',
          'Legal database optimization'
        ]
      },
      {
        id: 'legal-researcher',
        name: 'Legal Research Specialist',
        level: 'specialized',
        reportsTo: 'legal-research-manager',
        responsibilities: [
          'Case law and precedent research',
          'Statutory and regulatory analysis',
          'Legal memoranda preparation',
          'Citation verification and validation',
          'Legislative history tracking',
          'Jurisdictional requirement analysis'
        ]
      },
      {
        id: 'legal-document',
        name: 'Document Analysis Agent',
        level: 'operational',
        reportsTo: 'legal-research-manager',
        responsibilities: [
          'Legal document review and processing',
          'Document categorization and indexing',
          'Key information extraction',
          'Document comparison and version control',
          'Contract clause identification',
          'Document summarization'
        ]
      },
      {
        id: 'legal-client',
        name: 'Client Communication Agent',
        level: 'operational',
        reportsTo: 'legal-case-manager',
        responsibilities: [
          'Client updates and notifications',
          'Meeting and deposition scheduling',
          'Document request coordination',
          'Status report generation',
          'Basic legal information provision',
          'Client onboarding assistance'
        ]
      },
      {
        id: 'legal-compliance',
        name: 'Compliance Monitoring Specialist',
        level: 'specialized',
        reportsTo: 'legal-director',
        responsibilities: [
          'Regulatory compliance tracking',
          'Compliance requirement analysis',
          'Compliance audit support',
          'Policy and procedure review',
          'Regulatory change notification',
          'Compliance training materials development'
        ]
      }
    ]
  },
  
  // Agriculture Vertical
  {
    industryId: 'agriculture',
    roles: [
      {
        id: 'ag-director',
        name: 'Agricultural Operations Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of agricultural operations',
          'Resource allocation and planning',
          'Production and yield optimization strategy',
          'Market positioning and sales strategy',
          'Sustainability and environmental program leadership',
          'Technology adoption planning'
        ]
      },
      {
        id: 'ag-crop-manager',
        name: 'Crop Production Manager',
        level: 'management',
        reportsTo: 'ag-director',
        responsibilities: [
          'Crop planning and rotation strategy',
          'Planting and harvesting schedule management',
          'Yield optimization initiatives',
          'Pest and disease management oversight',
          'Crop quality control program development',
          'Irrigation and fertilization planning'
        ]
      },
      {
        id: 'ag-logistics-manager',
        name: 'Agricultural Logistics Manager',
        level: 'management',
        reportsTo: 'ag-director',
        responsibilities: [
          'Supply chain coordination',
          'Harvest transportation planning',
          'Storage facility management',
          'Distribution network optimization',
          'Vendor and buyer relationship management',
          'Equipment utilization and maintenance planning'
        ]
      },
      {
        id: 'ag-monitor',
        name: 'Crop Monitoring Specialist',
        level: 'specialized',
        reportsTo: 'ag-crop-manager',
        responsibilities: [
          'Field condition monitoring',
          'Growth stage tracking',
          'Pest and disease detection',
          'Weather impact assessment',
          'Satellite and sensor data analysis',
          'Yield prediction modeling'
        ]
      },
      {
        id: 'ag-precision',
        name: 'Precision Agriculture Analyst',
        level: 'specialized',
        reportsTo: 'ag-crop-manager',
        responsibilities: [
          'Field mapping and zone creation',
          'Variable rate application planning',
          'Sensor data integration and analysis',
          'Soil sampling coordination and analysis',
          'Precision equipment calibration recommendations',
          'ROI analysis for precision agriculture practices'
        ]
      },
      {
        id: 'ag-equipment',
        name: 'Equipment Management Agent',
        level: 'operational',
        reportsTo: 'ag-logistics-manager',
        responsibilities: [
          'Equipment scheduling and allocation',
          'Maintenance tracking and notification',
          'Fuel consumption monitoring',
          'Equipment utilization reporting',
          'Spare parts inventory management',
          'Equipment operator assignment'
        ]
      },
      {
        id: 'ag-market',
        name: 'Market Intelligence Specialist',
        level: 'specialized',
        reportsTo: 'ag-director',
        responsibilities: [
          'Market trend analysis',
          'Price monitoring and forecasting',
          'Buyer demand assessment',
          'Competitor activity tracking',
          'International market opportunity identification',
          'Commodity futures analysis'
        ]
      }
    ]
  },
  
  // Energy & Utilities Vertical
  {
    industryId: 'energy',
    roles: [
      {
        id: 'energy-director',
        name: 'Energy Operations Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of energy operations',
          'Resource allocation and capacity planning',
          'Compliance and regulatory strategy',
          'Efficiency and sustainability initiatives',
          'Technology adoption planning',
          'Safety and security program leadership'
        ]
      },
      {
        id: 'energy-generation-manager',
        name: 'Generation Operations Manager',
        level: 'management',
        reportsTo: 'energy-director',
        responsibilities: [
          'Power generation oversight',
          'Output optimization strategy',
          'Maintenance planning and coordination',
          'Generation facility management',
          'Fuel and resource management',
          'Environmental compliance monitoring'
        ]
      },
      {
        id: 'energy-grid-manager',
        name: 'Grid Management Lead',
        level: 'management',
        reportsTo: 'energy-director',
        responsibilities: [
          'Transmission and distribution oversight',
          'Grid reliability and resilience planning',
          'Load balancing and management',
          'Outage response coordination',
          'Infrastructure maintenance planning',
          'Smart grid technology implementation'
        ]
      },
      {
        id: 'energy-monitor',
        name: 'Energy Monitoring Specialist',
        level: 'specialized',
        reportsTo: 'energy-generation-manager',
        responsibilities: [
          'Real-time performance monitoring',
          'Efficiency metrics analysis',
          'Output forecasting and planning',
          'Anomaly detection and alerting',
          'Generation asset performance optimization',
          'Emissions and environmental impact tracking'
        ]
      },
      {
        id: 'energy-maintenance',
        name: 'Maintenance Coordination Agent',
        level: 'operational',
        reportsTo: 'energy-generation-manager',
        responsibilities: [
          'Maintenance schedule management',
          'Work order processing and tracking',
          'Parts inventory coordination',
          'Contractor and vendor coordination',
          'Maintenance documentation management',
          'Preventative maintenance planning'
        ]
      },
      {
        id: 'energy-grid-analyst',
        name: 'Grid Analysis Specialist',
        level: 'specialized',
        reportsTo: 'energy-grid-manager',
        responsibilities: [
          'Load pattern analysis',
          'Grid performance modeling',
          'Capacity planning support',
          'Outage risk assessment',
          'Transmission efficiency optimization',
          'Distributed generation integration analysis'
        ]
      },
      {
        id: 'energy-outage',
        name: 'Outage Management Agent',
        level: 'operational',
        reportsTo: 'energy-grid-manager',
        responsibilities: [
          'Outage detection and verification',
          'Restoration progress tracking',
          'Customer outage communication',
          'Crew dispatch coordination',
          'Outage reporting and documentation',
          'Post-outage analysis support'
        ]
      }
    ]
  },
  
  // Government Services Vertical
  {
    industryId: 'government',
    roles: [
      {
        id: 'gov-director',
        name: 'Public Services Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of public services',
          'Resource allocation and budgeting',
          'Policy implementation leadership',
          'Cross-department coordination',
          'Public engagement strategy',
          'Service quality and accountability standards'
        ]
      },
      {
        id: 'gov-citizen-manager',
        name: 'Citizen Services Manager',
        level: 'management',
        reportsTo: 'gov-director',
        responsibilities: [
          'Citizen-facing services oversight',
          'Service accessibility initiatives',
          'Citizen experience improvement',
          'Service performance monitoring',
          'Complaint resolution process management',
          'Multi-channel service delivery coordination'
        ]
      },
      {
        id: 'gov-compliance-manager',
        name: 'Regulatory Compliance Manager',
        level: 'management',
        reportsTo: 'gov-director',
        responsibilities: [
          'Compliance program leadership',
          'Regulatory requirement tracking',
          'Compliance verification procedures',
          'Enforcement action coordination',
          'Compliance reporting systems',
          'Regulatory change management'
        ]
      },
      {
        id: 'gov-service-agent',
        name: 'Citizen Support Agent',
        level: 'operational',
        reportsTo: 'gov-citizen-manager',
        responsibilities: [
          'Citizen inquiry handling',
          'Service application processing',
          'Form completion assistance',
          'Status updates and notifications',
          'Service eligibility assessment',
          'Documentation verification'
        ]
      },
      {
        id: 'gov-data-analyst',
        name: 'Public Data Analyst',
        level: 'specialized',
        reportsTo: 'gov-citizen-manager',
        responsibilities: [
          'Public data analysis and reporting',
          'Service utilization trend identification',
          'Demographic analysis',
          'Impact assessment support',
          'Performance metric development',
          'Data visualization and dashboard creation'
        ]
      },
      {
        id: 'gov-compliance-monitor',
        name: 'Compliance Monitoring Agent',
        level: 'operational',
        reportsTo: 'gov-compliance-manager',
        responsibilities: [
          'Compliance check scheduling',
          'Documentation review and verification',
          'Compliance issue flagging',
          'Follow-up tracking',
          'Compliance report generation',
          'Record keeping and documentation'
        ]
      },
      {
        id: 'gov-policy-analyst',
        name: 'Policy Implementation Specialist',
        level: 'specialized',
        reportsTo: 'gov-director',
        responsibilities: [
          'Policy requirement analysis',
          'Implementation plan development',
          'Cross-departmental coordination',
          'Stakeholder impact assessment',
          'Policy compliance monitoring',
          'Policy effectiveness evaluation'
        ]
      }
    ]
  },
  
  // Insurance Vertical
  {
    industryId: 'insurance',
    roles: [
      {
        id: 'ins-director',
        name: 'Insurance Operations Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of insurance operations',
          'Product portfolio development and management',
          'Underwriting and claims strategy',
          'Compliance and regulatory oversight',
          'Risk management leadership',
          'Performance and profitability monitoring'
        ]
      },
      {
        id: 'ins-underwriting-manager',
        name: 'Underwriting Manager',
        level: 'management',
        reportsTo: 'ins-director',
        responsibilities: [
          'Underwriting policy development',
          'Risk assessment methodology oversight',
          'Pricing strategy implementation',
          'Underwriting team coordination',
          'Portfolio risk management',
          'Reinsurance coordination'
        ]
      },
      {
        id: 'ins-claims-manager',
        name: 'Claims Processing Manager',
        level: 'management',
        reportsTo: 'ins-director',
        responsibilities: [
          'Claims operations oversight',
          'Claims adjudication standards',
          'Fraud prevention strategy',
          'Claims team management',
          'Claims performance monitoring',
          'Claims process optimization'
        ]
      },
      {
        id: 'ins-underwriter',
        name: 'Risk Assessment Specialist',
        level: 'specialized',
        reportsTo: 'ins-underwriting-manager',
        responsibilities: [
          'Risk factor analysis',
          'Policy application evaluation',
          'Risk classification determination',
          'Premium calculation',
          'Special risk assessment',
          'Policy condition recommendations'
        ]
      },
      {
        id: 'ins-claims-processor',
        name: 'Claims Processing Agent',
        level: 'operational',
        reportsTo: 'ins-claims-manager',
        responsibilities: [
          'Claims intake and verification',
          'Coverage determination',
          'Documentation review',
          'Claim valuation and settlement calculation',
          'Payment processing coordination',
          'Claim status communication'
        ]
      },
      {
        id: 'ins-fraud',
        name: 'Fraud Detection Specialist',
        level: 'specialized',
        reportsTo: 'ins-claims-manager',
        responsibilities: [
          'Suspicious claim pattern detection',
          'Fraud indicator analysis',
          'Investigation coordination',
          'Documentation verification',
          'Fraud case reporting',
          'Anti-fraud measure development'
        ]
      },
      {
        id: 'ins-customer',
        name: 'Policy Servicing Agent',
        level: 'operational',
        reportsTo: 'ins-director',
        responsibilities: [
          'Policy information inquiries',
          'Policy changes and endorsements',
          'Premium payment processing',
          'Renewal coordination',
          'Coverage explanations',
          'Policy document distribution'
        ]
      }
    ]
  },
  
  // Manufacturing Vertical
  {
    industryId: 'manufacturing',
    roles: [
      {
        id: 'mfg-director',
        name: 'Manufacturing Operations Director',
        level: 'executive',
        responsibilities: [
          'Strategic oversight of manufacturing operations',
          'Production capacity planning',
          'Resource allocation and budgeting',
          'Operational efficiency strategy',
          'Quality management system leadership',
          'Supply chain integration planning'
        ]
      },
      {
        id: 'mfg-production-manager',
        name: 'Production Manager',
        level: 'management',
        reportsTo: 'mfg-director',
        responsibilities: [
          'Production schedule management',
          'Manufacturing process oversight',
          'Labor and machine resource planning',
          'Production efficiency monitoring',
          'Output target achievement',
          'Shop floor coordination'
        ]
      },
      {
        id: 'mfg-quality-manager',
        name: 'Quality Assurance Manager',
        level: 'management',
        reportsTo: 'mfg-director',
        responsibilities: [
          'Quality control system oversight',
          'Quality standard development',
          'Inspection and testing protocols',
          'Compliance with industry standards',
          'Defect reduction initiatives',
          'Quality documentation management'
        ]
      },
      {
        id: 'mfg-production-scheduler',
        name: 'Production Scheduling Agent',
        level: 'operational',
        reportsTo: 'mfg-production-manager',
        responsibilities: [
          'Production scheduling and sequencing',
          'Work order processing',
          'Material requirement coordination',
          'Machine capacity allocation',
          'Production status tracking',
          'Schedule adjustment for disruptions'
        ]
      },
      {
        id: 'mfg-process-analyst',
        name: 'Process Optimization Specialist',
        level: 'specialized',
        reportsTo: 'mfg-production-manager',
        responsibilities: [
          'Production process analysis',
          'Efficiency improvement identification',
          'Bottleneck detection and resolution',
          'Workflow optimization',
          'Process standardization',
          'Automation opportunity assessment'
        ]
      },
      {
        id: 'mfg-quality-inspector',
        name: 'Quality Control Agent',
        level: 'operational',
        reportsTo: 'mfg-quality-manager',
        responsibilities: [
          'Product inspection coordination',
          'Quality test result processing',
          'Defect tracking and categorization',
          'Quality documentation maintenance',
          'Hold and release management',
          'Statistical quality reporting'
        ]
      },
      {
        id: 'mfg-maintenance',
        name: 'Maintenance Coordination Specialist',
        level: 'specialized',
        reportsTo: 'mfg-director',
        responsibilities: [
          'Preventive maintenance scheduling',
          'Breakdown response coordination',
          'Maintenance resource allocation',
          'Spare parts inventory management',
          'Equipment downtime tracking',
          'Maintenance procedure documentation'
        ]
      }
    ]
  }
];