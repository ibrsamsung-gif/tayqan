import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Clock,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  Info,
  Coffee,
  Utensils,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { CampData, Session, Trainer } from '../types';
import { AppIcon } from './Icons';

interface ProgramPanelProps {
  data: CampData;
  onTrainerClick: (trainerId: string) => void;
  onNavigateToEvaluation?: () => void;
}

export const ProgramPanel: React.FC<ProgramPanelProps> = ({ 
  data, 
  onTrainerClick,
  onNavigateToEvaluation
}) => {
  const [activeDay, setActiveDay] = useState(0);
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({});
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [activeBioTrainerId, setActiveBioTrainerId] = useState<string | null>(null);

  const sessionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currentDay = data.days[activeDay] || data.days[0];
  const sessions = currentDay.sessions;

  // Reset active session and expanded states when changing day
  useEffect(() => {
    setActiveSessionIndex(0);
    setActiveBioTrainerId(null);
  }, [activeDay]);

  // Keyboard navigation for stepping through periods
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActiveSessionIndex((prev) => Math.min(prev + 1, sessions.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveSessionIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessions.length]);

  // Scroll smoothly to active session when changed via timeline scrubber
  const handleSelectSession = (idx: number, scrollIntoView = true) => {
    setActiveSessionIndex(idx);
    const session = sessions[idx];
    if (session && scrollIntoView) {
      const el = sessionRefs.current[session.id];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const toggleExpand = (sessionId: string) => {
    setExpandedSessionIds((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  const handleCopySummary = (session: Session) => {
    const text = `${session.title} (${session.time})\n${session.description}\nالمدرب: ${session.trainerLabel || 'فريق المخيم'}`;
    navigator.clipboard.writeText(text);
    setCopiedSessionId(session.id);
    setTimeout(() => setCopiedSessionId(null), 2200);
  };

  const createGoogleCalendarUrl = (session: Session) => {
    const dateMap: Record<number, string> = {
      0: '20260910',
      1: '20260911',
      2: '20260912',
    };
    const baseDate = dateMap[activeDay] || '20260910';
    const [startStr, endStr] = session.time.split('–');
    const formatTime = (tStr?: string) => {
      if (!tStr) return '120000';
      const [h, m] = tStr.trim().split(':').map(Number);
      const hour = h < 9 ? h + 12 : h;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(hour)}${pad(m || 0)}00`;
    };
    const start = `${baseDate}T${formatTime(startStr)}Z`;
    const end = `${baseDate}T${formatTime(endStr || startStr)}Z`;
    const title = encodeURIComponent(`مخيم ما وراء المحتوى: ${session.title}`);
    const details = encodeURIComponent(
      `${session.description}\n\nالمدرب: ${session.trainerLabel || 'فريق المخيم'}\nمخيم ما وراء المحتوى - تيقن`
    );
    const location = encodeURIComponent('فلسطين - مخيم ما وراء المحتوى - تيقن');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  const getTrainerObj = (trainerId: string | null): Trainer | undefined => {
    if (!trainerId) return undefined;
    return data.trainers.find((t) => t.id === trainerId);
  };

  return (
    <section className={`program day-${activeDay}`} aria-labelledby="program-title">
      {/* Section Header */}
      <div className="section-heading">
        <div>
          <span className="section-number">03 — البرنامج</span>
          <h2 id="program-title">جدول تدريبي مكثف</h2>
        </div>
        <a
          className="download-program"
          href={data.programPdf}
          download="برنامج-مخيم-ما-وراء-المحتوى.pdf"
          title="تحميل جدول المخيم التدريبي كاملاً بصيغة PDF"
        >
          <Download size={16} aria-hidden="true" />
          <span>تحميل البرنامج PDF</span>
        </a>
      </div>

      {/* 3 Day Tabs */}
      <div className="day-tabs" role="tablist" aria-label="أيام التدريب">
        {data.days.map((day, idx) => (
          <button
            key={day.id}
            role="tab"
            aria-selected={activeDay === idx}
            aria-controls={`day-panel-${idx}`}
            id={`day-tab-${idx}`}
            onClick={() => setActiveDay(idx)}
          >
            <span className="tab-number">0{idx + 1}</span>
            <div>
              <strong>{day.label}</strong>
              <small>{day.date}</small>
            </div>
          </button>
        ))}
      </div>

      {/* Day Panel Container */}
      <div id={`day-panel-${activeDay}`} role="tabpanel" aria-labelledby={`day-tab-${activeDay}`}>
        {/* Day Heading */}
        <div className="day-heading">
          <h3 className="font-bold text-[#32101a]">{currentDay.title}</h3>
          <span className="bg-[#f7e9ed] text-[#8a2947] font-semibold">{currentDay.date}</span>
        </div>

        {/* --- فكرة تفاعلية: شريط المسار الزمني الحي الممتد على كامل الشاشة (Full-Width Interactive Timeline Ribbon) --- */}
        <div 
          className="interactive-ribbon-container my-3.5 p-3.5 bg-[#fffdfb] border border-[#ead9df] rounded-2xl shadow-xs w-full"
          role="region"
          aria-label="مسار اليوم الزمني التفاعلي الممتد"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8a2947]">
              <Sparkles size={14} className="text-[#b4506e]" />
              <span>مسار فترات اليوم التفاعلي (ممتد بكامل العرض):</span>
              <span className="font-normal text-[#79515e]">
                الفترة {activeSessionIndex + 1} من {sessions.length}
              </span>
            </div>

            {/* Stepper Navigation Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectSession(Math.max(activeSessionIndex - 1, 0))}
                disabled={activeSessionIndex === 0}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#ead9df] text-[#8a2947] hover:bg-[#f7e9ed] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                title="الانتقال إلى الفترة السابقة"
              >
                <ChevronRight size={13} />
                <span>السابقة</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSession(Math.min(activeSessionIndex + 1, sessions.length - 1))}
                disabled={activeSessionIndex === sessions.length - 1}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#ead9df] text-[#8a2947] hover:bg-[#f7e9ed] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                title="الانتقال إلى الفترة التالية"
              >
                <span>التالية</span>
                <ChevronLeft size={13} />
              </button>
            </div>
          </div>

          {/* Full-width Responsive Stepper Grid across the screen */}
          <div className="w-full relative">
            {/* Visual background connecting line on desktop */}
            <div 
              className="hidden md:block absolute top-[20px] left-6 right-6 h-0.5 bg-[#ebd7df] pointer-events-none z-0" 
              aria-hidden="true" 
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-2 w-full">
              {sessions.map((session, idx) => {
                const isActive = activeSessionIndex === idx;
                const shortWord = session.shortWord || session.title.split(' ').slice(0, 2).join(' ');
                const startTime = session.time.split('–')[0]?.trim();

                return (
                  <button
                    key={`timeline-step-${session.id}`}
                    type="button"
                    onClick={() => handleSelectSession(idx)}
                    className={`relative z-1 flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all duration-200 border w-full ${
                      session.isBreak
                        ? isActive
                          ? 'bg-[#d97706] text-white border-[#b45309] shadow-md scale-[1.02] ring-2 ring-[#d97706]/30 font-bold'
                          : 'bg-[#fffbeb] text-[#92400e] border-[#fde68a] hover:bg-[#fef3c7] hover:border-[#f59e0b]'
                        : isActive
                        ? 'bg-[#8a2947] text-white border-[#8a2947] shadow-md scale-[1.02] ring-2 ring-[#8a2947]/20 font-bold'
                        : 'bg-[#fffdfb] text-[#32101a] border-[#ead9df] hover:border-[#8a2947] hover:text-[#8a2947]'
                    }`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {/* Time with Icon */}
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold">
                      {session.isBreak ? (
                        <Coffee size={12} className={isActive ? 'text-white' : 'text-[#b45309]'} />
                      ) : (
                        <span 
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-white' : 'bg-[#8a2947]'
                          }`} 
                        />
                      )}
                      <span dir="ltr" className="font-mono tracking-tight">{startTime}</span>
                    </div>

                    {/* Word / Short Label */}
                    <span className="text-xs font-semibold leading-tight line-clamp-1 truncate w-full">
                      {shortWord}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- الجدول الزمني الفعلي المتسلسل (Chronological Timeline List) --- */}
        <div 
          className="timeline-chronological flex flex-col gap-3.5 my-2" 
          role="list"
          aria-label={`جلسات ${currentDay.label}`}
        >
          {sessions.map((session, idx) => {
            const isActive = activeSessionIndex === idx;
            const isExpanded = !!expandedSessionIds[session.id];
            const trainer = getTrainerObj(session.trainerId);
            const isCopied = copiedSessionId === session.id;

            return (
              <div
                key={session.id}
                ref={(el) => { sessionRefs.current[session.id] = el; }}
                role="listitem"
                onClick={() => handleSelectSession(idx, false)}
                className={`relative rounded-xl border transition-all duration-200 p-4.5 cursor-pointer ${
                  session.isBreak
                    ? isActive
                      ? 'border-[#b45309] bg-[#fffbf2] ring-2 ring-[#d97706]/25 shadow-md'
                      : 'border-[#fed7aa] bg-[#fffdf5] hover:border-[#f59e0b] hover:bg-[#fff9eb] hover:shadow-xs'
                    : isActive
                    ? 'border-[#8a2947] ring-2 ring-[#8a2947]/20 shadow-md bg-[#fffdfb]'
                    : 'border-[#ead9df] bg-[#fffdfb] hover:border-[#b4506e] hover:shadow-xs'
                }`}
              >
                {/* Active Indicator Pin */}
                {isActive && (
                  <div 
                    className={`absolute -top-2.5 right-6 px-2.5 py-0.5 rounded-full text-white text-[11px] font-bold shadow-xs flex items-center gap-1 ${
                      session.isBreak ? 'bg-[#d97706]' : 'bg-[#8a2947]'
                    }`}
                    aria-label="الفترة المحددة حالياً"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>الفترة النشطة</span>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Right Side / Column 1: Time, Icon, Title, Summary */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Time & Icon Column */}
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 pt-0.5">
                      <div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          session.isBreak
                            ? isActive
                              ? 'bg-[#d97706] border-[#b45309] text-white shadow-xs'
                              : 'bg-[#fef3c7] border-[#fde68a] text-[#b45309]'
                            : isActive
                            ? 'bg-[#8a2947] border-[#8a2947] text-white shadow-xs'
                            : 'bg-[#f7e9ed] border-[#ebd7df] text-[#8a2947]'
                        }`}
                      >
                        {session.isBreak ? <Coffee size={20} /> : <AppIcon name={session.icon} size={20} />}
                      </div>

                      {/* Time Badge */}
                      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${
                        session.isBreak 
                          ? 'text-[#92400e] bg-[#fef3c7] border-[#fde68a]'
                          : 'text-[#8a2947] bg-[#f7e9ed] border-[#ebd7df]'
                      }`}>
                        <Clock size={11} className={session.isBreak ? 'text-[#b45309]' : 'text-[#b4506e]'} />
                        <span dir="ltr">{session.time}</span>
                      </div>

                      {session.duration && (
                        <span className={`text-[10px] font-medium ${
                          session.isBreak ? 'text-[#b45309]' : 'text-[#79515e]'
                        }`}>
                          {session.duration}
                        </span>
                      )}
                    </div>

                    {/* Title and Summary (العنوان الرئيسي واسفله اختصار للفترة التدريبية) */}
                    <div className="flex-1 min-w-0 pr-1">
                      {/* Category Label if available */}
                      {session.isBreak ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b45309] bg-[#fef3c7] px-2.5 py-0.5 rounded-full mb-1 border border-[#fde68a]">
                          <Coffee size={12} />
                          <span>{session.categoryLabel || 'استراحة وتواصل'}</span>
                        </span>
                      ) : session.categoryLabel && (
                        <span className="inline-block text-[11px] font-semibold text-[#8a2947] bg-[#f7e9ed]/70 px-2 py-0.5 rounded mb-1 border border-[#ebd7df]/60">
                          {session.categoryLabel}
                        </span>
                      )}

                      {/* العنوان الرئيسي (Main Title) */}
                      <h4 className={`text-lg font-bold leading-snug mb-1 ${
                        session.isBreak ? 'text-[#78350f]' : 'text-[#32101a]'
                      }`}>
                        {session.title}
                      </h4>

                      {/* أسفله اختصار للفترة التدريبية (Concise Session Summary) */}
                      <p className={`text-sm leading-relaxed mb-2 font-normal ${
                        session.isBreak ? 'text-[#92400e]/90' : 'text-[#684551]'
                      }`}>
                        {session.description}
                      </p>

                      {/* Inline Key Topics Accordion (فكرة تفاعلية سريعة ومدمجة) */}
                      {session.keyTopics && session.keyTopics.length > 0 && (
                        <div className="mt-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(session.id);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8a2947] hover:text-[#541126] transition-colors py-0.5"
                          >
                            <span>{isExpanded ? 'إخفاء محاور الفترة' : 'استعراض محاور وتفاصيل الفترة'}</span>
                            <ChevronDown 
                              size={14} 
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                            />
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-3 bg-[#fdf8f9] border border-[#ebd7df] rounded-lg text-xs leading-relaxed animate-fade-in">
                              <strong className="block text-[#8a2947] mb-1.5 font-bold">
                                أبرز محاور هذه الفترة:
                              </strong>
                              <ul className="list-disc list-inside space-y-1 text-[#541126]/90 pr-1">
                                {session.keyTopics.map((topic, tIdx) => (
                                  <li key={tIdx}>{topic}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Left Side / Column 2: المدرب (Trainer) + Quick Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#ebd7df]/70 md:border-r md:border-[#ebd7df]/70 md:pr-4 md:min-w-[200px]">
                    {/* Trainer Info */}
                    {trainer ? (
                      <div className="relative group flex items-center gap-2.5 text-right">
                        <div className="flex flex-col items-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTrainerClick(trainer.id);
                            }}
                            className="text-xs font-bold text-[#32101a] hover:text-[#8a2947] transition-colors text-right"
                            title="الانتقال لملف المدرب الكامل"
                          >
                            {trainer.name}
                          </button>
                          <span className="text-[11px] text-[#79515e] max-w-[140px] truncate text-right">
                            {trainer.specialty}
                          </span>
                        </div>

                        {/* Trainer Avatar */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveBioTrainerId(activeBioTrainerId === trainer.id ? null : trainer.id);
                          }}
                          className="relative flex-shrink-0 rounded-full border border-[#ead9df] p-0.5 hover:ring-2 hover:ring-[#8a2947]/30 transition-all"
                          title="عرض نبذة عن المدرب"
                        >
                          <img
                            src={trainer.image}
                            alt={trainer.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </button>

                        {/* Interactive Bio Popover */}
                        {activeBioTrainerId === trainer.id && (
                          <div 
                            className="absolute z-20 bottom-full mb-2 left-0 md:left-auto md:right-0 w-64 p-3 bg-[#541126] text-white rounded-xl shadow-xl text-xs leading-relaxed text-right animate-fade-in"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between border-b border-white/20 pb-1.5 mb-1.5">
                              <strong className="text-white font-bold">{trainer.name}</strong>
                              <button
                                type="button"
                                onClick={() => setActiveBioTrainerId(null)}
                                className="text-white/70 hover:text-white text-xs px-1"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="text-white/90 text-[11px] mb-2">{trainer.bio}</p>
                            <button
                              type="button"
                              onClick={() => onTrainerClick(trainer.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-[#ffd3e0] hover:underline font-bold"
                            >
                              <span>استعراض الملف الشخصي الكامل ←</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : session.trainerLabel ? (
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-xs font-semibold text-[#8a2947] bg-[#f7e9ed] px-2 py-1 rounded-md border border-[#ebd7df]">
                          {session.trainerLabel}
                        </span>
                      </div>
                    ) : session.isBreak ? (
                      <div className="flex items-center gap-1.5 text-xs text-[#92400e] font-medium bg-[#fef3c7]/60 px-2.5 py-1 rounded-md border border-[#fde68a]/60">
                        <Coffee size={12} className="text-[#b45309]" />
                        <span>استراحة وتواصل</span>
                      </div>
                    ) : null}

                    {/* Action Buttons: Add to Calendar & Copy Summary */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopySummary(session);
                        }}
                        className={`p-1.5 rounded-md border text-xs transition-colors flex items-center gap-1 ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-white text-[#684551] border-[#ead9df] hover:text-[#8a2947] hover:bg-[#f7e9ed]'
                        }`}
                        title="نسخ ملخص الفترة التدريبية"
                      >
                        {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span className="text-[11px]">{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                      </button>

                      <a
                        href={createGoogleCalendarUrl(session)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md border border-[#ead9df] bg-white text-[#684551] hover:text-[#8a2947] hover:bg-[#f7e9ed] text-xs transition-colors flex items-center gap-1"
                        title="إضافة هذه الفترة إلى تقويم Google"
                      >
                        <Calendar size={13} />
                        <span className="text-[11px]">التقويم</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Outcome Box */}
        <div className="outcome mt-6">
          <div>
            <span>المحصلة التدريبية المتوقعة</span>
            <h3>
              {activeDay === 0
                ? 'فهم واقع التحقق والبدء في استقصاء المصادر وبناء مسار واضح للتعامل مع التضليل'
                : activeDay === 1
                ? 'إتقان أدوات OSINT وتحليل الحسابات وفهم الأخلاقيات والمسارات الإعلامية التشاركية'
                : 'تطوير سيناريوهات تفاعلية، إنتاج قصص صحفية رقمية، وتجهيز مخرجات المخيم'}
            </h3>
          </div>
          <div className="duration">
            3 <strong>أيام</strong>
            <small>مكثفة</small>
          </div>
        </div>
 
        {/* Final Day Evaluation Callout Card */}
        {onNavigateToEvaluation && (
          <div className="mt-8 p-5 rounded-2xl border border-[#ebd7df] bg-gradient-to-r from-[#fdf8fa] to-[#fbf2f5] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5 text-right">
              <div className="w-11 h-11 rounded-xl bg-[#8a2947]/10 border border-[#8a2947]/20 flex items-center justify-center text-[#8a2947] flex-shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#8a2947]/10 text-[#8a2947]">
                    الشريحة الأخيرة (05)
                  </span>
                  <h4 className="font-bold text-[#3a121e] text-sm sm:text-base">
                    شريحة التقييم والتصويت النهائي
                  </h4>
                </div>
                <p className="text-xs text-[#704b57] mt-0.5">
                  شريحة تفاعلية مقفلة برقم سري يُزوّد به المشاركون في اليوم الأخير لإطلاق مرحلة التصويت المباشر.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onNavigateToEvaluation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#8a2947] hover:bg-[#701f37] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>الانتقال لشريحة التصويت</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
