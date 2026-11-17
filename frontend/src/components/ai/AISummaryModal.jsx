import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Loader2,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';

export const AISummaryModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.post('/ai/generate-summary');
      setSummaryData(res.data);
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!summaryData) return;

    const text = `🚀 **Daily Standup & Sprint Pulse** (${new Date().toLocaleDateString()})
**Status:** ${summaryData.headline} (Completion Rate: ${summaryData.completionRate})

✅ **Accomplishments:**
${summaryData.accomplishments?.map(a => `• ${a}`).join('\n') || 'None'}

🎯 **Focus Areas:**
${summaryData.focusAreas?.map(f => `• ${f}`).join('\n') || 'None'}

⚠️ **Blockers & Risks:**
${summaryData.blockersAndRisks?.map(b => `• ${b}`).join('\n') || 'None'}

💡 **AI Coach Insight:**
${summaryData.aiRecommendation}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Daily Standup & Sprint Pulse"
      subtitle="Automated intelligence synthesizing team velocity, focus items, and delivery blockers"
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-200">Synthesizing Task Intelligence...</h4>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing backlog priorities, active in-flight items, and upcoming deadlines.
          </p>
        </div>
      ) : summaryData ? (
        <div className="space-y-5">
          {/* Headline banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-violet-950/40 border border-indigo-500/30 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-1">
                Executive Status
              </span>
              <h3 className="text-sm font-bold text-slate-100">{summaryData.headline}</h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xl font-extrabold text-indigo-300">
                {summaryData.completionRate}
              </span>
              <span className="block text-[10px] text-slate-400">Completed</span>
            </div>
          </div>

          {/* Accomplishments */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Recent Accomplishments
            </h4>
            <div className="space-y-1.5 bg-slate-800/40 border border-slate-800 rounded-xl p-3">
              {summaryData.accomplishments?.map((acc, idx) => (
                <p key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{acc}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Active Focus Areas */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Active Focus Streams
            </h4>
            <div className="space-y-1.5 bg-slate-800/40 border border-slate-800 rounded-xl p-3">
              {summaryData.focusAreas?.map((focus, idx) => (
                <p key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>{focus}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Blockers & Risks */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Blockers & Critical Risks
            </h4>
            <div className="space-y-1.5 bg-rose-950/20 border border-rose-500/20 rounded-xl p-3">
              {summaryData.blockersAndRisks?.map((blocker, idx) => (
                <p key={idx} className="text-xs text-rose-300 flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{blocker}</span>
                </p>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-amber-300 mb-0.5">AI Coach Recommendation</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                {summaryData.aiRecommendation}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={fetchSummary}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Standup for Slack</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
