import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, Coins, Clock, Activity, FileText, Briefcase, 
  TrendingUp, DollarSign 
} from "lucide-react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onCreditTokens?: () => void;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function UserDetailsModal({ open, onOpenChange, user, onCreditTokens }: UserDetailsModalProps) {
  if (!user) return null;

  const usageData = [
    { name: 'Image Generation', value: user.usage?.image_generation || 0 },
    { name: 'Voice Generation', value: user.usage?.voice_generation || 0 },
    { name: 'Video Generation', value: user.usage?.video_generation || 0 },
    { name: 'Style Transfer', value: user.usage?.style_transfer || 0 },
  ].filter(item => item.value > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
          <div className="space-y-6">
            {/* Profile Section */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>
                    {user.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{user.display_name || 'Unknown User'}</h3>
                  <p className="text-sm text-muted-foreground">{user.email || user.id}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </div>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <Button onClick={onCreditTokens} size="sm">
                  <Coins className="h-4 w-4 mr-2" />
                  Credit Tokens
                </Button>
              </div>
            </Card>

            {/* Token Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-violet-500" />
                  <p className="text-sm font-medium">Current Balance</p>
                </div>
                <p className="text-2xl font-bold">{user.user_tokens?.[0]?.balance || 0}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <p className="text-sm font-medium">Lifetime Purchased</p>
                </div>
                <p className="text-2xl font-bold">{user.user_tokens?.[0]?.lifetime_purchased || 0}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-500" />
                  <p className="text-sm font-medium">Lifetime Used</p>
                </div>
                <p className="text-2xl font-bold">{user.user_tokens?.[0]?.lifetime_used || 0}</p>
              </Card>
            </div>

            {/* Usage Breakdown */}
            {usageData.length > 0 && (
              <Card className="p-6">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Usage Breakdown
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={usageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {usageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Recent Transactions */}
            {user.recentTransactions && user.recentTransactions.length > 0 && (
              <Card className="p-6">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Recent Transactions (Last 10)
                </h4>
                <div className="space-y-2">
                  {user.recentTransactions.slice(0, 10).map((txn: any) => (
                    <div key={txn.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">
                          {txn.transaction_type === 'purchase' ? 'Purchase' : 'Usage'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(txn.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <p className={`text-sm font-semibold ${txn.amount > 0 ? 'text-green-500' : 'text-orange-500'}`}>
                        {txn.amount > 0 ? '+' : ''}{txn.amount} tokens
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Jobs */}
            {user.recentJobs && user.recentJobs.length > 0 && (
              <Card className="p-6">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Recent Jobs (Last 10)
                </h4>
                <div className="space-y-2">
                  {user.recentJobs.slice(0, 10).map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{job.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(job.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <Badge variant={
                        job.status === 'completed' ? 'default' : 
                        job.status === 'failed' ? 'destructive' : 
                        'secondary'
                      }>
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
