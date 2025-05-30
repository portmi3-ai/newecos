import React from 'react';
import Breadcrumbs, { BreadcrumbItem } from '../components/Breadcrumbs';
import { twMerge } from 'tailwind-merge';

interface PageLayoutProps {
  /**
   * Page title
   */
  title: string;
  /**
   * Optional subtitle
   */
  subtitle?: string;
  /**
   * Breadcrumb items
   */
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Actions to display in the header
   */
  actions?: React.ReactNode;
  /**
   * Page content
   */
  children: React.ReactNode;
  /**
   * Optional sidebar content
   */
  sidebar?: React.ReactNode;
  /**
   * Sidebar width (percentage of page width)
   */
  sidebarWidth?: 25 | 33 | 50;
  /**
   * Sidebar position
   */
  sidebarPosition?: 'left' | 'right';
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Additional CSS classes for the header
   */
  headerClassName?: string;
  /**
   * Additional CSS classes for the content
   */
  contentClassName?: string;
}

/**
 * PageLayout component for consistent page structure
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
  sidebar,
  sidebarWidth = 33,
  sidebarPosition = 'right',
  className = '',
  headerClassName = '',
  contentClassName = '',
}) => {
  // Calculate content width based on sidebar presence and width
  const contentWidthClasses = sidebar
    ? `lg:w-${100 - sidebarWidth}%`
    : 'lg:w-full';
  
  // Sidebar width classes
  const sidebarWidthClasses = `lg:w-${sidebarWidth}%`;

  return (
    <div className={twMerge('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6', className)}>
      {/* Header */}
      <div className={twMerge('mb-8', headerClassName)}>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4" />}
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-gray-600">{subtitle}</p>
            )}
          </div>
          
          {actions && (
            <div className="mt-4 md:mt-0 flex space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className={twMerge('flex flex-col lg:flex-row', contentClassName)}>
        {/* Main content */}
        <main
          className={twMerge(
            'w-full', 
            contentWidthClasses, 
            sidebar && sidebarPosition === 'left' ? 'lg:order-2' : 'lg:order-1'
          )}
        >
          {children}
        </main>

        {/* Sidebar */}
        {sidebar && (
          <aside
            className={twMerge(
              'w-full mt-8 lg:mt-0', 
              sidebarWidthClasses,
              sidebarPosition === 'left' ? 'lg:order-1 lg:pr-6' : 'lg:order-2 lg:pl-6'
            )}
          >
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
};

export default PageLayout;