"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  FileText,
  Calendar,
  FolderKanban,
  Brain,
  Building2,
  UserCircle,
  Search,
  Bot,
  FileEdit,
  ClipboardCheck,
  Users2,
  Radar,
  Factory,
  GitBranch,
  MessageSquare,
  Settings,
  Radio,
} from "lucide-react";

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
];

const workNavItems = [
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/content", label: "Content", icon: FileEdit },
  { href: "/approvals", label: "Approvals", icon: ClipboardCheck },
  { href: "/council", label: "Council", icon: Users2 },
];

const planningNavItems = [
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

const knowledgeNavItems = [
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/docs", label: "Docs", icon: FileText },
  { href: "/people", label: "People", icon: Users },
];

const workspaceNavItems = [
  { href: "/office", label: "Office", icon: Building2 },
  { href: "/team", label: "Team", icon: Users2 },
];

const systemNavItems = [
  { href: "/system", label: "System", icon: Settings },
  { href: "/radar", label: "Radar", icon: Radar },
  { href: "/factory", label: "Factory", icon: Factory },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
];

interface NavSectionProps {
  title: string;
  items: Array<{ href: string; label: string; icon: React.ComponentType<{ size?: number }> }>;
  pathname: string;
}

function NavSection({ title, items, pathname }: NavSectionProps) {
  return (
    <div className="mb-4">
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive ? "font-medium" : "hover:bg-opacity-50"
              )}
              style={{
                background: isActive ? "var(--bg-tertiary)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col border-r"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-xl">🔥</span>
        <span className="font-semibold text-sm tracking-wide" style={{ color: "var(--text-primary)" }}>
          Mission Control
        </span>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
          <Search size={14} />
          <span>Search</span>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>⌘K</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto">
        <NavSection title="Main" items={mainNavItems} pathname={pathname} />
        <NavSection title="Work" items={workNavItems} pathname={pathname} />
        <NavSection title="Planning" items={planningNavItems} pathname={pathname} />
        <NavSection title="Knowledge" items={knowledgeNavItems} pathname={pathname} />
        <NavSection title="Workspace" items={workspaceNavItems} pathname={pathname} />
        <NavSection title="System" items={systemNavItems} pathname={pathname} />
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm"
          style={{ color: "var(--text-secondary)" }}>
          <UserCircle size={18} />
          <span>Gustave</span>
          <span className="ml-auto flex items-center gap-1">
            <Radio size={10} className="text-green-500" />
          </span>
        </div>
      </div>
    </aside>
  );
}
