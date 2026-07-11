"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { getPlan, getUpgradeTarget, type UsageLimitName } from "@/engines/monetization-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PremiumGate({
  plan,
  feature,
  children,
}: {
  plan: Parameters<typeof getPlan>[0];
  feature: UsageLimitName;
  children: React.ReactNode;
}) {
  const value = getPlan(plan).limits[feature];
  if (typeof value !== "boolean" || value) return <>{children}</>;
  const target = getUpgradeTarget(plan);
  return (
    <div className="relative overflow-hidden rounded-md border border-primary/30 bg-primary/5 p-5">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/75 p-5 text-center backdrop-blur-sm">
        <Badge>
          <Lock /> Recurso premium
        </Badge>
        <p className="max-w-sm text-sm text-muted-foreground">
          Desbloqueie processamento prioritário e mais recursos para estudar sem interrupções.
        </p>
        {target ? (
          <Button asChild size="sm">
            <Link href="/subscription">
              <Sparkles /> Conhecer o {getPlan(target).name}
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
