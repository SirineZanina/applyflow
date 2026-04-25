export interface JobCard {
  id: string;
  companyName: string;
  companyLogoText: string | null;
  companyColor: string | null;
  title: string;
  location: string;
  remoteEligible: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  roleType: string;
  postedAt: string;
  matchScore: number | null;
  saved: boolean;
  applied: boolean;
  matchedSkills: string[];
}

export interface JobDetail extends JobCard {
  description: string;
  requiredSkills: string[];
  sourceUrl: string | null;
  salaryInsight: string;
  interviewTip: string;
}
