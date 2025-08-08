export interface ApplicationData {
  exportDate: string;
  totalJobs: number;
  source: string;
  version: string;
  
  statistics: {
    total: number;
    available: number;
    applied: number;
    interview: number;
    rejected: number;
    hidden: number;
  };
  
  jobs: JobApplication[];
}

export interface JobApplication {
  id: number;
  title: string;
  company: string;
  location?: string;
  date: string;
  daysAgo?: string;
  jobUrl: string;
  description: string;
  status: ApplicationStatus;
  flags: ApplicationFlags;
  dateLoaded: string;
  updatedAt: string;
}

export interface ApplicationFlags {
  applied: boolean;
  hidden: boolean;
  interview: boolean;
  rejected: boolean;
}

export type ApplicationStatus = 'available' | 'applied' | 'interview' | 'rejected' | 'hidden';

export interface Application extends Omit<JobApplication, 'updatedAt'> {
  _id?: string;
  userId: string;
  appliedAt?: Date;
  interviewDate?: Date;
  notes?: string;
  resumeContent?: string;
  coverLetter?: string;
  salary?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateApplicationData {
  title: string;
  company: string;
  location?: string;
  jobUrl: string;
  description: string;
  status?: ApplicationStatus;
  salary?: string;
  notes?: string;
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {
  appliedAt?: Date;
  interviewDate?: Date;
  resumeContent?: string;
  coverLetter?: string;
}

export interface ApplicationFilters {
  status?: ApplicationStatus | ApplicationStatus[];
  company?: string;
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  appliedDateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface ApplicationSort {
  field: 'date' | 'appliedAt' | 'updatedAt' | 'title' | 'company';
  order: 'asc' | 'desc';
}

export interface ApplicationStats {
  total: number;
  available: number;
  applied: number;
  interview: number;
  rejected: number;
  hidden: number;
  responseRate: number;
  interviewRate: number;
  averageDaysToResponse?: number;
  topCompanies: Array<{
    company: string;
    count: number;
  }>;
  topLocations: Array<{
    location: string;
    count: number;
  }>;
  applicationsByMonth: Array<{
    month: string;
    count: number;
  }>;
}

export interface ApplicationsResponse {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
  stats: ApplicationStats;
}

export interface ApplicationResponse {
  application: Application;
  success: boolean;
  message?: string;
}

export interface ImportData {
  source: 'linkedin' | 'manual' | 'csv';
  data: ApplicationData | JobApplication[];
  overwriteExisting?: boolean;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includeNotes?: boolean;
  includeGenerated?: boolean;
  statusFilter?: ApplicationStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}
