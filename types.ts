
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  GENERATOR = 'GENERATOR',
  ANALYZER = 'ANALYZER',
  ABOUT = 'ABOUT'
}

export enum DocumentCategory {
  RESIDENTIAL_LEASE = 'Residential Lease',
  COMMERCIAL_LEASE = 'Commercial Lease',
  SERVICE_AGREEMENT = 'Service Agreement',
  CONSULTING_AGREEMENT = 'Consulting Agreement',
  NDA = 'Non-Disclosure Agreement (NDA)',
  SALES_CONTRACT = 'Sales/Purchase Contract',
  EMPLOYMENT_AGREEMENT = 'Employment Agreement',
  SUBLEASE = 'Sublease Agreement',
  CORPORATE = 'Corporate Contract',
  POLICY = 'Policy Document',
  FORM = 'Legal Form/Notice'
}

export interface DocumentTemplate {
  id: string;
  name: DocumentCategory;
  description: string;
  icon: string;
  requiredFields: string[];
}

export interface AnalysisResult {
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  risks: string[];
  plainEnglishTranslation: string;
  hiddenClauses: string[];
}

export interface GeneratedDocument {
  title: string;
  content: string; // Markdown or HTML
  date: string;
}
