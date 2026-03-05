"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutGrid,
  BotOff,
  Bot,
  FileText,
  ShieldCheck,
  Crown,
  Calendar,
  FolderKanban,
  Brain,
  File,
  Users,
  Building2,
  User,
  Settings,
  Radar,
  Factory,
  GitBranch,
  MessageSquare
} from "lucide-react";

// Groups divided by visual space
const navGroups = [
  [
    { href: "/tasks", label: "Tasks", icon: LayoutGrid },
    { href: "/agents", label: "Agents", icon: Bot },
    { href: "/content", label: "Content", icon: FileText },
    { href: "/approvals", label: "Approvals", icon: ShieldCheck },
    { href: "/council", label: "Council", icon: Crown },
  ],
  [
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/memory", label: "Memory", icon: Brain },
    { href: "/docs", label: "Docs", icon: File },
    { href: "/people", label: "People", icon: Users },
  ],
  [
    { href: "/office", label: "Office", icon: Building2 },
    { href: "/team", label: "Team", icon: User },
    { href: "/system", label: "System", icon: Settings },
    { href: "/radar", label: "Radar", icon: Radar },
    { href: "/factory", label: "Factory", icon: Factory },
    { href: "/pipeline", label: "Pipeline", icon: GitBranch },
    { href: "/feedback", label: "Feedback", icon: MessageSquare },
  ]
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-56 flex flex-col border-r pb-4"
      style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5">
        <span className="text-xl opacity-80" style={{ color: "var(--text-primary)" }}>⌘</span>
        <span className="font-semibold text-sm tracking-wide" style={{ color: "var(--text-primary)" }}>
          Mission Control
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto w-full pt-2">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6 space-y-1">
            {group.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors",
                    isActive ? "font-medium" : "hover:bg-opacity-50"
                  )}
                  style={{
                    background: isActive ? "var(--bg-secondary)" : "transparent",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="opacity-80" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Logo */}
      <div className="px-6 mt-auto">
        <div className="w-6 h-6 rounded-full border flex items-center justify-center"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          <span className="text-xs font-bold">N</span>
        </div>
      </div>
    </aside>
  );
}

