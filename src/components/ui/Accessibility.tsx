import React from 'react';

/**
 * Screen reader only utility component for accessibility announcements
 */
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only" aria-live="polite">
    {children}
  </span>
);

/**
 * Enhanced live region for dynamic content announcements
 */
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}> = ({ children, priority = 'polite', atomic = true }) => (
  <div
    className="sr-only"
    aria-live={priority}
    aria-atomic={atomic}
  >
    {children}
  </div>
);

/**
 * Enhanced status indicator with accessibility
 */
export const StatusIndicator: React.FC<{
  status: 'loading' | 'success' | 'error' | 'warning' | 'info';
  message: string;
  children?: React.ReactNode;
}> = ({ status, message, children }) => {
  const statusConfig = {
    loading: { label: 'Loading', className: 'text-blue-600' },
    success: { label: 'Success', className: 'text-green-600' },
    error: { label: 'Error', className: 'text-red-600' },
    warning: { label: 'Warning', className: 'text-yellow-600' },
    info: { label: 'Information', className: 'text-blue-600' },
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${statusConfig[status].label}: ${message}`}
      className="flex items-center gap-2"
    >
      {children}
      <ScreenReaderOnly>
        {statusConfig[status].label}: {message}
      </ScreenReaderOnly>
    </div>
  );
};

/**
 * Enhanced form field with accessibility improvements
 */
export const AccessibleFormField: React.FC<{
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, error, required, helpText, children }) => (
  <div className="space-y-2">
    <label
      htmlFor={htmlFor}
      className="text-responsive-sm font-medium text-foreground"
    >
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
    <div className="relative">
      {children}
    </div>
    {error && (
      <p
        id={`${htmlFor}-error`}
        className="text-responsive-xs text-destructive"
        role="alert"
        aria-live="polite"
      >
        {error}
      </p>
    )}
    {helpText && !error && (
      <p
        id={`${htmlFor}-help`}
        className="text-responsive-xs text-muted-foreground"
      >
        {helpText}
      </p>
    )}
  </div>
);

/**
 * Enhanced navigation breadcrumb component
 */
export const Breadcrumb: React.FC<{
  items: Array<{ label: string; href?: string; current?: boolean }>;
}> = ({ items }) => (
  <nav aria-label="Breadcrumb navigation" className="flex items-center space-x-2 text-responsive-sm">
    <ol className="flex items-center space-x-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-center">
          {index > 0 && (
            <span className="text-muted-foreground mx-2" aria-hidden="true">/</span>
          )}
          {item.current ? (
            <span
              aria-current="page"
              className="font-medium text-foreground"
            >
              {item.label}
            </span>
          ) : (
            <a
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

/**
 * Enhanced skip link component
 */
export const SkipLinks: React.FC = () => (
  <div className="sr-only focus-within:not-sr-only">
    <a
      href="#main-content"
      className="absolute left-0 top-0 transform -translate-y-full bg-primary text-primary-foreground px-4 py-2 rounded-br-lg focus:translate-y-0 transition-transform duration-200 z-[9999] focus-enhanced"
    >
      Skip to main content
    </a>
    <a
      href="#navigation"
      className="absolute left-0 top-0 transform -translate-y-full bg-primary text-primary-foreground px-4 py-2 rounded-br-lg focus:translate-y-0 transition-transform duration-200 z-[9999] focus-enhanced"
    >
      Skip to navigation
    </a>
  </div>
);

/**
 * Enhanced announcement region for dynamic updates
 */
export const AnnouncementRegion: React.FC<{
  message: string;
  clearAfter?: number;
}> = ({ message, clearAfter }) => {
  const [announcement, setAnnouncement] = React.useState(message);

  React.useEffect(() => {
    setAnnouncement(message);
    if (clearAfter && message) {
      const timer = setTimeout(() => setAnnouncement(''), clearAfter);
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <LiveRegion priority="assertive">
      {announcement}
    </LiveRegion>
  );
};

/**
 * Enhanced modal with accessibility features
 */
export const AccessibleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, description, children, size = 'md' }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Focus management
  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0] as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);

  // Keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className={`bg-background rounded-lg shadow-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 id="modal-title" className="text-responsive-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-responsive-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="touch-target text-muted-foreground hover:text-foreground focus:text-foreground"
            aria-label="Close modal"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced data table with accessibility features
 */
export const AccessibleTable: React.FC<{
  headers: Array<{ key: string; label: string; sortable?: boolean }>;
  data: Array<Record<string, React.ReactNode>>;
  caption?: string;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}> = ({ headers, data, caption, onSort, sortKey, sortDirection }) => (
  <div className="overflow-x-auto">
    <table
      className="w-full border-collapse"
      role="table"
      aria-label={caption || 'Data table'}
    >
      {caption && (
        <caption className="text-responsive-sm font-medium text-left mb-2">
          {caption}
        </caption>
      )}
      <thead>
        <tr>
          {headers.map((header) => (
            <th
              key={header.key}
              className="text-left p-3 border-b border-border font-medium text-responsive-sm"
              role="columnheader"
              scope="col"
              aria-sort={
                sortKey === header.key
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : header.sortable
                  ? 'none'
                  : undefined
              }
            >
              {header.sortable && onSort ? (
                <button
                  onClick={() => onSort(header.key)}
                  className="flex items-center gap-1 hover:text-primary focus:text-primary touch-target"
                  aria-label={`Sort by ${header.label}`}
                >
                  {header.label}
                  <span className="text-xs">
                    {sortKey === header.key ? (
                      sortDirection === 'asc' ? '↑' : '↓'
                    ) : (
                      '↕'
                    )}
                  </span>
                </button>
              ) : (
                header.label
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="hover:bg-muted/50">
            {headers.map((header) => (
              <td
                key={header.key}
                className="p-3 border-b border-border text-responsive-sm"
                role="cell"
              >
                {row[header.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
