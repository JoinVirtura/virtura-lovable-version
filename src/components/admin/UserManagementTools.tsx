import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { UserDetailsModal } from "./UserDetailsModal";
import { CreditTokensDialog } from "./CreditTokensDialog";
import { Users, TrendingUp, UserPlus, Award, Activity, DollarSign, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserData {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  user_tokens: {
    balance: number;
    lifetime_purchased: number;
    lifetime_used: number;
  }[];
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  topSpender: { name: string; amount: number } | null;
  mostActive: { name: string; usage: number } | null;
  avgBalance: number;
}

export function UserManagementTools() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    topSpender: null,
    mostActive: null,
    avgBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "balance" | "usage">("created_at");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeUserIds, setActiveUserIds] = useState<Set<string>>(new Set());
  
  const usersPerPage = 20;

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const start = (currentPage - 1) * usersPerPage;
      const end = start + usersPerPage - 1;

      // Fetch all profiles first
      const { data: profiles, error: profileError, count } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (profileError) throw profileError;

      // Fetch token data separately
      const profileIds = profiles?.map(p => p.id) || [];
      const { data: tokenData } = await supabase
        .from('user_tokens')
        .select('user_id, balance, lifetime_purchased, lifetime_used')
        .in('user_id', profileIds);

      // Create a map of token data by user_id
      const tokenMap = new Map(tokenData?.map(t => [t.user_id, t]) || []);

      // Combine data
      const combinedData = profiles?.map(p => ({
        ...p,
        user_tokens: tokenMap.has(p.id) 
          ? [tokenMap.get(p.id)!] 
          : [{ balance: 0, lifetime_purchased: 0, lifetime_used: 0 }]
      })) || [];

      // Apply search filter
      let filteredData = combinedData;
      if (searchTerm) {
        filteredData = filteredData.filter(u => 
          u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Get active users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentActivity } = await supabase
        .from('token_transactions')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const activeIds = new Set(recentActivity?.map(t => t.user_id) || []);
      setActiveUserIds(activeIds);

      // Sort by balance or usage if needed
      let sortedData = filteredData;
      if (sortBy === 'balance') {
        sortedData.sort((a, b) => (b.user_tokens[0]?.balance || 0) - (a.user_tokens[0]?.balance || 0));
      } else if (sortBy === 'usage') {
        sortedData.sort((a, b) => (b.user_tokens[0]?.lifetime_used || 0) - (a.user_tokens[0]?.lifetime_used || 0));
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        sortedData = sortedData.filter(user => {
          const isActive = activeIds.has(user.id);
          return statusFilter === 'active' ? isActive : !isActive;
        });
      }

      setUsers(sortedData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // New users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Active users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentActivity } = await supabase
        .from('token_transactions')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const activeUsers = new Set(recentActivity?.map(t => t.user_id) || []).size;

      // Get all user tokens for calculations
      const { data: allUserTokens } = await supabase
        .from('user_tokens')
        .select('user_id, balance, lifetime_purchased, lifetime_used')
        .order('lifetime_purchased', { ascending: false });

      // Top spender
      const topSpender = allUserTokens && allUserTokens.length > 0 ? allUserTokens[0] : null;
      let topSpenderName = 'N/A';
      if (topSpender) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', topSpender.user_id)
          .single();
        topSpenderName = profile?.display_name || 'Unknown';
      }

      // Most active
      const mostActive = allUserTokens?.sort((a, b) => b.lifetime_used - a.lifetime_used)[0];
      let mostActiveName = 'N/A';
      if (mostActive) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', mostActive.user_id)
          .single();
        mostActiveName = profile?.display_name || 'Unknown';
      }

      // Average balance
      const totalBalance = allUserTokens?.reduce((sum, u) => sum + u.balance, 0) || 0;
      const avgBalance = allUserTokens && allUserTokens.length > 0 ? Math.round(totalBalance / allUserTokens.length) : 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers,
        newUsersThisMonth: newUsers || 0,
        topSpender: topSpender ? { name: topSpenderName, amount: topSpender.lifetime_purchased } : null,
        mostActive: mostActive ? { name: mostActiveName, usage: mostActive.lifetime_used } : null,
        avgBalance,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const exportSelectedToCSV = () => {
    const selectedUserData = users.filter(u => selectedUsers.has(u.id));
    const csv = [
      ['Email/ID', 'Display Name', 'Balance', 'Lifetime Purchased', 'Lifetime Used', 'Join Date', 'Status'],
      ...selectedUserData.map(u => [
        u.id,
        u.display_name || 'N/A',
        u.user_tokens[0]?.balance || 0,
        u.user_tokens[0]?.lifetime_purchased || 0,
        u.user_tokens[0]?.lifetime_used || 0,
        format(new Date(u.created_at), 'yyyy-MM-dd'),
        activeUserIds.has(u.id) ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  const handleCreditComplete = () => {
    setShowCreditDialog(false);
    fetchUsers();
    fetchStats();
  };

  const totalPages = Math.ceil(totalCount / usersPerPage);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Users</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Active Users</span>
          </div>
          <p className="text-2xl font-bold">{stats.activeUsers}</p>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">New Users</span>
          </div>
          <p className="text-2xl font-bold">{stats.newUsersThisMonth}</p>
          <p className="text-xs text-muted-foreground">This month</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Top Spender</span>
          </div>
          <p className="text-lg font-bold truncate">{stats.topSpender?.name || 'N/A'}</p>
          <p className="text-xs text-muted-foreground">{stats.topSpender?.amount || 0} tokens</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Most Active</span>
          </div>
          <p className="text-lg font-bold truncate">{stats.mostActive?.name || 'N/A'}</p>
          <p className="text-xs text-muted-foreground">{stats.mostActive?.usage || 0} used</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Avg Balance</span>
          </div>
          <p className="text-2xl font-bold">{stats.avgBalance}</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Join Date</SelectItem>
              <SelectItem value="balance">Token Balance</SelectItem>
              <SelectItem value="usage">Usage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Batch Actions Bar */}
      {selectedUsers.size > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{selectedUsers.size} user(s) selected</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportSelectedToCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUsers(new Set())}
              >
                Cancel Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* User Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onCheckedChange={selectAllUsers}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Purchased</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserDetails(true);
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.display_name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.display_name || 'No name'}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {user.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{user.user_tokens[0]?.balance || 0}</span>
                  </TableCell>
                  <TableCell>{user.user_tokens[0]?.lifetime_purchased || 0}</TableCell>
                  <TableCell>{user.user_tokens[0]?.lifetime_used || 0}</TableCell>
                  <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={activeUserIds.has(user.id) ? "default" : "secondary"}>
                      {activeUserIds.has(user.id) ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalCount)} of {totalCount} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Modals */}
      {selectedUser && (
        <UserDetailsModal
          open={showUserDetails}
          onOpenChange={setShowUserDetails}
          user={selectedUser}
          onCreditTokens={() => {
            setShowUserDetails(false);
            setShowCreditDialog(true);
          }}
        />
      )}

      {selectedUser && (
        <CreditTokensDialog
          open={showCreditDialog}
          onOpenChange={setShowCreditDialog}
          user={selectedUser}
          onSuccess={handleCreditComplete}
        />
      )}
    </div>
  );
}
