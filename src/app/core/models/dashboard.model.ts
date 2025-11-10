// dashboard.model.ts
export interface SummaryStatusItem {
  statusType: string;
  count: number;
}

export type SummaryStatusResponse = SummaryStatusItem[];

// Alternative: If you want to define specific status types
export type JobStatusType = 
  | 'New'
  | 'Accepted'
  | 'Assigned'
  | 'Actioned'
  | 'Rejected'
  | 'Booked'
  | 'Confirmed'
  | 'Progress'
  | 'Incomplete'
  | 'Fail'
  | 'PendingReview'
  | 'Complete'
  | 'Repair'
  | 'Cancelled';

export interface TypedSummaryStatusItem {
  statusType: JobStatusType;
  count: number;
}

export type TypedSummaryStatusResponse = TypedSummaryStatusItem[];

// Enhanced model with additional properties
export interface SummaryStatus {
  statusType: string;
  count: number;
  percentage?: number; // Optional: calculated percentage
  color?: string; // Optional: for UI styling
  icon?: string; // Optional: for UI icons
  priority?: number; // Optional: for sorting
}

export interface DashboardSummary {
  totalJobs: number;
  statusItems: SummaryStatus[];
  lastUpdated: Date;
}

export interface EngineerSummary {
  userName: string;
  count: number;
  userId?: number;
  firstName?: string;
  lastName?: string;
}

export type EngineerSummaryResponse = EngineerSummary[];