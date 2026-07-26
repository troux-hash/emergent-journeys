import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ExternalLink, MapPin, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  property_name: string;
  phone: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  facebook_handle: string | null;
  num_rooms: number | null;
  price_min: number | null;
  price_max: number | null;
  created_at: string;
}

interface Operator {
  id: string;
  lead_id: string | null;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  price_range: string | null;
  hero_image: string | null;
  images: string[];
  amenities: string[];
  identity_verified: boolean;
  photo_gps_verified: boolean;
  whatsapp_verified: boolean;
  payout_verified: boolean;
  is_verified: boolean | null;
  status: string;
}

interface RoomType {
  id: string;
  operator_id: string;
  name: string;
  description: string | null;
  price_per_night: number;
  currency: string;
  max_guests: number;
}

interface PhotoAnalysisEntry {
  index: number;
  url: string;
  category: string;
  quality: "good" | "needs_work" | "poor" | string;
  quality_note: string;
  authenticity_flag: "none" | "possibly_edited" | string;
}

interface PhotoAnalysis {
  photos: PhotoAnalysisEntry[];
  missingCategories: string[];
  recommendedCoverUrl: string | null;
  failedToFetch?: number;
  skipped?: number;
}

const CHECKLIST: { key: keyof Pick<Operator, "identity_verified" | "photo_gps_verified" | "whatsapp_verified" | "payout_verified">; label: string; help: string }[] = [
  { key: "identity_verified", label: "Identity & ownership", help: "National ID / business registration matches the sign-up name" },
  { key: "photo_gps_verified", label: "Property reality check", help: "3+ photos cross-checked against the GPS pin" },
  { key: "whatsapp_verified", label: "Reachability", help: "WhatsApp number confirmed live with a real reply" },
  { key: "payout_verified", label: "Payout readiness", help: "Mobile money / bank account on file with the payment processor" },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `operator-${Date.now()}`;
}

const IntranetOperators = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [rooms, setRooms] = useState<Record<string, RoomType[]>>({});
  const [editing, setEditing] = useState<Operator | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", price_per_night: "", max_guests: "2" });
  const [geocoding, setGeocoding] = useState(false);
  const [analyzingPhotos, setAnalyzingPhotos] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAnalysis | null>(null);

  const fetchAll = async () => {
    const [leadsRes, opsRes] = await Promise.all([
      supabase.from("operator_leads").select("*").order("created_at", { ascending: false }),
      supabase.from("operators").select("*").order("created_at", { ascending: false }),
    ]);
    setLeads(leadsRes.data || []);
    setOperators((opsRes.data as Operator[]) || []);

    const opIds = (opsRes.data || []).map((o: Operator) => o.id);
    if (opIds.length > 0) {
      const { data: roomData } = await supabase
        .from("room_types")
        .select("*")
        .in("operator_id", opIds)
        .order("sort_order", { ascending: true });
      const grouped: Record<string, RoomType[]> = {};
      for (const r of (roomData as RoomType[]) || []) {
        grouped[r.operator_id] = grouped[r.operator_id] || [];
        grouped[r.operator_id].push(r);
      }
      setRooms(grouped);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Leads that already have a published/draft operator record shouldn't be
  // offered for promotion again.
  const promotedLeadIds = new Set(operators.map((o) => o.lead_id).filter(Boolean));

  const handlePromote = async (lead: Lead) => {
    const { data, error } = await supabase
      .from("operators")
      .insert({
        lead_id: lead.id,
        slug: slugify(lead.property_name),
        name: lead.property_name,
        phone: lead.phone,
        price_range:
          lead.price_min && lead.price_max ? `$${lead.price_min}–$${lead.price_max}` : null,
        instagram_url: lead.instagram_handle,
        tripadvisor_url: null,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Draft listing created — fill in the rest before publishing");
    setEditing(data as Operator);
    setPhotoAnalysis(null);
    setDialogOpen(true);
    fetchAll();
  };

  const openEdit = (op: Operator) => {
    setEditing({ ...op });
    setPhotoAnalysis(null);
    setDialogOpen(true);
  };

  const handleSuggestGps = async () => {
    if (!editing) return;
    const query = [editing.address, editing.city, editing.country].filter(Boolean).join(", ");
    if (!query) {
      toast.error("Enter an address, city, or country first");
      return;
    }
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
      );
      const results = await res.json();
      if (!results || results.length === 0) {
        toast.error("No match found — try a more specific address");
        return;
      }
      setEditing({ ...editing, lat: Number(results[0].lat), lng: Number(results[0].lon) });
      toast.success("Coordinates suggested — verify against a photo/satellite check before confirming the checklist item");
    } catch {
      toast.error("Lookup failed — check your connection and try again");
    } finally {
      setGeocoding(false);
    }
  };

  const handleAnalyzePhotos = async () => {
    if (!editing) return;
    const images = [editing.hero_image, ...(editing.images || [])].filter(Boolean) as string[];
    if (images.length === 0) {
      toast.error("Add at least one photo URL first");
      return;
    }
    setAnalyzingPhotos(true);
    setPhotoAnalysis(null);
    const { data, error } = await supabase.functions.invoke("analyze-operator-photos", {
      body: { images },
    });
    setAnalyzingPhotos(false);
    if (error || (data && (data as { error?: string }).error)) {
      toast.error((data as { error?: string })?.error || error?.message || "Analysis failed");
      return;
    }
    setPhotoAnalysis(data as PhotoAnalysis);
  };

  const handleSave = async () => {
    if (!editing) return;
    const { id, ...payload } = editing;
    const { error } = await supabase.from("operators").update(payload).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved");
    setDialogOpen(false);
    setEditing(null);
    fetchAll();
  };

  const handlePublishToggle = async () => {
    if (!editing) return;
    const nextStatus = editing.status === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("operators")
      .update({ status: nextStatus })
      .eq("id", editing.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(nextStatus === "published" ? "Published — now live" : "Moved back to draft");
    setEditing({ ...editing, status: nextStatus });
    fetchAll();
  };

  const handleAddRoom = async () => {
    if (!editing || !newRoom.name.trim() || !newRoom.price_per_night) {
      toast.error("Room name and price are required");
      return;
    }
    const { error } = await supabase.from("room_types").insert({
      operator_id: editing.id,
      name: newRoom.name.trim(),
      price_per_night: Number(newRoom.price_per_night),
      max_guests: Number(newRoom.max_guests) || 2,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewRoom({ name: "", price_per_night: "", max_guests: "2" });
    fetchAll();
  };

  const handleDeleteRoom = async (roomId: string) => {
    await supabase.from("room_types").delete().eq("id", roomId);
    fetchAll();
  };

  const canPublish =
    !!editing &&
    editing.identity_verified &&
    editing.photo_gps_verified &&
    editing.whatsapp_verified &&
    editing.payout_verified;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-foreground mb-1">Operators</h1>
        <p className="text-sm text-muted-foreground">
          Enrich and verify leads, then publish them as live listings.
        </p>
      </div>

      {/* Unconverted leads */}
      <div className="space-y-3">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          Leads awaiting review ({leads.filter((l) => !promotedLeadIds.has(l.id)).length})
        </h2>
        {leads.filter((l) => !promotedLeadIds.has(l.id)).length === 0 && (
          <p className="text-sm text-muted-foreground">No new leads.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {leads
            .filter((l) => !promotedLeadIds.has(l.id))
            .map((lead) => (
              <Card key={lead.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-foreground">{lead.property_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.phone || "no phone"} · {lead.num_rooms ?? "?"} rooms ·{" "}
                      {lead.price_min && lead.price_max ? `$${lead.price_min}-$${lead.price_max}` : "no price range"}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handlePromote(lead)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Promote
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Operators (draft + published) */}
      <div className="space-y-3">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          Listings ({operators.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {operators.map((op) => (
            <Card key={op.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(op)}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm text-foreground">{op.name}</p>
                  <p className="text-xs text-muted-foreground">/operators/{op.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  {op.is_verified && <Badge variant="default">Verified</Badge>}
                  <Badge variant={op.status === "published" ? "default" : "outline"}>{op.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editing?.name}
              {editing?.status === "published" && (
                <a href={`/operators/${editing.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <Input placeholder="Slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <Input placeholder="Tagline" value={editing.tagline || ""} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} />
              <Textarea placeholder="Description" rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />

              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="City" value={editing.city || ""} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
                <Input placeholder="Country" value={editing.country || ""} onChange={(e) => setEditing({ ...editing, country: e.target.value })} />
                <Input placeholder="Address" value={editing.address || ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={editing.lat ?? ""}
                  onChange={(e) => setEditing({ ...editing, lat: e.target.value ? Number(e.target.value) : null })}
                />
                <Input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={editing.lng ?? ""}
                  onChange={(e) => setEditing({ ...editing, lng: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleSuggestGps} disabled={geocoding}>
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {geocoding ? "Looking up..." : "Suggest GPS from address"}
              </Button>
              <p className="text-xs text-muted-foreground -mt-2">
                Auto-suggested from the address/city/country above — this speeds up entry but doesn't replace the
                photo-vs-GPS verification check.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Phone / WhatsApp" value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                <Input placeholder="Email" value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                <Input placeholder="Website" value={editing.website || ""} onChange={(e) => setEditing({ ...editing, website: e.target.value })} />
              </div>

              <Input placeholder="Hero image URL" value={editing.hero_image || ""} onChange={(e) => setEditing({ ...editing, hero_image: e.target.value })} />
              <Textarea
                placeholder="Gallery image URLs, one per line"
                rows={3}
                value={(editing.images || []).join("\n")}
                onChange={(e) => setEditing({ ...editing, images: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
              />

              <div className="space-y-2">
                <Button type="button" variant="outline" size="sm" onClick={handleAnalyzePhotos} disabled={analyzingPhotos}>
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  {analyzingPhotos ? "Analyzing..." : "Analyze Photos"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Categorizes each photo, flags quality issues, suggests a cover image, and flags anything that looks
                  deceptively edited. Read-only — never changes or generates images itself.
                </p>

                {photoAnalysis && (
                  <div className="border border-border rounded p-3 space-y-3 mt-2">
                    {photoAnalysis.missingCategories.length > 0 && (
                      <p className="flex items-center gap-1.5 text-xs text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        Missing: {photoAnalysis.missingCategories.join(", ")}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {photoAnalysis.photos.map((ph) => (
                        <div key={ph.index} className="flex gap-2 border border-border rounded p-2">
                          <img src={ph.url} alt="" className="w-14 h-14 object-cover rounded shrink-0" />
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-1">
                              <Badge variant="outline" className="text-[10px]">{ph.category}</Badge>
                              <Badge
                                variant={ph.quality === "good" ? "default" : ph.quality === "poor" ? "destructive" : "outline"}
                                className="text-[10px]"
                              >
                                {ph.quality}
                              </Badge>
                              {ph.url === photoAnalysis.recommendedCoverUrl && (
                                <Badge className="text-[10px]">Suggested cover</Badge>
                              )}
                              {ph.authenticity_flag === "possibly_edited" && (
                                <Badge variant="destructive" className="text-[10px]">Check authenticity</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{ph.quality_note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {photoAnalysis.recommendedCoverUrl && photoAnalysis.recommendedCoverUrl !== editing.hero_image && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing({ ...editing, hero_image: photoAnalysis.recommendedCoverUrl! })}
                      >
                        Use suggested cover
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Textarea
                placeholder="Amenities, one per line"
                rows={3}
                value={(editing.amenities || []).join("\n")}
                onChange={(e) => setEditing({ ...editing, amenities: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
              />

              {/* Room types */}
              <div className="space-y-2">
                <p className="font-label text-[10px] tracking-wider uppercase text-muted-foreground">Rooms</p>
                {(rooms[editing.id] || []).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm border border-border px-3 py-2 rounded">
                    <span>{r.name} — {r.currency}{r.price_per_night}/night · up to {r.max_guests} guests</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteRoom(r.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input placeholder="Room name" value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} />
                  <Input type="number" placeholder="$/night" value={newRoom.price_per_night} onChange={(e) => setNewRoom({ ...newRoom, price_per_night: e.target.value })} />
                  <Input type="number" placeholder="Guests" value={newRoom.max_guests} onChange={(e) => setNewRoom({ ...newRoom, max_guests: e.target.value })} />
                  <Button variant="outline" onClick={handleAddRoom}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Verification checklist */}
              <div className="space-y-2 border-t border-border pt-4">
                <p className="font-label text-[10px] tracking-wider uppercase text-muted-foreground">
                  Fichua Verified checklist — all four required to publish
                </p>
                {CHECKLIST.map((item) => (
                  <label key={item.key} className="flex items-start gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={editing[item.key]}
                      onCheckedChange={(checked) => setEditing({ ...editing, [item.key]: !!checked })}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">{item.help}</span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={handleSave}>Save</Button>
                <Button
                  variant={editing.status === "published" ? "outline" : "default"}
                  disabled={editing.status !== "published" && !canPublish}
                  onClick={handlePublishToggle}
                >
                  {editing.status === "published" ? "Unpublish" : "Publish"}
                </Button>
              </div>
              {editing.status !== "published" && !canPublish && (
                <p className="text-xs text-muted-foreground text-right">
                  Complete all 4 checklist items to publish
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntranetOperators;
