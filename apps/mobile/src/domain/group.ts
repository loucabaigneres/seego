/** The API leaves a group trip's destination empty (`null`) until the group picks its city. */
export function isDestinationPending(destination: string | null | undefined): boolean {
  return !destination?.trim();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/**
 * "Toi, Tom et Inès", "Toi, Tom et 3 autres": the members of a group as one phrase, the current
 * user first. `total` counts every member, `members` may be only the first few.
 */
export function membersLabel(
  members: { id: string; name: string }[],
  meId: string | undefined,
  total = members.length,
): string {
  const me = members.find((m) => m.id === meId);
  const others = members.filter((m) => m !== me).map((m) => firstName(m.name));
  const names = me ? ['Toi', ...others] : others;
  const rest = total - members.length;
  if (rest > 0) names.push(rest === 1 ? '1 autre' : `${rest} autres`);
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} et ${names.at(-1)}`;
}

/** Caption of a group trip row: "3 participants" for the organizer, "Organisé par Marie" otherwise. */
export function groupRowCaption(
  role: 'owner' | 'member',
  memberCount: number,
  ownerName: string | null,
): string {
  if (role === 'member' && ownerName) return `Organisé par ${firstName(ownerName)}`;
  return memberCount > 1 ? `${memberCount} participants` : 'Rien que toi pour l’instant';
}
