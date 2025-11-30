import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Verify Cloudflare Turnstile Token
 *
 * API Route để verify Turnstile token từ client
 * Trước khi gọi sang Spring Boot backend
 */

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing turnstile token" },
        { status: 400 }
      );
    }

    if (!TURNSTILE_SECRET_KEY) {
      logger.warn("TURNSTILE_SECRET_KEY not configured, skipping verification");
      // Trong development, có thể skip verification
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json(
        { success: false, error: "Turnstile not configured" },
        { status: 500 }
      );
    }

    // Verify token với Cloudflare
    const formData = new FormData();
    formData.append("secret", TURNSTILE_SECRET_KEY);
    formData.append("response", token);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
      const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Turnstile verification failed",
            errors: verifyData["error-codes"],
          },
          { status: 400 }
        );
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { success: false, error: "Turnstile verification timeout" },
          { status: 408 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
