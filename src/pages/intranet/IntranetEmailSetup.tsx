import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, ExternalLink, AlertTriangle } from "lucide-react";

// Guide for receiving mail at tr@fichua.co via Name.com email forwarding,
// with a live MX lookup so progress is visible from this page.

interface MxAnswer {
  data: string;
  TTL: number;
}

const IntranetEmailSetup = () => {
  const [mx, setMx] = useState<MxAnswer[] | null>(null);
  const [mxError, setMxError] = useState<string | null>(null);

  const checkMx = async () => {
    setMx(null);
    setMxError(null);
    try {
      const res = await fetch(
        "https://dns.google/resolve?name=fichua.co&type=MX",
        { headers: { accept: "application/dns-json" } },
      );
      const data = await res.json();
      const answers: MxAnswer[] = (data.Answer ?? []).map((a: any) => ({
        data: a.data,
        TTL: a.TTL,
      }));
      setMx(answers);
    } catch (err) {
      setMxError(String(err));
    }
  };

  useEffect(() => {
    checkMx();
  }, []);

  const forwardingLive = (mx ?? []).some((m) => m.data.includes("fichua.co"));

  const steps = [
    {
      title: "1. Log in to Name.com",
      body: (
        <>
          Go to{" "}
          <a
            href="https://www.name.com/account"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            name.com
          </a>{" "}
          and open <strong>fichua.co</strong> from your domain list.
        </>
      ),
    },
    {
      title: "2. Open Email Forwarding",
      body: (
        <>
          In the domain management screen, choose <strong>Email</strong> →{" "}
          <strong>Email Forwarding</strong> (free on Name.com, no mailbox needed).
        </>
      ),
    },
    {
      title: "3. Create the forwarding rule",
      body: (
        <>
          Add a rule: forward <strong>tr@fichua.co</strong> to{" "}
          <strong>teddy225@mit.edu</strong>. Add any other addresses you want to
          catch (e.g. <em>hello@fichua.co</em>) as separate rules.
        </>
      ),
    },
    {
      title: "4. Wait for DNS to update",
      body: (
        <>
          Name.com adds the MX records automatically. This usually takes minutes
          but can take a few hours. The live check below turns green when the
          forwarding records are visible publicly.
        </>
      ),
    },
    {
      title: "5. Verify the destination inbox",
      body: (
        <>
          Send a test email from any account to <strong>tr@fichua.co</strong>.
          Confirm it lands at teddy225@mit.edu (check spam the first time). If
          Name.com asks you to confirm the destination address, click the link in
          the verification email it sends you.
        </>
      ),
    },
    {
      title: "6. When forwarding works",
      body: (
        <>
          Let Teddy know so the admin notification email can be switched back
          from teddy225@mit.edu to tr@fichua.co.
        </>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-semibold">
          Receiving email at tr@fichua.co
        </h1>
        <p className="text-muted-foreground mt-1">
          Set up forwarding through Name.com so admin mail reaches your real
          inbox. Takes about 5 minutes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            Live status: fichua.co MX records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mxError && (
            <p className="text-sm text-destructive">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Could not check DNS: {mxError}
            </p>
          )}
          {mx === null && !mxError && (
            <p className="text-sm text-muted-foreground">Checking…</p>
          )}
          {mx !== null && mx.length === 0 && (
            <p className="text-sm text-amber-600">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              No MX records yet — forwarding is not set up. Nothing can receive
              mail at tr@fichua.co yet.
            </p>
          )}
          {mx !== null && mx.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm">
                <CheckCircle2 className="inline h-4 w-4 mr-1 text-green-600" />
                MX records found. Mail servers for fichua.co:
              </p>
              <ul className="text-sm text-muted-foreground font-mono space-y-1">
                {mx.map((m, i) => (
                  <li key={i}>{m.data}</li>
                ))}
              </ul>
            </div>
          )}
          {mx !== null && (
            <Badge variant={forwardingLive ? "default" : "secondary"}>
              {forwardingLive
                ? "Forwarding records look live"
                : "Forwarding records not visible yet"}
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Setup steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {steps.map((step) => (
            <div key={step.title} className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{step.body}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Useful links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <a
            href="https://www.name.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> Name.com — manage fichua.co
          </a>
          <a
            href="https://dnschecker.org/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> DNS Checker — confirm MX globally
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntranetEmailSetup;
