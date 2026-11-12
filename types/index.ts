export type VerificationLabel =
  | "Supported by sources"
  | "Not supported by sources"
  | "Insufficient evidence";

export interface CorpusPassage {
  id: string;
  source_title: string;
  source_url: string;
  published_date: string;
  text: string;
  placeholder?: boolean;
  note?: string;
  score?: number;
}

export interface CitedEvidence {
  passage_id: string;
  quote_or_summary: string;
  source_title?: string;
  source_url?: string;
  published_date?: string;
}

export interface ClaimAssessment {
  original_claim: string;
  label: VerificationLabel;
  explanation: string;
  evidence: CitedEvidence[];
  limitations: string;
  retrieved_passages?: CorpusPassage[];
}

export interface VerificationResponse {
  claims: ClaimAssessment[];
  timestamp: string;
  isDemoMode: boolean;
  demoNotice?: string;
  processing_ms?: number;
}

export interface ReviewerReport {
  id: string;
  input_text: string;
  timestamp: string;
  status: "AI-generated" | "Approved" | "Flagged" | "Corrected";
  reviewer_notes?: string;
  reviewed_at?: string;
  response: VerificationResponse;
}
