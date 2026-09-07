import React, { useState, useEffect } from 'react';
import { TayqanLogo } from './Icons';

export const IntroOverlay: React.FC = () => {
  const [show, setShow] = useState(() => !sessionStorage.getItem('camp-intro'));

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(
      () => {
        setShow(false);
        sessionStorage.setItem('camp-intro', '1');
      },
      isReduced ? 0 : 1800
    );

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('camp-intro', '1');
  };

  return (
    <div className="intro">
      <TayqanLogo />
      <h2>ما وراء المحتوى</h2>
      <div className="loading" />
      <button onClick={dismiss}>تجاوز المقدمة</button>
    </div>
  );
};
