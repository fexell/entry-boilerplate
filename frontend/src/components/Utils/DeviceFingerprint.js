

export async function getDeviceFingerprint() {
  const navigatorInfo = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    navigator.hardwareConcurrency,
    navigator.deviceMemory
  ].join("|");

  const screenInfo = [
    screen.width,
    screen.height,
    screen.colorDepth,
    window.devicePixelRatio
  ].join("|");

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // RAW STRING (den som ska hashas)
  const raw = navigatorInfo + "|" + screenInfo + "|" + timezone;

  // Hasha fingerprinten
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
