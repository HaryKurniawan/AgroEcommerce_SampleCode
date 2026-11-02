import { NextRequest, NextResponse } from "next/server";

import { serverConfig } from "./config";

export async function handleProxyRequest(request: NextRequest, slug: string[]) {
  const apiUrl = serverConfig.apiUrl;
  const apiKey = serverConfig.apiKey;

  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      {
        error: "Server proxy configuration is missing",
        details: { apiUrl: !!apiUrl, apiKey: !!apiKey },
      },
      { status: 500 },
    );
  }

  const targetPath = slug ? slug.join("/") : "";

  // Intercept the logout route purely on the Next.js side to clear the cookie
  if (targetPath === "auth/logout") {
    const res = NextResponse.json({ success: true, message: "Logged out" });
    res.cookies.delete("accessToken");
    return res;
  }

  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : "";
  const targetUrl = `${apiUrl}/${targetPath}${queryString}`;

  const headers = new Headers();
  headers.set("x-api-key", apiKey);
  headers.set(
    "Content-Type",
    request.headers.get("Content-Type") || "application/json",
  );

  // Automatically attach the HttpOnly cookie's token into the Authorization header
  const tokenCookie = request.cookies.get("accessToken");
  if (tokenCookie?.value) {
    headers.set("Authorization", `Bearer ${tokenCookie.value}`);
  } else {
    // Fallback just in case the Next.js client request manually attached an auth header
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      headers.set("Authorization", authHeader);
    }
  }

  let body = undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: request.signal,
    });

    // Support for Server-Sent Events (SSE) streaming
    const contentType =
      response.headers.get("Content-Type") || "application/json";

    if (contentType.includes("text/event-stream")) {
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    const dataText = await response.text();

    if (targetPath.includes("logistics/calculate")) {
      console.log("LOGISTICS PROXY REQUEST:", { targetUrl, body });
      console.log("LOGISTICS PROXY RESPONSE:", {
        status: response.status,
        dataText,
      });
    }

    // Create the standard Next.js response passing through the backend's status
    const proxyResponse = new NextResponse(dataText, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
      },
    });

    // Intercept successful login/register to save the JWT token into a secure cookie
    if (
      response.ok &&
      (targetPath === "auth/login" || targetPath.startsWith("auth/register"))
    ) {
      try {
        const jsonData = JSON.parse(dataText);
        const token = jsonData.data?.accessToken || jsonData.accessToken;
        if (token) {
          proxyResponse.cookies.set({
            name: "accessToken",
            value: token,
            httpOnly: true,
            secure: serverConfig.isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days matching JWT expiration
          });
        }
      } catch (err) {
        console.error("Failed to parse auth response for cookies", err);
      }
    }

    return proxyResponse;
  } catch (error) {
    console.error("API Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request to backend API" },
      { status: 502 },
    );
  }
}
