import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import { User, Mail, Crown, Calendar, BarChart3, Settings, Star, Trophy, Clock, Download, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UserProfileProps {
  user: any;
}

export function UserProfile({ user }: UserProfileProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userContent, setUserContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = user?.access_token || localStorage.getItem('supabase.auth.token');
      
      // Fetch user profile
      const profileResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9ea3e56/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setUserProfile(profile);
      }

      // Fetch user content
      const contentResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9ea3e56/user/content`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (contentResponse.ok) {
        const content = await contentResponse.json();
        setUserContent(content);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradeToPremium = async () => {
    setUpgrading(true);
    try {
      const token = user?.access_token || localStorage.getItem('supabase.auth.token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9ea3e56/user/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription: 'premium' })
      });

      if (!response.ok) {
        throw new Error('Failed to upgrade subscription');
      }

      setUserProfile({ ...userProfile, subscription: 'premium' });
      toast.success('Successfully upgraded to Premium! 🎉');
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Failed to upgrade subscription');
    } finally {
      setUpgrading(false);
    }
  };

  const downgradeToFree = async () => {
    setUpgrading(true);
    try {
      const token = user?.access_token || localStorage.getItem('supabase.auth.token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9ea3e56/user/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription: 'free' })
      });

      if (!response.ok) {
        throw new Error('Failed to downgrade subscription');
      }

      setUserProfile({ ...userProfile, subscription: 'free', dailyApiCalls: 0 });
      toast.success('Subscription changed to Free plan');
    } catch (error: any) {
      console.error('Downgrade error:', error);
      toast.error(error.message || 'Failed to change subscription');
    } finally {
      setUpgrading(false);
    }
  };

  const exportUserData = () => {
    if (!userContent) return;

    const data = {
      profile: userProfile,
      notes: userContent.notes,
      flashcards: userContent.flashcards,
      routines: userContent.routines,
      quizzes: userContent.quizzes,
      exportDate: new Date().toISOString()
    };

    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'studyai-data-export.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Data exported successfully!');
  };

  const deleteAllData = async () => {
    if (!confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }

    toast.error('Data deletion is not available in this demo. In a production app, this would permanently delete all user data.');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const getMembershipDuration = () => {
    if (!userProfile?.createdAt) return 'N/A';
    const createdDate = new Date(userProfile.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;
    const months = Math.floor(diffDays / 30);
    if (months === 1) return '1 month';
    return `${months} months`;
  };

  const getUsageProgress = () => {
    if (userProfile?.subscription === 'premium') return 0;
    const dailyCalls = userProfile?.dailyApiCalls || 0;
    return Math.min((dailyCalls / 10) * 100, 100);
  };

  const getActivityScore = () => {
    if (!userContent) return 0;
    const total = (userContent.notes?.length || 0) + 
                 (userContent.flashcards?.length || 0) + 
                 (userContent.routines?.length || 0) + 
                 (userContent.quizzes?.length || 0);
    return Math.min(total * 10, 100);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">
                  {userProfile?.name || user?.email?.split('@')[0] || 'Student'}
                </CardTitle>
                <CardDescription className="text-purple-100 flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </CardDescription>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant={userProfile?.subscription === 'premium' ? 'default' : 'secondary'} className="text-white bg-white/20 mb-2">
                {userProfile?.subscription === 'premium' ? (
                  <div className="flex items-center space-x-1">
                    <Crown className="h-3 w-3" />
                    <span>Premium</span>
                  </div>
                ) : (
                  'Free Plan'
                )}
              </Badge>
              <p className="text-sm text-purple-100">
                Member for {getMembershipDuration()}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Notes Created</p>
                    <p className="text-2xl font-bold">{userContent?.notes?.length || 0}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Flashcard Sets</p>
                    <p className="text-2xl font-bold">{userContent?.flashcards?.length || 0}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                    <p className="text-2xl font-bold">{userContent?.quizzes?.length || 0}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Daily AI Calls</span>
                  <span>
                    {userProfile?.subscription === 'premium' ? '∞' : `${userProfile?.dailyApiCalls || 0}/10`}
                  </span>
                </div>
                <Progress value={getUsageProgress()} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Activity Score</span>
                  <span>{getActivityScore()}%</span>
                </div>
                <Progress value={getActivityScore()} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Based on content created and engagement
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{userContent?.routines?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Study Plans</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {userContent?.flashcards?.reduce((total: number, set: any) => total + (set.flashcards?.length || 0), 0) || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Flashcards</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {getMembershipDuration()}
                  </p>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{userProfile?.subscription === 'premium' ? 'Premium Plan' : 'Free Plan'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {userProfile?.subscription === 'premium' ? 'Unlimited AI requests and premium features' : 'Limited to 10 AI requests per day'}
                    </p>
                  </div>
                  <Badge variant={userProfile?.subscription === 'premium' ? 'default' : 'secondary'}>
                    {userProfile?.subscription === 'premium' ? 'Active' : 'Current'}
                  </Badge>
                </div>

                {userProfile?.subscription !== 'premium' ? (
                  <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                        <Crown className="h-5 w-5" />
                        <span>Upgrade to Premium</span>
                      </CardTitle>
                      <CardDescription className="text-yellow-700 dark:text-yellow-300">
                        Unlock unlimited AI requests and advanced features
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Premium Features:</h4>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                              <li>✓ Unlimited AI requests</li>
                              <li>✓ Advanced study analytics</li>
                              <li>✓ Priority support</li>
                              <li>✓ Export to PDF</li>
                              <li>✓ Custom study routines</li>
                              <li>✓ Advanced quiz features</li>
                            </ul>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">$5</div>
                            <div className="text-sm text-yellow-600 dark:text-yellow-400">per month</div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">or $50/year (save 17%)</div>
                          </div>
                        </div>
                        <Button 
                          onClick={upgradeToPremium}
                          disabled={upgrading}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                        >
                          {upgrading ? 'Processing...' : 'Upgrade to Premium'}
                        </Button>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
                          * This is a demo. No actual payment will be processed.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                        <Crown className="h-5 w-5" />
                        <span>Premium Active</span>
                      </CardTitle>
                      <CardDescription className="text-green-700 dark:text-green-300">
                        You're enjoying all premium features
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm text-green-700 dark:text-green-300">
                          <p>✓ Unlimited AI requests</p>
                          <p>✓ All premium features unlocked</p>
                          <p>✓ Priority support</p>
                        </div>
                        <Button 
                          onClick={downgradeToFree}
                          disabled={upgrading}
                          variant="outline"
                          className="w-full border-green-300 text-green-700 hover:bg-green-50"
                        >
                          {upgrading ? 'Processing...' : 'Downgrade to Free (Demo)'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userContent?.notes?.slice(0, 5).map((note: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{note.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                {userContent?.quizzes?.slice(0, 3).map((quiz: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Trophy className="h-4 w-4 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Quiz: {quiz.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed {new Date(quiz.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                {(!userContent?.notes?.length && !userContent?.quizzes?.length) && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
                    <p className="text-muted-foreground">
                      Start creating notes, flashcards, or taking quizzes to see your activity here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed in this demo
                </p>
              </div>

              <div>
                <Label>Display Name</Label>
                <Input value={userProfile?.name || ''} disabled />
                <p className="text-xs text-muted-foreground mt-1">
                  Name editing is not available in this demo
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download all your notes, flashcards, and activity data
                  </p>
                </div>
                <Button onClick={exportUserData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-red-600">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button onClick={deleteAllData} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">ℹ️ Demo Notice</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This is a demonstration version of StudyAI. Some features like payment processing, 
                email changes, and permanent data deletion are simulated for demo purposes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}