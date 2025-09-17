import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Brain, 
  Zap, 
  MessageCircle, 
  StickyNote, 
  Calendar, 
  Star,
  Users,
  Globe,
  Crown,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Trophy,
  Clock
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const features = [
    {
      icon: MessageCircle,
      title: "AI Tutor Chat",
      description: "Get instant help with homework and complex topics in English or Bengali",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      icon: StickyNote,
      title: "Smart Note Generator", 
      description: "Transform any text, image, or PDF into comprehensive study notes",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      icon: Zap,
      title: "Flashcard Creator",
      description: "AI-powered flashcards with interactive practice sessions",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
    },
    {
      icon: Calendar,
      title: "Study Planner",
      description: "Personalized study routines based on your schedule and exam dates",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      icon: Brain,
      title: "Quiz Practice",
      description: "Adaptive quizzes with detailed explanations to test your knowledge",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    },
    {
      icon: Target,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and insights",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Students", value: "10,000+" },
    { icon: BookOpen, label: "Study Sessions", value: "500K+" },
    { icon: Trophy, label: "Success Rate", value: "95%" },
    { icon: Globe, label: "Countries", value: "50+" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "High School Student",
      content: "StudyAI helped me improve my grades by 30%! The AI tutor explains concepts so clearly.",
      rating: 5
    },
    {
      name: "Ahmed Rahman", 
      role: "University Student",
      content: "The flashcard feature is amazing. I can create study cards from my lecture notes instantly.",
      rating: 5
    },
    {
      name: "Maria Santos",
      role: "Medical Student", 
      content: "Study planner changed my life. No more cramming - just organized, effective learning.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by AI
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your AI-Powered
            <br />
            Learning Companion
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your study sessions with intelligent tutoring, automated note-taking, 
            and personalized learning plans. Boost your grades with the power of AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={onGetStarted} 
              size="lg" 
              className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={onSignIn} 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg"
            >
              Sign In
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            ✨ Free plan includes 10 AI requests daily • No credit card required
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-3">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From AI tutoring to personalized study plans, we've got every aspect 
              of your learning journey covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors hover:shadow-lg">
                  <CardHeader>
                    <div className={`${feature.bgColor} rounded-lg w-12 h-12 flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How StudyAI Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started in minutes and transform your learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "1",
                title: "Sign Up & Set Goals", 
                description: "Create your account and tell us about your subjects and study goals"
              },
              {
                step: "2", 
                title: "AI Creates Your Plan",
                description: "Our AI analyzes your needs and creates a personalized study routine"
              },
              {
                step: "3",
                title: "Learn & Improve",
                description: "Use AI tutoring, notes, flashcards, and quizzes to master your subjects"
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-blue-200 dark:bg-blue-800 transform translate-x-6"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Students Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of students who are already improving their grades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free Plan</CardTitle>
                <div className="text-3xl font-bold">$0</div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    "10 AI requests per day",
                    "Basic note generation", 
                    "Flashcard creation",
                    "Simple quizzes",
                    "Community support"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={onGetStarted} className="w-full" variant="outline">
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm">
                Popular
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <span>Premium</span>
                </CardTitle>
                <div className="text-3xl font-bold">$5<span className="text-lg text-muted-foreground">/month</span></div>
                <CardDescription>Everything you need to excel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    "Unlimited AI requests",
                    "Advanced study analytics",
                    "Priority support",
                    "Export to PDF",
                    "Custom study routines",
                    "Advanced quiz features"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={onGetStarted} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students who are already improving their grades with AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted} 
                size="lg" 
                className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100"
              >
                Start Learning for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={onSignIn} 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg border-white text-white hover:bg-white/10"
              >
                <Clock className="mr-2 h-5 w-5" />
                Already have an account?
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-blue-600 rounded-lg p-2">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">StudyAI</div>
                <div className="text-sm text-muted-foreground">Your Personal Learning Assistant</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>© 2024 StudyAI. All rights reserved.</p>
              <p>Making learning smarter, one AI interaction at a time.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}