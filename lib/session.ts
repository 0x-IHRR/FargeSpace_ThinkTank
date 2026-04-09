export const MEMBER_ROLES = ["member", "editor", "admin"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];
export const MEMBER_SESSION_COOKIE_NAME = "fargespace_member_session";
export const DEFAULT_MEMBER_TIER_CODE = "standard_member";
export const DEFAULT_SESSION_HOURS = 8;
export const REMEMBER_SESSION_DAYS = 30;

export type MemberSession = {
  userId: string;
  role: MemberRole;
  displayName: string;
  activeMemberTierCode: string;
  sessionExpiry: string;
};

export type SessionState =
  | { kind: "anonymous" }
  | { kind: "authenticated"; session: MemberSession }
  | { kind: "expired"; session: MemberSession };

export const ANONYMOUS_SESSION_STATE: SessionState = { kind: "anonymous" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMemberRole(value: unknown): value is MemberRole {
  return typeof value === "string" && MEMBER_ROLES.includes(value as MemberRole);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseMemberSession(value: unknown): MemberSession | null {
  if (!isRecord(value)) {
    return null;
  }

  const { userId, role, displayName, activeMemberTierCode, sessionExpiry } = value;
  if (!isNonEmptyString(userId)) return null;
  if (!isMemberRole(role)) return null;
  if (!isNonEmptyString(displayName)) return null;
  if (!isNonEmptyString(activeMemberTierCode)) return null;
  if (!isNonEmptyString(sessionExpiry)) return null;

  return {
    userId,
    role,
    displayName,
    activeMemberTierCode,
    sessionExpiry,
  };
}

export function isSessionExpired(session: MemberSession, now = new Date()): boolean {
  const expiryTime = Date.parse(session.sessionExpiry);
  if (Number.isNaN(expiryTime)) {
    return true;
  }
  return expiryTime <= now.getTime();
}

export function buildSessionState(payload: unknown, now = new Date()): SessionState {
  const session = parseMemberSession(payload);
  if (!session) {
    return ANONYMOUS_SESSION_STATE;
  }
  if (isSessionExpired(session, now)) {
    return { kind: "expired", session };
  }
  return { kind: "authenticated", session };
}

function parseCookiePayload(cookieValue: string): unknown {
  try {
    const decoded = decodeURIComponent(cookieValue);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function getSessionStateFromCookieValue(
  cookieValue: string | null | undefined,
  now = new Date()
): SessionState {
  if (!cookieValue) {
    return ANONYMOUS_SESSION_STATE;
  }
  return buildSessionState(parseCookiePayload(cookieValue), now);
}

export function formatSessionStatus(state: SessionState): string {
  if (state.kind === "anonymous") {
    return "访客模式";
  }
  if (state.kind === "expired") {
    return `${state.session.displayName}（会话已过期）`;
  }
  return `${state.session.displayName}（${state.session.role} / ${state.session.activeMemberTierCode}）`;
}

export function encodeMemberSessionCookie(session: MemberSession): string {
  return encodeURIComponent(JSON.stringify(session));
}

export function sanitizeNextPath(path: string | null | undefined): string {
  if (!path) {
    return "/";
  }
  if (!path.startsWith("/")) {
    return "/";
  }
  if (path.startsWith("//")) {
    return "/";
  }
  return path;
}
