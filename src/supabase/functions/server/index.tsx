import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Authentication middleware for protected routes
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
};

// Health check endpoint
app.get("/make-server-e9ea3e56/health", (c) => {
  return c.json({ status: "ok" });
});

// User Registration
app.post("/make-server-e9ea3e56/auth/register", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields: email, password, name' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Registration error:', error);
      return c.json({ error: `Registration failed: ${error.message}` }, 400);
    }

    // Initialize user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      createdAt: new Date().toISOString(),
      subscription: 'free',
      dailyApiCalls: 0,
      lastApiCallDate: new Date().toDateString()
    });

    return c.json({ 
      message: 'User registered successfully', 
      user: { id: data.user.id, email: data.user.email, name } 
    });
  } catch (error) {
    console.log('Registration error:', error);
    return c.json({ error: 'Internal server error during registration' }, 500);
  }
});

// AI Chat endpoint
app.post("/make-server-e9ea3e56/ai/chat", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { message, language = 'english' } = await c.req.json();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Check user's daily API limit
    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    const today = new Date().toDateString();
    let dailyApiCalls = userProfile.dailyApiCalls || 0;
    
    if (userProfile.lastApiCallDate !== today) {
      dailyApiCalls = 0;
    }

    if (userProfile.subscription === 'free' && dailyApiCalls >= 10) {
      return c.json({ error: 'Daily API limit reached. Please upgrade to premium for unlimited usage.' }, 429);
    }

    const systemPrompt = language === 'bengali' 
      ? "You are a helpful AI tutor for students. Respond in Bengali. Provide clear explanations, step-by-step solutions for math/physics problems, and help with homework. Keep your responses educational and encouraging."
      : "You are a helpful AI tutor for students. Provide clear explanations, step-by-step solutions for math/physics problems, and help with homework. Keep your responses educational and encouraging.";

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('OpenAI API error:', errorText);
      return c.json({ error: 'AI service temporarily unavailable' }, 503);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    // Update user's API call count
    await kv.set(`user:${userId}`, {
      ...userProfile,
      dailyApiCalls: dailyApiCalls + 1,
      lastApiCallDate: today
    });

    // Save chat history
    const chatHistoryKey = `chat:${userId}:${Date.now()}`;
    await kv.set(chatHistoryKey, {
      userId,
      message,
      response: aiResponse,
      language,
      timestamp: new Date().toISOString()
    });

    return c.json({ 
      response: aiResponse,
      remainingCalls: userProfile.subscription === 'free' ? (9 - dailyApiCalls) : -1
    });
  } catch (error) {
    console.log('AI chat error:', error);
    return c.json({ error: 'Failed to process AI chat request' }, 500);
  }
});

// Generate Notes from text
app.post("/make-server-e9ea3e56/ai/generate-notes", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { text, topic } = await c.req.json();

    if (!text) {
      return c.json({ error: 'Text content is required' }, 400);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert note-taking assistant. Create concise, well-structured study notes from the provided text. Use bullet points, headings, and highlight key concepts. Make it easy to understand for students.' 
          },
          { 
            role: 'user', 
            content: `Create study notes for the topic "${topic || 'General Study Notes'}" from this text:\n\n${text}` 
          }
        ],
        max_tokens: 1500,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      return c.json({ error: 'Failed to generate notes' }, 503);
    }

    const data = await response.json();
    const notes = data.choices[0]?.message?.content;

    // Save notes to user's collection
    const noteId = `note:${userId}:${Date.now()}`;
    await kv.set(noteId, {
      userId,
      topic: topic || 'Untitled Notes',
      content: notes,
      originalText: text,
      createdAt: new Date().toISOString()
    });

    return c.json({ notes, noteId });
  } catch (error) {
    console.log('Generate notes error:', error);
    return c.json({ error: 'Failed to generate notes' }, 500);
  }
});

// Generate Flashcards
app.post("/make-server-e9ea3e56/ai/generate-flashcards", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { text, count = 5 } = await c.req.json();

    if (!text) {
      return c.json({ error: 'Text content is required' }, 400);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: `Create exactly ${count} flashcards from the provided text. Return ONLY a JSON array with objects containing 'question' and 'answer' fields. Make questions clear and answers concise but complete.` 
          },
          { 
            role: 'user', 
            content: `Create ${count} flashcards from this text:\n\n${text}` 
          }
        ],
        max_tokens: 1000,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      return c.json({ error: 'Failed to generate flashcards' }, 503);
    }

    const data = await response.json();
    let flashcards;
    
    try {
      flashcards = JSON.parse(data.choices[0]?.message?.content);
    } catch {
      // Fallback if AI doesn't return proper JSON
      const content = data.choices[0]?.message?.content;
      flashcards = [{ question: "Generated Content", answer: content }];
    }

    // Save flashcard set
    const flashcardSetId = `flashcards:${userId}:${Date.now()}`;
    await kv.set(flashcardSetId, {
      userId,
      flashcards,
      sourceText: text,
      createdAt: new Date().toISOString()
    });

    return c.json({ flashcards, flashcardSetId });
  } catch (error) {
    console.log('Generate flashcards error:', error);
    return c.json({ error: 'Failed to generate flashcards' }, 500);
  }
});

// Generate Study Routine
app.post("/make-server-e9ea3e56/ai/generate-routine", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { subjects, examDates, studyHours, preferences } = await c.req.json();

    if (!subjects || !examDates || !studyHours) {
      return c.json({ error: 'Subjects, exam dates, and study hours are required' }, 400);
    }

    const prompt = `Create a personalized study routine for a student with the following:
    - Subjects: ${subjects.join(', ')}
    - Exam dates: ${JSON.stringify(examDates)}
    - Available study hours per day: ${studyHours}
    - Preferences: ${preferences || 'None specified'}
    
    Provide a detailed weekly schedule with specific time allocations for each subject, considering exam priorities and optimal learning patterns. Format as a structured plan.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert study planner. Create detailed, realistic study routines that help students manage their time effectively and prepare for exams systematically.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      return c.json({ error: 'Failed to generate study routine' }, 503);
    }

    const data = await response.json();
    const routine = data.choices[0]?.message?.content;

    // Save routine
    const routineId = `routine:${userId}:${Date.now()}`;
    await kv.set(routineId, {
      userId,
      subjects,
      examDates,
      studyHours,
      preferences,
      routine,
      createdAt: new Date().toISOString()
    });

    return c.json({ routine, routineId });
  } catch (error) {
    console.log('Generate routine error:', error);
    return c.json({ error: 'Failed to generate study routine' }, 500);
  }
});

// Generate Quiz Questions
app.post("/make-server-e9ea3e56/ai/generate-quiz", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { topic, difficulty = 'medium', questionCount = 5 } = await c.req.json();

    if (!topic) {
      return c.json({ error: 'Topic is required' }, 400);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: `Create ${questionCount} multiple choice questions about ${topic} at ${difficulty} difficulty level. Return ONLY a JSON array with objects containing: 'question', 'options' (array of 4 choices), 'correctAnswer' (index 0-3), and 'explanation'. Make questions educational and challenging.` 
          },
          { 
            role: 'user', 
            content: `Generate ${questionCount} ${difficulty} level MCQ questions about: ${topic}` 
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return c.json({ error: 'Failed to generate quiz' }, 503);
    }

    const data = await response.json();
    let questions;
    
    try {
      questions = JSON.parse(data.choices[0]?.message?.content);
    } catch {
      return c.json({ error: 'Failed to parse quiz questions' }, 500);
    }

    // Save quiz
    const quizId = `quiz:${userId}:${Date.now()}`;
    await kv.set(quizId, {
      userId,
      topic,
      difficulty,
      questions,
      createdAt: new Date().toISOString()
    });

    return c.json({ questions, quizId });
  } catch (error) {
    console.log('Generate quiz error:', error);
    return c.json({ error: 'Failed to generate quiz' }, 500);
  }
});

// Get user's saved content
app.get("/make-server-e9ea3e56/user/content", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    // Get all user content by prefix
    const notes = await kv.getByPrefix(`note:${userId}:`);
    const flashcards = await kv.getByPrefix(`flashcards:${userId}:`);
    const routines = await kv.getByPrefix(`routine:${userId}:`);
    const quizzes = await kv.getByPrefix(`quiz:${userId}:`);

    return c.json({
      notes: notes || [],
      flashcards: flashcards || [],
      routines: routines || [],
      quizzes: quizzes || []
    });
  } catch (error) {
    console.log('Get user content error:', error);
    return c.json({ error: 'Failed to retrieve user content' }, 500);
  }
});

// Get user profile
app.get("/make-server-e9ea3e56/user/profile", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json(userProfile);
  } catch (error) {
    console.log('Get user profile error:', error);
    return c.json({ error: 'Failed to retrieve user profile' }, 500);
  }
});

// Update user subscription
app.post("/make-server-e9ea3e56/user/subscription", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { subscription } = await c.req.json();

    if (!['free', 'premium'].includes(subscription)) {
      return c.json({ error: 'Invalid subscription type' }, 400);
    }

    const userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    await kv.set(`user:${userId}`, {
      ...userProfile,
      subscription,
      updatedAt: new Date().toISOString()
    });

    return c.json({ message: 'Subscription updated successfully', subscription });
  } catch (error) {
    console.log('Update subscription error:', error);
    return c.json({ error: 'Failed to update subscription' }, 500);
  }
});

Deno.serve(app.fetch);