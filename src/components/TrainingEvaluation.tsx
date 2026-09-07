import React, { useState, useEffect } from 'react';
import {
  Star,
  Sparkles,
  Users,
  CheckCircle2,
  BarChart3,
  MessageSquare,
  Send,
  RotateCcw,
  Award,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';

interface EvaluationItem {
  id: string;
  name: string;
  role?: string;
  rating: number;
  criteria?: {
    content: number;
    trainers: number;
    practice: number;
    organization: number;
  };
  recommend?: boolean;
  comment: string;
  tags: string[];
  date: string;
  isCurrentUser?: boolean;
}

interface TagInfo {
  label: string;
  count: number;
  icon: string;
}

// -------------------------------------------------------------
// ZEROED OUT INITIAL DATA (مصفرة تماماً للبدء الفعلي ببيانات المشاركين)
// -------------------------------------------------------------
const INITIAL_TAGS: Record<string, TagInfo> = {
  osint: { label: 'أدوات OSINT والتحقق الميداني', count: 0, icon: '🔍' },
  teamwork: { label: 'روح العمل الجماعي وتبادل الخبرات', count: 0, icon: '🤝' },
  ai_deepfake: { label: 'كشف التزييف العميق والمحتوى المولّد', count: 0, icon: '🤖' },
  production: { label: 'إنتاج القصص الرقمية والوسائط', count: 0, icon: '🎬' },
  trainers: { label: 'كفاءة المدربين وانفتاحهم للنقاش', count: 0, icon: '👏' },
  ethics: { label: 'أخلاقيات التحقق ومكافحة التضليل', count: 0, icon: '⚖️' },
};

const INITIAL_REVIEWS: EvaluationItem[] = [];

interface TrainingEvaluationProps {
  onNavigateToProgram?: () => void;
}

export const TrainingEvaluation: React.FC<TrainingEvaluationProps> = ({ onNavigateToProgram }) => {
  // Passcode Lock State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tayqan_evaluation_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHint, setShowHint] = useState(false);

  const [activeTab, setActiveTab] = useState<'form' | 'results'>('results');
  const [hasVoted, setHasVoted] = useState(false);

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [criteria, setCriteria] = useState<{
    content: number;
    trainers: number;
    practice: number;
    organization: number;
  }>({
    content: 5,
    trainers: 5,
    practice: 5,
    organization: 5,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(['osint', 'trainers']);
  const [recommend, setRecommend] = useState<boolean>(true);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Stats State - 100% Zeroed Out
  const [reviewsList, setReviewsList] = useState<EvaluationItem[]>(() => {
    try {
      const saved = localStorage.getItem('tayqan_camp_live_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [tagStats, setTagStats] = useState<Record<string, TagInfo>>(() => {
    try {
      const saved = localStorage.getItem('tayqan_camp_live_tags');
      return saved ? JSON.parse(saved) : INITIAL_TAGS;
    } catch {
      return INITIAL_TAGS;
    }
  });

  const [upvotedTags, setUpvotedTags] = useState<Record<string, boolean>>({});

  // Check localStorage on mount for prior user vote
  useEffect(() => {
    try {
      const savedVote = localStorage.getItem('tayqan_camp_live_user_vote');
      if (savedVote) {
        setHasVoted(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save changes to reviews in storage
  const saveReviewsToStorage = (updatedReviews: EvaluationItem[], updatedTags?: Record<string, TagInfo>) => {
    try {
      localStorage.setItem('tayqan_camp_live_reviews', JSON.stringify(updatedReviews));
      if (updatedTags) {
        localStorage.setItem('tayqan_camp_live_tags', JSON.stringify(updatedTags));
      }
    } catch {
      // ignore
    }
  };

  const handleRatingClick = (star: number) => {
    setRating(star);
  };

  const handleTagToggle = (tagKey: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagKey) ? prev.filter((t) => t !== tagKey) : [...prev, tagKey]
    );
  };

  const handleDirectUpvoteTag = (tagKey: string) => {
    if (upvotedTags[tagKey]) return;
    setUpvotedTags((prev) => ({ ...prev, [tagKey]: true }));
    setTagStats((prev) => {
      const updated = {
        ...prev,
        [tagKey]: {
          ...prev[tagKey],
          count: (prev[tagKey]?.count || 0) + 1,
        },
      };
      saveReviewsToStorage(reviewsList, updated);
      return updated;
    });
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newReview: EvaluationItem = {
        id: `user-${Date.now()}`,
        name: name.trim() || 'مشارك/ة في المخيم',
        role: 'مشارك في مخيم ما وراء المحتوى',
        rating,
        criteria: { ...criteria },
        recommend,
        comment: comment.trim() || 'مشاركة حقيقية في تقييم فعاليات المخيم التدريبي.',
        tags: selectedTags.map((key) => tagStats[key]?.label).filter(Boolean),
        date: 'الآن',
        isCurrentUser: true,
      };

      // Increment tag counts
      const updatedTags = { ...tagStats };
      selectedTags.forEach((key) => {
        if (updatedTags[key]) {
          updatedTags[key] = { ...updatedTags[key], count: (updatedTags[key].count || 0) + 1 };
        }
      });
      setTagStats(updatedTags);

      const updatedList = [newReview, ...reviewsList.filter((r) => !r.isCurrentUser)];
      setReviewsList(updatedList);
      setHasVoted(true);
      setIsSubmitting(false);
      setActiveTab('results');

      saveReviewsToStorage(updatedList, updatedTags);

      try {
        localStorage.setItem(
          'tayqan_camp_live_user_vote',
          JSON.stringify({
            votedAt: new Date().toISOString(),
            rating,
            criteria,
            recommend,
          })
        );
      } catch {
        // ignore
      }
    }, 350);
  };

  // Organizer: Reset All Data to Zero
  const handleResetToZero = () => {
    const confirmReset = window.confirm('هل أنت متأكد من تصفير جميع التقييمات والأصوات والبدء من الصفر (0)؟');
    if (!confirmReset) return;

    setReviewsList([]);
    setTagStats(INITIAL_TAGS);
    setHasVoted(false);
    setUpvotedTags({});

    try {
      localStorage.removeItem('tayqan_camp_live_reviews');
      localStorage.removeItem('tayqan_camp_live_tags');
      localStorage.removeItem('tayqan_camp_live_user_vote');
      localStorage.removeItem('tayqan_camp_user_vote');
    } catch {
      // ignore
    }
  };

  const starLabels: Record<number, string> = {
    5: 'استثنائي ومثري جداً 🌟',
    4: 'رائع ومفيد جداً ✨',
    3: 'جيد ومناسب 👍',
    2: 'متوسط ويحتاج تطوير 🤔',
    1: 'أقل من التوقعات ⚠️',
  };

  // Unlock validation handler
  const handleUnlockSubmit = (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const code = (directCode ?? passcode).trim().toLowerCase();
    const validCodes = ['5555', 'tayqan', 'تيقن'];

    if (validCodes.includes(code)) {
      setIsUnlocked(true);
      setPasscodeError(false);
      setErrorMessage('');
      try {
        localStorage.setItem('tayqan_evaluation_unlocked', 'true');
      } catch {
        // ignore
      }
    } else {
      setPasscodeError(true);
      setErrorMessage('الرمز السري غير صحيح. سيتم تزويد المشاركين بالرمز خلال فعاليات اليوم الختامي.');
      setTimeout(() => {
        setPasscodeError(false);
      }, 3000);
    }
  };

  const handleLockAgain = () => {
    setIsUnlocked(false);
    setPasscode('');
    try {
      localStorage.removeItem('tayqan_evaluation_unlocked');
    } catch {
      // ignore
    }
  };

  // Calculated Real Metrics
  const totalEvaluations = reviewsList.length;
  const avgRating =
    totalEvaluations > 0
      ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalEvaluations).toFixed(1)
      : '0.0';

  const recommendationRate =
    totalEvaluations > 0
      ? Math.round(
          (reviewsList.filter((r) => r.recommend !== false).length / totalEvaluations) * 100
        )
      : 0;

  // Criteria real calculations
  const calcCriteriaAvg = (key: keyof NonNullable<EvaluationItem['criteria']>) => {
    const listWithCriteria = reviewsList.filter((r) => r.criteria && r.criteria[key] !== undefined);
    if (listWithCriteria.length === 0) return { avg: '0.0', pct: 0 };
    const sum = listWithCriteria.reduce((acc, r) => acc + (r.criteria?.[key] || 0), 0);
    const mean = sum / listWithCriteria.length;
    return {
      avg: mean.toFixed(1),
      pct: Math.round((mean / 5) * 100),
    };
  };

  const contentScore = calcCriteriaAvg('content');
  const trainersScore = calcCriteriaAvg('trainers');
  const practiceScore = calcCriteriaAvg('practice');
  const organizationScore = calcCriteriaAvg('organization');

  // -------------------------------------------------------------
  // VIEW 1: LOCKED PASSCODE SCREEN (قبل فتح الشريحة في اليوم الختامي)
  // -------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <section 
        id="camp-evaluation-locked" 
        className="evaluation-panel-wrapper relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 text-center select-none overflow-hidden"
        aria-label="شريحة تقييم المخيم المقفلة برمز سري"
      >
        {/* Soft Ambient Background */}
        <div className="absolute inset-0 pointer-events-none -z-1 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-br from-[#8a2947]/8 via-[#b4506e]/4 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md mx-auto bg-white/95 border border-[#ead9df] rounded-2xl p-4 sm:p-5 shadow-lg shadow-[#8a2947]/5 backdrop-blur-md transition-all my-auto">
          
          {/* Animated Lock Icon */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#8a2947]/10 animate-ping opacity-30" />
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#8a2947] to-[#b4506e] text-white flex items-center justify-center shadow-md shadow-[#8a2947]/20">
              <Lock size={22} className="stroke-[2.2]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fcedf2] border border-[#ebd7df] text-[#8a2947] font-bold text-[11px] mb-2">
            <Sparkles size={12} className="text-amber-500" />
            <span>شريحة تفاعلية • مقفلة حتى اليوم الختامي</span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-[#32101a] tracking-tight mb-1">
            تقييم ختام المخيم والتصويت
          </h2>

          <p className="text-[11px] sm:text-xs text-[#734f5b] leading-relaxed mb-3 max-w-sm mx-auto">
            لتعزيز التفاعل وضمان اكتمال كافة محاور المخيم، تم قفل هذه الشريحة برقم سري يُزوّد به المشاركون في اليوم الختامي لإطلاق مرحلة التقييم الجماعي.
          </p>

          {/* Passcode Form */}
          <form onSubmit={(e) => handleUnlockSubmit(e)} className="space-y-2.5">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#8a2947]/60">
                <KeyRound size={16} />
              </div>
              <input
                id="evaluation-passcode-input"
                type="text"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (passcodeError) setPasscodeError(false);
                }}
                placeholder="أدخل الرمز السري (مثال: 5555)"
                className={`w-full pr-10 pl-4 py-2.5 text-center text-base sm:text-lg font-bold tracking-wider rounded-xl border transition-all outline-hidden shadow-inner ${
                  passcodeError
                    ? 'border-rose-500 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-400'
                    : 'border-[#ebd7df] bg-[#fbf5f7] text-[#32101a] focus:border-[#8a2947] focus:bg-white focus:ring-2 focus:ring-[#8a2947]/20'
                }`}
                autoComplete="off"
                maxLength={10}
              />
            </div>

            {/* Error Message */}
            {passcodeError && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-semibold animate-fade-in">
                <ShieldAlert size={13} />
                <span>{errorMessage || 'الرمز السري غير صحيح'}</span>
              </div>
            )}

            <button
              id="unlock-evaluation-btn"
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#8a2947] hover:bg-[#701f37] active:scale-[0.98] text-white py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <Unlock size={16} />
              <span>إلغاء القفل والدخول للتقييم</span>
            </button>
          </form>

          {/* Organizer / Presenter Helper Tooltip */}
          <div className="mt-3 pt-2.5 border-t border-[#ebd7df]/70 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1 text-[11px] text-[#8a2947] hover:text-[#701f37] font-semibold cursor-pointer underline-offset-2 hover:underline"
            >
              {showHint ? <EyeOff size={12} /> : <Eye size={12} />}
              <span>{showHint ? 'إخفاء رمز المنظم' : '💡 رمز اليوم الختامي للمنظمين'}</span>
            </button>

            {showHint && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#fdf5f8] border border-[#ebd7df] text-xs text-[#541126] flex items-center justify-between gap-3 w-full max-w-xs animate-fade-in">
                <span>الرمز المعتمد: <strong className="font-mono text-sm text-[#8a2947]">5555</strong></span>
                <button
                  type="button"
                  onClick={() => handleUnlockSubmit(undefined, '5555')}
                  className="px-2.5 py-1 rounded-lg bg-[#8a2947] text-white text-[11px] font-bold hover:bg-[#701f37] transition-colors"
                >
                  فتح فوري
                </button>
              </div>
            )}
          </div>

          {onNavigateToProgram && (
            <button
              type="button"
              onClick={onNavigateToProgram}
              className="mt-2.5 text-[11px] text-[#8a2947] hover:text-[#541126] font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <span>العودة إلى جدول البرنامج التدريبي</span>
              <ArrowLeft size={12} />
            </button>
          )}
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: UNLOCKED EVALUATION MODULE (مفتوحة في اليوم الختامي)
  // -------------------------------------------------------------
  return (
    <section 
      id="camp-evaluation" 
      className="evaluation-panel-wrapper w-full max-w-5xl mx-auto py-3 px-3 sm:px-5"
      aria-labelledby="evaluation-title"
    >
      {/* Organizer Bar when Unlocked */}
      <div className="mb-3 bg-[#fbf5f7] border border-[#ebd7df] rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-[#704b57]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-emerald-800 text-[11px] sm:text-xs">
            التقييم مفتوح الآن ومصفر لاستقبال أصوات المشاركين الحقيقية (0 مسجل)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToZero}
            className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 font-bold text-[11px] cursor-pointer hover:underline"
            title="تصفير كافة التقييمات والأصوات الحالية والبدء من 0"
          >
            <RotateCcw size={11} />
            <span>تصفير النتائج (0)</span>
          </button>
          <button
            type="button"
            onClick={handleLockAgain}
            className="inline-flex items-center gap-1 text-[#8a2947] hover:text-rose-700 font-bold text-[11px] cursor-pointer hover:underline"
            title="إعادة قفل الشريحة للمنظمين"
          >
            <Lock size={11} />
            <span>قفل الشريحة</span>
          </button>
        </div>
      </div>

      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 bg-gradient-to-r from-[#541126] via-[#701d36] to-[#8a2947] text-white p-4 md:p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
              <Sparkles size={12} className="text-amber-300" />
              <span>تقييم ختامي مباشر</span>
            </span>
            <span className="text-white/80 text-[11px] sm:text-xs flex items-center gap-1">
              <Users size={12} />
              <span>
                {totalEvaluations === 0
                  ? 'بانتظار تسجيل أول مشارك'
                  : `${totalEvaluations} مشارك/ة قيّموا المخيم حتى الآن`}
              </span>
            </span>
          </div>
          <h3 id="evaluation-title" className="text-lg md:text-xl font-black text-white">
            تقييم ختام المخيم والنتائج التفاعلية
          </h3>
          <p className="text-xs text-white/85 max-w-2xl mt-0.5">
            شارك رأيك في مخرجات مخيم «ما وراء المحتوى»، وتابع مؤشرات الرضا وانطباعات المشاركين المعروضة لحظياً أمام الجميع.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'bg-white text-[#541126] shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 size={14} />
            <span>النتائج الحية المباشرة</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-white text-[#541126] shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Star size={14} />
            <span>{hasVoted ? 'تعديل تقييمك' : 'سجّل تقييمك الآن'}</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: FORM (نموذج التقييم التفاعلي) --- */}
      {activeTab === 'form' && (
        <div className="bg-[#fffdfb] border border-[#ead9df] rounded-2xl p-4 sm:p-5 shadow-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#ead9df] pb-3 mb-4">
            <div>
              <h4 className="text-base font-bold text-[#32101a] flex items-center gap-2">
                <Award size={18} className="text-[#8a2947]" />
                <span>نموذج تقييم المشارك في المخيم</span>
              </h4>
              <p className="text-xs text-[#79515e] mt-0.5">
                تقييمك يظهر فوراً على شاشة النتائج الجماعية التفاعلية أمام الجميع بشكل حي ومباشر.
              </p>
            </div>
            {hasVoted && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>سبق لك التقييم (يمكنك التعديل)</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitEvaluation} className="space-y-4 sm:space-y-5">
            {/* 1. Overall Star Rating */}
            <div className="p-3 sm:p-4 bg-[#fdf8f9] border border-[#ebd7df] rounded-xl text-center">
              <label className="block text-xs sm:text-sm font-bold text-[#32101a] mb-1.5">
                ما تقييمك الإجمالي لتجربة مخيم «ما وراء المحتوى»؟
              </label>

              <div className="flex items-center justify-center gap-2 my-2" dir="ltr">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-hidden transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                      aria-label={`${star} من 5 نجوم`}
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <span className="inline-block mt-1 text-xs font-bold text-[#8a2947] bg-[#f7e9ed] px-3 py-1 rounded-full border border-[#ebd7df]">
                {starLabels[hoverRating || rating]}
              </span>
            </div>

            {/* 2. Key Criteria Matrix */}
            <div>
              <h5 className="text-xs font-bold text-[#8a2947] uppercase tracking-wide mb-2.5">
                تقييم محاور المخيم الأساسية:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'content', label: 'عمق وجودة المحتوى التدريبي' },
                  { key: 'trainers', label: 'كفاءة وتفاعل المدربين' },
                  { key: 'practice', label: 'التطبيق العملي والميداني (OSINT)' },
                  { key: 'organization', label: 'التنظيم العام وإدارة الوقت' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-2.5 rounded-xl border border-[#ead9df] bg-white flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-[#32101a]">{item.label}</span>
                    <div className="flex items-center gap-1" dir="ltr">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setCriteria((prev) => ({ ...prev, [item.key]: val }))
                          }
                          className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${
                            (criteria[item.key as keyof typeof criteria] || 5) >= val
                              ? 'bg-[#8a2947] text-white shadow-2xs'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Favorite Highlights (Multi-select tags) */}
            <div>
              <h5 className="text-xs font-bold text-[#8a2947] uppercase tracking-wide mb-2">
                أبرز ما أضاف لك خلال أيام المخيم (اختر كل ما يناسبك):
              </h5>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(tagStats) as [string, TagInfo][]).map(([key, info]) => {
                  const isSelected = selectedTags.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTagToggle(key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-[#8a2947] text-white border-[#8a2947] shadow-xs'
                          : 'bg-[#faf3f5] text-[#32101a] border-[#ead9df] hover:border-[#8a2947]'
                      }`}
                    >
                      <span>{info.icon}</span>
                      <span>{info.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Recommendation Switch */}
            <div className="p-3 rounded-xl bg-[#fdf5f8] border border-[#ebd7df] flex items-center justify-between">
              <span className="text-xs font-bold text-[#32101a]">
                هل توصي زملاءك الصحفيين وصنّاع المحتوى بحضور النسخ القادمة؟
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRecommend(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    recommend
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  نعم، أوصي بشدة 👍
                </button>
                <button
                  type="button"
                  onClick={() => setRecommend(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !recommend
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  بحاجة لتحسين
                </button>
              </div>
            </div>

            {/* 5. Qualitative Feedback */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-[#32101a] mb-1">
                  الاسم (اختياري):
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مشارك في المخيم"
                  className="w-full px-3 py-2 rounded-xl border border-[#ead9df] text-xs focus:outline-hidden focus:border-[#8a2947] bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#32101a] mb-1">
                  كلمة ختامية أو انطباعك عن المخيم:
                </label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="أبرز ما تعلمته أو رسالة شكر لفريق تيقن والمدربين..."
                  className="w-full px-3 py-2 rounded-xl border border-[#ead9df] text-xs focus:outline-hidden focus:border-[#8a2947] bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('results')}
                className="px-4 py-2 rounded-xl border border-[#ead9df] text-[#79515e] hover:text-[#32101a] font-medium text-xs transition-colors"
              >
                إلغاء والعودة للنتائج
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#8a2947] hover:bg-[#6c1f36] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>جاري تسجيل التقييم...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>اعتماد التقييم وعرضه لحظياً</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TAB 2: LIVE RESULTS DASHBOARD (شاشة النتائج المباشرة المعروضة للجميع) --- */}
      {activeTab === 'results' && (
        <div className="space-y-3 animate-fade-in">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Metric 1: Overall Average */}
            <div className="p-3 bg-[#fffdfb] border border-[#ead9df] rounded-xl shadow-xs text-center flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#79515e]">معدل الرضا العام</span>
                <div className="flex items-baseline justify-center gap-1 my-1">
                  <span className="text-3xl font-black text-[#8a2947]">
                    {avgRating}
                  </span>
                  <span className="text-xs text-[#79515e] font-semibold">/ 5.0</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={
                      Number(avgRating) >= s
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
                <span className="text-[10px] text-[#79515e] font-bold mr-1">
                  {totalEvaluations === 0
                    ? 'بانتظار أول تقييم'
                    : Number(avgRating) >= 4.5
                    ? 'ممتاز جداً'
                    : 'تقييم إيجابي'}
                </span>
              </div>
            </div>

            {/* Metric 2: Recommendation Percentage */}
            <div className="p-3 bg-[#fffdfb] border border-[#ead9df] rounded-xl shadow-xs text-center flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#79515e]">نسبة التوصية بالمخيم</span>
                <div className="text-3xl font-black text-emerald-700 my-1">
                  {recommendationRate}
                  <span className="text-xl font-bold">%</span>
                </div>
              </div>
              <div className="text-[10px] text-emerald-800 font-medium bg-emerald-50 border border-emerald-200/80 rounded-md py-0.5 px-1.5">
                {totalEvaluations === 0
                  ? 'بانتظار تصويت المشاركين'
                  : `${recommendationRate}% يوصون بحضور المخيم`}
              </div>
            </div>

            {/* Metric 3: Total Evaluators */}
            <div className="p-3 bg-[#fffdfb] border border-[#ead9df] rounded-xl shadow-xs text-center flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#79515e]">إجمالي المقيمين المباشر</span>
                <div className="text-3xl font-black text-[#541126] my-1 flex items-center justify-center gap-1.5">
                  <span>{totalEvaluations}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
              <div className="text-[10px] text-[#79515e] font-medium">
                {totalEvaluations === 0 ? 'مصفّر وبانتظار المشاركين' : 'مشاركون حقيقيون قيّموا المخيم'}
              </div>
            </div>

            {/* Metric 4: Satisfaction Pulse */}
            <div className="p-3 bg-[#fffdfb] border border-[#ead9df] rounded-xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#79515e] mb-1">
                <span>جاهزية التقييم</span>
                <span className="text-emerald-700 font-bold">
                  {totalEvaluations === 0 ? 'جاهز للتصويت' : 'تحديث حي'}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#32101a] font-medium">اكتمال التصويت الجماعي</span>
                  <span className="font-bold text-[#8a2947]">
                    {totalEvaluations === 0 ? '0%' : `${Math.min(100, totalEvaluations * 5)}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#f0e0e6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#8a2947] rounded-full transition-all duration-500"
                    style={{
                      width: `${totalEvaluations === 0 ? 0 : Math.min(100, totalEvaluations * 5)}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <span className="text-[#32101a] font-medium">مستوى الموثوقية</span>
                  <span className="font-bold text-emerald-700">100% مباشر</span>
                </div>
              </div>
            </div>
          </div>

          {/* Criteria Progress Bars & Live Reaction Tags */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Detailed Criteria Scores (7 Cols) */}
            <div className="lg:col-span-7 bg-[#fffdfb] border border-[#ead9df] rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2.5 border-b border-[#ead9df] pb-2">
                <h4 className="text-xs font-bold text-[#32101a] flex items-center gap-1.5">
                  <BarChart3 size={15} className="text-[#8a2947]" />
                  <span>تفصيل المؤشرات التدريبية من تصويت الحضور:</span>
                </h4>
                <span className="text-[10px] text-[#79515e]">
                  {totalEvaluations === 0 ? 'مصفّر بالكامل' : `${totalEvaluations} أصوات مسجلة`}
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'عمق وجودة المادة التدريبية', data: contentScore },
                  { label: 'كفاءة وتفاعل المدربين وانفتاحهم', data: trainersScore },
                  { label: 'القيمة التطبيقية لبيئة العمل الصحفي', data: practiceScore },
                  { label: 'إدارة الوقت والتنظيم اللوجستي', data: organizationScore },
                ].map((crit, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#32101a] text-[11px]">{crit.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#79515e] font-mono">{crit.data.avg}/5</span>
                        <span className="font-bold text-[#8a2947] text-[11px]">{crit.data.pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#f4e8ed] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8a2947] to-[#b4506e] rounded-full transition-all duration-500"
                        style={{ width: `${crit.data.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Interactive Tag Counter (5 Cols) */}
            <div className="lg:col-span-5 bg-[#fffdfb] border border-[#ead9df] rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2 border-b border-[#ead9df] pb-2">
                <h4 className="text-xs font-bold text-[#32101a] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>أبرز ما تميز به المخيم (تصويت حي):</span>
                </h4>
                <span className="text-[10px] text-[#8a2947] font-semibold bg-[#f7e9ed] px-2 py-0.5 rounded">
                  انقر للتأييد
                </span>
              </div>
              <p className="text-[10px] text-[#79515e] mb-2">
                انقر على أي وسم لزيادة رصيده التفاعلي وتأكيده مباشرة أمام الجميع:
              </p>

              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(tagStats) as [string, TagInfo][]).map(([key, info]) => {
                  const isUpvoted = !!upvotedTags[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleDirectUpvoteTag(key)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isUpvoted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-[#faf3f5] text-[#32101a] border-[#ead9df] hover:border-[#8a2947] hover:bg-[#f4e4e9]'
                      }`}
                      title="انقر لتأييد هذا الوسم"
                    >
                      <span className="text-xs">{info.icon}</span>
                      <span className="text-[10px] font-semibold">{info.label}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isUpvoted ? 'bg-emerald-600 text-white' : 'bg-[#ebd7df] text-[#541126]'
                        }`}
                      >
                        {info.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Participant Voice Stream (انطباعات المشاركين التفاعلية) */}
          <div className="bg-[#fffdfb] border border-[#ead9df] rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-2.5 border-b border-[#ead9df] pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-[#8a2947]" />
                <h4 className="text-xs font-bold text-[#32101a]">
                  لوحة انطباعات الزملاء في المخيم ({totalEvaluations} رسائل حقيقية)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="text-xs font-bold text-[#8a2947] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ أضف انطباعك الآن</span>
              </button>
            </div>

            {totalEvaluations === 0 ? (
              <div className="p-6 text-center bg-[#fdf8f9] rounded-xl border border-dashed border-[#ebd7df]">
                <Sparkles size={24} className="mx-auto text-[#8a2947]/60 mb-2" />
                <h5 className="text-xs font-bold text-[#32101a] mb-1">
                  التقييم مصفر وجاهز لاستقبال أول انطباع وتصويت
                </h5>
                <p className="text-[11px] text-[#79515e] max-w-sm mx-auto mb-3">
                  لم يتم تسجيل تقييمات بعد. شارك برأيك الحقيقي الآن ليظهر في صدارة اللوحة أمام الجميع!
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-4 py-1.5 rounded-lg bg-[#8a2947] text-white text-xs font-bold hover:bg-[#701f37] transition-colors cursor-pointer shadow-xs"
                >
                  سجّل أول تقييم في المخيم
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {reviewsList.slice(0, 6).map((rev) => (
                  <div
                    key={rev.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      rev.isCurrentUser
                        ? 'bg-[#fef9f0] border-amber-300 ring-2 ring-amber-200/50 shadow-xs'
                        : 'bg-[#faf4f6] border-[#ead9df]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <strong className="block text-xs font-bold text-[#32101a]">
                            {rev.name}
                          </strong>
                          {rev.role && (
                            <span className="text-[10px] text-[#79515e]">{rev.role}</span>
                          )}
                        </div>
                        <div className="flex items-center text-amber-400" dir="ltr">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={11} className="fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-[#541126]/90 leading-relaxed font-normal my-1.5">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-[#ebd7df]/60 text-[10px] text-[#79515e]">
                      <span className="truncate max-w-[140px]">
                        {rev.tags && rev.tags.length > 0 ? rev.tags[0] : 'مخيم ما وراء المحتوى'}
                      </span>
                      <span className="font-semibold text-[#8a2947]">
                        {rev.isCurrentUser ? 'تقييمك الشخصي' : rev.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Invitation Bar */}
            <div className="mt-3 p-2.5 bg-[#fdf8f9] border border-[#ebd7df] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-right">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#8a2947] shrink-0" />
                <span className="text-[11px] text-[#541126]">
                  هل شاركت في جلسات اليوم التدريبي؟ صوتك يساهم في توثيق أثر المخيم وتطوير النسخ القادمة.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#8a2947] text-white hover:bg-[#6c1f36] transition-colors whitespace-nowrap shadow-xs cursor-pointer"
              >
                {hasVoted ? 'تعديل أو كتابة تعليق إضافي' : 'سجّل تقييمك الآن (دقيقة واحدة)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
