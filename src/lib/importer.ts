import fs from 'fs/promises';
import path from 'path';
import { Application } from '@/models/application';
import { ApplicationData, JobApplication } from '@/types/applications';
import { dbConnect } from '@/lib/database';

/**
 * @fileoverview Utility class for importing and exporting job application
 * data to and from the application's MongoDB store.
 *
 * @author ejparnell
 * @since 1.0.0
 */

export class ApplicationImporter {
  /**
   * Imports job applications from a JSON file on disk.
   *
   * @param filePath - Path to the JSON file to import.
   * @param userId - User ID to associate the imported applications with.
   * @returns Summary of the import process including counts and errors.
   */
  static async importFromJSON(filePath: string, userId: string): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const result = {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    try {
      await dbConnect();
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data: ApplicationData = JSON.parse(fileContent);
      
      console.log(`Found ${data.totalJobs} jobs to import from ${data.source}`);
      
      for (const job of data.jobs) {
        try {
          const existingApp = await Application.findOne({ 
            id: job.id, 
            userId 
          });
          
          if (existingApp) {
            result.skipped++;
            continue;
          }
          
          const applicationData = {
            ...job,
            userId,
            appliedAt: job.flags.applied ? new Date(job.updatedAt) : undefined,
            description: this.cleanDescription(job.description),
          };
          
          await Application.create(applicationData);
          
          result.imported++;
          
        } catch (error) {
          const errorMsg = `Failed to import job ${job.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
      
      result.success = true;
      console.log(`Import completed: ${result.imported} imported, ${result.skipped} skipped, ${result.errors.length} errors`);
      
    } catch (error) {
      const errorMsg = `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      console.error(errorMsg);
    }
    
    return result;
  }
  
  /**
   * Imports job applications from an in-memory array of job records.
   *
   * @param jobs - Array of job application objects to import.
   * @param userId - User ID to associate the applications with.
   * @returns Summary of the import process.
   */
  static async importFromArray(jobs: JobApplication[], userId: string): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const result = {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    try {
      await dbConnect();
      
      for (const job of jobs) {
        try {
          const existingApp = await Application.findOne({ 
            id: job.id, 
            userId 
          });
          
          if (existingApp) {
            result.skipped++;
            continue;
          }
          
          const applicationData = {
            ...job,
            userId,
            appliedAt: job.flags.applied ? new Date(job.updatedAt) : undefined,
            description: this.cleanDescription(job.description),
          };
          
          await Application.create(applicationData);
          
          result.imported++;
          
        } catch (error) {
          const errorMsg = `Failed to import job ${job.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
      
      result.success = true;
      
    } catch (error) {
      const errorMsg = `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      console.error(errorMsg);
    }
    
    return result;
  }
  
  /**
   * Cleans HTML-laden job descriptions into Markdown-like plain text.
   *
   * @param description - Raw HTML job description.
   * @returns Sanitized description limited to 5000 characters.
   */
  static cleanDescription(description: string): string {
    return description
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?(div|p|span)[^>]*>/gi, '\n')
      .replace(/<\/?(strong|b)[^>]*>/gi, '**')
      .replace(/<\/?(em|i)[^>]*>/gi, '*')
      .replace(/<[^>]+>/g, '')
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .substring(0, 5000);
  }
  
  /**
   * Exports a user's applications to a JSON object and optionally writes
   * it to disk.
   *
   * @param userId - User whose applications are exported.
   * @param filePath - Optional file system path to write the JSON data to.
   * @returns Structured application data ready for export.
   */
  static async exportToJSON(userId: string, filePath?: string): Promise<ApplicationData> {
    await dbConnect();
    
    const applications = await Application.find({ userId }).lean();
    
    const stats = {
      total: applications.length,
      available: applications.filter(app => app.status === 'available').length,
      applied: applications.filter(app => app.status === 'applied').length,
      interview: applications.filter(app => app.status === 'interview').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      hidden: applications.filter(app => app.status === 'hidden').length,
    };
    
    const exportData: ApplicationData = {
      exportDate: new Date().toISOString(),
      totalJobs: applications.length,
      source: 'Application Tracker Export',
      version: '1.0',
      statistics: stats,
      jobs: applications.map(app => ({
        id: app.id,
        title: app.title,
        company: app.company,
        location: app.location || '',
        date: app.date,
        daysAgo: app.daysAgo || '',
        jobUrl: app.jobUrl,
        description: app.description,
        status: app.status,
        flags: app.flags,
        dateLoaded: app.dateLoaded,
        updatedAt: app.updatedAt?.toISOString() || app.dateLoaded,
      }))
    };
    
    if (filePath) {
      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
      console.log(`Exported ${applications.length} applications to ${filePath}`);
    }
    
    return exportData;
  }
  
  /**
   * Convenience method that imports applications from the `data.json` file
   * located at the project root.
   *
   * @param userId - User ID to associate imported applications with.
   * @returns Summary of the import process.
   */
  static async migrateDataFromRoot(userId: string): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const dataPath = path.join(process.cwd(), 'data.json');
    return this.importFromJSON(dataPath, userId);
  }
}
