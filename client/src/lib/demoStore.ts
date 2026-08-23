// Evidence Ledger design reminder: AtlasDesk is an honest, browser-local prototype. Persist demo state locally and disclose it in the UI.
export type DemoDocument = {
  id: string;
  name: string;
  type: string;
  status: "Indexed" | "Processing";
  chunks: number;
  updated: string;
};

export type DemoConversation = {
  id: string;
  question: string;
  answer: string;
  sources: string[];
  confidence: number;
  helpful?: boolean;
};

const STORAGE_KEY = "atlasdesk-local-demo-v1";

export const defaultDocuments: DemoDocument[] = [
  { id: "doc-1", name: "Product handbook.pdf", type: "PDF", status: "Indexed", chunks: 248, updated: "Today" },
  { id: "doc-2", name: "Returns policy.docx", type: "DOCX", status: "Indexed", chunks: 64, updated: "3 days ago" },
  { id: "doc-3", name: "Pricing FAQ.txt", type: "TXT", status: "Indexed", chunks: 18, updated: "5 days ago" },
];

export function loadDocuments(): DemoDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDocuments;
    const parsed = JSON.parse(raw) as { documents?: DemoDocument[] };
    return parsed.documents?.length ? parsed.documents : defaultDocuments;
  } catch {
    return defaultDocuments;
  }
}

export function saveDocuments(documents: DemoDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ documents }));
}

export function resetDocuments() {
  localStorage.removeItem(STORAGE_KEY);
}
