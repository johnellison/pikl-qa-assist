/**
 * Score color and styling utilities
 * Comprehensive color system: Green = Great (8-10), Amber = Good (6-7), Orange = Needs Attention (4-5), Red = Failing (0-3)
 */

export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600 dark:text-green-400'; // Great performance
  if (score >= 6) return 'text-amber-600 dark:text-amber-400'; // Good but room for improvement
  if (score >= 4) return 'text-orange-600 dark:text-orange-400'; // Needs attention
  return 'text-red-600 dark:text-red-400'; // Failing
}

export function getScoreBgColor(score: number): string {
  if (score >= 8) return 'bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-800';
  if (score >= 6) return 'bg-amber-100 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800';
  if (score >= 4) return 'bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800';
  return 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800';
}

export function getScoreLabel(score: number): string {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good - Room for Improvement';
  if (score >= 4) return 'Needs Attention';
  return 'Requires Immediate Action';
}

export function getScoreVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score >= 8) return 'default'; // Green badge
  if (score >= 6) return 'secondary'; // Amber badge
  if (score >= 4) return 'outline'; // Orange badge
  return 'destructive'; // Red badge
}

export function getProgressColor(score: number): string {
  if (score >= 8) return '[&>div]:bg-green-600 dark:[&>div]:bg-green-500';
  if (score >= 6) return '[&>div]:bg-amber-600 dark:[&>div]:bg-amber-500';
  if (score >= 4) return '[&>div]:bg-orange-600 dark:[&>div]:bg-orange-500';
  return '[&>div]:bg-red-600 dark:[&>div]:bg-red-500';
}

/**
 * Get score tier (for grouping and filtering)
 */
export function getScoreTier(score: number): 'excellent' | 'good' | 'attention' | 'failing' {
  if (score >= 8) return 'excellent';
  if (score >= 6) return 'good';
  if (score >= 4) return 'attention';
  return 'failing';
}

/**
 * Get badge props for a score
 */
export function getScoreBadgeProps(score: number) {
  return {
    variant: getScoreVariant(score),
    className: getScoreColor(score).replace('text-', 'border-').replace(' dark:', ' dark:border-'),
  };
}
