import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
  /**
   * Whether the modal is visible
   */
  isOpen: boolean;
  /**
   * Callback when the modal is closed
   */
  onClose: () => void;
  /**
   * Modal title
   */
  title?: string;
  /**
   * Modal content
   */
  children: React.ReactNode;
  /**
   * Whether to show a close button
   */
  showCloseButton?: boolean;
  /**
   * Modal footer
   */
  footer?: React.ReactNode;
  /**
   * Size of the modal
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Whether to close when clicking outside the modal
   */
  closeOnOutsideClick?: boolean;
  /**
   * Additional CSS classes for the modal container
   */
  className?: string;
  /**
   * Additional CSS classes for the backdrop
   */
  backdropClassName?: string;
}

/**
 * Modal component for displaying content that requires user interaction
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  footer,
  size = 'md',
  closeOnOutsideClick = true,
  className = '',
  backdropClassName = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = ''; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={twMerge(
        'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity',
        backdropClassName
      )}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={twMerge(
          'bg-white rounded-lg shadow-xl overflow-hidden w-full',
          sizeClasses[size],
          'transform transition-all',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 id="modal-title" className="text-lg font-medium text-gray-900">
              {title}
            </h3>
            {showCloseButton && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className={`px-6 py-4 ${!title && showCloseButton ? 'pt-10 relative' : ''}`}>
          {!title && showCloseButton && (
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;