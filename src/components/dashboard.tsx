import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { MessageCircle, StickyNote, Zap, Calendar, Brain, User, BookOpen, Star, Trophy, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DashboardProps {
  user: any;
  setActiveTab: (tab: string) => void;
}

export function Dashboard({ user, setActiveTab }: DashboardProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userContent, setUserContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [user]);

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

  const quickActions = [
    {
      id: 'chat',
      title: 'Ask AI Tutor',
      description: 'Get help with homework and concepts',
      icon: MessageCircle,
      color: 'bg-blue-500',
      action: () => setActiveTab('chat')
    },
    {
      id: 'notes',
      title: 'Generate Notes',
      description: 'Create study notes from text or images',
      icon: StickyNote,
      color: 'bg-green-500',
      action: () => setActiveTab('notes')
    },
    {
      id: 'flashcards',
      title: 'Create Flashcards',
      description: 'Build flashcards for quick review',
      icon: Zap,
      color: 'bg-yellow-500',
      action: () => setActiveTab('flashcards')
    },
    {
      id: 'routine',
      title: 'Study Planner',
      description: 'Get a personalized study routine',
      icon: Calendar,
      color: 'bg-purple-500',
      action: () => setActiveTab('routine')
    },
    {
      id: 'quiz',
      title: 'Take Quiz',
      description: 'Practice with AI-generated questions',
      icon: Brain,
      color: 'bg-red-500',
      action: () => setActiveTab('quiz')
    },
    {
      id: 'profile',
      title: 'View Profile',
      description: 'Manage your account and subscription',
      icon: User,
      color: 'bg-gray-500',
      action: () => setActiveTab('profile')
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const remainingCalls = userProfile?.subscription === 'premium' ? '∞' : Math.max(0, 10 - (userProfile?.dailyApiCalls || 0));
  const usageProgress = userProfile?.subscription === 'premium' ? 0 : ((userProfile?.dailyApiCalls || 0) / 10) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white">
                {getGreeting()}, {userProfile?.name || user?.email?.split('@')[0] || 'Student'}!
              </CardTitle>
              <CardDescription className="text-blue-100">
                Ready to boost your learning today?
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={userProfile?.subscription === 'premium' ? 'default' : 'secondary'} className="text-white bg-white/20">
                  {userProfile?.subscription === 'premium' ? 'Premium' : 'Free'} Plan
                </Badge>
              </div>
              <p className="text-sm text-blue-100">
                Daily AI calls: {remainingCalls} remaining
              </p>
            </div>
          </div>
          
          {userProfile?.subscription !== 'premium' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-blue-100 mb-2">
                <span>Daily Usage</span>
                <span>{userProfile?.dailyApiCalls || 0}/10 calls</span>
              </div>
              <Progress value={usageProgress} className="h-2 bg-white/20" />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Notes Created</p>
              <p className="text-2xl font-bold">{userContent?.notes?.length || 0}</p>
            </div>
            <StickyNote className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Flashcard Sets</p>
              <p className="text-2xl font-bold">{userContent?.flashcards?.length || 0}</p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Study Plans</p>
              <p className="text-2xl font-bold">{userContent?.routines?.length || 0}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Quizzes Taken</p>
              <p className="text-2xl font-bold">{userContent?.quizzes?.length || 0}</p>
            </div>
            <Brain className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`${action.color} p-2 rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription className="text-sm">{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button className="w-full" variant="outline">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {userContent && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {/* Recent Notes */}
            {userContent.notes?.slice(0, 3).map((note: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex items-center space-x-3">
                  <StickyNote className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">{note.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('notes')}>
                    View
                  </Button>
                </div>
              </Card>
            ))}

            {/* Recent Flashcards */}
            {userContent.flashcards?.slice(0, 2).map((flashcardSet: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <p className="font-medium">{flashcardSet.flashcards?.length || 0} Flashcards</p>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(flashcardSet.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('flashcards')}>
                    Practice
                  </Button>
                </div>
              </Card>
            ))}

            {(!userContent.notes?.length && !userContent.flashcards?.length) && (
              <Card className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Start Your Learning Journey</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first notes, flashcards, or ask the AI tutor a question to get started!
                </p>
                <Button onClick={() => setActiveTab('chat')}>
                  Ask AI Tutor
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Upgrade Prompt for Free Users */}
      {userProfile?.subscription !== 'premium' && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-yellow-800 dark:text-yellow-200">Upgrade to Premium</CardTitle>
            </div>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Get unlimited AI requests, advanced features, and priority support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Premium Features:</p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Unlimited AI requests</li>
                  <li>• Advanced study analytics</li>
                  <li>• Priority support</li>
                  <li>• Export to PDF</li>
                </ul>
              </div>
              <Button onClick={() => setActiveTab('profile')} className="bg-yellow-600 hover:bg-yellow-700">
                <Trophy className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}