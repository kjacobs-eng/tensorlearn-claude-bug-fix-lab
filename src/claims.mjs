// Contract: docs/contract.md. Pure function; do not mutate claims.
export function getClaim(claims, viewerId, claimId) {
  if (!Array.isArray(claims) || typeof viewerId !== 'string' || typeof claimId !== 'string') {
    return null;
  }

  const target = claimId.trim();
  const viewer = viewerId.trim();
  if (!target || !viewer) return null;

  return claims.find(claim =>
    claim !== null &&
    typeof claim === 'object' &&
    !Array.isArray(claim) &&
    typeof claim.id === 'string' &&
    typeof claim.ownerId === 'string' &&
    claim.id.trim() === target &&
    claim.ownerId.trim() === viewer
  ) ?? null;
}
