interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export function ProfileStats({ postsCount, followersCount, followingCount }: ProfileStatsProps) {
  const stats = [
    { label: 'Posts', value: postsCount },
    { label: 'Followers', value: followersCount },
    { label: 'Following', value: followingCount },
  ];

  return (
    <div className="flex gap-6 border-b border-border bg-card px-6 py-4">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {stat.value.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
