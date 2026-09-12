
export interface ScamAnalysisResult {
  isScam: boolean;
  riskScore: number; // 1-100
  confidence: number;
  intent: string;
  redFlags: string[];
  summary: string;
  forensicBreakdown: {
    psychologicalTriggers: string[];
    technicalAnomalies: string[];
    urgencyLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  };
  educationalInsight: string;
}

export interface UPIAnalysisResult {
  isSuspicious: boolean;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  patternsIdentified: string[];
  recommendation: string;
}

export interface VoiceAnalysisResult {
  isDeepfake: boolean;
  probability: number;
  anomalies: string[];
  verdict: string;
}

export interface FirmAnalysisResult {
  isGhostFirm: boolean;
  riskRating: 'Safe' | 'Suspect' | 'Hazard' | 'Dangerous';
  firmRegistryStatus: string;
  redFlags: string[];
  verdict: string;
  companyBackground: string;
}

export interface WebsiteAnalysisResult {
  isPhishing: boolean;
  trustScore: number; // 0-100
  domainAgeInfo: string;
  technicalDiscrepancies: string[];
  verdict: string;
  officialSiteUrl?: string;
  isSpoofed: boolean;
}

export interface HeatmapHotspot {
  id: string;
  name: string;
  scamCount: number;
  recentType: string;
  coordinates: { x: number; y: number }; // Percentage for SVG positioning
  lat?: number;
  lng?: number;
}

export interface ScamAlert {
  id: string;
  title: string;
  scamType: string;
  description: string;
  areaName: string;
  lat: number;
  lng: number;
  severity: 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  createdAt: any;
  upvotes?: number;
  contactMasked?: string;
}

