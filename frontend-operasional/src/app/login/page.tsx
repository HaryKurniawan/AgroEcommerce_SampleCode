"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    const queryString = params ? `?${params}` : "";
    router.replace(`/${queryString}`);
  }, [router, searchParams]);

  return null;
}

export default function LoginPageRedirect() {
  return (
    <Suspense fallback={null}>
      <LoginRedirectContent />
    </Suspense>
  );
}
