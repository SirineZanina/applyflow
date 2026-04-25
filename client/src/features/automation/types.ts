export interface AutomationPreview {
  eligibleJobs: {
    jobId: string;
    companyName: string;
    title: string;
    matchScore: number;
    confidenceLabel: string;
    breakdown: {
      skills: number;
      desiredRoles: number;
      location: number;
      experience: number;
      salary: number;
    };
  }[];
}

export interface AutomationLaunchResponse {
  preparedCount: number;
  applications: {
    applicationId: string;
    jobId: string;
    companyName: string;
    title: string;
  }[];
}
