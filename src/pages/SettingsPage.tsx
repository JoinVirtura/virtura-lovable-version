import { VirturaNavigation } from "@/components/VirturaNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Download,
  Trash2,
  Settings as SettingsIcon
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <VirturaNavigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              
              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <Input id="company" placeholder="Your company name" />
              </div>
              
              <Button>Save Changes</Button>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about your generations</p>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Generation Complete</Label>
                  <p className="text-sm text-muted-foreground">Get notified when avatars finish generating</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Summary of your activity and usage</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Feature Updates</Label>
                  <p className="text-sm text-muted-foreground">News about new features and improvements</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Privacy & Security</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Content Credentials</Label>
                  <p className="text-sm text-muted-foreground">Add watermark to prove AI generation</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Analytics Collection</Label>
                  <p className="text-sm text-muted-foreground">Help us improve by sharing usage data</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label>Password</Label>
                <Button variant="outline">Change Password</Button>
                <Button variant="outline">Two-Factor Authentication</Button>
              </div>
            </div>
          </Card>

          {/* Billing & Usage */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Billing & Usage</h2>
            </div>
            
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                <div>
                  <h3 className="font-display font-bold">Free Plan</h3>
                  <p className="text-sm text-muted-foreground">50 generations per month</p>
                </div>
                <Badge className="bg-gradient-gold">Active</Badge>
              </div>
              
              {/* Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>This Month's Usage</Label>
                  <span className="text-sm text-muted-foreground">12 / 50</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-gold h-2 rounded-full" style={{ width: "24%" }}></div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button>Upgrade Plan</Button>
                <Button variant="outline">View Billing History</Button>
              </div>
            </div>
          </Card>

          {/* Data & Export */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Data & Export</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Export Your Data</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Download all your generated content and account data
                </p>
                <Button variant="outline">Request Data Export</Button>
              </div>
              
              <Separator />
              
              <div>
                <Label>Storage</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  You're using 2.3 GB of 10 GB storage
                </p>
                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "23%" }}></div>
                </div>
                <Button variant="outline">Manage Storage</Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-destructive/30">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-5 h-5 text-destructive" />
              <h2 className="text-xl font-display font-bold text-destructive">Danger Zone</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Delete Account</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}