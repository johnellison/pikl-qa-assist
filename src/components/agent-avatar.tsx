/**
 * Agent Avatar Component
 * Displays agent profile picture or initials
 */

interface AgentAvatarProps {
  agentName: string;
  agentId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AgentAvatar({ agentName, agentId, size = 'md', className = '' }: AgentAvatarProps) {
  // Extract initials from name
  const getInitials = (name: string): string => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate consistent color based on agent ID or name
  const getAvatarColor = (id: string | undefined, name: string): string => {
    const seed = id || name;
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    return colors[hash % colors.length];
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
  };

  const initials = getInitials(agentName);
  const colorClass = getAvatarColor(agentId, agentName);

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClass}
        ${className}
        rounded-full
        flex
        items-center
        justify-center
        text-white
        font-semibold
        shrink-0
        ring-2
        ring-white
        dark:ring-gray-800
      `}
      title={agentName}
    >
      {initials}
    </div>
  );
}
