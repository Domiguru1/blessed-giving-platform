
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Contribution = {
  id: string;
  created_at: string;
  amount: number;
  contribution_type: string;
};

const fetchContributions = async (userId: string): Promise<Contribution[]> => {
  const { data, error } = await supabase
    .from('contributions')
    .select('id, created_at, amount, contribution_type')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const ContributionHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to view your contribution history.',
        variant: 'destructive',
      });
    }
  }, [user, authLoading, navigate]);

  const { data: contributions, isLoading, isError, error } = useQuery({
    queryKey: ['contributions', user?.id],
    queryFn: () => fetchContributions(user!.id),
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-4">
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Contribution History</CardTitle>
            <CardDescription>A record of your generous support.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {isError && <p className="text-destructive">Error loading history: {error instanceof Error ? error.message : 'Unknown error'}</p>}
            {!isLoading && !isError && contributions && contributions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount (KES)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((contribution) => (
                    <TableRow key={contribution.id}>
                      <TableCell>{new Date(contribution.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{contribution.contribution_type}</TableCell>
                      <TableCell className="text-right">KES {contribution.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
            {!isLoading && !isError && (!contributions || contributions.length === 0) && (
              <div className="text-center py-10">
                <p className="mb-4">You have not made any contributions yet.</p>
                <Button asChild>
                  <Link to="/contribute">Make your first contribution</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContributionHistory;

