
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CalendarIcon, FilterIcon } from 'lucide-react';

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
  const { profile, user } = useAuth();
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  
  const displayName =
    (profile?.first_name || profile?.last_name)
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      : user?.email;

  const { data: contributions, isLoading, isError, error } = useQuery({
    queryKey: ['admin-contributions'],
    queryFn: fetchAllContributions,
  });

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
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>Welcome, {displayName}. Manage members and contributions.</CardDescription>
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
