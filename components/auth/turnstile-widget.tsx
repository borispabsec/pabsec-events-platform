"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render:      (container: HTMLElement, options: Record<string, unknown>) => string;
      remove:      (widgetId: string) => void;
      reset:       (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
  }
}

interface Props {
  onVerify:  (token: string) => void;
  onExpire?: () => void;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!;

export function TurnstileWidget({ onVerify, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef    = useRef<string | null>(null);
  // Keep latest callbacks in refs so the widget never goes stale
  const onVerifyRef  = useRef(onVerify);
  const onExpireRef  = useRef(onExpire);
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;

  function tryRender() {
    if (!containerRef.current || widgetRef.current !== null || !window.turnstile) return;
    widgetRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: (token: string) => onVerifyRef.current(token),
      "expired-callback": () => {
        widgetRef.current = null;
        onExpireRef.current?.();
      },
    });
  }

  useEffect(() => {
    // Turnstile may already be loaded if the modal was previously opened
    tryRender();
    return () => {
      if (widgetRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={tryRender}
      />
      <div ref={containerRef} />
    </>
  );
}
