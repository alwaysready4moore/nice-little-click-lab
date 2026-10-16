/**
 * Portable, user-controlled purchase backups. Contains puzzle inputs only,
 * never payment details, and never leaves the browser until a paid PDF request.
 */
export type PurchaseBackupKind = "crossword" | "wordsearch";

type BackupEnvelope = {
  format: "nice-little-click-lab-purchase-backup";
  version: 1;
  kind: PurchaseBackupKind;
  payload: unknown;
};

export function savePurchaseBackup(kind: PurchaseBackupKind, payload: unknown) {
  const backup: BackupEnvelope = {
    format: "nice-little-click-lab-purchase-backup",
    version: 1,
    kind,
    payload,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `nice-little-click-${kind}-backup.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readMatchingPurchaseBackup<T>(
  file: File,
  kind: PurchaseBackupKind,
  paidPuzzleHash: string,
): Promise<T> {
  if (file.size > 30_000) {
    throw new Error("This backup is too large. Choose a backup from the Lab.");
  }

  let backup: unknown;
  try {
    backup = JSON.parse(await file.text());
  } catch {
    throw new Error("That file is not a readable Lab backup.");
  }
  if (
    !backup ||
    typeof backup !== "object" ||
    Array.isArray(backup)
  ) {
    throw new Error("That file is not a Lab purchase backup.");
  }
  const saved = backup as Partial<BackupEnvelope>;
  if (
    saved.format !== "nice-little-click-lab-purchase-backup" ||
    saved.version !== 1 ||
    saved.kind !== kind ||
    !saved.payload ||
    typeof saved.payload !== "object" ||
    Array.isArray(saved.payload)
  ) {
    throw new Error("That backup is for another product or has an unsupported format.");
  }

  if (!globalThis.crypto?.subtle) {
    throw new Error("Secure backup verification is unavailable in this browser.");
  }
  // The hash is identical to the JSON.stringify hash checked server-side when
  // generating a paid PDF. A different draft cannot reuse a paid receipt.
  const bytes = new TextEncoder().encode(JSON.stringify(saved.payload));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const hash = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  if (hash !== paidPuzzleHash) {
    throw new Error("This backup does not match the puzzle on your paid receipt.");
  }

  return saved.payload as T;
}
