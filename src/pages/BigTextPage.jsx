import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function BigTextPage({ back }) {
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [fontSize, setFontSize] = useState(9);
  const [scrollSpeed, setScrollSpeed] = useState(4);
  const viewportRef = useRef(null);
  const measureRef = useRef(null);
  const speedMultiplier = 0.5 + scrollSpeed * 0.25;

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
  }, [isOpen, text, fontSize]);

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
        <div
          className="big-text-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Large text display"
          style={{
            '--big-text-size': `${fontSize}vmax`,
            '--big-text-duration': `${18 / speedMultiplier}s`,
          }}
        >
          <div className="big-text-landscape">
            <div className="big-text-toolbar">
              <button className="ghost big-text-close" onClick={() => setIsOpen(false)} aria-label="Close display">Close</button>
              <div className="big-text-controls">
                <div className="big-text-control-group" aria-label="Font size controls">
                  <span>Text</span>
                  <button className="ghost big-text-control" onClick={() => setFontSize((size) => Math.max(5, size - 1))} aria-label="Decrease font size">A−</button>
                  <button className="ghost big-text-control" onClick={() => setFontSize((size) => Math.min(16, size + 1))} aria-label="Increase font size">A+</button>
                </div>
                <div className="big-text-control-group" aria-label="Scroll speed controls">
                  <span>{speedMultiplier}×</span>
                  <button className="ghost big-text-control" onClick={() => setScrollSpeed((speed) => Math.max(0, speed - 1))} aria-label="Decrease scroll speed">Slower</button>
                  <button className="ghost big-text-control" onClick={() => setScrollSpeed((speed) => Math.min(6, speed + 1))} aria-label="Increase scroll speed">Faster</button>
                </div>
              </div>
            </div>
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
