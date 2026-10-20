import { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage.jsx';
import { RatePage, useRates } from './pages/ExchangeRatePage.jsx';
import Translator from './pages/TranslatePage.jsx';
import Teacher from './pages/TeacherPage.jsx';
import Clipboard from './pages/ClipboardPage.jsx';
import BigTextPage from './pages/BigTextPage.jsx';

export default function App() {
  const [page, setPage] = useState('home');
  const rates = useRates();
  const home = () => setPage('home');

  return (
    <>
      <div className="glow" />
      <div className="app">
        {page === 'home' && <HomePage rates={rates} openRate={() => setPage('rate')} openTool={setPage} />}
        {page === 'rate' && <RatePage rates={rates} back={home} />}
        {page === 'translate' && <Translator back={home} />}
        {page === 'teach' && <Teacher back={home} />}
        {page === 'clip' && <Clipboard back={home} />}
        {page === 'big-text' && <BigTextPage back={home} />}
      </div>
    </>
  );
}
