"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Mail, Phone, Tag, Loader2, Search } from "lucide-react";

interface Person {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  tags: string[];
  lastContact: string;
  notes: string;
  relationship: "cold" | "warm" | "hot";
}

const relationshipColors: Record<string, string> = {
  cold: "#6b7280",
  warm: "#f59e0b",
  hot: "#ef4444",
};

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: "", role: "", company: "", email: "", tags: "" });

  useEffect(() => {
    fetchPeople();
  }, []);

  async function fetchPeople() {
    try {
      const res = await fetch("/api/people");
      if (res.ok) {
        const data = await res.json();
        setPeople(data.people || []);
      }
    } catch (error) {
      console.error("Failed to fetch people:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addPerson() {
    if (!newPerson.name.trim()) return;
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPerson,
          tags: newPerson.tags.split(",").map((t) => t.trim()).filter(Boolean),
          phone: "",
          notes: "",
          relationship: "cold",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPeople([...people, data.person]);
        setNewPerson({ name: "", role: "", company: "", email: "", tags: "" });
        setShowNew(false);
      }
    } catch (error) {
      console.error("Failed to create person:", error);
    }
  }

  const filteredPeople = people.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={24} style={{ color: "var(--accent)" }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>People</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{people.length} contacts in your network</p>
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={16} /> Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Search by name, company, or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg text-sm border outline-none"
          style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        />
      </div>

      {/* People Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredPeople.map((person) => (
            <div
              key={person.id}
              className="rounded-xl p-4 border"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{person.name}</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{person.role}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{person.company}</p>
                </div>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: relationshipColors[person.relationship] }}
                  title={`${person.relationship} relationship`}
                />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {person.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px]"
                    style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                {person.email && (
                  <a href={`mailto:${person.email}`} className="flex items-center gap-1 hover:underline">
                    <Mail size={12} /> Email
                  </a>
                )}
                {person.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {person.phone}
                  </span>
                )}
                <span className="ml-auto">Last contact: {person.lastContact}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPeople.length === 0 && !loading && (
        <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
          No contacts found
        </div>
      )}

      {/* New Person Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl p-6 border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Add Contact</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newPerson.name}
                onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Role"
                  value={newPerson.role}
                  onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newPerson.company}
                  onChange={(e) => setNewPerson({ ...newPerson, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={newPerson.email}
                onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={newPerson.tags}
                onChange={(e) => setNewPerson({ ...newPerson, tags: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={addPerson} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--accent)" }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
