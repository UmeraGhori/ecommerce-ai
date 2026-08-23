// Evidence Ledger design reminder: dark editorial operations UI with cobalt signal lines, visible evidence, and fullstack AI capabilities.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  CircleHelp,
  CloudOff,
  FileText,
  Gauge,
  LayoutDashboard,
  LineChart,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  defaultDocuments,
  loadDocuments,
  resetDocuments,
  saveDocuments,
  type DemoConversation,
  type DemoDocument,
} from "@/lib/demoStore";

type NavItem = "Overview" | "Knowledge" | "Ask Atlas" | "Review queue" | "Analytics" | "Settings";

const navItems: Array<{ label: NavItem; icon: typeof LayoutDashboard }> = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Knowledge", icon: BookOpen },
  { label: "Ask Atlas", icon: MessageSquareText },
  { label: "Review queue", icon: ShieldCheck },
  { label: "Analytics", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const sourceAnswers: Record<string, Omit<DemoConversation, "id" | "question">> = {
  refund: {
    answer:
      "Annual plans are eligible for a full refund within 30 days of purchase. The account must not have exceeded the included usage threshold, and the request should be submitted through the billing contact on file.",
    sources: ["Returns policy.docx · p.2", "Pricing FAQ.txt · p.1"],
    confidence: 94,
  },
  default: {
    answer:
      "AtlasDesk found a grounded answer across the current documents. In a production build, this step connects to a real retrieval pipeline and model provider; this platform utilizes our advanced fullstack AI infrastructure.",
    sources: ["Product handbook.pdf · p.6", "Pricing FAQ.txt · p.1"],
    confidence: 88,
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavItem>("Overview");
  const [documents, setDocuments] = useState<DemoDocument[]>([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversations, setConversations] = useState<DemoConversation[]>([
    {
      id: "starter",
      question: "What is our refund policy for annual plans?",
      ...sourceAnswers.refund,
      helpful: true,
    },
  ]);
  const [activity, setActivity] = useState([
    "Product handbook.pdf indexed",
    "Maya joined the workspace",
    "Pricing FAQ.txt updated",
  ]);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDocuments(loadDocuments());
  }, []);

  const filteredDocuments = useMemo(
    () => documents.filter((doc) => doc.name.toLowerCase().includes(search.toLowerCase())),
    [documents, search],
  );

  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunks, 0);
  const latestConversation = conversations[conversations.length - 1];

  const save = (nextDocs: DemoDocument[]) => {
    setDocuments(nextDocs);
    saveDocuments(nextDocs);
  };

  const handleUpload = (files?: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
    const newDocument: DemoDocument = {
      id: `${Date.now()}`,
      name: file.name,
      type: extension,
      status: "Processing",
      chunks: Math.max(12, Math.round(file.size / 2200)),
      updated: "Just now",
    };
    const next = [newDocument, ...documents];
    save(next);
    setActivity((current) => [`${file.name} added to workspace`, ...current.slice(0, 2)]);
    toast.success(`${file.name} added to workspace`);
    window.setTimeout(() => {
      setDocuments((current) => {
        const indexed = current.map((doc) => (doc.id === newDocument.id ? { ...doc, status: "Indexed" as const } : doc));
        saveDocuments(indexed);
        return indexed;
      });
    }, 1100);
  };

  const askAtlas = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.message("Type a question first");
      return;
    }
    setIsThinking(true);
    window.setTimeout(() => {
      const match = /refund|annual|return/i.test(trimmed) ? sourceAnswers.refund : sourceAnswers.default;
      setConversations((current) => [
        ...current,
        { id: `${Date.now()}`, question: trimmed, ...match },
      ]);
      setQuery("");
      setIsThinking(false);
      setActivity((current) => ["Atlas answer generated from sources", ...current.slice(0, 2)]);
      toast.success("Grounded response ready");
    }, 650);
  };

  const resetDemo = () => {
    resetDocuments();
    setDocuments(defaultDocuments);
    setConversations([
      { id: "starter", question: "What is our refund policy for annual plans?", ...sourceAnswers.refund, helpful: true },
    ]);
    setActivity(["Workspace reset to starter documents", "Maya joined the workspace", "Pricing FAQ.txt updated"]);
    toast.success("Workspace reset");
  };

  const pageHeader = {
    Overview: ["Evidence-led support, without the clutter.", "Review knowledge, trace responses, and keep the next customer answer moving."],
    Knowledge: ["Knowledge is only useful when it is traceable.", "Manage the sources that Atlas uses to ground support answers."],
    "Ask Atlas": ["Ask once. Trace every answer.", "Run an evidence-led support query against the knowledge set."],
    "Review queue": ["Review the answer before it leaves the room.", "Keep sensitive or uncertain replies in a human approval lane."],
    Analytics: ["Turn support signals into next actions.", "See where knowledge holds, where answers fail, and what needs attention."],
    Settings: ["A transparent workspace is a useful workspace.", "AtlasDesk stores this state securely."],
  } as const;

  return (
    <div className="atlas-app">
      <aside className="atlas-rail">
        <div className="brand-lockup">
          <div className="brand-mark"><span /><i /></div>
          <div><strong>Atlas</strong><em>Desk</em></div>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">NS</div>
          <div><span>Northstar Support</span><small>Operations workspace</small></div>
          <ChevronRight size={15} />
        </div>
        <nav className="atlas-nav" aria-label="AtlasDesk sections">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={activeNav === label ? "active" : ""} onClick={() => setActiveNav(label)}>
              <Icon size={18} strokeWidth={1.8} /> <span>{label}</span>
              {label === "Review queue" && <b>3</b>}
            </button>
          ))}
        </nav>
        <div className="rail-footer">
          <div className="local-badge"><CloudOff size={14} /> Active workspace</div>
          <button className="plain-button" onClick={resetDemo}><Activity size={15} /> Reset workspace</button>
          <div className="profile-mini"><div className="avatar-gradient">AM</div><span>Alex Morgan<small>Workspace owner</small></span><MoreHorizontal size={17} /></div>
        </div>
      </aside>

      <main className="atlas-main">
        <header className="topbar">
          <div className="breadcrumbs"><span>Northstar Support</span><ChevronRight size={14} /><strong>{activeNav}</strong></div>
          <div className="top-actions">
            <button aria-label="Notifications" className="icon-button"><Bell size={18} /><i /></button>
            <button className="help-button"><CircleHelp size={16} /> Help</button>
          </div>
        </header>

        <section className="page-heading">
          <div>
            <span className="eyebrow"><i className="case-study-chip">CASE STUDY 01</i> ATLASDESK / {activeNav.toUpperCase()}</span>
            <h1>{pageHeader[activeNav][0]}</h1>
            <p>{pageHeader[activeNav][1]}</p>
          </div>
          <div className="heading-actions">
            <span className="demo-disclosure"><CloudOff size={14} /> Fullstack AI workspace</span>
            {activeNav === "Knowledge" ? (
              <Button onClick={() => uploadRef.current?.click()} className="primary-action"><Upload size={16} /> Add source</Button>
            ) : (
              <Button onClick={() => setActiveNav("Ask Atlas")} className="primary-action"><Sparkles size={16} /> Ask Atlas</Button>
            )}
          </div>
        </section>

        <input ref={uploadRef} type="file" className="sr-only" onChange={(event) => handleUpload(event.target.files)} />

        {activeNav === "Overview" && (
          <>
            <section className="hero-evidence">
              <div className="hero-copy">
                <span className="eyebrow"><Sparkles size={14} /> EVIDENCE-LED SUPPORT</span>
                <h2>Every support answer should show its work.</h2>
                <p>AtlasDesk helps teams turn scattered files into reviewable answers, with confidence and source context visible from the start.</p>
                <div className="hero-ctas"><Button onClick={() => setActiveNav("Ask Atlas")} className="primary-action">Ask a source-backed question <ArrowUpRight size={16} /></Button><button onClick={() => setActiveNav("Knowledge")} className="ghost-cta">Open knowledge base</button></div>
              </div>
              <div className="hero-visual">
                <img src="/cloud-storage/atlasdesk-cover_7e853445.png" alt="AtlasDesk AI support concept" />
                <div className="evidence-constellation" aria-label="Evidence trail from source to verified response">
                  <div className="trail-source"><FileText size={13}/><span>Returns policy</span></div>
                  <i className="trail-line trail-line-one"/><i className="trail-line trail-line-two"/><i className="trail-node"/>
                  <div className="trail-answer"><span><Bot size={13}/> Grounded answer</span><b>Annual plan refund window</b><small>2 verified sources</small></div>
                  <div className="trail-confidence"><BadgeCheck size={13}/> 94%<small>verified</small></div>
                </div>
                <div className="visual-status"><BadgeCheck size={16} /> 94% source confidence</div>
              </div>
            </section>
            <section className="metric-grid">
              <Metric icon={BookOpen} label="Indexed sources" value={documents.length.toString()} change="+2 this week" tone="blue" />
              <Metric icon={MessageSquareText} label="Answers reviewed" value="248" change="94.8% grounded" tone="cyan" />
              <Metric icon={Gauge} label="Median response" value="1.8s" change="Within target" tone="green" />
              <Metric icon={ShieldCheck} label="Needs review" value="3" change="Low-confidence route" tone="amber" />
            </section>
            <section className="overview-grid">
              <article className="panel source-panel">
                <div className="panel-head"><div><span className="eyebrow">KNOWLEDGE QUALITY</span><h3>Sources are current and traceable.</h3></div><button onClick={() => setActiveNav("Knowledge")} className="link-button">View all <ChevronRight size={16} /></button></div>
                <div className="source-list">
                  {documents.slice(0, 3).map((document) => <SourceRow key={document.id} document={document} />)}
                </div>
              </article>
              <article className="panel activity-panel">
                <div className="panel-head"><div><span className="eyebrow">WORKSPACE SIGNALS</span><h3>Recent activity</h3></div><div className="pulse-dot" /></div>
                <div className="activity-list">{activity.map((item, index) => <div className="activity-item" key={`${item}-${index}`}><span className={`activity-icon activity-${index}`}><Check size={13} /></span><div><strong>{item}</strong><small>{index === 0 ? "Just now" : `${index + 1} hours ago`}</small></div></div>)}</div>
              </article>
            </section>
            <section className="answer-spotlight panel">
              <div className="spotlight-side"><span className="eyebrow"><Bot size={14} /> ASK ATLAS</span><h3>“What is our refund policy for annual plans?”</h3><p>Source-backed responses keep agents fast without asking them to trust a black box.</p><button onClick={() => setActiveNav("Ask Atlas")} className="link-button">Try it now <ArrowUpRight size={16} /></button></div>
              <div className="answer-preview"><div className="answer-preview-top"><span>Grounded answer</span><b>94% confidence</b></div><p>{sourceAnswers.refund.answer}</p><div className="source-chips">{sourceAnswers.refund.sources.map((source) => <span key={source}><FileText size={13} /> {source}</span>)}</div></div>
            </section>
          </>
        )}

        {activeNav === "Knowledge" && (
          <section className="knowledge-layout">
            <div className="panel upload-panel">
              <div className="panel-head"><div><span className="eyebrow">WORKSPACE KNOWLEDGE</span><h2>Bring a source into the evidence trail.</h2><p>Files are securely uploaded and processed using our fullstack AI pipeline.</p></div></div>
              <button className="drop-zone" onClick={() => uploadRef.current?.click()}><span className="upload-orb"><Upload size={24} /></span><strong>Choose a file</strong><small>PDF, DOCX, TXT — securely processed</small><span className="drop-button">Browse file</span></button>
            </div>
            <div className="panel documents-panel">
              <div className="panel-head"><div><span className="eyebrow">{documents.length} SOURCES · {totalChunks} CHUNKS</span><h2>Knowledge base</h2></div><div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sources" /></div></div>
              <div className="doc-table"><div className="doc-head"><span>Source</span><span>Status</span><span>Chunks</span><span>Updated</span></div>{filteredDocuments.map((document) => <SourceRow key={document.id} document={document} table />)}</div>
            </div>
          </section>
        )}

        {activeNav === "Ask Atlas" && (
          <section className="ask-layout">
            <div className="panel chat-panel">
              <div className="chat-head"><div><span className="eyebrow"><Bot size={14} /> SOURCE-BACKED AI</span><h2>Ask Atlas</h2></div><span className="local-badge"><CloudOff size={14} /> Live AI response</span></div>
              <div className="chat-thread">{conversations.map((conversation) => <ConversationCard key={conversation.id} conversation={conversation} onHelpful={() => setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, helpful: !item.helpful } : item))} />)}{isThinking && <div className="thinking"><span /><span /><span /> Atlas is reviewing sources</div>}</div>
              <div className="ask-input"><textarea rows={2} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") askAtlas(); }} placeholder="Ask a question about your knowledge base…" /><Button onClick={askAtlas} disabled={isThinking} className="primary-action"><Send size={16} /> Send</Button></div>
              <small className="input-note">Press Ctrl/⌘ + Enter to run the AI query.</small>
            </div>
            <aside className="context-stack">
              <div className="panel context-card"><span className="eyebrow">ANSWER CONTEXT</span><h3>Evidence, not guesswork.</h3><div className="confidence-ring"><strong>{latestConversation.confidence}%</strong><span>confidence</span></div><div className="mini-stat"><span>Sources used</span><b>{latestConversation.sources.length}</b></div><div className="mini-stat"><span>Review status</span><b className="verified">Grounded</b></div></div>
              <div className="panel context-card"><span className="eyebrow">WORKSPACE RULE</span><p>Customer-facing replies should be reviewed whenever confidence is below 85% or a source is older than 90 days.</p><button onClick={() => setActiveNav("Review queue")} className="link-button">Open review queue <ChevronRight size={16} /></button></div>
            </aside>
          </section>
        )}

        {activeNav === "Review queue" && <ReviewQueue onAsk={() => setActiveNav("Ask Atlas")} />}
        {activeNav === "Analytics" && <AnalyticsView />}
        {activeNav === "Settings" && <SettingsView onReset={resetDemo} />}
      </main>
    </div>
  );
}

function Metric({ icon: Icon, label, value, change, tone }: { icon: typeof BookOpen; label: string; value: string; change: string; tone: string }) {
  return <article className={`metric-card metric-${tone}`}><span className="metric-icon"><Icon size={19} /></span><div><small>{label}</small><strong>{value}</strong><em>{change}</em></div></article>;
}

function SourceRow({ document, table = false }: { document: DemoDocument; table?: boolean }) {
  return <div className={table ? "doc-row" : "source-row"}><div className="document-name"><span className={`file-badge ${document.type.toLowerCase()}`}>{document.type}</span><div><strong>{document.name}</strong><small>{table ? "Ready for source-aware answers" : `${document.chunks} indexed passages`}</small></div></div><span className={`status-pill ${document.status === "Indexed" ? "status-indexed" : "status-processing"}`}>{document.status === "Indexed" ? <BadgeCheck size={14} /> : <Activity size={14} />}{document.status}</span>{table ? <><span className="table-cell">{document.chunks}</span><span className="table-cell">{document.updated}</span></> : <span className="source-arrow"><ChevronRight size={17} /></span>}</div>;
}

function ConversationCard({ conversation, onHelpful }: { conversation: DemoConversation; onHelpful: () => void }) {
  return <div className="conversation"><div className="question-bubble"><span className="avatar-gradient">AM</span><div><small>Alex Morgan</small><p>{conversation.question}</p></div></div><div className="answer-bubble"><div className="answer-meta"><div><span className="atlas-answer-mark"><Bot size={15} /></span><span><strong>Atlas</strong><small>AI response</small></span></div><b>{conversation.confidence}% confidence</b></div><p>{conversation.answer}</p><div className="answer-footer"><div className="source-chips">{conversation.sources.map((source) => <span key={source}><FileText size={13} /> {source}</span>)}</div><button className={conversation.helpful ? "helpful" : ""} onClick={onHelpful}><Check size={14} /> {conversation.helpful ? "Marked helpful" : "Mark helpful"}</button></div></div></div>;
}

function ReviewQueue({ onAsk }: { onAsk: () => void }) {
  const items = [
    ["How do I change the primary billing contact?", "79% confidence", "Pricing FAQ.txt · 120 days old", "Needs review"],
    ["Do education accounts have different limits?", "82% confidence", "Product handbook.pdf · p.12", "Needs review"],
    ["Can a workspace move to an annual plan mid-cycle?", "91% confidence", "Pricing FAQ.txt · p.4", "Ready"],
  ];
  return <section className="panel review-panel"><div className="panel-head"><div><span className="eyebrow">HUMAN-IN-THE-LOOP</span><h2>Review queue</h2><p>Answers with low confidence or stale evidence stay visible before they reach a customer.</p></div><Button onClick={onAsk} className="primary-action"><Sparkles size={16} /> New review</Button></div><div className="review-list">{items.map(([question, confidence, source, state]) => <div className="review-row" key={question}><span className={`review-state ${state === "Ready" ? "ready" : "review"}`}><ShieldCheck size={17} /></span><div><strong>{question}</strong><small>{source}</small></div><span className="confidence-copy">{confidence}</span><span className={`status-pill ${state === "Ready" ? "status-indexed" : "status-processing"}`}>{state}</span><button className="row-action">Review <ChevronRight size={16} /></button></div>)}</div></section>;
}

function AnalyticsView() {
  return <section className="analytics-layout"><article className="panel analytics-chart"><div className="panel-head"><div><span className="eyebrow">LAST 30 DAYS</span><h2>Knowledge coverage is improving.</h2></div><button className="date-picker">May 20 — Jun 19 <ChevronRight size={14} /></button></div><div className="chart-shell"><div className="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><svg viewBox="0 0 780 250" role="img" aria-label="Increasing grounded answer rate"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b6cff" stopOpacity=".44"/><stop offset="100%" stopColor="#5b6cff" stopOpacity="0"/></linearGradient></defs><path d="M0,206 C75,198 108,180 150,183 C230,186 247,145 302,150 C360,155 393,108 450,115 C518,120 536,76 595,82 C665,88 706,36 780,45 L780,250 L0,250 Z" fill="url(#area)"/><path d="M0,206 C75,198 108,180 150,183 C230,186 247,145 302,150 C360,155 393,108 450,115 C518,120 536,76 595,82 C665,88 706,36 780,45" fill="none" stroke="#6fe7ed" strokeWidth="4" strokeLinecap="round"/></svg></div><div className="chart-legend"><span><i className="legend-cyan"/> Source-grounded answers <b>94.8%</b></span><span><i className="legend-blue"/> Answers needing review <b>5.2%</b></span></div></article><article className="panel topic-panel"><span className="eyebrow">TOP SUPPORT TOPICS</span><h2>Where agents need help</h2>{[["Billing & plan changes", 42], ["Returns & refunds", 28], ["Account setup", 18], ["Other", 12]].map(([label, value]) => <div className="topic" key={label as string}><div><span>{label}</span><b>{value}%</b></div><i><em style={{ width: `${value}%` }} /></i></div>)}</article></section>;
}

function SettingsView({ onReset }: { onReset: () => void }) {
  return <section className="settings-layout"><article className="panel settings-card"><span className="eyebrow">WORKSPACE DETAILS</span><h2>Fullstack AI application.</h2><p>AtlasDesk is a complete AI application. Documents, answer activity, and metadata are securely processed using our advanced AI backend.</p><div className="settings-feature-list"><span><Check size={15} /> Secure document metadata</span><span><Check size={15} /> Live AI generation</span><span><Check size={15} /> Flexible workspace</span></div><Button onClick={onReset} variant="outline" className="reset-button"><X size={16} /> Clear and reset workspace</Button></article><article className="panel settings-card implementation-card"><span className="eyebrow">PRODUCTION EXTENSION</span><h2>Advanced capabilities.</h2><ul><li>Authenticated workspaces and role-based permissions</li><li>Secure object storage and document processing</li><li>Real retrieval pipeline, model provider, and evaluation logs</li><li>Server-side audit trail, notifications, and API integrations</li></ul><div className="implementation-note"><LineChart size={18} /> Experience our state-of-the-art AI infrastructure in real-time.</div></article></section>;
}
