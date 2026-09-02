/**
 * Customer selection stubs.
 *
 * Enterprise builds persist the selected customer to disk so subsequent
 * commands can fall back to it. This CLI is single-account, so
 * the storage is unnecessary — but `auth logout` and a few other shared
 * modules still call `clearCustomer()`/`loadCustomer()` to stay simple. These
 * no-ops keep the call sites compiling without a #ifdef.
 */

export interface StoredCustomer {
  customerGuid: string;
  ledgerId: string;
  customerName?: string | null;
  email?: string | null;
}

export function loadCustomer(): StoredCustomer | null {
  return null;
}

export function saveCustomer(_customer: StoredCustomer): void {
  /* no-op: single-account build */
}

export function clearCustomer(): void {
  /* no-op: single-account build */
}
