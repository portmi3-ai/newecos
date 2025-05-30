import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  /**
   * Unique identifier for the tab
   */
  id: string;
  /**
   * Tab label
   */
  label: string | React.ReactNode;
  /**
   * Optional icon to display with the label
   */
  icon?: React.ReactNode;
  /**
   * Tab content
   */
  content: React.ReactNode;
  /**
   * Whether the tab is disabled
   */
  disabled?: boolean;
}

interface TabsProps {
  /**
   * Array of tab items
   */
  tabs: TabItem[];
  /**
   * Default active tab id
   */
  defaultActiveTab?: string;
  /**
   * Controlled active tab id
   */
  activeTab?: string;
  /**
   * Callback when active tab changes
   */
  onTabChange?: (tabId: string) => void;
  /**
   * Style variant
   */
  variant?: 'underline' | 'contained' | 'pills';
  /**
   * Additional CSS classes for the tabs container
   */
  className?: string;
  /**
   * Additional CSS classes for the tab content
   */
  contentClassName?: string;
}

/**
 * Tabs component for switching between different views
 */
const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'underline',
  className = '',
  contentClassName = '',
}) => {
  // Use controlled active tab if provided, otherwise use internal state
  const [internalActiveTab, setInternalActiveTab] = useState(defaultActiveTab || tabs[0]?.id);
  const activeTabId = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    setInternalActiveTab(tabId);
  };

  // Styles for different tab variants
  const tabListClasses = {
    underline: 'border-b border-gray-200',
    contained: 'bg-gray-100 p-1 rounded-lg',
    pills: 'space-x-1',
  };

  const tabItemClasses = {
    underline: (isActive: boolean, disabled: boolean | undefined) =>
      twMerge(
        'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
        isActive
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
        disabled && 'opacity-40 cursor-not-allowed hover:text-gray-500 hover:border-transparent'
      ),
    contained: (isActive: boolean, disabled: boolean | undefined) =>
      twMerge(
        'px-3 py-1.5 text-sm font-medium rounded-md',
        isActive
          ? 'bg-white shadow text-gray-900'
          : 'text-gray-500 hover:text-gray-700',
        disabled && 'opacity-40 cursor-not-allowed hover:text-gray-500'
      ),
    pills: (isActive: boolean, disabled: boolean | undefined) =>
      twMerge(
        'px-3 py-1.5 text-sm font-medium rounded-full',
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
        disabled && 'opacity-40 cursor-not-allowed hover:text-gray-500 hover:bg-transparent'
      ),
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  return (
    <div className={className}>
      <div className={twMerge('flex', tabListClasses[variant])}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            className={tabItemClasses[variant](tab.id === activeTabId, tab.disabled)}
            disabled={tab.disabled}
            aria-selected={tab.id === activeTabId}
            role="tab"
          >
            <div className="flex items-center">
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </div>
          </button>
        ))}
      </div>
      <div className={twMerge('mt-4', contentClassName)}>
        {activeTab && activeTab.content}
      </div>
    </div>
  );
};

export default Tabs;