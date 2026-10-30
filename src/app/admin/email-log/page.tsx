"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  type Firestore,
} from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Eye, Mail, RefreshCw } from "lucide-react";
import {
  UNCOLLECTED_AFTER_MINUTES,
  describeDelivery,
  formatAge,
  formatDateTime,
  isUncollected,
  mailRecipients,
  mailSortTime,
  type MailDoc,
} from "@/lib/mail-delivery";

/** Rows shown. The `mail` collection is a log, not a working set. */
const MAIL_LIMIT = 100;

/**
 * Two ordered reads, merged.
 *
 * `queuedAt` only exists on mail queued by the current code, and a Firestore
 * `orderBy` silently drops documents that lack the field — so on its own it
 * would hide every pre-existing document, including the ones from the outage
 * being diagnosed. `delivery.startTime` is written by the extension, so it
 * covers the older documents it did process. What neither query can reach is a
 * pre-existing document the extension never touched: it has no field to sort
 * on. The collection count below exposes exactly that gap.
 */
async function fetchRecentMail(firestore: Firestore) {
  const byId = new Map<string, MailDoc>();
  const warnings: string[] = [];

  for (const field of ["queuedAt", "delivery.startTime"]) {
    try {
      const snap = await getDocs(
        query(collection(firestore, "mail"), orderBy(field, "desc"), limit(MAIL_LIMIT))
      );
      snap.forEach((d) => {
        if (!byId.has(d.id)) byId.set(d.id, { ...(d.data() as Omit<MailDoc, "id">), id: d.id });
      });
    } catch (e) {
      warnings.push(`Could not read mail ordered by \`${field}\`: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  let totalInCollection: number | null = null;
  try {
    totalInCollection = (await getCountFromServer(collection(firestore, "mail"))).data().count;
  } catch {
    // An aggregation read is a nicety; the list below still stands without it.
  }

  const docs = [...byId.values()].sort((a, b) => mailSortTime(b) - mailSortTime(a)).slice(0, MAIL_LIMIT);
  return { docs, warnings, totalInCollection };
}

function StatTile({ label, value, tone }: { label: string; value: number; tone?: "bad" | "good" }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={
          "text-2xl font-bold " +
          (tone === "bad" && value > 0 ? "text-destructive" : tone === "good" ? "text-green-600" : "")
        }
      >
        {value}
      </p>
    </div>
  );
}

export default function AdminEmailLogPage() {
  const firestore = useFirestore();
  const [mail, setMail] = useState<MailDoc[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [totalInCollection, setTotalInCollection] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Captured once per load so every row's staleness is judged against the same
  // instant instead of drifting during a render.
  const [loadedAt, setLoadedAt] = useState(() => new Date());
  const [selected, setSelected] = useState<MailDoc | null>(null);

  const load = useCallback(async () => {
    if (!firestore) return;
    setIsLoading(true);
    try {
      const result = await fetchRecentMail(firestore);
      setMail(result.docs);
      setWarnings(result.warnings);
      setTotalInCollection(result.totalInCollection);
    } catch (e) {
      console.error("Error loading email log:", e);
      setWarnings([`Could not read the mail collection: ${e instanceof Error ? e.message : String(e)}`]);
    } finally {
      setLoadedAt(new Date());
      setIsLoading(false);
    }
  }, [firestore]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () => mail.map((doc) => ({ doc, badge: describeDelivery(doc, loadedAt) })),
    [mail, loadedAt]
  );

  const selectedBadge = useMemo(
    () => (selected ? describeDelivery(selected, loadedAt) : null),
    [selected, loadedAt]
  );

  const counts = useMemo(() => {
    let sent = 0;
    let errored = 0;
    let waiting = 0;
    let uncollected = 0;
    for (const { doc } of rows) {
      const state = String(doc.delivery?.state || "").toUpperCase();
      if (state === "SUCCESS") sent++;
      else if (state === "ERROR" || state === "RETRY") errored++;
      else if (doc.delivery) waiting++;
      else if (isUncollected(doc, loadedAt)) uncollected++;
      else waiting++;
    }
    return { sent, errored, waiting, uncollected };
  }, [rows, loadedAt]);

  const unlistable = totalInCollection != null ? Math.max(0, totalInCollection - mail.length) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Email Log</CardTitle>
            <CardDescription>
              The {MAIL_LIMIT} most recent documents in the <code className="text-xs">mail</code> collection. Every
              email this site sends is queued here and sent by the Firebase <strong>Trigger Email</strong> extension,
              which writes its result back into each document&apos;s <code className="text-xs">delivery</code> field. The
              extension&apos;s SMTP settings live in the Firebase console, not in this codebase.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
            <RefreshCw className={"mr-2 h-3 w-3 " + (isLoading ? "animate-spin" : "")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <StatTile label="Sent" value={counts.sent} tone="good" />
            <StatTile label="Failed" value={counts.errored} tone="bad" />
            <StatTile label="In flight" value={counts.waiting} />
            <StatTile label="Never picked up" value={counts.uncollected} tone="bad" />
          </div>

          {counts.uncollected > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>The Trigger Email extension is not processing this collection</AlertTitle>
              <AlertDescription>
                {counts.uncollected} of these {rows.length} documents have no{" "}
                <code className="text-xs">delivery</code> field at all, more than {UNCOLLECTED_AFTER_MINUTES} minutes
                after being queued. The extension normally stamps that field within seconds, so the email was written
                correctly and then nothing collected it. Check in the Firebase console that the Trigger Email extension
                is installed, is not erroring on startup, and that its configured collection is{" "}
                <code className="text-xs">mail</code>.
              </AlertDescription>
            </Alert>
          )}

          {counts.errored > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>SMTP rejected {counts.errored} message(s)</AlertTitle>
              <AlertDescription>
                The extension picked these up and could not send them — the reason is in each row&apos;s error. A
                rejected <em>from</em> address is the usual cause; it comes from <strong>Sender Email</strong> in{" "}
                <Link href="/admin/settings" className="underline">
                  Settings
                </Link>
                , and when that is blank the extension&apos;s own DEFAULT_FROM is used instead.
              </AlertDescription>
            </Alert>
          )}

          {unlistable > 0 && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>
                {unlistable} document(s) in the collection are not listed here
              </AlertTitle>
              <AlertDescription>
                The collection holds {totalInCollection} documents and {mail.length} are shown. Beyond the{" "}
                {MAIL_LIMIT}-row cap, a document queued before this page existed has neither a{" "}
                <code className="text-xs">queuedAt</code> field of ours nor a{" "}
                <code className="text-xs">delivery</code> field from the extension, so there is nothing to sort it by.
                A large gap here is itself a finding: those documents were written and never collected.
              </AlertDescription>
            </Alert>
          )}

          {warnings.map((warning) => (
            <Alert variant="destructive" key={warning}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Read failed</AlertTitle>
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          ))}

          {isLoading && <p>Loading email log...</p>}

          {!isLoading && rows.length === 0 && (
            <div className="rounded-md border-2 border-dashed py-12 text-center">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
              <p className="mt-2 text-muted-foreground">No mail documents found.</p>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                If orders have been paid for since this page was deployed, nothing is writing to the{" "}
                <code>mail</code> collection — the PayFast notification never reached the server. Check{" "}
                <Link href="/admin/orders" className="underline">
                  Orders
                </Link>{" "}
                for orders still sitting on <strong>Pending</strong>.
              </p>
            </div>
          )}

          {!isLoading && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Queued</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead className="text-center">Attempts</TableHead>
                  <TableHead>Finished</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ doc, badge }) => (
                  <TableRow key={doc.id} className={badge.isProblem ? "bg-destructive/5" : undefined}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {formatDateTime(doc.queuedAt)}
                      <span className="block text-muted-foreground">{formatAge(doc.queuedAt, loadedAt)}</span>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs">{mailRecipients(doc)}</TableCell>
                    <TableCell className="max-w-[260px] text-xs">
                      <span className="block truncate font-medium">{doc.message?.subject || "(no subject)"}</span>
                      {badge.isProblem && badge.detail && (
                        <span className="mt-0.5 block truncate text-destructive">{badge.detail}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant} className="whitespace-nowrap">
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs">{doc.delivery?.attempts ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{formatDateTime(doc.delivery?.endTime)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(doc)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.message?.subject || "(no subject)"}</DialogTitle>
            <DialogDescription className="font-mono text-xs">mail/{selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-[120px_1fr] gap-y-2 rounded border bg-muted/30 p-3 text-xs">
                <span className="text-muted-foreground">To</span>
                <span className="break-all">{mailRecipients(selected)}</span>
                <span className="text-muted-foreground">From</span>
                <span className="break-all">{selected.from || "(extension DEFAULT_FROM)"}</span>
                {selected.replyTo && (
                  <>
                    <span className="text-muted-foreground">Reply-To</span>
                    <span className="break-all">{selected.replyTo}</span>
                  </>
                )}
                <span className="text-muted-foreground">Queued</span>
                <span>{formatDateTime(selected.queuedAt)}</span>
                <span className="text-muted-foreground">Attachments</span>
                <span>{selected.message?.attachments?.length ?? 0}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedBadge?.variant}>{selectedBadge?.label}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {selected.delivery ? `${selected.delivery.attempts ?? 0} attempt(s)` : "no delivery writeback"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{selectedBadge?.detail}</p>
              </div>

              {selected.delivery?.error && (
                <div className="rounded border border-destructive/50 bg-destructive/5 p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-destructive">
                    delivery.error
                  </p>
                  <p className="break-words font-mono text-xs">{selected.delivery.error}</p>
                </div>
              )}

              <div className="grid grid-cols-[120px_1fr] gap-y-2 rounded border p-3 text-xs">
                <span className="text-muted-foreground">Started</span>
                <span>{formatDateTime(selected.delivery?.startTime)}</span>
                <span className="text-muted-foreground">Finished</span>
                <span>{formatDateTime(selected.delivery?.endTime)}</span>
                <span className="text-muted-foreground">Message ID</span>
                <span className="break-all">{selected.delivery?.info?.messageId || "—"}</span>
                <span className="text-muted-foreground">Accepted</span>
                <span className="break-all">{selected.delivery?.info?.accepted?.join(", ") || "—"}</span>
                <span className="text-muted-foreground">Rejected</span>
                <span className="break-all">{selected.delivery?.info?.rejected?.join(", ") || "—"}</span>
                <span className="text-muted-foreground">SMTP response</span>
                <span className="break-words">{selected.delivery?.info?.response || "—"}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
