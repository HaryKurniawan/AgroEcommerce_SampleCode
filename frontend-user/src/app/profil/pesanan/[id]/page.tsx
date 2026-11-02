"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function DetailPesananRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params?.id) {
      router.replace(`/pesanan/${params.id}`);
    } else {
      router.replace("/pesanan");
    }
  }, [params, router]);

  return null;
}
