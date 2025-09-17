# StudyAI - AI-Powered Personal Assistant for Students

A comprehensive web application designed to help students with homework, notes, quizzes, and study management using artificial intelligence.

## 🚀 Features

### 🤖 AI Chatbot (Study Helper)
- Intelligent tutoring in English and Bengali
- Step-by-step explanations for complex topics
- Math and physics problem solving
- Homework guidance and summaries

### 📝 Note Generator
- Generate study notes from text input
- OCR support for images and PDFs (simulated in demo)
- AI-powered content summarization
- Download notes as text files

### ⚡ Flashcard Creator
- Manual flashcard creation
- AI-generated flashcards from study material
- Interactive practice mode with shuffle
- Progress tracking and performance analytics

### 📅 Study Routine Planner
- Personalized daily/weekly study schedules
- AI-generated routines based on:
  - Subject priorities
  - Exam dates
  - Available study hours
  - Personal preferences

### 🧠 Quiz & MCQ Practice
- Topic-based multiple choice questions
- Customizable difficulty levels (Easy, Medium, Hard)
- AI explanations for correct/incorrect answers
- Performance tracking and detailed results

### 👤 User Management
- Secure authentication with Supabase
- Google and GitHub social login support
- User profiles with subscription management
- Data export and account management

### 💎 Premium Features
- **Free Plan**: 10 AI requests per day
- **Premium Plan**: Unlimited AI usage, advanced analytics, priority support

## 🛠️ Technology Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** component library
- **Lucide React** icons
- **Sonner** for notifications

### Backend
- **Supabase** for authentication and database
- **Hono** web framework for API endpoints
- **Deno** runtime environment

### AI Integration
- **OpenAI GPT-4o** for chat, notes, flashcards, and quiz generation
- Custom OCR simulation (ready for Tesseract.js or Google Vision API)

### Key Libraries
- `@supabase/supabase-js` - Supabase client
- `motion/react` - Animations
- `recharts` - Charts and graphs
- `sonner` - Toast notifications

## 🏗️ Architecture

```
StudyAI/
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── auth-screen.tsx        # Authentication UI
│   ├── dashboard.tsx          # Main dashboard
│   ├── chat-bot.tsx          # AI tutor interface
│   ├── note-generator.tsx    # Note creation tools
│   ├── flashcard-creator.tsx # Flashcard system
│   ├── study-routine-planner.tsx # Study planning
│   ├── quiz-practice.tsx     # Quiz system
│   ├── user-profile.tsx      # User management
│   └── theme-provider.tsx    # Theme context
├── supabase/
│   └── functions/server/     # Backend API
├── utils/
│   └── supabase/            # Supabase configuration
├── styles/
│   └── globals.css          # Global styles
└── App.tsx                  # Main application
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ or Deno
- OpenAI API key
- Supabase project

### Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studyai.git
   cd studyai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Configure authentication providers (optional: Google, GitHub)
   - Update environment variables

4. **Configure OpenAI**
   - Get API key from OpenAI
   - Add to environment variables

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📱 Mobile Support

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

For native mobile apps, the architecture supports React Native/Expo integration.

## 🔐 Security & Privacy

- Secure authentication with Supabase
- API keys stored securely on server-side
- User data encrypted in transit and at rest
- GDPR-compliant data handling

## 🎯 Usage Guide

### Getting Started
1. **Sign Up**: Create an account using email or social login
2. **Explore Dashboard**: Get familiar with all available features
3. **Start Learning**: Begin with the AI tutor or create your first notes

### Best Practices
- **AI Tutor**: Ask specific questions for better responses
- **Notes**: Provide clear, well-structured source material
- **Flashcards**: Keep questions concise and answers complete
- **Study Plans**: Be realistic about available study time
- **Quizzes**: Review explanations to understand concepts

## 🛣️ Roadmap

### Planned Features
- [ ] Voice input for hands-free interaction
- [ ] Advanced analytics and progress tracking
- [ ] Collaborative study groups
- [ ] Mobile app (React Native/Expo)
- [ ] Offline mode support
- [ ] Integration with popular learning platforms
- [ ] Gamification with achievements and streaks
- [ ] Export to multiple formats (PDF, Word, etc.)

### Technical Improvements
- [ ] Real OCR implementation (Tesseract.js/Google Vision)
- [ ] Advanced caching strategies
- [ ] Performance optimizations
- [ ] Multi-language support expansion
- [ ] Accessibility improvements

## 🧪 Testing

### Demo Accounts
```
Email: demo@studyai.com
Password: demo123
```

### Test Features
- Generate notes from sample text
- Create flashcards on any topic
- Take quizzes in different subjects
- Upgrade/downgrade subscription (demo mode)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@studyai.com
- Documentation: [Link to docs]

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4o API
- Supabase for backend infrastructure
- Shadcn for beautiful UI components
- The open-source community for amazing tools and libraries

---

**Built with ❤️ for students worldwide**

*StudyAI - Making learning smarter, one AI interaction at a time.*