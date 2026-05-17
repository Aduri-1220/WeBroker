/** Delivery choices where ops uploads the final stamped & e-signed PDF for customer download */
export function deliveryUsesExecutedCopyUpload(
  method: string | null | undefined,
): boolean {
  return method === "DIGITAL" || method === "SCANNED_ONLINE";
}

/** Customer may download executed copy only after e-stamping & e-signing (Out for Delivery onward). */
export function agreementStatusAllowsExecutedCopyDownload(
  status: string | null | undefined,
): boolean {
  return status === "DELIVERY" || status === "COMPLETED";
}
