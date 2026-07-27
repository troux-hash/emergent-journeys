import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

// Live DNS status via Google's public DNS-over-HTTPS resolver.
// No server calls — the browser queries dns.google directly (CORS-enabled).

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DnsResponse {
  Status: number;
  Answer?: DnsAnswer[];
  Authority?: DnsAnswer[];
}

const RECORD_TYPES = [
  { code: "NS", label: "Nameservers" },
  { code: "SOA", label: "SOA" },
  { code: "A", label: "A (IPv4)" },
  { code: "AAAA", label: "AAAA (IPv6)" },
  { code: "MX", label: "MX (Mail)" },
  { code: "TXT", label: "TXT (SPF/DMARC/verification)" },
  { code: "CNAME", label: "CNAME" },
] as const;

type RecordType = typeof RECORD_TYPES[number]["code"];

interface RecordResult {
  type: RecordType;
  status: "ok" | "empty" | "error";
  answers: string[];
  ttl?: number;
  error?: string;
}

async function queryDns(name: string, type: RecordType): Promise<RecordResult> {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
      { headers: { accept: "application/dns-json" } },
    );
    if (!res.ok) {
      return { type, status: "error", answers: [], error: `HTTP ${res.status}` };
    }
    const data: DnsResponse = await res.json();
    const answers = (data.Answer ?? []).filter((a) => a.name.replace(/\.$/, "") === name.replace(/\.$/, "") || type === "SOA");
    // SOA can come back in Authority section when queried on a subdomain
    const soaFallback = type === "SOA" && answers.length === 0 ? (data.Authority ?? []) : [];
    const all = answers.length > 0 ? answers : soaFallback;
    if (all.length === 0) {
      return { type, status: "empty", answers: [] };
    }
    return {
      type,
      status: "ok",
      answers: all.map((a) => a.data),
      ttl: all[0]?.TTL,
    };
  } catch (err) {
    return { type, status: "error", answers: [], error: String(err) };
  }
}

const StatusIcon = ({ status }: { status: RecordResult["status"] }) => {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === "empty") return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

const IntranetDns = () => {
  const [domain, setDomain] = useState("fichua.co");
  const [input, setInput] = useState("fichua.co");
  const [results, setResults] = useState<RecordResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const runChecks = useCallback(async (target: string) => {
    setLoading(true);
    const res = await Promise.all(RECORD_TYPES.map((t) => queryDns(target, t.code)));
    setResults(res);
    setCheckedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    runChecks(domain);
  }, [domain, runChecks]);

  const ns = results.find((r) => r.type === "NS");
  const soa = results.find((r) => r.type === "SOA");
  const usingNameCom = ns?.answers.some((a) => a.toLowerCase().includes("name.com"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-foreground mb-1">DNS Status</h1>
        <p className="text-sm text-muted-foreground">
          Live lookup against Google Public DNS (dns.google). Shows the current authoritative
          answers your domain is serving right now.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value.trim())}
            onKeyDown={(e) => e.key === "Enter" && setDomain(input)}
            placeholder="domain (e.g. fichua.co)"
            className="max-w-xs"
          />
          <Button onClick={() => setDomain(input)} disabled={loading || !input}>
            Check
          </Button>
          <Button variant="ghost" size="sm" onClick={() => runChecks(domain)} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {checkedAt && (
            <span className="text-xs text-muted-foreground ml-auto">
              Checked {checkedAt.toLocaleTimeString()}
            </span>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="font-label text-[10px] tracking-wider uppercase text-muted-foreground mb-2">
              Nameservers
            </p>
            {loading && !ns ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : ns?.status === "ok" ? (
              <>
                <ul className="text-sm font-mono space-y-0.5">
                  {ns.answers.map((a) => (
                    <li key={a} className="text-foreground">{a.replace(/\.$/, "")}</li>
                  ))}
                </ul>
                {usingNameCom && (
                  <Badge variant="outline" className="mt-2 text-[10px]">Managed at Name.com</Badge>
                )}
              </>
            ) : (
              <p className="text-sm text-destructive">No NS records returned</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="font-label text-[10px] tracking-wider uppercase text-muted-foreground mb-2">
              SOA (Start of Authority)
            </p>
            {loading && !soa ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : soa?.status === "ok" ? (
              <p className="text-xs font-mono text-foreground break-all">{soa.answers[0]}</p>
            ) : (
              <p className="text-sm text-destructive">No SOA record returned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full record table */}
      <div className="space-y-3">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          All records
        </h2>
        <div className="space-y-2">
          {RECORD_TYPES.map((rt) => {
            const r = results.find((x) => x.type === rt.code);
            return (
              <Card key={rt.code}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {r ? <StatusIcon status={r.status} /> : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <span className="font-mono text-sm font-medium text-foreground">{rt.code}</span>
                    <span className="text-xs text-muted-foreground">— {rt.label}</span>
                    {r?.ttl != null && (
                      <Badge variant="outline" className="ml-auto text-[10px]">TTL {r.ttl}s</Badge>
                    )}
                  </div>
                  {r?.status === "ok" ? (
                    <ul className="text-xs font-mono space-y-0.5 pl-6">
                      {r.answers.map((a, i) => (
                        <li key={i} className="text-foreground break-all">{a}</li>
                      ))}
                    </ul>
                  ) : r?.status === "empty" ? (
                    <p className="text-xs text-muted-foreground pl-6">No records of this type</p>
                  ) : r?.status === "error" ? (
                    <p className="text-xs text-destructive pl-6">{r.error}</p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IntranetDns;
