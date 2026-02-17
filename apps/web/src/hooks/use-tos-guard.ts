import type { User } from '@trendvault/shared-types';

/** Returns true if the authenticated user still needs to accept the Terms of Service */
export function needsTosAcceptance(user: User | null | undefined): boolean {
  return !!user && !user.tosAcceptedAt;
}
