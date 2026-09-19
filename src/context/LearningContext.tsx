import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  LearningTask, 
  TaskState, 
  RoadmapDay, 
  KnowledgeTopic, 
  MasteryDimensions, 
  KnowledgeStatus, 
  ReviewCard, 
  ReviewGrade, 
  DSAProblem, 
  SystemDesignProblem, 
  ClaudeCodeExercise, 
  EnglishSession, 
  ProjectFeature, 
  IncidentScenario, 
  InterviewQuestion, 
  MockInterviewSession, 
  CompetencyReadiness 
} from '../types';
import { 
  INITIAL_ROADMAP_DAYS, 
  INITIAL_TASKS, 
  INITIAL_KNOWLEDGE_TOPICS, 
  INITIAL_REVIEW_CARDS, 
  INITIAL_DSA_PROBLEMS, 
  INITIAL_SYSTEM_DESIGN_PROBLEMS, 
  INITIAL_CLAUDE_CODE_EXERCISES, 
  INITIAL_ENGLISH_SESSIONS, 
  INITIAL_PROJECT_FEATURES, 
  INITIAL_INCIDENTS, 
  INITIAL_INTERVIEW_QUESTIONS 
} from '../data/seedData';
import { calculateSm2Review } from '../engines/sm2';
import { calculateCompetencies, evaluateTopicDimensions, findWeakestDimension } from '../engines/competency';
import { validateIncidentHypothesis, validateBackupJson } from '../engines/stateValidation';

interface LearningContextType {
  currentDay: number;
  setCurrentDay: (day: number) => void;
  streak: number;
  studyTimeMinutes: number;
  isTimerRunning: boolean;
  toggleTimer: () => void;
  tasks: LearningTask[];
  roadmapDays: RoadmapDay[];
  knowledgeTopics: KnowledgeTopic[];
  reviewCards: ReviewCard[];
  dsaProblems: DSAProblem[];
  systemDesignProblems: SystemDesignProblem[];
  claudeCodeExercises: ClaudeCodeExercise[];
  englishSessions: EnglishSession[];
  projectFeatures: ProjectFeature[];
  incidents: IncidentScenario[];
  interviewQuestions: InterviewQuestion[];
  mockInterviews: MockInterviewSession[];
  
  // Actions
  setTaskState: (taskId: string, state: TaskState) => void;
  addTask: (task: Omit<LearningTask, 'id'>) => void;
  updateTaskNotes: (taskId: string, notes: string) => void;
  recordReviewAnswer: (cardId: string, grade: ReviewGrade, durationSec: number) => void;
  updateKnowledgeDimensions: (topicId: string, dims: Partial<MasteryDimensions>) => void;
  updateKnowledgeStatus: (topicId: string, status: KnowledgeStatus) => void;
  recordDsaAttempt: (problemId: string, durationMin: number, solvedWithoutHelp: boolean, notes?: string) => void;
  toggleDsaMastered: (problemId: string) => void;
  submitSystemDesignRubric: (problemId: string, rubric: SystemDesignProblem['rubricScores'], notes?: string) => void;
  updateClaudeCodeExercise: (exerciseId: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED', notes?: string) => void;
  updateEnglishPractice: (sessionId: string, spoken: boolean, written: boolean, dimensions?: EnglishSession['qualitativeDimensions']) => void;
  toggleProjectStage: (featureId: string, stageKey: keyof ProjectFeature['stages']) => void;
  investigateIncident: (incidentId: string, selectedHypothesisIndex: number) => { isCorrect: boolean; message: string };
  resolveIncident: (incidentId: string, postmortemData?: IncidentScenario['postmortem']) => void;
  recordMockInterview: (interview: Omit<MockInterviewSession, 'id'>) => void;
  createReviewCardFromMistake: (question: string, expectedAnswer: string, category: string) => void;
  
  // Computations
  getWeakestDimension: () => { topicTitle: string; dimension: string; score: number; action: string } | null;
  getNextBestAction: () => { title: string; category: string; description: string; targetView: string; actionLabel: string };
  getCompetencies: () => CompetencyReadiness[];
  exportDataAsJson: () => string;
  importDataFromJson: (jsonStr: string) => boolean;
  resetToDemoData: () => void;
}

const STORAGE_KEY = 'SENIOR_JAVA_180_STATE_V1';

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialize from seed data
  const [currentDay, setCurrentDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.currentDay || 37;
      }
    } catch (e) {
      console.error(e);
    }
    return 37;
  });

  const [streak, setStreak] = useState<number>(14);
  const [studyTimeMinutes, setStudyTimeMinutes] = useState<number>(142);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const [tasks, setTasks] = useState<LearningTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tasks) return parsed.tasks;
      }
    } catch (e) { console.error(e); }
    return INITIAL_TASKS;
  });

  const [roadmapDays, setRoadmapDays] = useState<RoadmapDay[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.roadmapDays) return parsed.roadmapDays;
      }
    } catch (e) { console.error(e); }
    return INITIAL_ROADMAP_DAYS;
  });

  const [knowledgeTopics, setKnowledgeTopics] = useState<KnowledgeTopic[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.knowledgeTopics) return parsed.knowledgeTopics;
      }
    } catch (e) { console.error(e); }
    return INITIAL_KNOWLEDGE_TOPICS;
  });

  const [reviewCards, setReviewCards] = useState<ReviewCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.reviewCards) return parsed.reviewCards;
      }
    } catch (e) { console.error(e); }
    return INITIAL_REVIEW_CARDS;
  });

  const [dsaProblems, setDsaProblems] = useState<DSAProblem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dsaProblems) return parsed.dsaProblems;
      }
    } catch (e) { console.error(e); }
    return INITIAL_DSA_PROBLEMS;
  });

  const [systemDesignProblems, setSystemDesignProblems] = useState<SystemDesignProblem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.systemDesignProblems) return parsed.systemDesignProblems;
      }
    } catch (e) { console.error(e); }
    return INITIAL_SYSTEM_DESIGN_PROBLEMS;
  });

  const [claudeCodeExercises, setClaudeCodeExercises] = useState<ClaudeCodeExercise[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.claudeCodeExercises) return parsed.claudeCodeExercises;
      }
    } catch (e) { console.error(e); }
    return INITIAL_CLAUDE_CODE_EXERCISES;
  });

  const [englishSessions, setEnglishSessions] = useState<EnglishSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.englishSessions) return parsed.englishSessions;
      }
    } catch (e) { console.error(e); }
    return INITIAL_ENGLISH_SESSIONS;
  });

  const [projectFeatures, setProjectFeatures] = useState<ProjectFeature[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.projectFeatures) return parsed.projectFeatures;
      }
    } catch (e) { console.error(e); }
    return INITIAL_PROJECT_FEATURES;
  });

  const [incidents, setIncidents] = useState<IncidentScenario[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.incidents) return parsed.incidents;
      }
    } catch (e) { console.error(e); }
    return INITIAL_INCIDENTS;
  });

  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.interviewQuestions) return parsed.interviewQuestions;
      }
    } catch (e) { console.error(e); }
    return INITIAL_INTERVIEW_QUESTIONS;
  });

  const [mockInterviews, setMockInterviews] = useState<MockInterviewSession[]>([]);

  // Persistent save to LocalStorage
  useEffect(() => {
    const payload = {
      currentDay,
      streak,
      studyTimeMinutes,
      tasks,
      roadmapDays,
      knowledgeTopics,
      reviewCards,
      dsaProblems,
      systemDesignProblems,
      claudeCodeExercises,
      englishSessions,
      projectFeatures,
      incidents,
      interviewQuestions,
      mockInterviews
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [
    currentDay,
    streak,
    studyTimeMinutes,
    tasks,
    roadmapDays,
    knowledgeTopics,
    reviewCards,
    dsaProblems,
    systemDesignProblems,
    claudeCodeExercises,
    englishSessions,
    projectFeatures,
    incidents,
    interviewQuestions,
    mockInterviews
  ]);

  // Live Timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudyTimeMinutes(prev => prev + 1);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  const setTaskState = (taskId: string, state: TaskState) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = state === 'COMPLETED';
        if (isNowCompleted && t.state !== 'COMPLETED') {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.85 }
          });
        }
        return {
          ...t,
          state,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
  };

  const addTask = (task: Omit<LearningTask, 'id'>) => {
    const newTask: LearningTask = {
      ...task,
      id: 'task-' + Date.now()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTaskNotes = (taskId: string, notes: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, notes } : t));
  };

  // Spaced Repetition Engine (SuperMemo-2 derivative)
  const recordReviewAnswer = (cardId: string, grade: ReviewGrade, durationSec: number) => {
    setReviewCards(prev => prev.map(card => {
      if (card.id !== cardId) return card;

      const sm2Result = calculateSm2Review(card, grade);

      return {
        ...card,
        ...sm2Result,
        history: [
          ...card.history,
          {
            date: sm2Result.lastReviewedAt,
            grade,
            durationSec
          }
        ]
      };
    }));
  };

  const updateKnowledgeDimensions = (topicId: string, dims: Partial<MasteryDimensions>) => {
    setKnowledgeTopics(prev => prev.map(topic => {
      if (topic.id !== topicId) return topic;
      const evalResult = evaluateTopicDimensions(dims, topic.dimensions);

      return {
        ...topic,
        dimensions: evalResult.dimensions,
        confidence: evalResult.confidence,
        status: evalResult.status,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const updateKnowledgeStatus = (topicId: string, status: KnowledgeStatus) => {
    setKnowledgeTopics(prev => prev.map(topic => 
      topic.id === topicId ? { ...topic, status, updatedAt: new Date().toISOString() } : topic
    ));
  };

  const recordDsaAttempt = (problemId: string, durationMin: number, solvedWithoutHelp: boolean, notes?: string) => {
    setDsaProblems(prev => prev.map(p => {
      if (p.id !== problemId) return p;
      return {
        ...p,
        attempts: p.attempts + 1,
        bestTimeMinutes: p.bestTimeMinutes ? Math.min(p.bestTimeMinutes, durationMin) : durationMin,
        solvedWithoutHelp,
        notes: notes || p.notes,
        lastSolvedAt: new Date().toISOString()
      };
    }));
  };

  const toggleDsaMastered = (problemId: string) => {
    setDsaProblems(prev => prev.map(p => p.id === problemId ? { ...p, mastered: !p.mastered } : p));
  };

  const submitSystemDesignRubric = (problemId: string, rubric: SystemDesignProblem['rubricScores'], notes?: string) => {
    setSystemDesignProblems(prev => prev.map(sd => {
      if (sd.id !== problemId) return sd;
      return {
        ...sd,
        rubricScores: rubric,
        notes: notes || sd.notes,
        completed: true
      };
    }));
  };

  const updateClaudeCodeExercise = (exerciseId: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED', notes?: string) => {
    setClaudeCodeExercises(prev => prev.map(c => 
      c.id === exerciseId ? { ...c, status, notes: notes || c.notes } : c
    ));
  };

  const updateEnglishPractice = (sessionId: string, spoken: boolean, written: boolean, dimensions?: EnglishSession['qualitativeDimensions']) => {
    setEnglishSessions(prev => prev.map(e => {
      if (e.id !== sessionId) return e;
      return {
        ...e,
        practicedSpoken: spoken,
        practicedWritten: written,
        qualitativeDimensions: dimensions || e.qualitativeDimensions
      };
    }));
  };

  const toggleProjectStage = (featureId: string, stageKey: keyof ProjectFeature['stages']) => {
    setProjectFeatures(prev => prev.map(feat => {
      if (feat.id !== featureId) return feat;
      return {
        ...feat,
        stages: {
          ...feat.stages,
          [stageKey]: !feat.stages[stageKey]
        }
      };
    }));
  };

  const investigateIncident = (incidentId: string, selectedHypothesisIndex: number) => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc) return { isCorrect: false, message: 'Incident not found' };

    const validationResult = validateIncidentHypothesis(inc, selectedHypothesisIndex);
    if (validationResult.isCorrect) {
      setIncidents(prev => prev.map(i => i.id === incidentId ? { ...i, status: 'INVESTIGATING' } : i));
    }
    return validationResult;
  };

  const resolveIncident = (incidentId: string, postmortemData?: IncidentScenario['postmortem']) => {
    setIncidents(prev => prev.map(i => {
      if (i.id !== incidentId) return i;
      return {
        ...i,
        status: 'RESOLVED',
        postmortem: postmortemData || {
          impact: 'P0 service disruption mitigated.',
          rootCause: i.rootCauseAnalysis,
          detection: 'Micrometer metric alerts triggered within 60s.',
          resolution: 'Hotfix applied and verified under JMeter load.',
          prevention: i.preventionStrategy
        }
      };
    }));
    confetti({ particleCount: 50, spread: 80 });
  };

  const recordMockInterview = (interview: Omit<MockInterviewSession, 'id'>) => {
    const newSession: MockInterviewSession = {
      ...interview,
      id: 'mock-' + Date.now()
    };
    setMockInterviews(prev => [newSession, ...prev]);

    // Auto-create review cards for forgotten or failed topics
    if (interview.reviewItemsToCreate && interview.reviewItemsToCreate.length > 0) {
      interview.reviewItemsToCreate.forEach(item => {
        createReviewCardFromMistake(item, 'Derived from mock interview gap analysis: ' + item, interview.type);
      });
    }
  };

  const createReviewCardFromMistake = (question: string, expectedAnswer: string, category: string) => {
    const newCard: ReviewCard = {
      id: 'card-err-' + Date.now(),
      category: category.toUpperCase(),
      question,
      expectedAnswer,
      intervalDays: 1,
      repetitionCount: 0,
      easeFactor: 2.2,
      nextReviewAt: new Date().toISOString(),
      history: []
    };
    setReviewCards(prev => [newCard, ...prev]);
  };

  const getWeakestDimension = () => {
    return findWeakestDimension(knowledgeTopics);
  };

  const getNextBestAction = () => {
    // 1. Check for unresolved P0 incidents
    const unresolvedP0 = incidents.find(i => i.status !== 'RESOLVED' && i.severity.startsWith('P0'));
    if (unresolvedP0) {
      return {
        title: 'Break The System Incident Active',
        category: 'INCIDENT_LAB',
        description: `Triage P0 incident: ${unresolvedP0.title}`,
        targetView: 'incident',
        actionLabel: 'Triage Incident'
      };
    }

    // 2. Check overdue review cards
    const now = new Date();
    const dueReviews = reviewCards.filter(c => new Date(c.nextReviewAt) <= now);
    if (dueReviews.length > 0) {
      return {
        title: `${dueReviews.length} Spaced Repetition Cards Due`,
        category: 'REVIEW',
        description: 'Complete active recall flashcards to reinforce memory retention.',
        targetView: 'review',
        actionLabel: 'Start Spaced Review'
      };
    }

    // 3. Check for weakest knowledge dimension
    const weakest = getWeakestDimension();
    if (weakest && weakest.score <= 2) {
      return {
        title: `Remediate Weak Dimension: ${weakest.dimension.toUpperCase()}`,
        category: 'KNOWLEDGE',
        description: `${weakest.topicTitle} is lagging on ${weakest.dimension}. Recommended: ${weakest.action}`,
        targetView: 'knowledge',
        actionLabel: 'Strengthen Concept'
      };
    }

    // 4. In-progress or next TODO task
    const activeTask = tasks.find(t => t.state === 'IN_PROGRESS') || tasks.find(t => t.state === 'TODO');
    if (activeTask) {
      return {
        title: `Day ${currentDay} Core Task: ${activeTask.title}`,
        category: activeTask.category,
        description: activeTask.description,
        targetView: 'today',
        actionLabel: 'Continue Task'
      };
    }

    return {
      title: 'Practice System Design or Mock Interview',
      category: 'INTERVIEW',
      description: 'Daily tasks complete! Run a 45-minute timed System Design architecture round.',
      targetView: 'systemdesign',
      actionLabel: 'Launch System Design'
    };
  };

  const getCompetencies = (): CompetencyReadiness[] => {
    return calculateCompetencies(knowledgeTopics);
  };

  const exportDataAsJson = () => {
    const data = {
      currentDay,
      streak,
      studyTimeMinutes,
      tasks,
      roadmapDays,
      knowledgeTopics,
      reviewCards,
      dsaProblems,
      systemDesignProblems,
      claudeCodeExercises,
      englishSessions,
      projectFeatures,
      incidents,
      interviewQuestions,
      mockInterviews,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataFromJson = (jsonStr: string) => {
    const validation = validateBackupJson(jsonStr);
    if (!validation.isValid || !validation.data) {
      return false;
    }
    const data = validation.data;
    if (data.currentDay) setCurrentDay(data.currentDay);
    if (data.tasks) setTasks(data.tasks);
    if (data.knowledgeTopics) setKnowledgeTopics(data.knowledgeTopics);
    if (data.reviewCards) setReviewCards(data.reviewCards);
    if (data.dsaProblems) setDsaProblems(data.dsaProblems);
    if (data.systemDesignProblems) setSystemDesignProblems(data.systemDesignProblems);
    if (data.claudeCodeExercises) setClaudeCodeExercises(data.claudeCodeExercises);
    if (data.englishSessions) setEnglishSessions(data.englishSessions);
    if (data.projectFeatures) setProjectFeatures(data.projectFeatures);
    if (data.incidents) setIncidents(data.incidents);
    if (data.interviewQuestions) setInterviewQuestions(data.interviewQuestions);
    return true;
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentDay(37);
    setStreak(14);
    setStudyTimeMinutes(142);
    setTasks(INITIAL_TASKS);
    setRoadmapDays(INITIAL_ROADMAP_DAYS);
    setKnowledgeTopics(INITIAL_KNOWLEDGE_TOPICS);
    setReviewCards(INITIAL_REVIEW_CARDS);
    setDsaProblems(INITIAL_DSA_PROBLEMS);
    setSystemDesignProblems(INITIAL_SYSTEM_DESIGN_PROBLEMS);
    setClaudeCodeExercises(INITIAL_CLAUDE_CODE_EXERCISES);
    setEnglishSessions(INITIAL_ENGLISH_SESSIONS);
    setProjectFeatures(INITIAL_PROJECT_FEATURES);
    setIncidents(INITIAL_INCIDENTS);
    setInterviewQuestions(INITIAL_INTERVIEW_QUESTIONS);
    setMockInterviews([]);
  };

  return (
    <LearningContext.Provider
      value={{
        currentDay,
        setCurrentDay,
        streak,
        studyTimeMinutes,
        isTimerRunning,
        toggleTimer,
        tasks,
        roadmapDays,
        knowledgeTopics,
        reviewCards,
        dsaProblems,
        systemDesignProblems,
        claudeCodeExercises,
        englishSessions,
        projectFeatures,
        incidents,
        interviewQuestions,
        mockInterviews,
        setTaskState,
        addTask,
        updateTaskNotes,
        recordReviewAnswer,
        updateKnowledgeDimensions,
        updateKnowledgeStatus,
        recordDsaAttempt,
        toggleDsaMastered,
        submitSystemDesignRubric,
        updateClaudeCodeExercise,
        updateEnglishPractice,
        toggleProjectStage,
        investigateIncident,
        resolveIncident,
        recordMockInterview,
        createReviewCardFromMistake,
        getWeakestDimension,
        getNextBestAction,
        getCompetencies,
        exportDataAsJson,
        importDataFromJson,
        resetToDemoData
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearning must be used within LearningProvider');
  return ctx;
};
