import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar as CalendarIcon, Clock, Plus, Minus, Sparkles, Loader2, Download, BookOpen, Target } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface StudyRoutinePlannerProps {
  user: any;
}

interface Subject {
  name: string;
  examDate: string;
  priority: 'high' | 'medium' | 'low';
}

export function StudyRoutinePlanner({ user }: StudyRoutinePlannerProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState({ name: '', examDate: '', priority: 'medium' as const });
  const [studyHours, setStudyHours] = useState(4);
  const [preferences, setPreferences] = useState('');
  const [generatedRoutine, setGeneratedRoutine] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);

  useEffect(() => {
    fetchSavedRoutines();
  }, []);

  const fetchSavedRoutines = async () => {
    try {
      const token = user?.access_token || localStorage.getItem('supabase.auth.token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9ea3e56/user/content`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedRoutines(data.routines || []);
      }
    } catch (error) {
      console.error('Error fetching saved routines:', error);
    }
  };

  const addSubject = () => {
    if (!newSubject.name.trim() || !newSubject.examDate) {
      toast.error('Please fill in subject name and exam date');
      return;
    }

    setSubjects([...subjects, newSubject]);
    setNewSubject({ name: '', examDate: '', priority: 'medium' });
    toast.success('Subject added!');
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const generateRoutine = async () => {
    if (subjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }

    if (studyHours < 1 || studyHours > 16) {
      toast.error('Please enter a valid number of study hours (1-16)');
      return;
    }

    setLoading(true);
    try {
      const token = user?.access_token || localStorage.getItem('supabase.auth.token');
      
      // Prepare exam dates object
      const examDates: { [key: string]: string } = {};
      subjects.forEach(subject => {
        examDates[subject.name] = subject.examDate;
      });

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e9ea3e56/ai/generate-routine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjects: subjects.map(s => `${s.name} (Priority: ${s.priority})`),
          examDates,
          studyHours,
          preferences: preferences || 'No specific preferences'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate study routine');
      }

      setGeneratedRoutine(data.routine);
      toast.success('Study routine generated successfully!');
      fetchSavedRoutines(); // Refresh saved routines
    } catch (error: any) {
      console.error('Generate routine error:', error);
      toast.error(error.message || 'Failed to generate study routine');
    } finally {
      setLoading(false);
    }
  };

  const downloadRoutine = () => {
    if (!generatedRoutine) return;

    const element = document.createElement('a');
    const file = new Blob([generatedRoutine], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'study-routine.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Study routine downloaded!');
  };

  const loadSavedRoutine = (routine: any) => {
    setGeneratedRoutine(routine.routine);
    setSubjects(routine.subjects?.map((s: string) => {
      const match = s.match(/^(.+?)\s*\(Priority:\s*(\w+)\)$/);
      return match ? {
        name: match[1],
        examDate: routine.examDates?.[match[1]] || '',
        priority: match[2] as 'high' | 'medium' | 'low'
      } : { name: s, examDate: '', priority: 'medium' as const };
    }) || []);
    setStudyHours(routine.studyHours || 4);
    setPreferences(routine.preferences || '');
    toast.success('Routine loaded!');
  };

  const clearAll = () => {
    setSubjects([]);
    setNewSubject({ name: '', examDate: '', priority: 'medium' });
    setStudyHours(4);
    setPreferences('');
    setGeneratedRoutine('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeUntilExam = (examDate: string) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past due';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-6 w-6 text-purple-600" />
            <span>AI Study Routine Planner</span>
          </CardTitle>
          <CardDescription>
            Create a personalized study schedule based on your subjects, exam dates, and available time
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Add Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Subjects</CardTitle>
              <CardDescription>Add subjects and their exam dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Subjects */}
              {subjects.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Subjects ({subjects.length})</Label>
                  <div className="space-y-2">
                    {subjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{subject.name}</span>
                            <Badge variant="outline" className={getPriorityColor(subject.priority)}>
                              {subject.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{new Date(subject.examDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{getTimeUntilExam(subject.examDate)}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeSubject(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Subject */}
              <div className="space-y-3 border-t pt-4">
                <Label>Add New Subject</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Subject name"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  />
                  <Input
                    type="date"
                    value={newSubject.examDate}
                    onChange={(e) => setNewSubject({ ...newSubject, examDate: e.target.value })}
                  />
                  <select
                    value={newSubject.priority}
                    onChange={(e) => setNewSubject({ ...newSubject, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <Button onClick={addSubject} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Study Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studyHours">Available Study Hours per Day</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="studyHours"
                    type="number"
                    min="1"
                    max="16"
                    value={studyHours}
                    onChange={(e) => setStudyHours(parseInt(e.target.value) || 4)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
              </div>

              <div>
                <Label htmlFor="preferences">Additional Preferences (Optional)</Label>
                <Textarea
                  id="preferences"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="e.g., Prefer morning study sessions, need more time for math, want breaks every hour..."
                  className="min-h-[100px]"
                />
              </div>

              <Button
                onClick={generateRoutine}
                disabled={loading || subjects.length === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Routine...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Study Routine
                  </>
                )}
              </Button>

              {subjects.length > 0 && (
                <Button onClick={clearAll} variant="outline" className="w-full">
                  Clear All
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {/* Generated Routine */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Study Routine</CardTitle>
                {generatedRoutine && (
                  <Button onClick={downloadRoutine} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedRoutine ? (
                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        AI-Generated Study Routine
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {generatedRoutine}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Routine Generated Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your subjects and preferences to generate a personalized study routine
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Routines */}
          {savedRoutines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Previous Routines</CardTitle>
                <CardDescription>Load your previously generated study routines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedRoutines.slice(0, 3).map((routine, index) => (
                    <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => loadSavedRoutine(routine)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-sm">
                            {routine.subjects?.length || 0} subjects
                          </span>
                          <Badge variant="outline">
                            {routine.studyHours}h/day
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(routine.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {routine.subjects?.slice(0, 3).join(', ')}
                        {routine.subjects?.length > 3 && '...'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📚 Study Tips:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Prioritize subjects with earlier exam dates</li>
                <li>• Take regular breaks to maintain focus</li>
                <li>• Review difficult topics multiple times</li>
                <li>• Create a consistent daily study schedule</li>
                <li>• Adjust the routine based on your progress</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}