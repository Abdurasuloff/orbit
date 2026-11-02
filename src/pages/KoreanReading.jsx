import { useState } from 'react';
import { consonants, syllables, vowels, words } from '../data/hangul-reading.js';

const PRACTICE_LENGTH = 10;

const practiceModes = [
  {
    id: 'consonants',
    label: 'Undoshlar',
    questions: consonants.map(({ letter, sound }) => ({
      display: letter,
      answer: sound,
    })),
  },
  {
    id: 'vowels',
    label: 'Unlilar',
    questions: vowels.map(({ letter, sound }) => ({
      display: letter,
      answer: sound,
    })),
  },
  { id: 'syllables', label: "Bo'g'inlar", questions: syllables },
  {
    id: 'words',
    label: "So'zlar",
    questions: words.map(({ display, answer, meaning }) => ({
      display,
      answer,
      hint: `Ma'nosi: ${meaning}`,
    })),
  },
];

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function createRound(mode) {
  const questions = shuffled(mode.questions).slice(0, PRACTICE_LENGTH);
  return questions.map((question) => {
    const alternatives = [...new Set(
      shuffled(mode.questions.filter((option) => option.answer !== question.answer))
        .map((option) => option.answer),
    )].slice(0, 3);

    return {
      ...question,
      choices: shuffled([question.answer, ...alternatives]),
    };
  });
}

function AlphabetSection({ title, description, items }) {
  return (
    <section className="reading-section">
      <div className="reading-section-heading">
        <h3>{title}</h3>
        <p className="dim">{description}</p>
      </div>
      <div className="reading-letter-grid">
        {items.map((item) => (
          <article className="reading-letter" key={item.letter}>
            <strong lang="ko">{item.letter}</strong>
            <span>{item.sound}</span>
            <small>{item.name}</small>
            <div className="reading-example">
              <span lang="ko">{item.example}</span>
              <span>{item.exampleReading}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function KoreanReading({ back }) {
  const [view, setView] = useState('learn');
  const [modeId, setModeId] = useState('consonants');
  const [round, setRound] = useState(() => createRound(practiceModes[0]));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const mode = practiceModes.find((item) => item.id === modeId);
  const question = round[current];
  const complete = current >= round.length;

  const startRound = (nextModeId = modeId) => {
    const nextMode = practiceModes.find((item) => item.id === nextModeId);
    setModeId(nextModeId);
    setRound(createRound(nextMode));
    setCurrent(0);
    setSelected(null);
    setScore(0);
  };

  const selectAnswer = (answer) => {
    if (selected !== null) return;
    setSelected(answer);
    if (answer === question.answer) setScore((value) => value + 1);
  };

  const nextQuestion = () => {
    setCurrent((value) => value + 1);
    setSelected(null);
  };

  return (
    <main className="page reading-page">
      <button className="back" onClick={back}>‹ Orbit</button>
      <header className="reading-header">
        <div className="reading-title">
          <span lang="ko" aria-hidden="true">한글</span>
          <div>
            <h2>Koreyscha o'qish</h2>
            <p className="dim">Hangul alifbosi va o'qish mashqlari</p>
          </div>
        </div>
      </header>

      <div className="reading-tabs" role="group" aria-label="O'rganish usuli">
        <button className={view === 'learn' ? 'on' : 'ghost'} onClick={() => setView('learn')}>Alifboni o'rganish</button>
        <button className={view === 'practice' ? 'on' : 'ghost'} onClick={() => setView('practice')}>O'qishni mashq qilish</button>
      </div>

      {view === 'learn' ? (
        <div className="reading-lesson">
          <section className="card reading-intro">
            <span className="reading-eyebrow">Yangi boshlovchilar uchun</span>
            <h3>Hangul — koreys alifbosi</h3>
            <p>Asosiy alifboda 14 ta sodda undosh va 10 ta sodda unli bor. Ularga qo'shaloq undoshlar va qo'shma unlilar qo'shiladi.</p>
            <p className="reading-pronunciation-note">Talaffuz o'zbekcha harflarda taxminiy yoziladi. Koreys tilidagi ayrim tovushlarning o'zbek tilida aynan muqobili yo'q.</p>
          </section>

          <AlphabetSection
            title={`Undosh harflar · ${consonants.length} ta`}
            description="Birinchi tovush so'z boshida, ikkinchisi bo'g'in oxirida qanday aytilishini ko'rsatadi."
            items={consonants}
          />

          <AlphabetSection
            title={`Unli harflar · ${vowels.length} ta`}
            description="ㅓ — o‘, ㅡ — labni kulmasdan aytiladigan qisqa i. Bu tovushlar taxminan berilgan."
            items={vowels}
          />

          <section className="card reading-lesson-card">
            <span className="reading-eyebrow">1-qoida</span>
            <h3>Harflar bo'g'in blokiga yig'iladi</h3>
            <p>Har bir blok bir bo'g'in hisoblanadi. Unli harf mustaqil yozilmaydi — oldiga talaffuz qilinmaydigan ㅇ qo'yiladi.</p>
            <div className="reading-block-examples">
              <div><strong lang="ko">ㄱ + ㅏ = 가</strong><span>g + a = ga</span></div>
              <div><strong lang="ko">ㄱ + ㅗ = 고</strong><span>g + o = go</span></div>
              <div><strong lang="ko">ㄱ + ㅏ + ㄴ = 간</strong><span>g + a + n = gan</span></div>
              <div><strong lang="ko">ㅇ + ㅏ = 아</strong><span>jim + a = a</span></div>
            </div>
          </section>

          <section className="card reading-lesson-card">
            <span className="reading-eyebrow">2-qoida · 받침</span>
            <h3>Bo'g'in oxiridagi undosh</h3>
            <p>Pastda yozilgan oxirgi undosh <span lang="ko">받침</span> deyiladi. Bo'g'in oxirida undoshlar odatda yettita asosiy tovushdan biriga yaqin aytiladi:</p>
            <div className="reading-ending-list">
              <div><strong lang="ko">ㄱ ㄲ ㅋ</strong><span>k · 국 <b>guk</b></span></div>
              <div><strong lang="ko">ㄴ</strong><span>n · 산 <b>san</b></span></div>
              <div><strong lang="ko">ㄷ ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ</strong><span>t · 옷 <b>ot</b></span></div>
              <div><strong lang="ko">ㄹ</strong><span>l · 물 <b>mul</b></span></div>
              <div><strong lang="ko">ㅁ</strong><span>m · 밤 <b>bam</b></span></div>
              <div><strong lang="ko">ㅂ ㅍ</strong><span>p · 밥 <b>bap</b></span></div>
              <div><strong lang="ko">ㅇ</strong><span>ng · 공 <b>gong</b></span></div>
            </div>
            <p className="reading-pronunciation-note">Agar bo'g'in oxiridagi undoshdan keyin unli kelsa, u keyingi bo'g'inga ulanib eshitilishi mumkin: 한국어 — han-gu-go‘.</p>
          </section>

          <button onClick={() => setView('practice')}>O'qishni mashq qilish <span aria-hidden="true">→</span></button>
        </div>
      ) : (
        <section className="reading-practice">
          <div className="reading-mode-list" role="group" aria-label="Mashq turi">
            {practiceModes.map((item) => (
              <button
                className={modeId === item.id ? 'on' : 'ghost'}
                key={item.id}
                onClick={() => startRound(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="reading-progress">
            <span>{complete ? round.length : current + 1} / {round.length}</span>
            <span className="dim">{complete ? `${score} ta to'g'ri javob` : `${mode.label} mashqi`}</span>
          </div>
          <div className="reading-progress-track" role="progressbar" aria-label="Mashq jarayoni" aria-valuemin={0} aria-valuemax={round.length} aria-valuenow={current}>
            <span style={{ width: `${(current / round.length) * 100}%` }} />
          </div>

          {complete ? (
            <div className="card reading-result" aria-live="polite">
              <span className="reading-result-score">{score}<small> / {round.length}</small></span>
              <h3>{score === round.length ? 'Ajoyib!' : "Yaxshi mashq bo'ldi!"}</h3>
              <p className="dim">{round.length} ta savoldan {score} tasiga to'g'ri javob berdingiz.</p>
              <button onClick={() => startRound()}>Yana mashq qilish</button>
              <button className="ghost" onClick={() => setView('learn')}>Alifboni ko'rish</button>
            </div>
          ) : (
            <>
              <div className="card reading-question">
                <span className="reading-eyebrow">{mode.label} · {current + 1}-savol</span>
                <span className="reading-prompt" lang="ko">{question.display}</span>
                <p className="dim">{selected === null ? "Bu harf yoki so'z qanday o'qiladi?" : question.hint ?? 'To‘g‘ri javob yashil rangda ko‘rsatilgan.'}</p>
              </div>

              <div className="reading-choices" role="group" aria-label="Javobni tanlang">
                {question.choices.map((choice) => {
                  const isCorrect = selected !== null && choice === question.answer;
                  const isIncorrect = selected === choice && choice !== question.answer;
                  return (
                    <button
                      className={`reading-choice${isCorrect ? ' correct' : ''}${isIncorrect ? ' incorrect' : ''}`}
                      key={choice}
                      disabled={selected !== null}
                      onClick={() => selectAnswer(choice)}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div className="reading-feedback" aria-live="polite">
                  <p>{selected === question.answer ? 'To‘g‘ri!' : `To‘g‘ri javob: ${question.answer}`}</p>
                  <button onClick={nextQuestion}>
                    {current + 1 === round.length ? 'Natijani ko‘rish' : 'Keyingi savol'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
