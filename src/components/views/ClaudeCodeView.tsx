import React, { useState } from 'react';
import { 
  Terminal, 
  Sparkles, 
  Cpu, 
  Copy, 
  Check, 
  ArrowRight, 
  Bot, 
  Code2, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CodeBlock } from '../ui/CodeBlock';
import { Button } from '../ui/Button';

export const ClaudeCodeView: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('subagent');

  const workflows = [
    {
      id: 'subagent',
      title: 'Architecting Custom Sub-Agents in Claude Code',
      category: 'Agent Orchestration',
      description: 'Define specialized sub-agents with narrow operational scopes, custom instruction boundaries, and automated tool authorizations.',
      promptTemplate: `claude --agents="architect,tester,security"
      
# Sub-Agent Definition: Backend Quality Architect
You are a Staff-Level Java & Spring Boot Code Review Agent.
Before approving any PR, you MUST run:
1. Architectural verification of transaction boundaries
2. N+1 query inspection on all JPA mappings
3. Concurrency check for unhandled race conditions or shared state
4. Testcontainers integration test validation`,
      commandSnippet: `// .claude/config.json
{
  "agents": {
    "java-architect": {
      "model": "claude-3-7-sonnet",
      "tools": ["bash", "file_edit", "read_dir"],
      "systemPrompt": "Enforce zero-leakage JMM volatile rules and non-blocking asynchronous patterns."
    }
  }
}`
    },
    {
      id: 'mcp',
      title: 'Model Context Protocol (MCP) Integration',
      category: 'Context & Tools',
      description: 'Connect Claude Code directly to internal databases, Kafka brokers, and Prometheus telemetry servers via MCP plugins.',
      promptTemplate: `claude mcp add postgresql "npx -y @modelcontextprotocol/server-postgres postgresql://localhost:5432/orders_db"
claude mcp add kafka "npx -y @modelcontextprotocol/server-kafka --brokers=localhost:9092"`,
      commandSnippet: `// Use Claude Code to query live telemetry and auto-generate Spring fixes
> @postgresql Analyze the index hit ratio on table 'order_items' and suggest a Flyway migration if sequential scans exceed 15%.`
    },
    {
      id: 'tdd-loop',
      title: 'Autonomous TDD & Testcontainers Verification Loop',
      category: 'Engineering Velocity',
      description: 'Instruct Claude Code to write failing Testcontainers integration tests, implement the minimal production code, and refactor cleanly.',
      promptTemplate: `Please implement the Outbox Event Dispatcher using TDD:
1. Write a failing @Testcontainers test using PostgreSQLContainer verifying that failed Kafka sends are retried 3 times with exponential backoff.
2. Implement the minimal OutboxDispatcherService to make all tests green.
3. Verify zero database connection leaks under load.`,
      commandSnippet: `claude "Run 'mvn test -Dtest=OutboxDispatcherTest' iteratively until 100% green without modifying test assertions."`
    }
  ];

  const current = workflows.find(w => w.id === selectedWorkflow) || workflows[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Claude Code & AI-Assisted Engineering"
        description="Master autonomous coding workflows, custom sub-agents, Model Context Protocol (MCP) integrations, and automated Testcontainers loops."
        badge={
          <Badge variant="primary" size="sm" dot>
            Next-Gen AI Developer Workflows
          </Badge>
        }
      />

      {/* Workflow Selector */}
      <Card variant="default" className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {workflows.map(w => (
            <button
              key={w.id}
              onClick={() => setSelectedWorkflow(w.id)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-mono border ${
                selectedWorkflow === w.id
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 font-bold'
                  : 'bg-surface-elevated text-text-muted border-border hover:border-border-muted hover:text-text-primary'
              }`}
            >
              {w.title}
            </button>
          ))}
        </div>
      </Card>

      {/* Workflow Deep Blueprint */}
      <Card variant="default" className="p-6 space-y-5">
        <div>
          <Badge variant="primary" size="sm" className="mb-2">
            {current.category}
          </Badge>
          <h2 className="text-xl font-bold text-text-primary mt-1">{current.title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed mt-2 font-sans">{current.description}</p>
        </div>

        {/* Prompt Blueprint */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-sky-400 uppercase font-bold">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> PRODUCTION AGENT PROMPT SPECIFICATION
            </span>
            <Badge variant="outline" size="sm">CLI Ready</Badge>
          </div>
          <CodeBlock
            code={current.promptTemplate}
            language="markdown"
            title="Agent Prompt Template"
            showLineNumbers
          />
        </div>

        {/* Configuration / Command snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400 uppercase font-bold">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4" /> CONFIGURATION & EXECUTION SCRIPT
            </span>
            <Badge variant="success" size="sm">Standard Config</Badge>
          </div>
          <CodeBlock
            code={current.commandSnippet}
            language="json"
            title="Configuration File"
            showLineNumbers
          />
        </div>
      </Card>
    </div>
  );
};
