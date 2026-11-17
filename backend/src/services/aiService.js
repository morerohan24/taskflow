/**
 * TaskFlow AI - AI Intelligence Engine
 * 
 * Supports:
 * 1. Live Google Gemini API (when GEMINI_API_KEY is configured in .env)
 * 2. Intelligent Rule-Based NLP & Heuristic Engine (zero-cost, offline fallback)
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

class AIService {
  constructor() {
    this.hasGemini = Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 10);
    if (this.hasGemini) {
      console.log('[AI Engine] Google Gemini API integration enabled.');
    } else {
      console.log('[AI Engine] Running built-in Smart Heuristic AI engine (offline-ready). Set GEMINI_API_KEY in .env for live Gemini LLM.');
    }
  }

  /**
   * Helper to invoke Gemini API with a prompt
   */
  async callGemini(prompt, systemInstruction = '') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction ? systemInstruction + '\n\n' : ''}${prompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1000
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * FEATURE 1: AI Task Description Generator
   */
  async generateDescription({ title, context = '' }) {
    if (this.hasGemini) {
      try {
        const prompt = `Generate a structured, professional software task specification for the title: "${title}".
Optional context: "${context}".

Return a JSON object strictly matching this schema:
{
  "description": "2-3 clear sentences describing the task objective, scope, and business value.",
  "acceptanceCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"],
  "suggestedSubtasks": ["Subtask 1", "Subtask 2", "Subtask 3", "Subtask 4"],
  "estimatedHours": 4
}
Do not include markdown code block backticks, return raw valid JSON only.`;

        const rawText = await this.callGemini(prompt, 'You are an expert technical product manager and software architect.');
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          description: parsed.description,
          acceptanceCriteria: parsed.acceptanceCriteria || [],
          suggestedSubtasks: parsed.suggestedSubtasks || [],
          estimatedHours: parsed.estimatedHours || 4,
          source: 'Gemini 1.5 Flash'
        };
      } catch (err) {
        console.warn('[AI Engine] Gemini call failed, falling back to smart heuristic:', err.message);
      }
    }

    // Smart heuristic generator
    const titleLower = title.toLowerCase();
    let estimatedHours = 4;
    let category = 'Engineering';
    let criteria = [];
    let subtasks = [];
    let description = '';

    if (titleLower.includes('auth') || titleLower.includes('login') || titleLower.includes('security') || titleLower.includes('jwt')) {
      category = 'Security & Auth';
      estimatedHours = 6;
      description = `Implement and harden the authentication lifecycle for "${title}". Ensure zero-trust validation, strict token expiration policies, and comprehensive audit trail logging.`;
      criteria = [
        'Secure password hashing with bcrypt (minimum cost factor 10)',
        'Signed JWT tokens with configurable expiration and error handling',
        'Unauthorized 401 response returned on invalid or missing tokens',
        'Protected routes verified across all client endpoints'
      ];
      subtasks = [
        'Design token verification and payload schema',
        'Implement middleware for protected REST endpoints',
        'Write automated tests for expired and malformed tokens',
        'Add client-side automatic logout on token expiry'
      ];
    } else if (titleLower.includes('ui') || titleLower.includes('frontend') || titleLower.includes('page') || titleLower.includes('board') || titleLower.includes('card') || titleLower.includes('modal')) {
      category = 'Frontend UX';
      estimatedHours = 5;
      description = `Build a high-performance, accessible, and responsive user interface for "${title}". Focus on smooth transitions, intuitive controls, and adherence to modern SaaS design standards.`;
      criteria = [
        'Responsive layout across mobile, tablet, and desktop breakpoints',
        'Optimistic state updates for instant user feedback',
        'Accessible color contrast and keyboard navigable interactions',
        'Error and empty state feedback handled gracefully'
      ];
      subtasks = [
        'Draft UI component specifications and responsive layout',
        'Implement interactive states (hover, active, disabled, loading)',
        'Connect component to global state and API client',
        'Cross-browser and mobile viewport verification'
      ];
    } else if (titleLower.includes('db') || titleLower.includes('database') || titleLower.includes('supabase') || titleLower.includes('schema') || titleLower.includes('sql') || titleLower.includes('cache')) {
      category = 'Data Architecture';
      estimatedHours = 7;
      description = `Engineer reliable database structures and persistence layers for "${title}". Prioritize data integrity, query latency optimization, and strict access policies.`;
      criteria = [
        'PostgreSQL schema normalized with appropriate foreign key cascades',
        'Row Level Security (RLS) policies enforcing multi-tenant isolation',
        'Indexes placed on frequently filtered and sorted columns',
        'Automated database migration scripts prepared'
      ];
      subtasks = [
        'Draft PostgreSQL migration script with indexes',
        'Configure Supabase Row Level Security policies',
        'Benchmark read/write query latency under load',
        'Update backend ORM/query builder models'
      ];
    } else {
      category = 'Product Workflow';
      estimatedHours = 4;
      description = `Execute the core implementation and lifecycle delivery for "${title}". Meet all business requirements while ensuring modularity, clean code practices, and thorough test coverage.`;
      criteria = [
        'Core business workflow executed without runtime regressions',
        'Comprehensive unit and integration test coverage',
        'Documentation updated with usage instructions and diagrams',
        'Reviewed and approved by cross-functional peers'
      ];
      subtasks = [
        'Break down technical requirements and dependencies',
        'Implement core business logic and REST handler',
        'Verify end-to-end integration with frontend client',
        'Conduct code review and document release notes'
      ];
    }

    return {
      description,
      acceptanceCriteria: criteria,
      suggestedSubtasks: subtasks,
      estimatedHours,
      category,
      source: 'TaskFlow Smart Heuristic Engine'
    };
  }

  /**
   * FEATURE 2: Smart Task Prioritization
   */
  async smartPrioritize({ title, description = '', dueDate = null, tags = [] }) {
    if (this.hasGemini) {
      try {
        const prompt = `Analyze this task and assign a priority ('urgent', 'high', 'medium', 'low'), an AI score from 1 to 100, and a concise 1-sentence rationale.
Title: "${title}"
Description: "${description}"
Due Date: "${dueDate || 'None'}"
Tags: ${JSON.stringify(tags)}

Return a raw JSON object only:
{
  "priority": "urgent" | "high" | "medium" | "low",
  "score": 85,
  "rationale": "Clear explanation of urgency, impact, and complexity."
}`;
        const rawText = await this.callGemini(prompt, 'You are an AI task scheduler prioritizing engineering and product workflows.');
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          priority: parsed.priority || 'medium',
          score: Math.min(100, Math.max(1, Number(parsed.score) || 50)),
          rationale: parsed.rationale || 'Prioritized based on impact and deadlines.',
          source: 'Gemini 1.5 Flash'
        };
      } catch (err) {
        console.warn('[AI Engine] Gemini prioritization failed, using heuristic:', err.message);
      }
    }

    // Heuristic prioritization algorithm
    let score = 50;
    const rationaleParts = [];
    const textToAnalyze = `${title} ${description} ${tags.join(' ')}`.toLowerCase();

    // Urgency keywords
    const urgentKeywords = ['urgent', 'critical', 'blocker', 'security', 'vulnerability', 'crash', 'down', 'p0', 'leak', 'hotfix'];
    const highKeywords = ['launch', 'api', 'auth', 'payment', 'revenue', 'stripe', 'migration', 'client', 'deadline', 'release'];
    const lowKeywords = ['refactor', 'cleanup', 'docs', 'readme', 'typo', 'nice to have', 'later', 'backlog', 'minor', 'color'];

    if (urgentKeywords.some(kw => textToAnalyze.includes(kw))) {
      score += 35;
      rationaleParts.push('Contains critical blocker / security keywords.');
    } else if (highKeywords.some(kw => textToAnalyze.includes(kw))) {
      score += 20;
      rationaleParts.push('High business impact on revenue, auth, or infrastructure.');
    } else if (lowKeywords.some(kw => textToAnalyze.includes(kw))) {
      score -= 20;
      rationaleParts.push('Non-blocking maintenance / polish item.');
    }

    // Due date proximity
    if (dueDate) {
      const now = new Date();
      const targetDate = new Date(dueDate);
      const diffDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        score += 30;
        rationaleParts.push(`Deadline is immediate (${diffDays <= 0 ? 'overdue / today' : 'within 24 hours'}).`);
      } else if (diffDays <= 3) {
        score += 15;
        rationaleParts.push('Due within 3 business days.');
      } else if (diffDays > 14) {
        score -= 10;
        rationaleParts.push('Long runway (> 2 weeks).');
      }
    }

    // Clamp score
    score = Math.min(99, Math.max(15, score));

    let priority = 'medium';
    if (score >= 85) priority = 'urgent';
    else if (score >= 70) priority = 'high';
    else if (score <= 35) priority = 'low';

    const rationale = rationaleParts.length > 0 
      ? rationaleParts.join(' ') 
      : `Standard priority based on baseline complexity and normal scheduling cycle.`;

    return {
      priority,
      score,
      rationale,
      source: 'TaskFlow Smart Heuristic Engine'
    };
  }

  /**
   * FEATURE 3: Task Summary Generation (Daily Standup & Sprint Pulse)
   */
  async generateSummary(tasks = []) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed');
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    const review = tasks.filter(t => t.status === 'review');
    const todo = tasks.filter(t => t.status === 'todo');
    const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');

    if (this.hasGemini && tasks.length > 0) {
      try {
        const taskBrief = tasks.map(t => `- [${t.status.toUpperCase()}] [${t.priority.toUpperCase()}] ${t.title}`).join('\n');
        const prompt = `Synthesize a daily standup and team productivity summary for these ${total} tasks:
${taskBrief}

Return a raw JSON object:
{
  "headline": "Punchy 1-line status overview",
  "completionRate": "${Math.round((completed.length / (total || 1)) * 100)}%",
  "accomplishments": ["Bullet 1", "Bullet 2"],
  "focusAreas": ["Immediate focus 1", "Immediate focus 2"],
  "blockersAndRisks": ["Risk/blocker item if any"],
  "aiRecommendation": "2 sentences of actionable advice to boost velocity."
}`;
        const rawText = await this.callGemini(prompt, 'You are an executive agile delivery coach.');
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          ...parsed,
          source: 'Gemini 1.5 Flash'
        };
      } catch (err) {
        console.warn('[AI Engine] Gemini summary failed, using heuristic:', err.message);
      }
    }

    // Heuristic Summary Engine
    const completionPercent = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    
    let headline = 'Sprint Velocity On Track';
    if (urgent.length > 0) {
      headline = `Action Required: ${urgent.length} urgent task${urgent.length > 1 ? 's' : ''} pending completion`;
    } else if (completionPercent >= 75) {
      headline = 'Exceptional Progress: Approaching milestone completion';
    }

    const accomplishments = completed.length > 0
      ? completed.slice(0, 3).map(t => `Completed: ${t.title}`)
      : ['No tasks marked completed yet in this current cycle.'];

    const focusAreas = inProgress.length > 0
      ? inProgress.slice(0, 3).map(t => `Active: ${t.title} (Priority: ${t.priority.toUpperCase()})`)
      : (todo.length > 0 ? todo.slice(0, 3).map(t => `Ready to start: ${t.title}`) : ['No pending tasks.']);

    const blockersAndRisks = urgent.length > 0
      ? urgent.map(t => `Urgent attention required: "${t.title}" (Score: ${t.ai_priority_score || 90}/100)`)
      : ['No critical blockers identified. Work distribution is well balanced.'];

    let aiRecommendation = `Maintain momentum by focusing on the ${inProgress.length} active work stream${inProgress.length === 1 ? '' : 's'}. Ensure peer reviews are scheduled promptly for items in review.`;
    if (urgent.length > 0) {
      aiRecommendation = `Clear the ${urgent.length} urgent item(s) first before taking on new backlog tasks to avoid context switching and delivery bottlenecks.`;
    }

    return {
      headline,
      completionRate: `${completionPercent}%`,
      stats: {
        total,
        completed: completed.length,
        inProgress: inProgress.length,
        inReview: review.length,
        todo: todo.length,
        urgentUnresolved: urgent.length
      },
      accomplishments,
      focusAreas,
      blockersAndRisks,
      aiRecommendation,
      source: 'TaskFlow Smart Heuristic Engine'
    };
  }
}

module.exports = new AIService();
