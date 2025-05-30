import { AgentRole } from '../types/agent';

export const agentRoles: AgentRole[] = [
  // Executive Level Roles
  {
    id: 'strategic-director',
    name: 'Strategic Director',
    level: 'executive',
    description: 'Oversees the entire agent ecosystem with high-level strategic planning',
    responsibilities: [
      'Define organizational objectives and strategies',
      'Allocate resources across departments',
      'Monitor overall performance metrics',
      'Make high-level business decisions'
    ],
    permissions: [
      { id: 'view-all', name: 'View All Data', description: 'Access all data in the system', scope: 'read' },
      { id: 'manage-all', name: 'Manage All Agents', description: 'Create, modify, and delete any agent', scope: 'manage' },
      { id: 'execute-all', name: 'Execute Any Operation', description: 'Run any operation in the system', scope: 'execute' }
    ]
  },
  {
    id: 'chief-coordinator',
    name: 'Chief Coordinator',
    level: 'executive',
    description: 'Coordinates activities across all departments and ensures alignment with objectives',
    responsibilities: [
      'Synchronize operations across departments',
      'Resolve inter-departmental conflicts',
      'Ensure information flow between departments',
      'Report directly to Strategic Director'
    ],
    permissions: [
      { id: 'view-operations', name: 'View Operations', description: 'Access operations data', scope: 'read' },
      { id: 'manage-coordination', name: 'Manage Coordination', description: 'Create and modify coordination protocols', scope: 'write' }
    ]
  },
  
  // Management Level Roles
  {
    id: 'department-head',
    name: 'Department Head',
    level: 'management',
    description: 'Manages a specific department of agents with related functions',
    responsibilities: [
      'Set department goals aligned with organizational objectives',
      'Monitor department performance',
      'Allocate resources within the department',
      'Report to executive level'
    ],
    permissions: [
      { id: 'view-department', name: 'View Department Data', description: 'Access all data in the department', scope: 'read' },
      { id: 'manage-department', name: 'Manage Department', description: 'Modify department configuration', scope: 'write' },
      { id: 'create-agents', name: 'Create Agents', description: 'Create new agents in the department', scope: 'write' }
    ]
  },
  {
    id: 'team-supervisor',
    name: 'Team Supervisor',
    level: 'management',
    description: 'Supervises a team of agents working on specific tasks or objectives',
    responsibilities: [
      'Assign tasks to team members',
      'Monitor task execution and quality',
      'Provide guidance and intervention when needed',
      'Report to department head'
    ],
    permissions: [
      { id: 'view-team', name: 'View Team Data', description: 'Access all data in the team', scope: 'read' },
      { id: 'assign-tasks', name: 'Assign Tasks', description: 'Assign tasks to team members', scope: 'write' }
    ]
  },
  
  // Operational Level Roles
  {
    id: 'task-executor',
    name: 'Task Executor',
    level: 'operational',
    description: 'Executes specific assigned tasks according to defined parameters',
    responsibilities: [
      'Execute assigned tasks efficiently',
      'Report task completion status',
      'Identify and report issues in task execution',
      'Collect and process relevant data'
    ],
    permissions: [
      { id: 'execute-tasks', name: 'Execute Tasks', description: 'Run assigned tasks', scope: 'execute' },
      { id: 'view-task-data', name: 'View Task Data', description: 'Access data relevant to assigned tasks', scope: 'read' }
    ]
  },
  {
    id: 'data-processor',
    name: 'Data Processor',
    level: 'operational',
    description: 'Collects, processes, and analyzes data for decision-making',
    responsibilities: [
      'Gather data from various sources',
      'Process and clean data for analysis',
      'Generate reports and visualizations',
      'Identify patterns and anomalies'
    ],
    permissions: [
      { id: 'access-data-sources', name: 'Access Data Sources', description: 'Connect to data sources', scope: 'read' },
      { id: 'process-data', name: 'Process Data', description: 'Transform and process data', scope: 'write' }
    ]
  },
  
  // Specialized Roles
  {
    id: 'analytics-specialist',
    name: 'Analytics Specialist',
    level: 'specialized',
    description: 'Performs advanced data analysis and generates actionable insights',
    responsibilities: [
      'Develop and implement advanced analytics models',
      'Generate insights from complex datasets',
      'Create predictive models',
      'Support decision-making with data-driven recommendations'
    ],
    permissions: [
      { id: 'access-all-data', name: 'Access All Data', description: 'Read all relevant data sources', scope: 'read' },
      { id: 'create-models', name: 'Create Models', description: 'Develop and deploy analytical models', scope: 'write' }
    ]
  },
  {
    id: 'compliance-monitor',
    name: 'Compliance Monitor',
    level: 'specialized',
    description: 'Ensures all operations comply with relevant regulations and policies',
    responsibilities: [
      'Monitor compliance with internal policies',
      'Ensure regulatory requirements are met',
      'Identify and report compliance issues',
      'Recommend compliance improvements'
    ],
    permissions: [
      { id: 'view-operations', name: 'View Operations', description: 'Monitor all operations', scope: 'read' },
      { id: 'flag-issues', name: 'Flag Issues', description: 'Raise compliance flags', scope: 'write' }
    ]
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    level: 'specialized',
    description: 'Creates various types of content based on specifications and requirements',
    responsibilities: [
      'Generate text content for various purposes',
      'Adapt tone and style to target audiences',
      'Optimize content for different platforms',
      'Ensure content quality and accuracy'
    ],
    permissions: [
      { id: 'access-content-sources', name: 'Access Content Sources', description: 'Read content sources and references', scope: 'read' },
      { id: 'create-content', name: 'Create Content', description: 'Generate and publish content', scope: 'write' }
    ]
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    level: 'specialized',
    description: 'Handles customer inquiries, issues, and provides assistance',
    responsibilities: [
      'Respond to customer inquiries',
      'Resolve customer issues and complaints',
      'Provide product information and guidance',
      'Escalate complex issues when necessary'
    ],
    permissions: [
      { id: 'view-customer-data', name: 'View Customer Data', description: 'Access customer information', scope: 'read' },
      { id: 'respond-to-inquiries', name: 'Respond to Inquiries', description: 'Send responses to customers', scope: 'write' }
    ]
  }
];

export const getRoleById = (id: string): AgentRole | undefined => {
  return agentRoles.find(role => role.id === id);
};

export const getRolesByLevel = (level: 'executive' | 'management' | 'operational' | 'specialized'): AgentRole[] => {
  return agentRoles.filter(role => role.level === level);
};

export const getAllRoleLevels = () => {
  return ['executive', 'management', 'operational', 'specialized'] as const;
};