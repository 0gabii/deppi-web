"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { can } from "@/lib/access";

// Sem login -> /login. Com login mas sem a permissão -> /403.
export function RequirePermission({ permission, children }: { permission?: string; children: ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = !!user && can(user.permissions, permission);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    else if (!allowed) router.replace("/403");
  }, [ready, user, allowed, router, pathname]);

  if (!ready || !allowed) return null; // não mostra nada enquanto decide
  return <>{children}</>;
}