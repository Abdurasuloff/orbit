 import { useEffect, useRef, useState } from 'react';
import words from '../data/korean-words.js';

const ALL_TOPICS = 'Barcha mavzular';
const topics = [...new Set(words.map((word) => word.category))];
const topicIcons = {
  Davlatlar: 'book',
  "Kasblar va mashg'ulotlar": 'work',
  'Xitoy-koreys sonlari': 'number',
  'Tub koreys sonlari': 'number',
  'Oila, shaxslar va kishilik olmoshlari': 'chat',
  'Binolar, inshootlar va joylar': 'home',
  "Joylashuv va yo'nalishlar": 'transit',
  "O'quv qurollari va jihozlar": 'book',
  'Yemak, ichimlik va mevalar': 'food',
  'Kiyim-kechak va ranglar': 'bag',
  'Vaqt, sanalar va fasllar': 'calendar',
  'Transport va harakatlanish': 'transit',
  Sifatlar: 'question',
  "Asosiy fe'llar va harakatlar": 'work',
  "Muhim iboralar va grammatik qo'shimchalar": 'chat',
};

const INITIALS = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const VOWELS = ['a', 'e', 'ya', 'ye', "o'", 'e', "yo'", 'ye', 'o', 'wa', 'we', 'we', 'yo', 'u', "wo'", 'we', 'wi', 'yu', 'i', 'ui', 'i'];
const FINALS = ['', 'k', 'k', 'ks', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'ps', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
const LIAISON_INITIALS = { 1: 0, 2: 1, 4: 2, 7: 3, 8: 5, 16: 6, 17: 7, 19: 9, 20: 10, 22: 12, 23: 14, 24: 15, 25: 16, 26: 17 };

function pronunciationFor(text) {
  const syllables = Array.from(text, (character) => {
    const code = character.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return { source: character, isHangul: false };

    const value = code - 0xac00;
    return {
      source: character,
      isHangul: true,
      initial: Math.floor(value / 588),
      vowel: Math.floor((value % 588) / 28),
      final: value % 28,
    };
  });

  for (let index = 0; index < syllables.length - 1; index += 1) {
    const current = syllables[index];
    const next = syllables[index + 1];
    if (!current.isHangul || !next.isHangul || next.initial !== 11) continue;

    const initial = LIAISON_INITIALS[current.final];
    if (initial !== undefined) {
      next.initial = initial;
      current.final = 0;
    }
  }

  return syllables.map((syllable, index) => {
    if (!syllable.isHangul) return syllable.source;

    let initial = INITIALS[syllable.initial];
    if ([9, 10].includes(syllable.initial) && [2, 3, 6, 7, 12, 17, 20].includes(syllable.vowel)) {
      initial = syllable.initial === 9 ? 'sh' : 'shsh';
    }
    const sound = `${initial}${VOWELS[syllable.vowel]}${FINALS[syllable.final]}`;
    return index > 0 && syllables[index - 1].isHangul ? `-${sound}` : sound;
  }).join('');
}

function TopicIcon({ name }) {
  const icons = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" /><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20" /></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2 1-4.5a7.5 7.5 0 1 1 16-5z" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></>,
    food: <><path d="M4 11h16a8 8 0 0 1-16 0zM3 11h18M7 5l2 3M12 4v4M17 5l-2 3" /></>,
    bag: <><path d="M5 8h14l1 13H4zM9 8V6a3 3 0 0 1 6 0v2" /><path d="M9 12v2M15 12v2" /></>,
    work: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" /></>,
    transit: <><rect x="5" y="3" width="14" height="16" rx="3" /><path d="M8 7h8v5H8zM8 19l-2 3M16 19l2 3M8 16h.01M16 16h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    number: <><path d="M8 4 6 20M16 4l-2 16M4 9h16M3 15h16" /></>,
    question: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1 .9-1.7 1.2-1.7 2.7M12 17h.01" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2" /></>,
    basket: <><path d="m4 10 2 10h12l2-10zM3 10h18M8 10l4-7 4 7" /></>,
  };
  return <svg className="korean-topic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
}

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function wordsForTopic(topic) {
  return topic === ALL_TOPICS ? words : words.filter((word) => word.category === topic);
}

export default function KoreanMemorizer({ back }) {
  const [count, setCount] = useState(20);
  const [topic, setTopic] = useState(null);
  const [deck, setDeck] = useState(() => words.slice(0, 20));
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [view, setView] = useState('cards');
  const [hiddenColumns, setHiddenColumns] = useState(() => new Set());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMessage, setSpeechMessage] = useState('');
  const touchStart = useRef(null);
  const suppressClick = useRef(false);
  const speechUtterance = useRef(null);
  const card = deck[current];
  const complete = current >= deck.length;

  const cancelSpeech = () => {
    speechUtterance.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeechMessage('');
  };
  const readWordAloud = () => {
    if (speechUtterance.current) {
      cancelSpeech();
      return;
    }
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setSpeechMessage("Bu brauzer ovoz chiqarib o'qishni qo'llab-quvvatlamaydi.");
      return;
    }

    setSpeechMessage('');
    const utterance = new SpeechSynthesisUtterance(card.korean);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.8;
    utterance.voice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('ko')) ?? null;
    utterance.onstart = () => {
      if (speechUtterance.current === utterance) setIsSpeaking(true);
    };
    utterance.onend = () => {
      if (speechUtterance.current !== utterance) return;
      speechUtterance.current = null;
      setIsSpeaking(false);
    };
    utterance.onerror = (event) => {
      if (speechUtterance.current !== utterance) return;
      speechUtterance.current = null;
      setIsSpeaking(false);
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        setSpeechMessage("So'zni ovoz chiqarib o'qib bo'lmadi.");
      }
    };
    speechUtterance.current = utterance;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  const showAnswer = () => setRevealed((value) => !value);
  const next = () => {
    if (current < deck.length) setCurrent((value) => value + 1);
    cancelSpeech();
    setRevealed(false);
  };
  const previous = () => {
    if (current > 0) setCurrent((value) => value - 1);
    cancelSpeech();
    setRevealed(false);
  };
  const restart = () => {
    cancelSpeech();
    setCurrent(0);
    setRevealed(false);
  };
  const updateDeck = (nextTopic, nextCount, randomize = false) => {
    cancelSpeech();
    const source = wordsForTopic(nextTopic);
    const ordered = randomize ? shuffled(source) : source;
    setDeck(ordered.slice(0, nextCount === 'all' ? ordered.length : Number(nextCount)));
    setCurrent(0);
    setRevealed(false);
  };
  const changeCount = (value) => {
    setCount(value === 'all' ? 'all' : Number(value));
    updateDeck(topic, value);
  };
  const changeTopic = (nextTopic) => {
    cancelSpeech();
    setTopic(nextTopic);
    setView('cards');
    setHiddenColumns(new Set());
    updateDeck(nextTopic, count);
  };
  const shuffle = () => {
    setDeck(shuffled(deck));
    restart();
  };
  const anotherSet = () => {
    updateDeck(topic, count, true);
  };
  const changeView = (nextView) => {
    cancelSpeech();
    setView(nextView);
  };
  const topicWords = topic ? wordsForTopic(topic) : words;
  const handleTouchStart = (event) => {
    const touch = event.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (event) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    suppressClick.current = true;
    if (deltaX < 0) next();
    else previous();
    window.setTimeout(() => { suppressClick.current = false; }, 400);
  };
  const toggleColumn = (column) => {
    setHiddenColumns((previousHidden) => {
      const updated = new Set(previousHidden);
      if (updated.has(column)) updated.delete(column);
      else updated.add(column);
      return updated;
    });
  };
  const renderColumnVisibilityButton = (column, label) => {
    const isHidden = hiddenColumns.has(column);
    return (
      <button
        className="korean-eye-button"
        onClick={() => toggleColumn(column)}
        aria-label={`${isHidden ? "Ko'rsatish" : 'Yashirish'}: ${label}`}
        aria-pressed={isHidden}
        title={`${isHidden ? "Ko'rsatish" : 'Yashirish'}: ${label}`}
      >
        {isHidden ? (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.7 10.7 0 0 1 12 5c5.5 0 9 7 9 7a15 15 0 0 1-3.1 3.8M6.2 6.2C3.9 7.8 3 12 3 12s3.5 7 9 7a9.8 9.8 0 0 0 3-.5" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" /><circle cx="12" cy="12" r="2.5" /></svg>
        )}
      </button>
    );
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== 'Space' || event.repeat || event.target instanceof HTMLButtonElement || event.target instanceof HTMLSelectElement) return;
      event.preventDefault();
      if (!complete) showAnswer();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [complete]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const flipCard = (event) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    if (event.type === 'keydown') {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!complete) showAnswer();
  };

  return (
    <div className="korean-page page">
      <button className="back" onClick={back}>‹ Orbit</button>
      <header className="korean-header">
        <div>
          {topic && (
            <button className="korean-topics-back" onClick={() => setTopic(null)} aria-label="Mavzularga qaytish">
              ‹ Mavzular
            </button>
          )}
          <h2>{topic || 'K-words'}</h2>
        </div>
        {topic && (
          <label className="korean-count">
            <span className="dim">Kartochkalar</span>
            <select value={count === 'all' || Number(count) > topicWords.length ? 'all' : count} onChange={(event) => changeCount(event.target.value)} aria-label="Kartochkalar soni">
              {[10, 20, 30].map((value) => (
                <option key={value} value={value} disabled={value > topicWords.length}>{value} ta</option>
              ))}
              <option value="all">{topic === ALL_TOPICS ? 'Barchasi' : 'Mavzudagilarning barchasi'}</option>
            </select>
          </label>
        )}
      </header>

      {!topic ? (
        <section className="korean-topics" aria-label="Lug'at mavzulari">
          <div className="korean-topics-heading">
            <strong>Mavzuni tanlang</strong>
            <span className="dim">{words.length} ta kartochka</span>
          </div>
          <div className="korean-topic-list">
            {[ALL_TOPICS, ...topics].map((item) => {
              const topicCount = item === ALL_TOPICS ? words.length : wordsForTopic(item).length;
              const details = item === ALL_TOPICS
                ? { icon: 'book', label: ALL_TOPICS }
                : { icon: topicIcons[item] ?? 'book', label: item };
              return (
                <button key={item} className="korean-topic" onClick={() => changeTopic(item)}>
                  <TopicIcon name={details.icon} />
                  <strong>{details.label}</strong>
                  <small>{topicCount} ta kartochka</small>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <>

      <div className="korean-view-toggle" role="group" aria-label="Lug'at ko'rinishi">
        <button className={view === 'cards' ? 'on' : 'ghost'} onClick={() => changeView('cards')}>Kartochkalar</button>
        <button className={view === 'list' ? 'on' : 'ghost'} onClick={() => changeView('list')}>So'zlar ro'yxati</button>
      </div>
      <p className="korean-pronunciation-note dim">Talaffuz o'zbekcha harflarda taxminiy yozilgan.</p>

      {view === 'list' ? (
        <div className="korean-word-table-wrap">
          <table className="korean-word-table">
            <thead>
              <tr>
                <th scope="col"><span>Koreyscha</span>{renderColumnVisibilityButton('korean', 'koreyscha')}</th>
                <th scope="col"><span>Talaffuzi (o'zbekcha)</span>{renderColumnVisibilityButton('pronunciation', 'talaffuz')}</th>
                <th scope="col"><span>O'zbekcha ma'nosi</span>{renderColumnVisibilityButton('translation', "o'zbekcha ma'no")}</th>
              </tr>
            </thead>
            <tbody>
              {topicWords.map((word) => (
                <tr key={word.id}>
                  <td lang="ko" className={`korean-table-word${hiddenColumns.has('korean') ? ' blurred' : ''}`}>{word.korean}</td>
                  <td className={hiddenColumns.has('pronunciation') ? 'blurred' : ''}>{pronunciationFor(word.korean)}</td>
                  <td lang="uz" className={hiddenColumns.has('translation') ? 'blurred' : ''}>{word.uz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
      <>
      <div className="korean-progress">
        <div className="row between">
          <span>{complete ? deck.length : current + 1} / {deck.length}</span>
          <span className="dim">{complete ? 'Yakunlandi' : 'Jarayon'}</span>
        </div>
        <div className="korean-progress-track" role="progressbar" aria-label="Mashg'ulot jarayoni" aria-valuemin="0" aria-valuemax={deck.length} aria-valuenow={current}>
          <span style={{ width: `${(current / deck.length) * 100}%` }} />
        </div>
      </div>

      {complete ? (
        <section className="card korean-complete" aria-live="polite">
          <span className="korean-complete-mark" aria-hidden="true">✓</span>
          <h3>Barakalla!</h3>
          <p className="dim">{deck.length} ta kartochkani tugatdingiz. Yana bir marta takrorlang yoki yangi to'plamni boshlang.</p>
          <button onClick={restart}>Qaytadan boshlash</button>
          <button className="ghost" onClick={anotherSet}>Boshqa to'plam</button>
        </section>
      ) : (
        <>
          <div
            className={`card korean-card${revealed ? ' revealed' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={revealed ? "Javob ko'rsatilgan. Yashirish uchun bosing yoki Space tugmasini bosing." : "Javobni ko'rish uchun bosing yoki Space tugmasini bosing."}
            onClick={flipCard}
            onKeyDown={flipCard}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="korean-card-top">
              <span className="korean-category">{card.category === 'Everyday' ? 'Everyday words' : card.category}</span>
              <span className="dim">Bosing yoki Space tugmasini bosing</span>
            </div>
            <div className="korean-word">
              <strong lang="ko">{card.korean}</strong>
              <span>{pronunciationFor(card.korean)}</span>
            </div>
            {revealed && (
              <div className="korean-answer">
                <div className="korean-meaning">
                  <span>O'zbekcha ma'nosi</span>
                  <strong lang="uz">{card.uz}</strong>
                </div>
              </div>
            )}
          </div>
          <div className="korean-speech-control">
            <button
              className="ghost korean-speech-button"
              onClick={readWordAloud}
              aria-label={isSpeaking ? "Talaffuzni to'xtatish" : "Koreyscha so'zni ovoz chiqarib o'qish"}
              aria-pressed={isSpeaking}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {isSpeaking
                  ? <path d="M8 5h3v14H8zM15 5h3v14h-3z" />
                  : <><path d="M4 10v4h4l5 4V6l-5 4z" /><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a8.5 8.5 0 0 1 0 11" /></>}
              </svg>
              {isSpeaking ? "To'xtatish" : "Ovoz chiqarib o'qish"}
            </button>
            {speechMessage && <span className="korean-speech-message" role="status">{speechMessage}</span>}
          </div>
          <div className="korean-actions">
            <button className="ghost" onClick={previous} disabled={current === 0}>Oldingi</button>
            <button onClick={showAnswer}>{revealed ? "Javobni yashirish" : "Javobni ko'rsatish"}</button>
            {revealed && <button className="ghost" onClick={next}>Keyingisi</button>}
          </div>
          <div className="korean-utility">
            <button className="back" onClick={shuffle}>Aralashtirish</button>
            <button className="back" onClick={restart}>Boshidan boshlash</button>
          </div>
        </>
      )}
      </>
      )}
        </>
      )}
    </div>
  );
}
