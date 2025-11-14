/**
 * TV-Object types and their attribute schemas for the TVAS framework
 */

export const TV_OBJECT_TYPES = [
  "Actor",
  "Event",
  "Condition",
  "Ideology",
  "Source",
  "Claim",
  "Method",
] as const;

export type TVObjectType = typeof TV_OBJECT_TYPES[number];

export interface TVObjectAttribute {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "textarea";
  required?: boolean;
  placeholder?: string;
}

export const TV_OBJECT_SCHEMAS: Record<TVObjectType, TVObjectAttribute[]> = {
  Actor: [
    { name: "role", label: "Role", type: "text", required: true, placeholder: "e.g., King, Revolutionary Leader" },
    { name: "birth_year", label: "Birth Year", type: "number", placeholder: "e.g., 1754" },
    { name: "death_year", label: "Death Year", type: "number", placeholder: "e.g., 1793" },
    { name: "affiliation", label: "Affiliation", type: "text", placeholder: "e.g., Monarchy, Jacobins" },
    { name: "active_period", label: "Active Period", type: "text", placeholder: "e.g., 1774-1792" },
  ],
  Event: [
    { name: "date", label: "Date", type: "date", required: true },
    { name: "location", label: "Location", type: "text", required: true, placeholder: "e.g., Paris, France" },
    { name: "participants", label: "Participants", type: "textarea", placeholder: "List key participants" },
    { name: "duration", label: "Duration", type: "text", placeholder: "e.g., 1 day, 3 months" },
    { name: "significance", label: "Significance", type: "textarea", placeholder: "Why is this event important?" },
  ],
  Condition: [
    { name: "start_date", label: "Start Date", type: "date" },
    { name: "end_date", label: "End Date", type: "date" },
    { name: "severity", label: "Severity", type: "text", placeholder: "e.g., Critical, Moderate, Low" },
    { name: "affected_groups", label: "Affected Groups", type: "textarea", placeholder: "Who was affected?" },
  ],
  Ideology: [
    { name: "core_tenets", label: "Core Tenets", type: "textarea", required: true, placeholder: "List main principles" },
    { name: "proponents", label: "Key Proponents", type: "textarea", placeholder: "Who advocated for this?" },
    { name: "historical_context", label: "Historical Context", type: "textarea", placeholder: "When and where did this emerge?" },
  ],
  Source: [
    { name: "author", label: "Author", type: "text", required: true, placeholder: "e.g., John Smith" },
    { name: "publication_date", label: "Publication Date", type: "date", placeholder: "When was this published?" },
    { name: "document_type", label: "Document Type", type: "text", placeholder: "e.g., Book, Article, Primary Source" },
    { name: "credibility", label: "Credibility", type: "text", placeholder: "e.g., Primary source, Peer-reviewed" },
  ],
  Claim: [
    { name: "claimant", label: "Claimant", type: "text", placeholder: "Who makes this claim?" },
    { name: "confidence_level", label: "Confidence Level", type: "text", placeholder: "e.g., High, Medium, Low" },
    { name: "evidence_links", label: "Evidence Links", type: "textarea", placeholder: "What supports this claim?" },
  ],
  Method: [
    { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Describe the methodology" },
    { name: "domain", label: "Domain", type: "text", placeholder: "e.g., History, Sociology" },
    { name: "key_references", label: "Key References", type: "textarea", placeholder: "Important works using this method" },
  ],
};

export const RELATIONSHIP_TYPES = [
  "IS_SUPPORTED_BY",
  "IS_CONTRADICTED_BY",
  "CRITIQUES",
  "BUILDS_ON",
  "REFUTES",
  "IS_CAUSED_BY",
  "LEADS_TO",
  "USES_METHOD_FROM",
  "APPLIES_FRAMEWORK_OF",
  "PROVIDES_EVIDENCE_FOR",
  "AFFECTED",
  "LED_BY",
  "TAKEN_BY",
  "CHALLENGED",
  "EMBODIES",
  "BURDENED",
] as const;

export type RelationshipType = typeof RELATIONSHIP_TYPES[number];
