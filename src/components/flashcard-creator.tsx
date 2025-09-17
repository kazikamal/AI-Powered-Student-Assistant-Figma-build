import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import { Zap, Plus, RotateCcw, ChevronLeft, ChevronRight, Shuffle, Sparkles, Loader2, Check, X, Edit3, Save, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface FlashcardCreatorProps {
  user: any;
}

interface Flashcard {
  question: string;
  answer: string;
}

export function FlashcardCreator({ user }: FlashcardCreatorProps) {
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [cardCount, setCardCount] = useState(5);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState('');
  const [editingAnswer, setEditingAnswer] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceStats, setPracticeStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [savedFlashcards, setSavedFlashcards] = useState<any[]>([]);

  useEffect(() => {
    fetchSavedFlashcards();
  }, []);

  const fetchSavedFlashcards = async () => {
    try {
      const token = user?.access_token || localStorage.getItem('supabase.auth.token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9ea3e56/user/content`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedFlashcards(data.flashcards || []);
      }
    } catch (error) {
      console.error('Error fetching saved flashcards:', error);
    }
  };

  const generateFlashcards = async () => {
    if (!sourceText.trim()) {
      toast.error('Please provide text content to generate flashcards');
      return;
    }

    setLoading(true);
    try {
      const token = user?.access_token || localStorage.getItem('supabase.auth.token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9ea3e56/ai/generate-flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: sourceText,
          count: cardCount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      setFlashcards(data.flashcards);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setActiveTab('practice');
      toast.success(`Generated ${data.flashcards.length} flashcards!`);
      fetchSavedFlashcards(); // Refresh saved flashcards
    } catch (error: any) {
      console.error('Generate flashcards error:', error);
      toast.error(error.message || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const addManualCard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    const newCard: Flashcard = {
      question: newQuestion,
      answer: newAnswer
    };

    setFlashcards([...flashcards, newCard]);
    setNewQuestion('');
    setNewAnswer('');
    toast.success('Flashcard added!');
  };

  const deleteCard = (index: number) => {
    const updatedCards = flashcards.filter((_, i) => i !== index);
    setFlashcards(updatedCards);
    if (currentCardIndex >= updatedCards.length && updatedCards.length > 0) {
      setCurrentCardIndex(updatedCards.length - 1);
    }
    setShowAnswer(false);
    toast.success('Flashcard deleted');
  };

  const startEditing = () => {
    if (flashcards[currentCardIndex]) {
      setEditingQuestion(flashcards[currentCardIndex].question);
      setEditingAnswer(flashcards[currentCardIndex].answer);
      setIsEditing(true);
    }
  };

  const saveEdit = () => {
    if (!editingQuestion.trim() || !editingAnswer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    const updatedCards = [...flashcards];
    updatedCards[currentCardIndex] = {
      question: editingQuestion,
      answer: editingAnswer
    };
    setFlashcards(updatedCards);
    setIsEditing(false);
    toast.success('Flashcard updated!');
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    toast.success('Flashcards shuffled!');
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const markAnswer = (correct: boolean) => {
    const newStats = {
      ...practiceStats,
      correct: practiceStats.correct + (correct ? 1 : 0),
      incorrect: practiceStats.incorrect + (correct ? 0 : 1),
      total: practiceStats.total + 1
    };
    setPracticeStats(newStats);
    
    setTimeout(() => {
      nextCard();
    }, 500);
  };

  const resetPractice = () => {
    setPracticeStats({ correct: 0, incorrect: 0, total: 0 });
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setPracticeMode(false);
  };

  const loadSavedFlashcards = (flashcardSet: any) => {
    setFlashcards(flashcardSet.flashcards || []);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setActiveTab('practice');
    toast.success('Flashcards loaded!');
  };

  if (flashcards.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-yellow-600" />
              <span>Flashcard Creator</span>
            </CardTitle>
            <CardDescription>
              Create flashcards manually or generate them automatically from any text using AI
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate from Text</CardTitle>
              <CardDescription>Let AI create flashcards from your study material</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sourceText">Study Material</Label>
                <Textarea
                  id="sourceText"
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste your study material, notes, or any text content here..."
                  className="min-h-[150px]"
                />
              </div>

              <div>
                <Label htmlFor="cardCount">Number of Flashcards</Label>
                <Input
                  id="cardCount"
                  type="number"
                  min="1"
                  max="20"
                  value={cardCount}
                  onChange={(e) => setCardCount(parseInt(e.target.value) || 5)}
                />
              </div>

              <Button
                onClick={generateFlashcards}
                disabled={loading || !sourceText.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Flashcards
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Manual Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Manually</CardTitle>
              <CardDescription>Add individual flashcards one by one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newQuestion">Question/Front</Label>
                <Input
                  id="newQuestion"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter the question or front side"
                />
              </div>

              <div>
                <Label htmlFor="newAnswer">Answer/Back</Label>
                <Textarea
                  id="newAnswer"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Enter the answer or back side"
                  className="min-h-[100px]"
                />
              </div>

              <Button
                onClick={addManualCard}
                disabled={!newQuestion.trim() || !newAnswer.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Flashcard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Saved Flashcards */}
        {savedFlashcards.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Saved Flashcards</CardTitle>
              <CardDescription>Load previously created flashcard sets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedFlashcards.map((flashcardSet, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => loadSavedFlashcards(flashcardSet)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">
                          {flashcardSet.flashcards?.length || 0} cards
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(flashcardSet.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {flashcardSet.sourceText?.substring(0, 100)}...
                      </p>
                      <Button size="sm" className="w-full mt-3">
                        Load Flashcards
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">⚡ Flashcard Tips:</h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• Keep questions clear and specific</li>
              <li>• Make answers concise but complete</li>
              <li>• Use active recall - try to answer before flipping</li>
              <li>• Review difficult cards more frequently</li>
              <li>• Mix up the order to avoid pattern memorization</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];
  const progress = flashcards.length > 0 ? ((currentCardIndex + 1) / flashcards.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-yellow-600" />
              <div>
                <CardTitle>Flashcard Practice</CardTitle>
                <CardDescription>
                  {flashcards.length} cards • Card {currentCardIndex + 1} of {flashcards.length}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={shuffleCards} variant="outline" size="sm">
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button onClick={resetPractice} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button onClick={() => {
                setFlashcards([]);
                setActiveTab('create');
              }} variant="outline" size="sm">
                New Set
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Practice Stats */}
      {practiceStats.total > 0 && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-green-900 dark:text-green-100">Practice Session</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>{practiceStats.correct} Correct</span>
                </div>
                <div className="flex items-center space-x-1 text-red-600">
                  <X className="h-4 w-4" />
                  <span>{practiceStats.incorrect} Incorrect</span>
                </div>
                <div className="text-muted-foreground">
                  Accuracy: {practiceStats.total > 0 ? Math.round((practiceStats.correct / practiceStats.total) * 100) : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Flashcard */}
      <Card className="min-h-[400px]">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            {/* Card Content */}
            <div className="w-full max-w-2xl">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editQuestion">Question</Label>
                    <Input
                      id="editQuestion"
                      value={editingQuestion}
                      onChange={(e) => setEditingQuestion(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editAnswer">Answer</Label>
                    <Textarea
                      id="editAnswer"
                      value={editingAnswer}
                      onChange={(e) => setEditingAnswer(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={saveEdit}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div>
                    <Badge variant="outline" className="mb-4">
                      {showAnswer ? 'Answer' : 'Question'}
                    </Badge>
                    <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                      <p className="text-lg leading-relaxed">
                        {showAnswer ? currentCard.answer : currentCard.question}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4">
                    {!showAnswer ? (
                      <Button onClick={() => setShowAnswer(true)} className="px-8">
                        Show Answer
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        {/* Practice Mode Buttons */}
                        <div className="flex justify-center space-x-4">
                          <Button
                            onClick={() => markAnswer(false)}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Incorrect
                          </Button>
                          <Button
                            onClick={() => markAnswer(true)}
                            variant="outline"
                            className="border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Correct
                          </Button>
                        </div>
                        
                        {/* Or just continue */}
                        <Button onClick={nextCard} variant="outline" className="w-full">
                          Continue
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={prevCard}
              disabled={currentCardIndex === 0}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <Button onClick={startEditing} variant="outline" size="sm">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => deleteCard(currentCardIndex)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={nextCard}
              disabled={currentCardIndex === flashcards.length - 1}
              variant="outline"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}