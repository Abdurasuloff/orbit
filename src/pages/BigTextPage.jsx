import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function BigTextPage({ back }) {
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const viewportRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const updateOverflow = () => {
      const viewport = viewportRef.current;
      const measure = measureRef.current;
      if (viewport && measure) setOverflows(measure.scrollWidth > viewport.clientWidth);
    };
    const observer = new ResizeObserver(updateOverflow);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (measureRef.current) observer.observe(measureRef.current);
    updateOverflow();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, text]);

  const showText = (event) => {
    event.preventDefault();
    if (text.trim()) setIsOpen(true);
  };

  return (
    <div className="stack page">
      <button className="back" onClick={back}>‹ Orbit</button>
      <h2>Big Text</h2>
      <form className="stack" onSubmit={showText}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type text or a number"
          aria-label="Text to display"
        />
        <button type="submit" disabled={!text.trim()}>Show</button>
      </form>
      {isOpen && createPortal(
        <div className="big-text-overlay" role="dialog" aria-modal="true" aria-label="Large text display">
          <div className="big-text-landscape">
            <button className="ghost big-text-close" onClick={() => setIsOpen(false)} aria-label="Close display">Close</button>
            <div className={`big-text-viewport${overflows ? ' scrolling' : ''}`} ref={viewportRef}>
              <span className="big-text-measure" ref={measureRef}>{text}</span>
              {overflows ? (
                <div className="big-text-track" aria-label={text}>
                  <span aria-hidden="true">{text}</span>
                  <span aria-hidden="true">{text}</span>
                </div>
              ) : (
                <div className="big-text-static">{text}</div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
