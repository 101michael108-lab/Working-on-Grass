"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { collection, documentId, getDocs, query, where, type Firestore } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, BarChart3, RefreshCw, TrendingDown } from "lucide-react";
import {
  FUNNEL_COLLECTION_LIMIT,
  RANGES,
  type RangeId,
} from "./ranges";
import {
  biggestDropOff,
  buildFunnel,
  explainDropOff,
  explainFailureReason,
  recentDayIds,
  sumDays,
  type DailyFunnel,
  type FunnelEvent,
} from "@/lib/funnel";

/** Firestore caps an `in` filter at 30 values, so days are fetched in chunks. */
const ID_CHUNK = 30;

async function fetchDays(firestore: Firestore, dayIds: string[]): Promise<DailyFunnel[]> {
  const days: DailyFunnel[] = [];
  const ids = dayIds.slice(0, FUNNEL_COLLECTION_LIMIT);

  for (let i = 0; i < ids.length; i += ID_CHUNK) {
    const chunk = ids.slice(i, i + ID_CHUNK);
    const snap = await getDocs(query(collection(firestore, "analytics"), where(documentId(), "in", chunk)));
    snap.forEach((d) => days.push({ date: d.id, ...(d.data() as Omit<DailyFunnel, "date">) }));
  }

  return days;
}

function percent(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value * 100)}%`;
}

export default function AdminAnalyticsPage() {
  const firestore = useFirestore();
  const [range, setRange] = useState<RangeId>("30");
  const [days, setDays] = useState<DailyFunnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!firestore) return;
    setIsLoading(true);
    setError(null);
    try {
      const wanted = RANGES.find((r) => r.id === range)!.days;
      setDays(await fetchDays(firestore, recentDayIds(wanted)));
    } catch (e) {
      console.error("Error loading funnel:", e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [firestore, range]);

  useEffect(() => {
    load();
  }, [load]);

  const { counts, failures } = useMemo(() => sumDays(days), [days]);
  const rows = useMemo(() => buildFunnel(counts), [counts]);
  const worst = useMemo(() => biggestDropOff(rows), [rows]);
  const topCount = rows[0]?.count ?? 0;

  const failureRows = useMemo(
    () => Object.entries(failures).sort((a, b) => b[1] - a[1]),
    [failures]
  );
  const failureTotal = failureRows.reduce((sum, [, n]) => sum + n, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Where people drop off</CardTitle>
              <CardDescription>
                Each step is counted as it happens on the site. These are totals, not individual people — one visitor
                who looks at three products counts three times at the first step. The percentages between steps are the
                part worth reading.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
              <RefreshCw className={"mr-2 h-3 w-3 " + (isLoading ? "animate-spin" : "")} />
              Refresh
            </Button>
          </div>

          <Tabs value={range} onValueChange={(v) => setRange(v as RangeId)}>
            <TabsList>
              {RANGES.map((r) => (
                <TabsTrigger key={r.id} value={r.id}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Could not load the figures</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && <p className="py-8 text-center text-muted-foreground">Loading…</p>}

          {!isLoading && topCount === 0 && (
            <div className="rounded-md border-2 border-dashed py-12 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
              <p className="mt-2 text-muted-foreground">Nothing recorded for this period yet.</p>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                Counting starts from the day this page was deployed, so earlier visits are not included. Come back
                after the site has had some traffic.
              </p>
            </div>
          )}

          {!isLoading && topCount > 0 && (
            <div className="space-y-2">
              {rows.map((row) => {
                const width = topCount > 0 ? Math.max(2, Math.round((row.count / topCount) * 100)) : 0;
                const isWorst = worst?.id === row.id;

                return (
                  <div key={row.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="font-medium">
                        {row.label}
                        {isWorst && (
                          <Badge variant="destructive" className="ml-2 text-[10px]">
                            biggest drop
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-baseline gap-3 text-sm">
                        <span className="text-xl font-bold">{row.count}</span>
                        {row.fromPrevious !== null && (
                          <span className={row.fromPrevious < 0.5 ? "text-destructive" : "text-muted-foreground"}>
                            {percent(row.fromPrevious)} of the step above
                          </span>
                        )}
                      </div>
                    </div>

                    {/* A plain bar, so the shape of the funnel is visible at a glance. */}
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={"h-full rounded-full " + (isWorst ? "bg-destructive" : "bg-primary")}
                        style={{ width: `${width}%` }}
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-muted-foreground">{row.help}</p>

                    {row.lost > 0 && (
                      <p className="mt-1 text-xs">
                        <TrendingDown className="mr-1 inline h-3 w-3 text-destructive" />
                        <span className="text-destructive">
                          {row.lost} lost here
                        </span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && worst && (
            <Alert>
              <TrendingDown className="h-4 w-4" />
              <AlertTitle>Start with “{worst.label}” — {worst.lost} people lost there</AlertTitle>
              <AlertDescription>{explainDropOff(worst.id as FunnelEvent)}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checkouts that were refused</CardTitle>
          <CardDescription>
            People who filled in the form and were turned away before they could pay. These never become orders, so
            they leave no other trace — every one is a sale that was lost at the last moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {failureTotal === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No refused checkouts in this period. That is the result you want.
            </p>
          ) : (
            <div className="space-y-2">
              {failureRows.map(([reason, count]) => (
                <div key={reason} className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium capitalize">{reason.replace(/_/g, " ")}</span>
                    <span className="text-xl font-bold text-destructive">{count}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{explainFailureReason(reason)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Payments are confirmed by PayFast&apos;s notification, so the final step only counts once the money is
        confirmed. If that step is far below &ldquo;Went to pay&rdquo;, check{" "}
        <Link href="/admin/orders" className="underline">
          Orders
        </Link>{" "}
        for orders stuck on <strong>Not paid</strong> and the{" "}
        <Link href="/admin/email-log" className="underline">
          email log
        </Link>
        .
      </p>
    </div>
  );
}
