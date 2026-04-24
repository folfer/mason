import type { MasonicLevel, AccessLevel } from '@/lib/db/schema'

/**
 * Returns which access levels a user at a given masonic level can see.
 * Mestre sees everything; aprendiz only sees "all" and "aprendiz" posts.
 */
export function getAllowedAccessLevels(level: MasonicLevel): AccessLevel[] {
  switch (level) {
    case 'mestre':
      return ['all', 'aprendiz', 'companheiro', 'mestre']
    case 'companheiro':
      return ['all', 'aprendiz', 'companheiro']
    case 'aprendiz':
      return ['all', 'aprendiz']
    default:
      return ['all']
  }
}

export function canAccessPost(
  userLevel: MasonicLevel | null | undefined,
  postAccessLevel: AccessLevel
): boolean {
  if (!userLevel) return postAccessLevel === 'all'
  return getAllowedAccessLevels(userLevel).includes(postAccessLevel)
}
