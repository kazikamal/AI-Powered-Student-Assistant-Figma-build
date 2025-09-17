import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "./components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { LandingPage } from "./components/landing-page";
import { AuthScreen } from "./components/auth-screen";
import { Dashboard } from "./components/dashboard";
import { ChatBot } from "./components/chat-bot";
import { NoteGenerator } from "./components/note-generator";
import { FlashcardCreator } from "./components/flashcard-creator";
import { StudyRoutinePlanner } from "./components/study-routine-planner";
import { QuizPractice } from "./components/quiz-practice";
import { UserProfile } from "./components/user-profile";
import {
  projectId,
  publicAnonKey,
} from "./utils/supabase/info";
import {
  Moon,
  Sun,
  BookOpen,
  MessageCircle,
  StickyNote,
  Zap,
  Calendar,
  Brain,
  User,
  Home,
} from "lucide-react";

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <div className={theme === "dark" ? "dark" : ""}>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="icon"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </div>

            {showAuth ? (
              <AuthScreen 
                supabase={supabase} 
                onBackToLanding={() => setShowAuth(false)}
              />
            ) : (
              <LandingPage
                onGetStarted={() => setShowAuth(true)}
                onSignIn={() => setShowAuth(true)}
              />
            )}
          </div>
          <Toaster />
        </div>
      </ThemeProvider>
    );
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "chat", label: "AI Tutor", icon: MessageCircle },
    { id: "notes", label: "Notes", icon: StickyNote },
    { id: "flashcards", label: "Flashcards", icon: Zap },
    { id: "routine", label: "Study Plan", icon: Calendar },
    { id: "quiz", label: "Quiz", icon: Brain },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <ThemeProvider theme={theme}>
      <div className={theme === "dark" ? "dark" : ""}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 rounded-lg p-2">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    StudyAI
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your Personal Learning Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={toggleTheme}
                  variant="outline"
                  size="icon"
                >
                  {theme === "light" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={() => supabase.auth.signOut()}
                  variant="outline"
                >
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-7 mb-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TabsTrigger
                      key={item.id}
                      value={item.id}
                      className="flex items-center space-x-1"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {item.label}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="dashboard">
                <Dashboard
                  user={user}
                  setActiveTab={setActiveTab}
                />
              </TabsContent>

              <TabsContent value="chat">
                <ChatBot user={user} />
              </TabsContent>

              <TabsContent value="notes">
                <NoteGenerator user={user} />
              </TabsContent>

              <TabsContent value="flashcards">
                <FlashcardCreator user={user} />
              </TabsContent>

              <TabsContent value="routine">
                <StudyRoutinePlanner user={user} />
              </TabsContent>

              <TabsContent value="quiz">
                <QuizPractice user={user} />
              </TabsContent>

              <TabsContent value="profile">
                <UserProfile user={user} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}