import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';

export default function PdfViewer({
  pdfUrl,
  title = 'PDF Document',
  description = '',
  height = '800px',
  showDownloadButton = true,
  accentColor = '#00A3FF',
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [pdfUrl]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ '--accent-color': accentColor }}>
        <div className={styles.titleSection}>
          <div className={styles.iconWrapper}>
            <svg 
              className={styles.pdfIcon} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 17H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 9H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={styles.textContent}>
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>
        {showDownloadButton && (
          <a 
            href={pdfUrl} 
            download 
            className={styles.downloadButton}
            style={{ '--accent-color': accentColor }}
          >
            <svg 
              className={styles.downloadIcon} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Download PDF</span>
          </a>
        )}
      </div>
      
      <div className={styles.viewerWrapper} style={{ height }}>
        {isLoading && !hasError && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} style={{ '--accent-color': accentColor }}></div>
            <p>Loading document...</p>
          </div>
        )}
        
        {hasError ? (
          <div className={styles.errorState}>
            <svg 
              className={styles.errorIcon} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            <h4>Unable to display PDF</h4>
            <p>Your browser may not support embedded PDF viewing.</p>
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.fallbackLink}
              style={{ '--accent-color': accentColor }}
            >
              Open PDF in new tab →
            </a>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            className={styles.pdfFrame}
            title={title}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
      
      <div className={styles.footer}>
        <a 
          href={pdfUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.externalLink}
        >
          Open in new tab ↗
        </a>
      </div>
    </div>
  );
}

PdfViewer.propTypes = {
  pdfUrl: PropTypes.string.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  height: PropTypes.string,
  showDownloadButton: PropTypes.bool,
  accentColor: PropTypes.string,
};

