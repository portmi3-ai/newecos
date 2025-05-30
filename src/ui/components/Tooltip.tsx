import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';

type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  /**
   * The tooltip content
   */
  content: React.ReactNode;
  /**
   * The element that triggers the tooltip
   */
  children: React.ReactElement;
  /**
   * Tooltip placement
   */
  placement?: TooltipPlacement;
  /**
   * Delay before showing tooltip (ms)
   */
  delay?: number;
  /**
   * Whether the tooltip is disabled
   */
  disabled?: boolean;
  /**
   * Max width of the tooltip
   */
  maxWidth?: number | string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Tooltip component for displaying additional information on hover
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 300,
  disabled = false,
  maxWidth = 200,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Calculate tooltip position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    let top = 0;
    let left = 0;
    
    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8 + scrollTop;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollLeft;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollTop;
        left = triggerRect.right + 8 + scrollLeft;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8 + scrollTop;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollLeft;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollTop;
        left = triggerRect.left - tooltipRect.width - 8 + scrollLeft;
        break;
    }
    
    // Adjust if tooltip goes off screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust horizontally
    if (left < 10) {
      left = 10;
    } else if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }
    
    // Adjust vertically
    if (top < 10) {
      top = 10;
    } else if (top + tooltipRect.height > viewportHeight - 10) {
      top = viewportHeight - tooltipRect.height - 10;
    }
    
    setPosition({ top, left });
  };

  // Show tooltip
  const handleMouseEnter = () => {
    if (disabled) return;
    
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      // Calculate position after render
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  // Hide tooltip
  const handleMouseLeave = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsVisible(false);
  };

  // Update position on window resize
  useEffect(() => {
    if (isVisible) {
      const handleResize = () => {
        calculatePosition();
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    }
  }, [isVisible]);

  // Clean up timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Add mouse events to the child element
  const childWithProps = React.cloneElement(children, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
      
      // Forward the ref if the child has one
      const originalRef = children.ref;
      if (typeof originalRef === 'function') {
        originalRef(node);
      } else if (originalRef !== null && originalRef !== undefined) {
        (originalRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      // Call the original handler if it exists
      if (children.props.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      // Call the original handler if it exists
      if (children.props.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
    }
  });

  // Arrow directions based on placement
  const arrowStyles = {
    top: 'bottom-[-4px] left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-0',
    right: 'left-[-4px] top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-0',
    bottom: 'top-[-4px] left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-0',
    left: 'right-[-4px] top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-0',
  };

  return (
    <>
      {childWithProps}
      
      {isVisible && content && createPortal(
        <div
          ref={tooltipRef}
          className={twMerge(
            'fixed z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg',
            className
          )}
          style={{
            top: position.top,
            left: position.left,
            maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          }}
        >
          <div
            className={twMerge(
              'absolute w-0 h-0 border-4 border-gray-900',
              arrowStyles[placement]
            )}
          />
          {content}
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;