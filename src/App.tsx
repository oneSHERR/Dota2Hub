import { Routes, Route } from 'react-router-dom';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { HomePage } from '@/components/HomePage';
import { DraftPage } from '@/components/draft/DraftPage';
import { WikiPage } from '@/components/wiki/WikiPage';
import { QuizPage } from '@/components/quiz/QuizPage';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { AuthPage } from '@/components/auth/AuthPage';
import { PatchNotesPage } from '@/components/patch/PatchNotesPage';
import { TierListPage } from '@/components/tierlist/TierListPage';
import { DraftCalculatorPage } from '@/components/calculator/DraftCalculatorPage';
import { CounterpickQuizPage } from '@/components/counterpick/CounterpickQuizPage';
import { NewsPage } from '@/components/news/NewsPage';

function App() {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      <div className="min-h-screen bg-dota-bg noise-bg">
        <Navbar />
        <main className="page-enter">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/draft" element={<DraftPage />} />
            <Route path="/wiki" element={<WikiPage />} />
            <Route path="/tierlist" element={<TierListPage />} />
            <Route path="/calculator" element={<DraftCalculatorPage />} />
            <Route path="/counterpick" element={<CounterpickQuizPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/patch" element={<PatchNotesPage />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
