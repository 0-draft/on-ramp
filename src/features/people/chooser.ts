/**
 * The people-access decision from docs/07-user-access.md ("Choosing a path"):
 * network-level access to many CIDRs → Client VPN; an admin reaching a
 * server → Session Manager (or EIC Endpoint for native SSH/RDP); otherwise,
 * may corporate data reach the device? yes → Verified Access, no → WorkSpaces.
 */
export type Product = "clientvpn" | "ava" | "ssm" | "eice" | "workspaces" | "bastion";

export interface Answers {
  manyNetworks?: boolean;
  adminToServer?: boolean;
  dataMayLeave?: boolean;
}

export type Question = keyof Answers;

/** The next unanswered question, or null once a product is decided. */
export function nextQuestion(a: Answers): Question | null {
  if (a.manyNetworks === undefined) return "manyNetworks";
  if (a.manyNetworks) return null;
  if (a.adminToServer === undefined) return "adminToServer";
  if (a.adminToServer) return null;
  if (a.dataMayLeave === undefined) return "dataMayLeave";
  return null;
}

export function recommend(a: Answers): Product[] | null {
  if (nextQuestion(a) !== null) return null;
  if (a.manyNetworks) return ["clientvpn"];
  if (a.adminToServer) return ["ssm", "eice"];
  return a.dataMayLeave ? ["ava"] : ["workspaces"];
}

/** Tokyo list prices from docs/07 (USD, 730-hour month). */
export const TOKYO = {
  clientVpnAssocHour: 0.15,
  clientVpnConnHour: 0.05,
  avaHttpAppHour: 0.35,
  hoursPerMonth: 730,
} as const;

/**
 * Monthly cost of the two network-level options for the same people, before
 * data transfer. Client VPN is billed per subnet association plus per
 * connected user-hour; Verified Access (HTTP) per application-hour.
 */
export function monthlyCost(opts: {
  azs: number;
  users: number;
  hoursPerUser: number;
  apps: number;
}): { clientVpn: number; ava: number } {
  const clientVpn =
    opts.azs * TOKYO.clientVpnAssocHour * TOKYO.hoursPerMonth +
    opts.users * opts.hoursPerUser * TOKYO.clientVpnConnHour;
  const ava = opts.apps * TOKYO.avaHttpAppHour * TOKYO.hoursPerMonth;
  return { clientVpn, ava };
}
