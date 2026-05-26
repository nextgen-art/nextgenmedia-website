import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, TrendingUp, PhoneCall, CheckCircle, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Lead {
  id: string;
  lead_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  source: string | null;
  status: string;
  quote_amount: number | null;
  closed_amount: number | null;
  lead_date: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "closed_won", label: "Closed Won" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  quoted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  closed_won: "bg-green-500/20 text-green-400 border-green-500/30",
};

const SOURCE_COLORS: Record<string, string> = {
  facebook_ads: "#1877F2",
  google_ads: "#EA4335",
  instagram: "#E1306C",
  tiktok_ads: "#010101",
  organic: "#22C55E",
  referral: "#A855F7",
  email: "#F59E0B",
  direct: "#6B7280",
  crm: "#64748B",
  website: "#10B981",
  call: "#0EA5E9",
};

function sourceLabel(s: string | null) {
  const map: Record<string, string> = {
    facebook_ads: "Facebook",
    google_ads: "Google",
    instagram: "Instagram",
    tiktok_ads: "TikTok",
    organic: "Organic",
    referral: "Referral",
    email: "Email",
    direct: "Direct",
    crm: "CRM",
    website: "Website",
    call: "Call / Phone",
  };
  return map[s || ""] || s || "Unknown";
}

interface ClientLeadsProps {
  clientId: string;
}

export default function ClientLeads({ clientId }: ClientLeadsProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    fetchLeads();

    const channel = supabase
      .channel(`client-leads-${clientId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "leads",
        filter: `client_id=eq.${clientId}`,
      }, fetchLeads)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clientId]);

  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(leadId: string, newStatus: string) {
    setUpdating(leadId);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", leadId);
      if (error) throw error;
      setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: newStatus } : l));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdating(null);
    }
  }

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    quoted: leads.filter((l) => l.status === "quoted").length,
    closed_won: leads.filter((l) => l.status === "closed_won").length,
    revenue_closed: leads.reduce((sum, l) => sum + (l.closed_amount || 0), 0),
  };

  const sourceCounts = leads.reduce<Record<string, number>>((acc, l) => {
    const s = l.source || "unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const sourceData = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, label: sourceLabel(source), count }))
    .sort((a, b) => b.count - a.count);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold">{stats.new}</p>
              <p className="text-xs text-muted-foreground">New</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <PhoneCall className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold">{stats.quoted}</p>
              <p className="text-xs text-muted-foreground">Quoted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold">{stats.closed_won}</p>
              <p className="text-xs text-muted-foreground">Closed Won</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold">${stats.revenue_closed.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Revenue Closed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Breakdown Chart */}
      {sourceData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leads by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sourceData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "#f1f5f9" }}
                  itemStyle={{ color: "#94a3b8" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {sourceData.map((entry) => (
                    <Cell key={entry.source} fill={SOURCE_COLORS[entry.source] || "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Leads</CardTitle>
          <CardDescription>
            Inbound leads captured from your marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No leads yet. They will appear here automatically as new contacts come in.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Contact</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Value</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Source</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 font-medium">{lead.lead_name || "—"}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        <div>{lead.lead_phone || "—"}</div>
                        {lead.lead_email && <div className="text-xs">{lead.lead_email}</div>}
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {lead.closed_amount
                          ? <span className="text-emerald-400">${lead.closed_amount.toLocaleString()}</span>
                          : lead.quote_amount
                          ? <span className="text-purple-400">${lead.quote_amount.toLocaleString()}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {sourceLabel(lead.source)}
                      </td>
                      <td className="py-3 px-2">
                        <Select
                          value={lead.status}
                          onValueChange={(val) => updateStatus(lead.id, val)}
                          disabled={updating === lead.id}
                        >
                          <SelectTrigger className={`w-32 h-7 text-xs border ${STATUS_COLORS[lead.status] || ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground text-xs">
                        {lead.lead_date
                          ? new Date(lead.lead_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
