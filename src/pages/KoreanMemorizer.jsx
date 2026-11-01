import { useEffect, useState } from 'react';
import words from '../data/korean-words.json';

const ALL_TOPICS = 'All topics';
const topics = [...new Set(words.map((word) => word.category))];
const topicDetails = {
  [ALL_TOPICS]: { icon: 'book', label: 'All topics' },
  Greetings: { icon: 'chat', label: 'Greetings' },
  Everyday: { icon: 'chat', label: 'Everyday words' },
  'Food & drink': { icon: 'food', label: 'Food & drinks' },
  'Shopping & money': { icon: 'bag', label: 'Shopping & money' },
  Work: { icon: 'work', label: 'Work' },
  Housing: { icon: 'home', label: 'Home & housing' },
  Transportation: { icon: 'transit', label: 'Transportation' },
  'Time & numbers': { icon: 'clock', label: 'Time' },
  Numbers: { icon: 'number', label: 'Numbers' },
  'Questions & responses': { icon: 'question', label: 'Questions' },
  'Days & months': { icon: 'calendar', label: 'Days & months' },
  Supermarket: { icon: 'basket', label: 'Supermarket' },
};

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
  const card = deck[current];
  const complete = current >= deck.length;

  const showAnswer = () => setRevealed((value) => !value);
  const next = () => {
    if (current < deck.length) setCurrent((value) => value + 1);
    setRevealed(false);
  };
  const previous = () => {
    if (current > 0) setCurrent((value) => value - 1);
    setRevealed(false);
  };
  const restart = () => {
    setCurrent(0);
    setRevealed(false);
  };
  const updateDeck = (nextTopic, nextCount, randomize = false) => {
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
    setTopic(nextTopic);
    updateDeck(nextTopic, count);
  };
  const shuffle = () => {
    setDeck(shuffled(deck));
    restart();
  };
  const anotherSet = () => {
    updateDeck(topic, count, true);
  };
  const topicWords = topic ? wordsForTopic(topic) : words;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== 'Space' || event.repeat || event.target instanceof HTMLButtonElement || event.target instanceof HTMLSelectElement) return;
      event.preventDefault();
      if (!complete) showAnswer();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [complete]);

  const flipCard = (event) => {
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
            <button className="korean-topics-back" onClick={() => setTopic(null)} aria-label="Back to topics">
              ‹ Topics
            </button>
          )}
          <h2>{topic ? topicDetails[topic]?.label ?? topic : 'K-words'}</h2>
        </div>
        {topic && (
          <label className="korean-count">
            <span className="dim">Cards</span>
            <select value={count === 'all' || Number(count) > topicWords.length ? 'all' : count} onChange={(event) => changeCount(event.target.value)} aria-label="Number of cards">
              {[10, 20, 30].map((value) => (
                <option key={value} value={value} disabled={value > topicWords.length}>{value} cards</option>
              ))}
              <option value="all">All {topic === ALL_TOPICS ? 'cards' : 'in topic'}</option>
            </select>
          </label>
        )}
      </header>

      {!topic ? (
        <section className="korean-topics" aria-label="Vocabulary topics">
          <div className="korean-topics-heading">
            <strong>Choose a topic</strong>
            <span className="dim">{words.length} words</span>
          </div>
          <div className="korean-topic-list">
            {[ALL_TOPICS, ...topics].map((item) => {
              const topicCount = item === ALL_TOPICS ? words.length : wordsForTopic(item).length;
              const details = topicDetails[item] ?? { icon: '📚', label: item };
              return (
                <button key={item} className="korean-topic" onClick={() => changeTopic(item)}>
                  <TopicIcon name={details.icon} />
                  <strong>{details.label}</strong>
                  <small>{topicCount} words</small>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <>

      <div className="korean-progress">
        <div className="row between">
          <span>{complete ? deck.length : current + 1} / {deck.length}</span>
          <span className="dim">{complete ? 'Complete' : 'Progress'}</span>
        </div>
        <div className="korean-progress-track" role="progressbar" aria-label="Session progress" aria-valuemin="0" aria-valuemax={deck.length} aria-valuenow={current}>
          <span style={{ width: `${(current / deck.length) * 100}%` }} />
        </div>
      </div>

      {complete ? (
        <section className="card korean-complete" aria-live="polite">
          <span className="korean-complete-mark" aria-hidden="true">✓</span>
          <h3>Nice work!</h3>
          <p className="dim">You finished all {deck.length} cards. Take a short break, or give them another round.</p>
          <button onClick={restart}>Start again</button>
          <button className="ghost" onClick={anotherSet}>Practise another set</button>
        </section>
      ) : (
        <>
          <div
            className={`card korean-card${revealed ? ' revealed' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={revealed ? 'Flashcard answer. Click or press Space to hide.' : 'Flashcard. Click or press Space to reveal the answer.'}
            onClick={flipCard}
            onKeyDown={flipCard}
          >
            <div className="korean-card-top">
              <span className="korean-category">{card.category === 'Everyday' ? 'Everyday words' : card.category}</span>
              <span className="dim">Tap card or press Space</span>
            </div>
            <div className="korean-word">
              <strong lang="ko">{card.korean}</strong>
              <span>{card.romanization}</span>
            </div>
            {revealed && (
              <div className="korean-answer">
                <div className="korean-translations">
                  <div><span>O'zbekcha</span><strong>{card.uz}</strong></div>
                  <div><span>English</span><strong>{card.en}</strong></div>
                </div>
                <div className="korean-example">
                  <span className="korean-example-label">Example</span>
                  <strong lang="ko">{card.example.korean}</strong>
                  <p>{card.example.en}</p>
                  <p>{card.example.uz}</p>
                </div>
              </div>
            )}
          </div>
          <div className="korean-actions">
            <button className="ghost" onClick={previous} disabled={current === 0}>Previous</button>
            <button onClick={showAnswer}>{revealed ? 'Hide Answer' : 'Reveal Answer'}</button>
            {revealed && <button className="ghost" onClick={next}>Next Card</button>}
          </div>
          <div className="korean-utility">
            <button className="back" onClick={shuffle}>Shuffle cards</button>
            <button className="back" onClick={restart}>Restart session</button>
          </div>
        </>
      )}
        </>
      )}
    </div>
  );
}
