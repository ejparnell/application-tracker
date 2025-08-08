'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import styles from './QuickActions.module.css';

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

export default function QuickActions() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleImportData = async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await fetch('/api/applications/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source: 'root-data' }),
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }

      const result: ImportResult = await response.json();
      setImportResult(result);
      
      // Trigger a page refresh to update all application lists
      if (result.success && result.imported > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleNewApplication = () => {
    window.location.href = '/applications/new';
  };

  const handleViewApplications = () => {
    window.location.href = '/applications';
  };

  return (
    <div className={styles.quickActions}>
      <Text variant="h3" className={styles.title}>
        Quick Actions
      </Text>
      
      <div className={styles.actionGrid}>
        <Button
          variant="primary"
          size="large"
          onClick={handleNewApplication}
          className={styles.actionButton}
        >
          Add New Application
        </Button>
        
        <Button
          variant="secondary"
          size="large"
          onClick={handleViewApplications}
          className={styles.actionButton}
        >
          View All Applications
        </Button>
        
        <Button
          variant="secondary"
          size="large"
          onClick={handleImportData}
          disabled={isImporting}
          className={styles.actionButton}
        >
          {isImporting ? 'Importing...' : 'Import Data from JSON'}
        </Button>
      </div>

      {importResult && (
        <div className={styles.importResult}>
          <div className={`${styles.resultCard} ${importResult.success ? styles.success : styles.error}`}>
            <Text variant="body-large" color={importResult.success ? 'success' : 'error'}>
              {importResult.success ? 'Import Completed!' : 'Import Failed'}
            </Text>
            
            {importResult.success && (
              <div className={styles.resultStats}>
                <Text variant="body-small" color="secondary">
                  Imported: {importResult.imported} • Skipped: {importResult.skipped}
                </Text>
                {importResult.imported > 0 && (
                  <Text variant="body-small" color="secondary">
                    Page will refresh in 2 seconds...
                  </Text>
                )}
              </div>
            )}
            
            {importResult.errors.length > 0 && (
              <div className={styles.errorList}>
                <Text variant="body-small" color="error">
                  Errors:
                </Text>
                {importResult.errors.slice(0, 3).map((error, index) => (
                  <Text key={index} variant="caption" color="error" className={styles.errorItem}>
                    • {error}
                  </Text>
                ))}
                {importResult.errors.length > 3 && (
                  <Text variant="caption" color="error">
                    ... and {importResult.errors.length - 3} more errors
                  </Text>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
