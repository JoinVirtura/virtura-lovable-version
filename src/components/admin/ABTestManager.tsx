import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, TrendingUp, Users, BarChart3, Play, Pause, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: string;
  control_group_percentage: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface ABTestVariant {
  id: string;
  test_id: string;
  variant_name: string;
  title: string;
  message: string;
  category: string;
  priority: string;
}

export function ABTestManager() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // New test form state
  const [newTest, setNewTest] = useState({
    name: "",
    description: "",
    control_group_percentage: 50,
    start_date: "",
    end_date: "",
  });

  const [controlVariant, setControlVariant] = useState({
    title: "",
    message: "",
    category: "system",
    priority: "normal",
  });

  const [testVariants, setTestVariants] = useState([
    {
      title: "",
      message: "",
      category: "system",
      priority: "normal",
    },
  ]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('notification_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching A/B tests:', error);
      toast({
        title: "Error",
        description: "Failed to load A/B tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTest = async () => {
    if (!newTest.name || !controlVariant.title || !testVariants[0].title) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Create test
      const { data: test, error: testError} = await (supabase as any)
        .from('notification_ab_tests')
        .insert({
          name: newTest.name,
          description: newTest.description,
          control_group_percentage: newTest.control_group_percentage,
          start_date: newTest.start_date,
          end_date: newTest.end_date,
          created_by: user.user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (testError) throw testError;

      // Create control variant
      const { error: controlError } = await (supabase as any)
        .from('notification_ab_variants')
        .insert([{
          test_id: test.id,
          variant_name: 'control',
          title: controlVariant.title,
          message: controlVariant.message,
          category: controlVariant.category as any,
          priority: controlVariant.priority,
        }]);

      if (controlError) throw controlError;

      // Create test variants
      for (let i = 0; i < testVariants.length; i++) {
        const { error: variantError } = await (supabase as any)
          .from('notification_ab_variants')
          .insert([{
            test_id: test.id,
            variant_name: `variant_${String.fromCharCode(97 + i)}`, // variant_a, variant_b, etc.
            title: testVariants[i].title,
            message: testVariants[i].message,
            category: testVariants[i].category as any,
            priority: testVariants[i].priority,
          }]);

        if (variantError) throw variantError;
      }

      toast({
        title: "Test Created",
        description: "A/B test created successfully",
      });

      setCreateDialogOpen(false);
      fetchTests();
      resetForm();
    } catch (error) {
      console.error('Error creating test:', error);
      toast({
        title: "Error",
        description: "Failed to create A/B test",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewTest({
      name: "",
      description: "",
      control_group_percentage: 50,
      start_date: "",
      end_date: "",
    });
    setControlVariant({
      title: "",
      message: "",
      category: "system",
      priority: "normal",
    });
    setTestVariants([
      {
        title: "",
        message: "",
        category: "system",
        priority: "normal",
      },
    ]);
  };

  const updateTestStatus = async (testId: string, status: string) => {
    try {
      const { error } = await (supabase as any)
        .from('notification_ab_tests')
        .update({ status })
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Test ${status === 'active' ? 'started' : status === 'paused' ? 'paused' : 'completed'}`,
      });

      fetchTests();
    } catch (error) {
      console.error('Error updating test status:', error);
      toast({
        title: "Error",
        description: "Failed to update test status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      active: "default",
      paused: "outline",
      completed: "default",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status}
      </Badge>
    );
  };

  if (loading && tests.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">A/B Testing</h2>
          <p className="text-muted-foreground">
            Test different notification variants to optimize engagement
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create A/B Test</DialogTitle>
              <DialogDescription>
                Set up a new A/B test for notifications
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Test Details</TabsTrigger>
                <TabsTrigger value="control">Control</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Test Name *</Label>
                  <Input
                    id="name"
                    value={newTest.name}
                    onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                    placeholder="e.g., System Notification Optimization"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                    placeholder="What are you testing?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="percentage">Control Group Size (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={newTest.control_group_percentage}
                    onChange={(e) => setNewTest({ ...newTest, control_group_percentage: parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground">
                    {newTest.control_group_percentage}% will receive the control, {100 - newTest.control_group_percentage}% will receive test variants
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={newTest.start_date}
                      onChange={(e) => setNewTest({ ...newTest, start_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={newTest.end_date}
                      onChange={(e) => setNewTest({ ...newTest, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="control" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Define the control notification (baseline for comparison)
                </p>

                <div className="space-y-2">
                  <Label htmlFor="control_title">Title *</Label>
                  <Input
                    id="control_title"
                    value={controlVariant.title}
                    onChange={(e) => setControlVariant({ ...controlVariant, title: e.target.value })}
                    placeholder="Control notification title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="control_message">Message *</Label>
                  <Textarea
                    id="control_message"
                    value={controlVariant.message}
                    onChange={(e) => setControlVariant({ ...controlVariant, message: e.target.value })}
                    placeholder="Control notification message"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="control_category">Category</Label>
                    <Select
                      value={controlVariant.category}
                      onValueChange={(value) => setControlVariant({ ...controlVariant, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="control_priority">Priority</Label>
                    <Select
                      value={controlVariant.priority}
                      onValueChange={(value) => setControlVariant({ ...controlVariant, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="variants" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Add test variants to compare against the control
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTestVariants([...testVariants, {
                      title: "",
                      message: "",
                      category: "system",
                      priority: "normal",
                    }])}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Variant
                  </Button>
                </div>

                {testVariants.map((variant, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">Variant {String.fromCharCode(65 + index)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          value={variant.title}
                          onChange={(e) => {
                            const updated = [...testVariants];
                            updated[index].title = e.target.value;
                            setTestVariants(updated);
                          }}
                          placeholder="Variant title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Message *</Label>
                        <Textarea
                          value={variant.message}
                          onChange={(e) => {
                            const updated = [...testVariants];
                            updated[index].message = e.target.value;
                            setTestVariants(updated);
                          }}
                          placeholder="Variant message"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={variant.category}
                            onValueChange={(value) => {
                              const updated = [...testVariants];
                              updated[index].category = value;
                              setTestVariants(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="system">System</SelectItem>
                              <SelectItem value="account">Account</SelectItem>
                              <SelectItem value="billing">Billing</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="product">Product</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select
                            value={variant.priority}
                            onValueChange={(value) => {
                              const updated = [...testVariants];
                              updated[index].priority = value;
                              setTestVariants(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {testVariants.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const updated = testVariants.filter((_, i) => i !== index);
                            setTestVariants(updated);
                          }}
                        >
                          Remove Variant
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTest} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Test"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No A/B tests yet. Create your first test to optimize notifications.
              </p>
            </CardContent>
          </Card>
        ) : (
          tests.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{test.name}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Control Group</p>
                    <p className="text-2xl font-bold">{test.control_group_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium">
                      {test.start_date ? new Date(test.start_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="text-sm font-medium">
                      {test.end_date ? new Date(test.end_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {test.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => updateTestStatus(test.id, 'active')}
                    >
                      <Play className="mr-2 h-3 w-3" />
                      Start Test
                    </Button>
                  )}
                  {test.status === 'active' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTestStatus(test.id, 'paused')}
                      >
                        <Pause className="mr-2 h-3 w-3" />
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTestStatus(test.id, 'completed')}
                      >
                        <CheckCircle className="mr-2 h-3 w-3" />
                        Complete
                      </Button>
                    </>
                  )}
                  {test.status === 'paused' && (
                    <Button
                      size="sm"
                      onClick={() => updateTestStatus(test.id, 'active')}
                    >
                      <Play className="mr-2 h-3 w-3" />
                      Resume
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <TrendingUp className="mr-2 h-3 w-3" />
                    View Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
