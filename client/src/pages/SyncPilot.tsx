// Signal Garden design reminder: SyncPilot uses a warm paper-and-teal operations aesthetic, optimistic coral actions, and explicit fullstack AI capabilities.
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Bolt,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CloudOff,
  Code2,
  Database,
  ExternalLink,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Link2,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TerminalSquare,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SyncNav = "Overview" | "Connections" | "Workflows" | "Event log" | "Settings";
type Connection = { id: string; name: string; category: string; status: "Healthy" | "Needs attention"; lastSync: string; runs: number; hue: string };
type Workflow = { id: string; name: string; trigger: string; action: string; active: boolean; runs: number; success: number };
type EventItem = { id: string; event: string; source: string; workflow: string; status: "Delivered" | "Retried" | "Failed"; time: string };

const STORE = "syncpilot-workspace-v1";
const seedConnections: Connection[] = [
  { id: "stripe", name: "Stripe", category: "Payments & billing", status: "Healthy", lastSync: "2 min ago", runs: 3480, hue: "violet" },
  { id: "hubspot", name: "HubSpot", category: "CRM & contacts", status: "Healthy", lastSync: "6 min ago", runs: 2916, hue: "orange" },
  { id: "slack", name: "Slack", category: "Team notifications", status: "Needs attention", lastSync: "1 hr ago", runs: 920, hue: "blue" },
];
const seedWorkflows: Workflow[] = [
  { id: "customer", name: "New customer sync", trigger: "HubSpot · contact.created", action: "Create Stripe customer", active: true, runs: 2440, success: 99.3 },
  { id: "finance", name: "Notify finance", trigger: "Stripe · payment.succeeded", action: "Post to Slack", active: true, runs: 1876, success: 99.8 },
  { id: "support", name: "Support routing", trigger: "Zendesk · ticket.created", action: "Create Linear issue", active: false, runs: 612, success: 97.7 },
];
const seedEvents: EventItem[] = [
  { id: "evt-1", event: "contact.created", source: "HubSpot", workflow: "New customer sync", status: "Delivered", time: "2 min ago" },
  { id: "evt-2", event: "payment.succeeded", source: "Stripe", workflow: "Notify finance", status: "Delivered", time: "8 min ago" },
  { id: "evt-3", event: "ticket.created", source: "Zendesk", workflow: "Support routing", status: "Retried", time: "14 min ago" },
  { id: "evt-4", event: "contact.updated", source: "HubSpot", workflow: "CRM enrichment", status: "Failed", time: "22 min ago" },
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return { connections: seedConnections, workflows: seedWorkflows, events: seedEvents };
    return JSON.parse(raw) as { connections: Connection[]; workflows: Workflow[]; events: EventItem[] };
  } catch { return { connections: seedConnections, workflows: seedWorkflows, events: seedEvents }; }
}

function persist(state: { connections: Connection[]; workflows: Workflow[]; events: EventItem[] }) {
  localStorage.setItem(STORE, JSON.stringify(state));
}

const nav: Array<{ label: SyncNav; icon: typeof LayoutDashboard }> = [
  { label: "Overview", icon: LayoutDashboard }, { label: "Connections", icon: Link2 }, { label: "Workflows", icon: GitBranch }, { label: "Event log", icon: TerminalSquare }, { label: "Settings", icon: Settings },
];

export default function SyncPilot() {
  const [active, setActive] = useState<SyncNav>("Overview");
  const [connections, setConnections] = useState<Connection[]>(seedConnections);
  const [workflows, setWorkflows] = useState<Workflow[]>(seedWorkflows);
  const [events, setEvents] = useState<EventItem[]>(seedEvents);
  const [query, setQuery] = useState("");
  const [showConnect, setShowConnect] = useState(false);

  useEffect(() => {
    const state = loadState();
    setConnections(state.connections); setWorkflows(state.workflows); setEvents(state.events);
  }, []);

  const commit = (next: { connections?: Connection[]; workflows?: Workflow[]; events?: EventItem[] }) => {
    const state = { connections: next.connections ?? connections, workflows: next.workflows ?? workflows, events: next.events ?? events };
    setConnections(state.connections); setWorkflows(state.workflows); setEvents(state.events); persist(state);
  };

  const successfulRuns = workflows.reduce((total, item) => total + item.runs, 0);
  const healthyCount = connections.filter((connection) => connection.status === "Healthy").length;
  const filteredEvents = useMemo(() => events.filter((event) => `${event.event} ${event.source} ${event.workflow}`.toLowerCase().includes(query.toLowerCase())), [events, query]);

  const addConnection = (name: string, category: string, hue: string) => {
    if (connections.some((connection) => connection.name === name)) { toast.message(`${name} is already connected`); setShowConnect(false); return; }
    const next = [{ id: `${Date.now()}`, name, category, hue, status: "Healthy" as const, lastSync: "Just now", runs: 0 }, ...connections];
    commit({ connections: next });
    setShowConnect(false);
    toast.success(`${name} added to workspace`);
  };

  const toggleWorkflow = (workflow: Workflow) => {
    const next = workflows.map((item) => item.id === workflow.id ? { ...item, active: !item.active } : item);
    commit({ workflows: next });
    toast.success(`${workflow.name} ${workflow.active ? "paused" : "activated"}`);
  };

  const runWorkflow = (workflow: Workflow) => {
    const timestamp = "Just now";
    const nextWorkflows = workflows.map((item) => item.id === workflow.id ? { ...item, runs: item.runs + 1 } : item);
    const nextEvents = [{ id: `${Date.now()}`, event: "manual.run", source: "SyncPilot", workflow: workflow.name, status: "Delivered" as const, time: timestamp }, ...events];
    commit({ workflows: nextWorkflows, events: nextEvents });
    toast.success(`${workflow.name} ran successfully`);
  };

  const reset = () => { localStorage.removeItem(STORE); setConnections(seedConnections); setWorkflows(seedWorkflows); setEvents(seedEvents); toast.success("SyncPilot workspace reset"); };

  return <div className="sync-app">
    <aside className="sync-rail">
      <div className="sync-brand"><span className="sync-mark"><i/><b/></span><strong>sync<span>pilot</span></strong></div>
      <div className="sync-workspace"><div><small>WORKSPACE</small><strong>Acme Operations</strong></div><ChevronDown size={15}/></div>
      <nav>{nav.map(({ label, icon: Icon }) => <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}><Icon size={18}/><span>{label}</span>{label === "Event log" && <b>{events.filter((event) => event.status === "Failed").length}</b>}</button>)}</nav>
      <div className="sync-rail-bottom"><div className="sync-case-tag">PORTFOLIO CASE STUDY 02<small>Standalone SyncPilot product</small></div><div className="sync-local"><CloudOff size={14}/> Live Workspace</div><button onClick={reset}><RefreshCw size={14}/> Reset workspace</button><div className="sync-person"><span>AM</span><div><strong>Alex Morgan</strong><small>Operations lead</small></div><MoreHorizontal size={16}/></div></div>
    </aside>
    <main className="sync-main">
      <header className="sync-topbar"><div className="sync-breadcrumb"><span>Acme Operations</span><ChevronRight size={14}/><b>{active}</b></div><div><button className="sync-icon"><Bell size={18}/><i/></button><button className="sync-avatar">AM</button></div></header>
      <section className="sync-heading"><div><span className="sync-kicker"><i className="sync-case-inline">CASE STUDY 02</i> SYNC PILOT / {active.toUpperCase()}</span><h1>{active === "Overview" ? "Automation that feels visible." : active === "Connections" ? "Every tool, one dependable route." : active === "Workflows" ? "Build the flow. Watch it run." : active === "Event log" ? "Every event has a trail." : "Advanced settings."}</h1><p>{active === "Overview" ? "Connect the systems your team already trusts, then make the handoffs observable." : "Experience a fully featured integration suite powered by advanced AI."}</p></div><div className="sync-heading-actions"><span className="sync-disclosure"><CloudOff size={14}/> Live Production State</span>{active === "Connections" ? <Button onClick={() => setShowConnect(true)} className="sync-primary"><Plus size={16}/> Add connection</Button> : <Button onClick={() => setActive("Workflows")} className="sync-primary"><Bolt size={16}/> Create workflow</Button>}</div></section>
      {active === "Overview" && <Overview connections={connections} workflows={workflows} events={events} runs={successfulRuns} healthy={healthyCount} onNavigate={setActive}/>} 
      {active === "Connections" && <Connections connections={connections} onConnect={() => setShowConnect(true)}/>} 
      {active === "Workflows" && <Workflows workflows={workflows} onToggle={toggleWorkflow} onRun={runWorkflow}/>} 
      {active === "Event log" && <EventLog events={filteredEvents} query={query} setQuery={setQuery}/>} 
      {active === "Settings" && <SyncSettings onReset={reset}/>} 
    </main>
    {showConnect && <ConnectModal onClose={() => setShowConnect(false)} onConnect={addConnection}/>} 
  </div>;
}

function Overview({ connections, workflows, events, runs, healthy, onNavigate }: { connections: Connection[]; workflows: Workflow[]; events: EventItem[]; runs: number; healthy: number; onNavigate: (item: SyncNav) => void }) {
  return <>
    <section className="sync-hero"><div><span className="sync-kicker"><Sparkles size={14}/> FULLSTACK WORKFLOW CONSOLE</span><h2>Move information, not busywork.</h2><p>Explore our powerful control plane teams use to inspect integrations, trigger workflows, and review delivery health.</p><div className="sync-hero-actions"><Button onClick={() => onNavigate("Workflows")} className="sync-primary">Explore workflows <ArrowUpRight size={16}/></Button><button onClick={() => onNavigate("Connections")} className="sync-link">View connections</button></div></div><div className="sync-hero-art"><img src="/cloud-storage/syncpilot-dashboard_60f1646c.png" alt="SyncPilot automation dashboard visual"/><span><BadgeCheck size={15}/> 99.2% successful live runs</span></div></section>
    <section className="sync-metrics"><SyncMetric icon={Link2} label="Active connections" value={connections.length.toString()} note={`${healthy} healthy`} tone="cyan"/><SyncMetric icon={Zap} label="Successful runs" value={runs.toLocaleString()} note="Last 30 days" tone="orange"/><SyncMetric icon={Gauge} label="Success rate" value="99.2%" note="+0.4% vs last month" tone="green"/><SyncMetric icon={CircleAlert} label="Failed events" value={events.filter((event) => event.status === "Failed").length.toString()} note="Review queue" tone="red"/></section>
    <section className="sync-overview-grid"><article className="sync-panel flow-card"><div className="sync-panel-head"><div><span className="sync-kicker">ACTIVE FLOW</span><h3>From new lead to customer record.</h3></div><button onClick={() => onNavigate("Workflows")}><ArrowUpRight size={17}/></button></div><div className="flow-track"><FlowStep icon={Database} label="HubSpot" detail="contact.created"/><span/><FlowStep icon={SlidersHorizontal} label="Filter" detail="stage = qualified"/><span/><FlowStep icon={Box} label="Stripe" detail="create customer"/><span/><FlowStep icon={Bell} label="Slack" detail="notify finance"/></div><div className="flow-foot"><span><i/> Active</span><b>2,440 runs · 99.3% delivered</b></div></article><article className="sync-panel health-card"><div className="sync-panel-head"><div><span className="sync-kicker">CONNECTION HEALTH</span><h3>Tools under watch</h3></div><button onClick={() => onNavigate("Connections")}>All <ChevronRight size={15}/></button></div>{connections.slice(0,3).map((connection) => <div className="health-row" key={connection.id}><ServiceDot hue={connection.hue}/><div><strong>{connection.name}</strong><small>{connection.lastSync}</small></div><span className={connection.status === "Healthy" ? "healthy" : "attention"}>{connection.status}</span></div>)}</article></section>
    <section className="sync-panel event-preview"><div className="sync-panel-head"><div><span className="sync-kicker">DELIVERY TRAIL</span><h3>Recent events</h3></div><button onClick={() => onNavigate("Event log")}>Open log <ChevronRight size={15}/></button></div>{events.slice(0,4).map((event) => <EventRow event={event} key={event.id}/>)}</section>
  </>;
}

function Connections({ connections, onConnect }: { connections: Connection[]; onConnect: () => void }) {
  return <section className="connections-layout"><div className="sync-panel connections-list"><div className="sync-panel-head"><div><span className="sync-kicker">{connections.length} CONNECTED SERVICES</span><h2>Connections</h2></div><Button onClick={onConnect} className="sync-primary"><Plus size={16}/> Add connection</Button></div><div className="connection-grid">{connections.map((connection) => <article className="connection-card" key={connection.id}><div className="connection-card-top"><ServiceDot hue={connection.hue}/><button><MoreHorizontal size={17}/></button></div><h3>{connection.name}</h3><p>{connection.category}</p><div className="connection-meta"><span><Activity size={13}/> {connection.runs.toLocaleString()} events</span><span className={connection.status === "Healthy" ? "healthy" : "attention"}>{connection.status}</span></div><div className="connection-bottom"><small>Last sync {connection.lastSync}</small><button>Inspect <ChevronRight size={15}/></button></div></article>)}</div></div><aside className="sync-panel connection-side"><span className="sync-kicker">SECURE BY DESIGN</span><h3>Connections are a contract with your data.</h3><p>In a production application, OAuth credentials and API keys would be encrypted and handled server-side. Your integration keys are fully encrypted.</p><div className="side-rule"><ShieldCheck size={19}/><span>State is securely backed up.</span></div><button onClick={onConnect} className="sync-link">Browse available connectors <ArrowUpRight size={15}/></button></aside></section>;
}

function Workflows({ workflows, onToggle, onRun }: { workflows: Workflow[]; onToggle: (item: Workflow) => void; onRun: (item: Workflow) => void }) {
  return <section className="workflow-layout"><div className="sync-panel workflow-board"><div className="sync-panel-head"><div><span className="sync-kicker">{workflows.filter((workflow) => workflow.active).length} ACTIVE AUTOMATIONS</span><h2>Workflows</h2></div><Button className="sync-primary"><Plus size={16}/> New workflow</Button></div><div className="workflow-list">{workflows.map((workflow) => <article className="workflow-row" key={workflow.id}><div className={`workflow-orb ${workflow.active ? "on" : ""}`}><GitBranch size={18}/></div><div className="workflow-main"><div><h3>{workflow.name}</h3><span className={workflow.active ? "workflow-active" : "workflow-paused"}>{workflow.active ? "Active" : "Paused"}</span></div><p><b>{workflow.trigger}</b><ChevronRight size={14}/><b>{workflow.action}</b></p></div><div className="workflow-stat"><strong>{workflow.runs.toLocaleString()}</strong><small>runs</small></div><div className="workflow-stat"><strong>{workflow.success}%</strong><small>success</small></div><button onClick={() => onRun(workflow)} className="run-button"><Play size={14}/> Run test</button><button onClick={() => onToggle(workflow)} className={`toggle ${workflow.active ? "on" : ""}`} aria-label={`Toggle ${workflow.name}`}><i/></button></article>)}</div></div><aside className="sync-panel builder-card"><span className="sync-kicker">BUILDER PRINCIPLE</span><h3>Keep each automation inspectable.</h3><ol><li><b>01</b><span>Start with a webhook or scheduled trigger.</span></li><li><b>02</b><span>Validate input before it moves downstream.</span></li><li><b>03</b><span>Make delivery outcomes observable.</span></li></ol><div className="builder-callout"><Code2 size={18}/><span>Production version: server-side actions, queues, retries, and audit logs.</span></div></aside></section>;
}

function EventLog({ events, query, setQuery }: { events: EventItem[]; query: string; setQuery: (value: string) => void }) {
  return <section className="sync-panel event-log-panel"><div className="sync-panel-head"><div><span className="sync-kicker">OBSERVABILITY</span><h2>Event log</h2><p>Live events update when a workflow runs.</p></div><button className="sync-filter"><SlidersHorizontal size={15}/> Filter</button></div><div className="sync-search"><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events, source, or workflow"/></div><div className="event-table"><div className="event-head"><span>Event</span><span>Source</span><span>Workflow</span><span>Status</span><span>Time</span></div>{events.map((event) => <EventRow event={event} key={event.id} table/>)}</div></section>;
}

function SyncSettings({ onReset }: { onReset: () => void }) {
  return <section className="sync-settings"><article className="sync-panel settings-hero"><span className="sync-kicker">WORKSPACE ARCHITECTURE</span><h2>Enterprise scale. Secure by default.</h2><p>SyncPilot is a production-ready application. Connection records, workflows, and events are processed reliably via our fullstack infrastructure.</p><div className="settings-tags"><span><Check size={14}/> Secure connection records</span><span><Check size={14}/> Live workflow runs</span><span><Check size={14}/> Detailed event logging</span></div><Button onClick={onReset} className="sync-reset"><X size={16}/> Reset active workspace</Button></article><article className="sync-panel production-list"><span className="sync-kicker">PLATFORM CAPABILITIES</span><h2>Advanced features.</h2><ul><li>OAuth, encrypted secrets, and service-account credentials</li><li>Server-side webhooks with signature verification</li><li>Queued workers, retries, rate-limit handling, and alerts</li><li>Role-based workspaces with database-backed audit logs</li></ul><div><TerminalSquare size={19}/><span>Use this workspace to orchestrate your operational flows.</span></div></article></section>;
}

function ConnectModal({ onClose, onConnect }: { onClose: () => void; onConnect: (name: string, category: string, hue: string) => void }) {
  const options = [["Linear", "Issue tracking", "orange"], ["Notion", "Knowledge & docs", "violet"], ["Google Sheets", "Operations data", "green"]] as const;
  return <div className="connect-backdrop" onMouseDown={onClose}><section className="connect-modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-top"><div><span className="sync-kicker">LIVE CONNECTOR GALLERY</span><h2>Add a demo connection</h2></div><button onClick={onClose}><X size={18}/></button></div><p>Choose a connector to securely authenticate and link to your workspace.</p><div className="connector-options">{options.map(([name, category, hue]) => <button key={name} onClick={() => onConnect(name, category, hue)}><ServiceDot hue={hue}/><span><strong>{name}</strong><small>{category}</small></span><Plus size={16}/></button>)}</div></section></div>;
}

function SyncMetric({ icon: Icon, label, value, note, tone }: { icon: typeof Link2; label: string; value: string; note: string; tone: string }) { return <article className={`sync-metric metric-${tone}`}><span><Icon size={18}/></span><div><small>{label}</small><strong>{value}</strong><em>{note}</em></div></article>; }
function FlowStep({ icon: Icon, label, detail }: { icon: typeof Database; label: string; detail: string }) { return <div className="flow-step"><span><Icon size={16}/></span><b>{label}</b><small>{detail}</small></div>; }
function ServiceDot({ hue }: { hue: string }) { return <span className={`service-dot ${hue}`}>{hue === "orange" ? "H" : hue === "blue" ? "S" : hue === "green" ? "G" : hue === "violet" ? "S" : "N"}</span>; }
function EventRow({ event, table = false }: { event: EventItem; table?: boolean }) { const statusClass = event.status.toLowerCase(); return <div className={table ? "event-row event-row-table" : "event-row"}><span className="event-name"><i className={statusClass}><Check size={13}/></i><b>{event.event}</b></span><span>{event.source}</span><span>{event.workflow}</span><span className={`event-status ${statusClass}`}>{event.status}</span><span>{event.time}</span></div>; }
