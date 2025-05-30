import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface BreadcrumbItem {
  /**
   * Label to display
   */
  label: string;
  /**
   * URL to navigate to
   */
  href?: string;
  /**
   * Optional icon to display before the label
   */
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  /**
   * Array of breadcrumb items
   */
  items: BreadcrumbItem[];
  /**
   * Whether to show the home icon
   */
  showHomeIcon?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Breadcrumbs navigation component
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHomeIcon = true,
  className = '',
}) => {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Breadcrumbs"
      className={twMerge('flex items-center text-sm', className)}
    >
      <ol className="flex items-center space-x-2">
        {showHomeIcon && items[0].href && (
          <li>
            <Link
              to={items[0].href}
              className="flex items-center text-gray-500 hover:text-gray-700"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
          </li>
        )}

        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </li>
            )}
            <li className="flex items-center">
              {item.href && index < items.length - 1 ? (
                <Link
                  to={item.href}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  {item.icon && <span className="mr-1.5">{item.icon}</span>}
                  {item.label}
                </Link>
              ) : (
                <span className="flex items-center text-gray-900 font-medium">
                  {item.icon && <span className="mr-1.5">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;