import React, { useState } from 'react';
import { 
  Languages, 
  Volume2, 
  Mic, 
  Square, 
  Play, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const EnglishView: React.FC = () => {
  const { englishSessions, updateEnglishPractice } = useLearning();

  const [selectedTopic, setSelectedTopic] = useState<string>('concurrency');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [userTranscript, setUserTranscript] = useState<string>('');

  const drills = [
    {
      id: 'concurrency',
      title: 'Explaining Java Concurrency & JMM to Senior Interviewers',
      category: 'Technical Architecture',
      prompt: 'How would you explain the difference between volatile and synchronized in Java?',
      modelResponse: `"In Java, volatile guarantees visibility and ordering across threads without acquiring exclusive locks. When a variable is marked volatile, all reads and writes are performed directly against main memory, bypassing CPU L1 and L2 caches, and the compiler injects memory barriers to prevent instruction reordering. 

On the other hand, synchronized provides both visibility and mutual exclusion, meaning only one thread can execute the protected critical section at any given time. For a Senior Architect, volatile is suitable for state flags or double-checked locking singletons, whereas synchronized or ReentrantLock is strictly required when multiple dependent operations must execute atomically."`,
      keyVocab: [
        { word: 'Mutual Exclusion', phonetics: '/ˈmjuː.tʃu.əl ɪkˈskluː.ʒən/', meaning: 'Ensuring no two processes access a shared resource concurrently' },
        { word: 'Memory Barrier', phonetics: '/ˈmem.ər.i ˈbær.i.ər/', meaning: 'CPU instruction preventing memory reordering' },
        { word: 'Instruction Reordering', phonetics: '/ɪnˈstrʌk.ʃən ˌriːˈɔː.dər.ɪŋ/', meaning: 'Compiler optimization rearranging bytecode execution' }
      ]
    },
    {
      id: 'outbox-explanation',
      title: 'Explaining Transactional Outbox Pattern in System Design',
      category: 'System Design',
      prompt: 'How do you guarantee that messages are sent to Kafka after database commit without dual-write issues?',
      modelResponse: `"To avoid distributed dual-write inconsistency between our PostgreSQL database and Apache Kafka, we implement the Transactional Outbox Pattern. 

Instead of publishing directly to Kafka inside the API request, we insert an outbox event record into an outbox_table within the exact same local ACID transaction as our business entity. Subsequently, a CDC tool like Debezium or an asynchronous polling worker reads the committed transactions from the PostgreSQL WAL log and safely publishes them to Kafka with at-least-once delivery guarantees. On the consumer side, we enforce idempotency keys to handle duplicate events safely."`,
      keyVocab: [
        { word: 'Dual-Write Problem', phonetics: '/ˈdjuː.əl raɪt/', meaning: 'Risk of partial failure when writing to DB and broker separately' },
        { word: 'Write-Ahead Log (WAL)', phonetics: '/raɪt əˈhed lɒɡ/', meaning: 'Append-only log for database crash recovery and CDC' },
        { word: 'Idempotency', phonetics: '/ˌaɪ.dəmˈpoʊ.tən.si/', meaning: 'Property where an operation produces identical results if repeated' }
      ]
    },
    {
      id: 'star-incident',
      title: 'Behavioral STAR: High-Severity Production Outage Response',
      category: 'Leadership & STAR',
      prompt: 'Tell me about a time when a critical production system failed under your watch.',
      modelResponse: `"Situation: During Black Friday peak traffic, our payment processing service began experiencing 504 Gateway Timeouts, causing checkout drops of 35%.

Task: As the Senior Lead, I needed to triage the root cause, mitigate the ongoing customer impact immediately, and coordinate clear stakeholder communication.

Action: I checked Prometheus connection pool metrics and discovered HikariCP connection starvation due to an unindexed foreign key query holding DB connections for 4 seconds. I immediately engaged our Circuit Breaker to reject non-critical cart queries, rolled out a hotfix index migration via Flyway, and scaled the DB read replicas.

Result: Latency normalized within 8 minutes. We recovered all queued transactions with zero data loss and published a thorough postmortem with automated query timeout guardrails."`,
      keyVocab: [
        { word: 'Connection Starvation', phonetics: '/kəˈnek.ʃən stɑːˈveɪ.ʃən/', meaning: 'Pool exhausted by slow or leaking queries' },
        { word: 'Root Cause Triage', phonetics: '/ruːt kɔːz ˈtriː.ɑːʒ/', meaning: 'Systematic diagnosis of outage trigger' },
        { word: 'Postmortem Guardrails', phonetics: '/ˌpoʊstˈmɔːr.təm/', meaning: 'Systematic fixes to prevent repeat failures' }
      ]
    }
  ];

  const current = drills.find(d => d.id === selectedTopic) || drills[0];

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setUserTranscript('Practicing verbal delivery: Focus on pacing, crisp pronunciation of technical jargon, and concise structure.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Senior Technical English & STAR Method"
        description="Speak fluently like a global tech lead. Practice articulating architectural trade-offs, concurrency models, and outage responses."
        badge={
          <Badge variant="cyan" size="sm" dot>
            Global Tech Lead Voice Practice
          </Badge>
        }
      />

      {/* Drill Selector */}
      <Card variant="default" className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {drills.map(d => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedTopic(d.id);
                if (isPlayingAudio) window.speechSynthesis.cancel();
                setIsPlayingAudio(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-mono border ${
                selectedTopic === d.id
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 font-bold'
                  : 'bg-surface-elevated text-text-muted border-border hover:border-border-muted hover:text-text-primary'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Practice Arena */}
      <Card variant="default" className="p-6 space-y-6">
        <div>
          <Badge variant="cyan" size="sm" className="mb-2">
            {current.category}
          </Badge>
          <div className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider mt-1">
            VERBAL PROMPT:
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-text-primary mt-1 leading-snug">
            {current.prompt}
          </h2>
        </div>

        {/* Model Response Box with Native Web Speech Audio Playback */}
        <div className="p-5 bg-surface-elevated border border-border rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>MODEL SENIOR TECH LEAD RESPONSE</span>
            </div>

            <Button
              variant={isPlayingAudio ? 'danger' : 'primary'}
              size="sm"
              className={!isPlayingAudio ? 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 border-cyan-400' : ''}
              onClick={() => handleSpeak(current.modelResponse)}
              icon={isPlayingAudio ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            >
              {isPlayingAudio ? 'Stop Voice Audio' : 'Listen with Native Speech'}
            </Button>
          </div>

          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap font-sans">
            {current.modelResponse}
          </p>
        </div>

        {/* High-Yield Technical Vocabulary Cards */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
            HIGH-YIELD PHONETICS & VOCABULARY:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {current.keyVocab.map((v, idx) => (
              <div key={idx} className="p-3.5 bg-surface-elevated border border-border rounded-xl space-y-1 font-mono text-xs">
                <div className="font-bold text-text-primary text-sm">{v.word}</div>
                <div className="text-cyan-400 text-[11px]">{v.phonetics}</div>
                <div className="text-text-secondary text-[11px] font-sans pt-1 leading-normal">{v.meaning}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Recording / Practice Box */}
        <div className="p-4 bg-surface-elevated border border-cyan-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              <Mic className="w-4 h-4" />
              <span>VERBAL DELIVERY SIMULATOR</span>
            </div>

            <Button
              variant={isRecording ? 'danger' : 'outline'}
              size="sm"
              onClick={handleToggleRecord}
              icon={isRecording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            >
              {isRecording ? 'Stop Practice' : 'Start Verbal Practice'}
            </Button>
          </div>

          {userTranscript && (
            <div className="p-3 bg-surface border border-border rounded-lg text-xs font-mono text-text-secondary">
              {userTranscript}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
