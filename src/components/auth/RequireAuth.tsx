"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { OfferRowSkeleton, Skeleton } from "@/components/ui/EmptyState";

export function RequireAuth({
  children,
  next,
}: {
  children: React.ReactNode;
  next?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const redirectTo = next ?? `${pathname}`;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/auth?next=${encodeURIComponent(redirectTo)}`);
    } else if (!isLoading && user && !user.profileComplete && pathname !== "/onboarding/hub") {
      router.replace("/onboarding/hub");
    }
  }, [isLoading, user, router, redirectTo, pathname]);

  if (isLoading || !user) {
    return (
      <div className="space-y-3 py-10">
        <Skeleton className="h-10 w-48" />
        <OfferRowSkeleton />
        <OfferRowSkeleton />
      </div>
    );
  }

  if (!user.profileComplete && pathname !== "/onboarding/hub") {
    return (
      <div className="space-y-3 py-10">
        <OfferRowSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}
