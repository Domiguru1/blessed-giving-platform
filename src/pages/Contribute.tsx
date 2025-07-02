
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

const ContributePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [amount, setAmount] = useState('');
  const [contributionType, setContributionType] = useState('offering');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch total contributions for the user
  const { data: totalContributions, refetch: refetchTotal } = useQuery({
    queryKey: ['totalContributions', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from('contributions')
        .select('amount')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.reduce((sum, contribution) => sum + contribution.amount, 0);
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to make a contribution.',
        variant: 'destructive',
      });
    }
  }, [user, authLoading, navigate]);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to contribute.', variant: 'destructive' });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid positive amount.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('contributions').insert({
      user_id: user.id,
      amount: numericAmount,
      contribution_type: contributionType,
    });

    if (error) {
      toast({ title: 'Error making contribution', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success!', description: 'Thank you for your contribution.' });
      setAmount('');
      refetchTotal(); // Refresh the total
    }
    setLoading(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Make a Contribution</CardTitle>
          <CardDescription className="text-center">Your support is greatly appreciated.</CardDescription>
          {totalContributions !== undefined && (
            <div className="text-center mt-2 p-2 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Total Contributions</p>
              <p className="text-lg font-semibold text-primary">KES {totalContributions.toLocaleString()}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContribute} className="space-y-4">
            <div>
              <Label htmlFor="contributionType">Contribution Type</Label>
              <Select value={contributionType} onValueChange={setContributionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contribution type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tithe">Tithe</SelectItem>
                  <SelectItem value="offering">Offering</SelectItem>
                  <SelectItem value="sacrifice">Sacrifice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                min="1"
                step="1"
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Contribute Now'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button asChild variant="link">
              <Link to="/history">View Contribution History</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContributePage;
