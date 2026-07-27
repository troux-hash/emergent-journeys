import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

// Evidence log for AI-discoverability before/after testing.
//
// The whole value of this page depends on capturing BASELINE results
// before a listing is indexed -- that "before" is unrecoverable once the
// page is live and crawled. The comparison view below is what turns
// scattered tests into a claim you can actually show an operator.

interface Operator {
  id: string;
  name: string;
  status: string;
}

interface TestRow {
  id: string;
  operator_id: string | null;
  phase: string;
  engine: string;
  query_text: string;
  operator_mentioned: boolean;
  fichua_cited: boolean;
  price_quoted_correctly: boolean | null;
  position: number | null;
  competitors_mentioned: string[] | null;
  response_excerpt: string | null;
  notes: string | null;
  tested_at: string;
}

const ENGINES = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "perplexity", label: "Perplexity" },
  { value: "google_ai", label: "Google AI Overview" },
  { value: "gemini", label: "Gemini" },
  { value: "claude", label: "Claude" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  operator_id: "",
  phase: "baseline",
  engine: "chatgpt",
  query_text: "",
  operator_mentioned: false,
  fichua_cited: false,
  price_quoted_correctly: false,
  position: "",
  competitors_mentioned: "",
  response_excerpt: "",
  notes: "",
};

const IntranetDiscoverability = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [tests, setTests] = useState<TestRow[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    const [opsRes, testsRes] = await Promise.all([
      supabase.from("operators").select("id, name, status").order("name"),
      supabase.from("discoverability_tests").select("*").order("tested_at", { ascending: false }),
    ]);
    setOperators((opsRes.data as Operator[]) || []);
    setTests((testsRes.data as unknown as TestRow[]) || []);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSave = async () => {
    if (!form.query_text.trim()) {
      toast.error("The exact query text is required — the comparison is meaningless without it");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("discoverability_tests").insert({
      operator_id: form.operator_id || null,
      phase: form.phase,
      engine: form.engine,
      query_text: form.query_text.trim(),
      operator_mentioned: form.operator_mentioned,
      fichua_cited: form.fichua_cited,
      price_quoted_correctly: form.operator_mentioned ? form.price_quoted_correctly : null,
      position: form.position ? Number(form.position) : null,
      competitors_mentioned: form.competitors_mentioned
        ? form.competitors_mentioned.split(",").map((s) => s.trim()).filter(Boolean)
        : null,
      response_excerpt: form.response_excerpt.trim() || null,
      notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Test logged");
    setForm({ ...emptyForm, operator_id: form.operator_id, engine: form.engine, phase: form.phase });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("discoverability_tests").delete().eq("id", id);
    fetchAll();
  };

  const baselines = tests.filter((t) => t.phase === "baseline");
  const followups = tests.filter((t) => t.phase === "followup");

  const rate = (rows: TestRow[], key: "operator_mentioned" | "fichua_cited") =>
    rows.length === 0 ? null : Math.round((rows.filter((r) => r[key]).length / rows.length) * 100);

  const baseMention = rate(baselines, "operator_mentioned");
  const followMention = rate(followups, "operator_mentioned");
  const baseCited = rate(baselines, "fichua_cited");
  const followCited = rate(followups, "fichua_cited");

  const opName = (id: string | null) =>
    operators.find((o) => o.id === id)?.name || "— no operator —";

  const renderTest = (t: TestRow) => (
    <Card key={t.id}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm text-foreground">{opName(t.operator_id)}</p>
            <p className="text-xs text-muted-foreground">
              {ENGINES.find((e) => e.value === t.engine)?.label || t.engine} ·{" "}
              {new Date(t.tested_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={t.operator_mentioned ? "default" : "outline"}>
              {t.operator_mentioned ? "Mentioned" : "Not mentioned"}
            </Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(t.id)}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>
        <p className="text-xs italic text-muted-foreground">"{t.query_text}"</p>
        <div className="flex flex-wrap gap-1.5">
          {t.fichua_cited && <Badge variant="outline" className="text-[10px]">Fichua cited</Badge>}
          {t.price_quoted_correctly && <Badge variant="outline" className="text-[10px]">Price correct</Badge>}
          {t.position != null && <Badge variant="outline" className="text-[10px]">Rank #{t.position}</Badge>}
        </div>
        {t.competitors_mentioned && t.competitors_mentioned.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Shown instead: {t.competitors_mentioned.join(", ")}
          </p>
        )}
        {t.response_excerpt && (
          <p className="text-xs text-foreground border-l-2 border-border pl-2">{t.response_excerpt}</p>
        )}
        {t.notes && <p className="text-xs text-muted-foreground">{t.notes}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-foreground mb-1">AI Discoverability Evidence</h1>
        <p className="text-sm text-muted-foreground">
          Log what AI answer engines say about an operator before and after they're listed on Fichua.
          Capture the baseline <strong>before</strong> publishing — once a page is indexed, the "before" is gone.
        </p>
      </div>

      {/* Comparison summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="font-label text-[10px] tracking-wider uppercase text-muted-foreground mb-2">
              Operator mentioned by an AI engine
            </p>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-2xl font-semibold text-muted-foreground">
                  {baseMention === null ? "—" : `${baseMention}%`}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Baseline ({baselines.length})
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {followMention === null ? "—" : `${followMention}%`}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  After ({followups.length})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="font-label text-[10px] tracking-wider uppercase text-muted-foreground mb-2">
              Fichua cited as the source
            </p>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-2xl font-semibold text-muted-foreground">
                  {baseCited === null ? "—" : `${baseCited}%`}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Baseline</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {followCited === null ? "—" : `${followCited}%`}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">After</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log a new test */}
      <div className="space-y-3">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">Log a test</h2>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={form.operator_id} onValueChange={(v) => setForm({ ...form, operator_id: v })}>
                <SelectTrigger><SelectValue placeholder="Operator" /></SelectTrigger>
                <SelectContent>
                  {operators.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name} {o.status !== "published" ? "(draft)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.phase} onValueChange={(v) => setForm({ ...form, phase: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baseline">Baseline (before listing)</SelectItem>
                  <SelectItem value="followup">Follow-up (after listing)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.engine} onValueChange={(v) => setForm({ ...form, engine: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENGINES.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder='Exact query used — e.g. "best places to stay in Musanze, Rwanda"'
              value={form.query_text}
              onChange={(e) => setForm({ ...form, query_text: e.target.value })}
            />

            <div className="flex flex-wrap items-center gap-5 py-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={form.operator_mentioned}
                  onCheckedChange={(c) => setForm({ ...form, operator_mentioned: !!c })}
                />
                Operator was mentioned
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={form.fichua_cited}
                  onCheckedChange={(c) => setForm({ ...form, fichua_cited: !!c })}
                />
                Fichua cited as source
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={form.price_quoted_correctly}
                  disabled={!form.operator_mentioned}
                  onCheckedChange={(c) => setForm({ ...form, price_quoted_correctly: !!c })}
                />
                Price quoted correctly
              </label>
              <Input
                type="number"
                min={1}
                placeholder="Rank"
                className="w-24"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>

            <Input
              placeholder="Competitors mentioned instead (comma separated)"
              value={form.competitors_mentioned}
              onChange={(e) => setForm({ ...form, competitors_mentioned: e.target.value })}
            />
            <Textarea
              rows={2}
              placeholder="Short excerpt of what the engine actually said"
              value={form.response_excerpt}
              onChange={(e) => setForm({ ...form, response_excerpt: e.target.value })}
            />
            <Input
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Log Test"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
            Baseline — before listing ({baselines.length})
          </h2>
          {baselines.length === 0 && (
            <p className="text-sm text-muted-foreground">
              None yet. Capture these before publishing any pilot operator.
            </p>
          )}
          <div className="space-y-3">{baselines.map(renderTest)}</div>
        </div>
        <div className="space-y-3">
          <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
            Follow-up — after listing ({followups.length})
          </h2>
          {followups.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Re-run each baseline query ~30 days after the listing goes live.
            </p>
          )}
          <div className="space-y-3">{followups.map(renderTest)}</div>
        </div>
      </div>
    </div>
  );
};

export default IntranetDiscoverability;
