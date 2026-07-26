import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Operator {
  id: string;
  name: string;
}

interface EligibleBooking {
  id: string;
  guest_name: string;
  guest_email: string;
  check_out: string;
  review_token: string;
  operator_id: string;
  operators: { name: string } | null;
}

interface Review {
  id: string;
  operator_id: string;
  source: string;
  reviewer_name: string;
  rating: number;
  review_text: string | null;
  moderation_status: string;
  external_url: string | null;
  operators: { name: string } | null;
}

const SITE_URL = "https://fichua.co";

const SOURCES = ["google", "tripadvisor", "booking_com", "facebook", "other"];

const IntranetReviews = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [eligible, setEligible] = useState<EligibleBooking[]>([]);
  const [pending, setPending] = useState<Review[]>([]);
  const [approved, setApproved] = useState<Review[]>([]);
  const [importForm, setImportForm] = useState({
    operator_id: "", source: "google", reviewer_name: "", rating: "5", review_text: "", external_url: "",
  });

  const fetchAll = async () => {
    const [opsRes, bookingsRes, reviewsRes] = await Promise.all([
      supabase.from("operators").select("id, name").order("name"),
      supabase
        .from("bookings")
        .select("id, guest_name, guest_email, check_out, review_token, operator_id, operators(name)")
        .is("review_requested_at", null)
        .lt("check_out", new Date().toISOString().slice(0, 10))
        .neq("status", "cancelled"),
      supabase
        .from("reviews")
        .select("id, operator_id, source, reviewer_name, rating, review_text, moderation_status, external_url, operators(name)")
        .order("created_at", { ascending: false }),
    ]);
    setOperators(opsRes.data || []);
    setEligible((bookingsRes.data as unknown as EligibleBooking[]) || []);
    const reviews = (reviewsRes.data as unknown as Review[]) || [];
    setPending(reviews.filter((r) => r.moderation_status === "pending"));
    setApproved(reviews.filter((r) => r.moderation_status !== "pending"));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSendRequest = async (booking: EligibleBooking) => {
    const reviewUrl = `${SITE_URL}/review/${booking.id}?token=${booking.review_token}`;
    const { error: fnError } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "review-request",
        recipientEmail: booking.guest_email,
        idempotencyKey: `review-request-${booking.id}`,
        templateData: {
          guestName: booking.guest_name,
          operatorName: booking.operators?.name || "the property",
          reviewUrl,
        },
      },
    });
    if (fnError) {
      toast.error("Failed to send: " + fnError.message);
      return;
    }
    await supabase.from("bookings").update({ review_requested_at: new Date().toISOString() }).eq("id", booking.id);
    toast.success("Review request sent");
    fetchAll();
  };

  const handleModerate = async (reviewId: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("reviews").update({ moderation_status: status }).eq("id", reviewId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "approved" ? "Review approved" : "Review rejected");
    fetchAll();
  };

  const handleImport = async () => {
    if (!importForm.operator_id || !importForm.reviewer_name.trim()) {
      toast.error("Operator and reviewer name are required");
      return;
    }
    const { error } = await supabase.from("reviews").insert({
      operator_id: importForm.operator_id,
      source: importForm.source,
      reviewer_name: importForm.reviewer_name.trim(),
      rating: Number(importForm.rating),
      review_text: importForm.review_text.trim() || null,
      external_url: importForm.external_url.trim() || null,
      moderation_status: "approved", // admin is curating this by hand — already vetted
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Imported review added");
    setImportForm({ operator_id: "", source: "google", reviewer_name: "", rating: "5", review_text: "", external_url: "" });
    fetchAll();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-foreground mb-1">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Moderate submitted reviews, send post-stay requests, and import reviews from other platforms.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          Eligible for a review request ({eligible.length})
        </h2>
        {eligible.length === 0 && <p className="text-sm text-muted-foreground">No completed stays awaiting a request.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {eligible.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm text-foreground">{b.guest_name} — {b.operators?.name}</p>
                  <p className="text-xs text-muted-foreground">Checked out {b.check_out}</p>
                </div>
                <Button size="sm" onClick={() => handleSendRequest(b)}>Send Request</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          Pending moderation ({pending.length})
        </h2>
        {pending.length === 0 && <p className="text-sm text-muted-foreground">Nothing waiting.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pending.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-foreground">{r.operators?.name}</p>
                  <Badge variant="outline">{r.source === "fichua_verified" ? "Verified Stay" : r.source}</Badge>
                </div>
                <p className="text-sm text-foreground">{r.reviewer_name} · {r.rating}★</p>
                {r.review_text && <p className="text-xs text-muted-foreground">{r.review_text}</p>}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => handleModerate(r.id, "approved")}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleModerate(r.id, "rejected")}>Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          Import a review from another platform
        </h2>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Select value={importForm.operator_id} onValueChange={(v) => setImportForm({ ...importForm, operator_id: v })}>
                <SelectTrigger><SelectValue placeholder="Operator" /></SelectTrigger>
                <SelectContent>
                  {operators.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={importForm.source} onValueChange={(v) => setImportForm({ ...importForm, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Reviewer name" value={importForm.reviewer_name} onChange={(e) => setImportForm({ ...importForm, reviewer_name: e.target.value })} />
              <Input type="number" min={1} max={5} placeholder="Rating (1-5)" value={importForm.rating} onChange={(e) => setImportForm({ ...importForm, rating: e.target.value })} />
            </div>
            <Textarea placeholder="Review excerpt" rows={2} value={importForm.review_text} onChange={(e) => setImportForm({ ...importForm, review_text: e.target.value })} />
            <Input placeholder="Link to original review" value={importForm.external_url} onChange={(e) => setImportForm({ ...importForm, external_url: e.target.value })} />
            <Button onClick={handleImport}>Add Imported Review</Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <h2 className="font-label text-xs tracking-wider uppercase text-muted-foreground">
          Approved / rejected ({approved.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {approved.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-foreground">{r.operators?.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.source === "fichua_verified" ? "Verified Stay" : r.source}</Badge>
                    <Badge variant={r.moderation_status === "approved" ? "default" : "destructive"}>{r.moderation_status}</Badge>
                  </div>
                </div>
                <p className="text-sm text-foreground mt-1">{r.reviewer_name} · {r.rating}★</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntranetReviews;
