import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AgentRoleSelectorProps {
  selectedRole: string | undefined;
  onChange: (role: string) => void;
  className?: string;
}

const AgentRoleSelector: React.FC<AgentRoleSelectorProps> = ({
  selectedRole,
  onChange,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Agent Role</label>
      <div className="relative">
        <select
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          value={selectedRole || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select a role</option>
          <optgroup label="Executive Level">
            <option value="executive-director">Executive Director</option>
            <option value="chief-strategist">Chief Strategist</option>
            <option value="ecosystem-coordinator">Ecosystem Coordinator</option>
          </optgroup>
          <optgroup label="Management Level">
            <option value="department-manager">Department Manager</option>
            <option value="team-lead">Team Lead</option>
            <option value="project-coordinator">Project Coordinator</option>
          </optgroup>
          <optgroup label="Operational Level">
            <option value="task-processor">Task Processor</option>
            <option value="data-collector">Data Collector</option>
            <option value="communication-handler">Communication Handler</option>
          </optgroup>
          <optgroup label="Specialized">
            <option value="analytics-specialist">Analytics Specialist</option>
            <option value="content-creator">Content Creator</option>
            <option value="customer-support">Customer Support</option>
            <option value="research-analyst">Research Analyst</option>
            <option value="compliance-monitor">Compliance Monitor</option>
          </optgroup>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        {getRoleDescription(selectedRole)}
      </p>
    </div>
  );
};

const getRoleDescription = (role?: string): string => {
  switch (role) {
    case 'executive-director':
      return 'Oversees the entire agent ecosystem with strategic planning and resource allocation.';
    case 'chief-strategist':
      return 'Develops and implements high-level strategies for the agent ecosystem.';
    case 'ecosystem-coordinator':
      return 'Coordinates interactions between different agent hierarchies and domains.';
    case 'department-manager':
      return 'Manages a specific department of agents with related functions.';
    case 'team-lead':
      return 'Leads a team of agents focused on specific tasks or objectives.';
    case 'project-coordinator':
      return 'Coordinates agents working on a specific project or initiative.';
    case 'task-processor':
      return 'Processes specific tasks and carries out defined operations.';
    case 'data-collector':
      return 'Gathers, organizes, and prepares data for other agents in the ecosystem.';
    case 'communication-handler':
      return 'Manages communications with users or other systems.';
    case 'analytics-specialist':
      return 'Performs advanced data analysis and generates insights.';
    case 'content-creator':
      return 'Creates text, images, or other content based on specifications.';
    case 'customer-support':
      return 'Handles customer inquiries and provides assistance.';
    case 'research-analyst':
      return 'Conducts research and produces analytical reports.';
    case 'compliance-monitor':
      return 'Ensures operations comply with relevant regulations and policies.';
    default:
      return 'Select a role to see its description.';
  }
};

export default AgentRoleSelector;