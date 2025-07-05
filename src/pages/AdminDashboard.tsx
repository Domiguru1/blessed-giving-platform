
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { CalendarIcon, FilterIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

type ContributionWithProfile = {
  id: string;
  amount: number;
  contribution_type: string;
  created_at: string;
  user_id: string;
  member_name: string;
};

const fetchAllContributions = async (): Promise<ContributionWithProfile[]> => {
  // First fetch all contributions
  const { data: contributions, error: contributionsError } = await supabase
    .from('contributions')
    .select('*')
    .order('created_at', { ascending: false });

  if (contributionsError) {
    throw new Error(contributionsError.message);
  }

  if (!contributions || contributions.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(contributions.map(c => c.user_id))];

  // Fetch profiles for these users
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .in('id', userIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  }

  // Combine the data
  const contributionsWithProfiles = contributions.map(contribution => {
    const profile = profiles?.find(p => p.id === contribution.user_id);
    const memberName = profile 
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Member'
      : 'Unknown Member';

    return {
      ...contribution,
      member_name: memberName
    };
  });

  return contributionsWithProfiles;
};

const AdminDashboard = () => {
  const { profile, user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  
  const displayName =
    (profile?.first_name || profile?.last_name)
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      : user?.email;

  const isAdmin = roles.includes('admin');

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Signed out successfully" });
      navigate('/');
    } catch (error) {
      toast({ title: "Error signing out", variant: "destructive" });
    }
  };

  const { data: contributions, isLoading, isError, error } = useQuery({
    queryKey: ['admin-contributions'],
    queryFn: fetchAllContributions,
    enabled: !!user && isAdmin, // Only fetch if user is authenticated and is admin
  });

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  // Show sign-in option if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>Sign in to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>You don't have admin privileges to access this dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredContributions = contributions?.filter(contribution => {
    const matchesDate = !dateFilter || 
      new Date(contribution.created_at).toISOString().split('T')[0] === dateFilter;
    
    const matchesType = !typeFilter || contribution.contribution_type === typeFilter;
    
    const matchesMember = !memberFilter || 
      contribution.member_name.toLowerCase().includes(memberFilter.toLowerCase());
    
    return matchesDate && matchesType && matchesMember;
  }) || [];

  const totalAmount = filteredContributions.reduce((sum, contribution) => sum + contribution.amount, 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="outline" className="mb-4">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
                <CardDescription>Welcome, {displayName}. Manage members and contributions.</CardDescription>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label htmlFor="date-filter" className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Filter by Date
                </label>
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="type-filter" className="text-sm font-medium flex items-center gap-2">
                  <FilterIcon className="h-4 w-4" />
                  Filter by Type
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="tithe">Tithe</SelectItem>
                    <SelectItem value="offering">Offering</SelectItem>
                    <SelectItem value="sacrifice">Sacrifice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="member-filter" className="text-sm font-medium">
                  Filter by Member
                </label>
                <Input
                  id="member-filter"
                  placeholder="Search member name..."
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Contributions</p>
                  <p className="text-2xl font-bold">{filteredContributions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">KES {totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unique Members</p>
                  <p className="text-2xl font-bold">
                    {new Set(filteredContributions.map(c => c.user_id)).size}
                  </p>
                </div>
              </div>
            </div>

            {/* Contributions Table */}
            {isLoading && <p>Loading contributions...</p>}
            {isError && <p className="text-destructive">Error loading contributions: {error instanceof Error ? error.message : 'Unknown error'}</p>}
            
            {!isLoading && !isError && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount (KES)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContributions.length > 0 ? (
                      filteredContributions.map((contribution) => (
                        <TableRow key={contribution.id}>
                          <TableCell>
                            {contribution.member_name}
                          </TableCell>
                          <TableCell className="capitalize">{contribution.contribution_type}</TableCell>
                          <TableCell>{new Date(contribution.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">KES {contribution.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No contributions found matching the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
