import { NextRequest } from "next/server";

import { handleProxyRequest } from "@/lib/proxy-handler";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams.slug);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams.slug);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams.slug);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams.slug);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams.slug);
}
