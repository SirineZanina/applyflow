export interface DashboardSummary {
  stats: {
    totalApplications: number;
    appliedCount: number;
    interviewingCount: number;
    offerCount: number;
    resumeCount: number;
    documentCount: number;
  };
  topMatches: {
    jobId: string;
    companyName: string;
    title: string;
    matchScore: number;
    location: string;
    saved: boolean;
  }[];
  upcomingItems: {
    applicationId: string;
    companyName: string;
    jobTitle: string;
    status: string;
    nextStep: string | null;
    nextStepAt: string | null;
  }[];
  quickActions: {
    profileReady: boolean;
    hasPrimaryResume: boolean;
    hasGeneratedDocuments: boolean;
    nextRecommendedRoute: string;
  };
}
