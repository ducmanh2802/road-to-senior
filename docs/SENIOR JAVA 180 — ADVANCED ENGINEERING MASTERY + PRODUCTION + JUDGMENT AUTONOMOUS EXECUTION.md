# SENIOR JAVA 180
# ADVANCED ENGINEERING MASTERY + PRODUCTION + JUDGMENT
# AUTONOMOUS FULL EXECUTION → VALIDATION → CERTIFICATION

---

# 0. MISSION

You are now the **Principal Java Engineer + Staff Backend Engineer + System Architect + SRE + Security Engineer + Performance Engineer + Senior Interviewer + Learning-System Architect + QA/Release Engineer** responsible for completing the `SENIOR JAVA 180` platform.

Your mission is to take the CURRENT repository and autonomously implement everything required to transform it from a Java learning platform into a:

> **production-grade Senior Java / Senior Backend Engineering mastery platform**

The system must train and prove:

```text
KNOWLEDGE
    ↓
IMPLEMENTATION
    ↓
DEBUGGING
    ↓
PERFORMANCE
    ↓
PRODUCTION
    ↓
ENGINEERING JUDGMENT
    ↓
ARCHITECTURE
    ↓
CODE REVIEW
    ↓
INCIDENT RESPONSE
    ↓
SYSTEM DESIGN
    ↓
DEFENSE
    ↓
SENIOR CERTIFICATION
```

You must:

```text
AUDIT
→ DISCOVER GAPS
→ PLAN
→ IMPLEMENT
→ TEST
→ BREAK
→ DEBUG
→ BENCHMARK
→ REVIEW
→ REMEDIATE
→ RE-AUDIT
→ CERTIFY
→ CONTINUE
```

Do NOT stop after creating a plan.

Do NOT stop after writing documentation.

Do NOT stop after creating lessons.

Do NOT stop after creating tests.

Continue autonomously until every feasible phase is implemented, integrated, tested, reachable, and certified.

---

# 1. PRIMARY CONSTRAINT

The finished project MUST remain:

# GOOGLE AI STUDIO COMPATIBLE

This is a hard requirement.

Every change must preserve:

```text
repository loadability
dependency installation
typecheck
tests
build
server startup
frontend startup
API availability
UI rendering
environment configuration
```

At the end, the project must still pass the Google AI Studio compatibility gate.

---

# 2. CURRENT PROJECT IS THE SOURCE OF TRUTH

Do not blindly trust:

- README
- old roadmap
- previous certification
- comments
- documentation
- feature flags
- test count
- UI labels

Verify actual implementation.

A capability is not considered complete merely because:

```text
file exists
OR
lesson exists
OR
test exists
OR
route exists
OR
UI button exists
```

It must be reachable and demonstrably functional.

---

# 3. NON-DESTRUCTIVE DEVELOPMENT

Never use:

```bash
git reset --hard
git clean -fd
git clean -fdx
git restore .
git checkout -- .
git push --force
```

Never delete unknown work.

Before modifying an existing file:

```text
inspect
→ understand
→ inspect diff
→ modify minimally
```

Preserve existing learning functionality.

Preserve:

```text
SENIOR_JAVA_180_STATE_V1
```

unless a deliberate versioned migration is required.

---

# 4. FIRST ACTION — FULL AUDIT

Before implementing new functionality:

Inspect:

```text
package.json
lockfiles
tsconfig*
vite.config*
README*
docs/**
src/**
tests/**
public/**
scripts/**
database/**
.github/**
.env.example
```

Also inspect:

```bash
git status --short
git branch
git log --oneline -20
git remote -v
```

Determine:

```text
frontend
backend
database
learning engine
competency engine
exercise engine
progress state
mastery
review
interview
project system
routing
API
testing
build
deployment
Google AI Studio compatibility
```

---

# 5. CREATE MASTER GAP AUDIT

Create:

```text
docs/SENIOR_ENGINEERING_MASTERY_FULL_AUDIT.md
```

Audit these domains:

```text
1. Engineering Judgment
2. Code Review
3. Architecture Review
4. Production Engineering
5. Incident Response
6. SRE / Observability
7. Performance Engineering
8. Capacity Planning
9. Distributed Systems Failure
10. Security Engineering
11. System Design
12. ADR / Architecture Decisions
13. Anti-pattern Detection
14. Testing Strategy
15. CI/CD / DevOps
16. AWS Engineering
17. Kafka / Messaging
18. Redis / Caching
19. Technical Leadership
20. AI-assisted Engineering
21. Senior Interview Defense
22. Integrated Capstone
23. Google AI Studio compatibility
```

Classify:

```text
P0 = blocker
P1 = senior-critical
P2 = important
P3 = optional
```

Then automatically generate the required implementation phases.

---

# 6. DO NOT BLINDLY FOLLOW A FIXED PHASE COUNT

The following roadmap is the minimum expected scope.

If the existing project already implements something properly:

```text
AUDIT
→ VERIFY
→ KEEP
```

Do not rebuild it.

If partially implemented:

```text
AUDIT
→ COMPLETE
```

If missing:

```text
CREATE
→ IMPLEMENT
→ TEST
→ CERTIFY
```

If an existing design is architecturally weak:

```text
IDENTIFY
→ REMEDIATE
→ MIGRATE SAFELY
→ TEST
```

---

# 7. MASTER PHASES

Execute the following phases automatically.

---

# PHASE A — ENGINEERING JUDGMENT

## A1 — Decision Training

Implement an engineering decision framework.

Every scenario should contain:

```text
Context
Constraints
Symptoms
Evidence
Options
Trade-offs
Decision
Rejected Alternatives
Consequences
Verification
```

The learner must not simply select a predefined answer.

Support:

```text
free-form reasoning
structured reasoning
trade-off analysis
evidence collection
decision confidence
```

---

# A2 — Senior-vs-Mid Decision Lab

Create scenarios where the obvious solution is deliberately tempting.

Example:

```text
API latency increased from 100ms to 800ms.
```

Do NOT reward:

```text
"Add Redis."
```

The learner must investigate:

```text
metrics
→ traces
→ database
→ external dependency
→ CPU
→ memory
→ GC
→ thread pools
→ network
```

Then decide.

Assessment must distinguish:

```text
guess
→ plausible reasoning
→ evidence-driven reasoning
→ senior-level reasoning
```

---

# PHASE B — CODE REVIEW MASTERY

Create:

```text
REVIEW-01 Code Review
REVIEW-02 Architecture Review
REVIEW-03 Security Review
REVIEW-04 Performance Review
REVIEW-05 Production Readiness Review
```

Each review lab provides intentionally flawed code/design.

The learner must identify:

```text
correctness bug
concurrency bug
transaction problem
security issue
N+1
bad abstraction
coupling
memory problem
performance regression
API issue
observability gap
testing gap
```

Require:

```text
finding
severity
evidence
explanation
suggested fix
trade-off
regression test
```

Do not mark review complete merely because a checklist was opened.

---

# PHASE C — PRODUCTION INCIDENT LAB

Create a production incident simulation engine.

Minimum incidents:

```text
CPU spike
Memory leak
GC pressure
Thread starvation
Deadlock
Database connection pool exhaustion
Slow query
N+1
API latency spike
5xx spike
Redis outage
Kafka consumer lag
Duplicate messages
Lost messages
Downstream timeout
Retry storm
Circuit breaker open
Transaction rollback issue
Partial failure
Deployment failure
```

Required learner workflow:

```text
OBSERVE
→ HYPOTHESIZE
→ COLLECT EVIDENCE
→ IDENTIFY ROOT CAUSE
→ FIX
→ VERIFY
→ PREVENT
→ POSTMORTEM
```

Each incident must contain evidence.

Do not fake success.

---

# PHASE D — POSTMORTEM / INCIDENT RESPONSE

Implement a postmortem artifact:

```text
Incident Summary
Timeline
Impact
Detection
Root Cause
Contributing Factors
Resolution
Recovery
Corrective Actions
Preventive Actions
Monitoring Improvements
Lessons Learned
```

Require the learner to distinguish:

```text
root cause
vs
symptom
vs
contributing factor
```

---

# PHASE E — PRODUCTION READINESS

Create:

```text
PRODUCTION READINESS GATE
```

Every major project must answer:

```text
How is it deployed?
How is it monitored?
How is failure detected?
How is it rolled back?
How is data backed up?
How is data restored?
What happens when DB fails?
What happens when Redis fails?
What happens when downstream fails?
What happens when messages duplicate?
What happens during partial deployment?
What happens under load?
```

Create a machine-readable readiness model.

Required states:

```text
NOT_READY
PARTIAL
READY
CERTIFIED
```

---

# PHASE F — OBSERVABILITY / SRE

Implement practical training for:

```text
structured logs
metrics
tracing
correlation IDs
health checks
readiness
liveness
SLI
SLO
error budget
alerting
dashboards
incident investigation
```

Teach:

```text
Golden Signals
RED
USE
```

where appropriate.

Create exercises where the learner must diagnose failures from observability evidence.

---

# PHASE G — PERFORMANCE ENGINEERING

Implement:

```text
PERF-01 Profiling
PERF-02 JFR
PERF-03 JMH
PERF-04 JVM
PERF-05 Database
PERF-06 API
PERF-07 Concurrency
PERF-08 Capacity Planning
```

Every optimization must follow:

```text
BASELINE
→ MEASURE
→ IDENTIFY BOTTLENECK
→ CHANGE
→ BENCHMARK
→ COMPARE
→ VERIFY
```

Reject:

```text
"I think this is faster."
```

unless supported by measurement.

---

# PHASE H — CAPACITY PLANNING

Create realistic estimation exercises.

Example:

```text
10M users
100K requests/sec
P95 < 200ms
20K DB QPS
500K events/sec
10GB/day logs
```

Require estimation of:

```text
CPU
RAM
DB capacity
connection pools
network
storage
replicas
Kafka partitions
cache size
throughput
headroom
```

Teach:

```text
back-of-the-envelope estimation
capacity limits
bottleneck identification
scaling strategy
cost/performance trade-off
```

---

# PHASE I — DISTRIBUTED SYSTEM FAILURE LAB

Create practical failure simulations for:

```text
network partition
duplicate delivery
message reordering
delayed message
lost message
consumer crash
producer retry
split brain concepts
stale cache
cache invalidation
partial failure
eventual consistency
distributed transaction failure
```

Require:

```text
failure
→ observe
→ explain
→ design mitigation
→ implement
→ verify
```

---

# PHASE J — KAFKA / MESSAGING

Where appropriate to the existing project architecture, add:

```text
Kafka concepts
producer
consumer
partition
offset
consumer group
ordering
delivery semantics
retry
dead letter
idempotency
consumer lag
rebalancing
schema evolution
```

Create labs.

Do not introduce a heavyweight runtime dependency merely for cosmetic learning content.

If external Kafka cannot run in Google AI Studio:

```text
provide deterministic educational simulation
```

but explicitly label it:

```text
SIMULATION
```

It must never pretend to be a production Kafka cluster.

---

# PHASE K — REDIS / CACHING

Implement:

```text
cache-aside
TTL
invalidation
stampede
thundering herd
distributed lock concepts
hot keys
cache consistency
failure behavior
```

Labs must demonstrate:

```text
without cache
vs
with cache
```

using measurable evidence where possible.

---

# PHASE L — SECURITY ENGINEERING

Implement practical exercises:

```text
authentication
authorization
session security
CSRF
CORS
SQL injection
XSS
SSRF
path traversal
deserialization
secret management
PII logging
rate limiting
input validation
dependency security
threat modeling
```

Create:

```text
SECURITY-01 Threat Modeling
SECURITY-02 API Security
SECURITY-03 Data Security
SECURITY-04 Production Security Review
```

The learner must identify attack surface and mitigation.

---

# PHASE M — SYSTEM DESIGN DEFENSE

Create senior-level system design cases:

```text
URL Shortener
Notification System
Payment System
Order System
Market Data System
Learning Platform
Job Scheduler
Distributed Cache
Event Processing Platform
```

Each must require:

```text
requirements
scale assumptions
API
data model
architecture
consistency
failure modes
security
observability
capacity
trade-offs
alternatives
ADR
```

---

# PHASE N — ADR / ARCHITECTURE DECISION ENGINE

Implement ADR support.

Examples:

```text
PostgreSQL vs MongoDB
REST vs gRPC
Kafka vs RabbitMQ
Redis strategy
Monolith vs Microservices
Optimistic vs Pessimistic Locking
Virtual Threads vs Platform Threads
Strong vs Eventual Consistency
```

ADR structure:

```text
Context
Problem
Options
Decision
Trade-offs
Consequences
Rejected Alternatives
Review Date
```

Require actual learner-generated decisions.

---

# PHASE O — ANTI-PATTERN LAB

Create intentionally flawed systems:

```text
God Class
God Service
Anemic Domain Model
Distributed Monolith
Shared Database
N+1
Chatty API
Over-fetching
Under-fetching
Premature Abstraction
Premature Optimization
Retry Storm
Cache Stampede
Thundering Herd
Circular Dependency
```

Learner must:

```text
DETECT
→ EXPLAIN
→ REFACTOR
→ TEST
→ BENCHMARK
```

---

# PHASE P — TESTING STRATEGY

Deepen testing beyond unit tests:

```text
unit
integration
repository
API
contract
security
concurrency
performance
regression
property-based
end-to-end
```

Teach test pyramid and appropriate boundaries.

Require:

```text
bug
→ regression test
→ fix
→ proof
```

Do not reward test quantity alone.

---

# PHASE Q — CI/CD + DEVOPS

Add practical concepts:

```text
Git workflow
CI
build
test
static analysis
security scan
artifact
deployment
rollback
blue/green
canary
health checks
```

If actual CI/CD infrastructure cannot run in Google AI Studio:

create deterministic configuration and simulation exercises, clearly marked as simulation.

Do not require unavailable infrastructure merely to mark the phase complete.

---

# PHASE R — AWS ENGINEERING

Keep AWS AIF-C01 preparation separate from actual engineering mastery.

Add practical architecture exercises for:

```text
IAM
EC2
S3
RDS
VPC
Lambda
CloudWatch
ECS/EKS concepts
load balancing
autoscaling
reliability
security
cost
```

Do not let certification trivia replace engineering skills.

---

# PHASE S — TECHNICAL LEADERSHIP

Add senior-level exercises:

```text
technical proposal
design review
PR review
architecture review
trade-off discussion
stakeholder communication
technical debt prioritization
migration plan
risk assessment
```

Require the learner to explain decisions to:

```text
developer
senior engineer
architect
product manager
non-technical stakeholder
```

---

# PHASE T — AI-ASSISTED ENGINEERING

Add an AI engineering track.

Teach:

```text
AI coding
AI debugging
AI test generation
AI code review
AI architecture critique
AI security review
AI documentation
```

Mandatory principle:

```text
AI SUGGESTS
→ ENGINEER VERIFIES
→ ENGINEER CHALLENGES
→ ENGINEER TESTS
→ ENGINEER ACCEPTS / REJECTS
```

Never allow AI output to count as evidence automatically.

The learner must demonstrate independent reasoning.

---

# PHASE U — SENIOR INTERVIEW DEFENSE

Expand the interview engine.

Minimum domains:

```text
Java
JVM
JMM
Concurrency
Spring
Database
REST
Security
Performance
Distributed Systems
System Design
Production
Architecture
Leadership
Trade-offs
```

Every question should support:

```text
answer
follow-up
counterargument
trade-off
defense
```

Example:

```text
Q:
Why Virtual Threads?

Follow-up:
What happens when the downstream database has only 20 connections?

Follow-up:
Does increasing threads solve the bottleneck?

Follow-up:
What metrics would prove your architecture works?
```

---

# PHASE V — SENIOR VS MID/JUNIOR CALIBRATION

Create a competency calibration engine.

Distinguish answers as:

```text
JUNIOR
MID
SENIOR
STAFF
```

based on:

```text
correctness
depth
evidence
trade-offs
failure awareness
production awareness
communication
```

Do not use arbitrary keyword matching alone.

---

# PHASE W — INTEGRATED PRODUCTION CAPSTONE

If an adequate capstone does not exist, create one.

It must integrate:

```text
Java
Spring Boot
REST
Database
Transactions
Concurrency
Security
Testing
Observability
Performance
Distributed Systems
Messaging
Caching
Deployment
Architecture
```

It must contain at least:

```text
1 concurrency problem
1 database performance problem
1 security problem
1 distributed failure
1 production incident
1 observability investigation
1 performance optimization
1 architecture trade-off
1 ADR
1 rollback/recovery scenario
```

---

# PHASE X — CAPSTONE FAILURE INJECTION

The capstone must be intentionally breakable.

Create controlled scenarios:

```text
database slowdown
database unavailable
Redis unavailable
downstream timeout
duplicate event
consumer lag
memory pressure
CPU pressure
race condition
bad deployment
configuration error
```

Learner must diagnose and recover.

---

# PHASE Y — SENIOR PRODUCTION DEFENSE

Before certification, ask the learner:

```text
Why this architecture?
Why this database?
Why this transaction model?
Why this concurrency model?
Why this cache?
Why this consistency model?
Why this messaging model?
What happens if DB fails?
What happens if Redis fails?
What happens if Kafka fails?
What happens under load?
How do you monitor it?
How do you rollback?
How do you recover?
What would you change at 10x scale?
What would you change at 100x scale?
```

Require evidence from the capstone.

---

# PHASE Z — FINAL SENIOR CERTIFICATION

Create:

```text
docs/SENIOR_ENGINEERING_FINAL_CERTIFICATION.md
```

Certification must require:

```text
Java                  PASS
JVM/JMM               PASS
Concurrency           PASS
Spring                PASS
Database              PASS
REST/API              PASS
Security              PASS
Testing               PASS
Performance            PASS
Observability         PASS
Distributed Systems   PASS
Messaging             PASS
Caching               PASS
System Design         PASS
Architecture          PASS
Code Review           PASS
Incident Response     PASS
Production Readiness  PASS
Capacity Planning     PASS
Technical Leadership  PASS
AI-assisted Engineering PASS
Senior Defense        PASS
Capstone              PASS
```

---

# 9. EVIDENCE-BASED MASTERY

The existing six-dimensional competency model must be extended where necessary.

Target model:

```text
Knowledge
Design
Implementation
Debugging
Optimization
Communication
Architecture
Production
Security
Reliability
Judgment
Leadership
Defense
```

Do NOT hardcode scores.

Every score must be backed by evidence:

```text
lesson
exercise
code
test
benchmark
incident
review
ADR
project
defense
```

---

# 10. NO FAKE COMPLETION

Never implement:

```text
mastery = 100
certified = true
exercisePassed = true
incidentSolved = true
reviewPassed = true
```

without legitimate evidence.

Never make the UI say:

```text
CERTIFIED
```

simply because a page was opened.

---

# 11. REACHABILITY REQUIREMENT

Every new capability must have:

```text
implementation
↓
service/domain
↓
actual production caller
↓
UI/API/workflow
↓
persistence if required
↓
test
↓
evidence
```

Test-only callers do not count.

Documentation does not count.

Dead code does not count.

Unused registry entries do not count.

Create:

```text
docs/SENIOR_ENGINEERING_REACHABILITY_AUDIT.md
```

---

# 12. LEARNING HUB INTEGRATION

Do not create a separate disconnected application.

Integrate all new content into the existing learning architecture:

```text
catalog
lesson
exercise
practice
project
incident
review
interview
mastery
progress
recommendation
certification
```

Use existing architecture where possible.

Do not duplicate engines unnecessarily.

---

# 13. ADAPTIVE LEARNING

Use existing mastery/recommendation infrastructure.

When learner is weak in:

```text
concurrency
```

recommend:

```text
lesson
→ exercise
→ failure lab
→ debugging
→ review
→ interview
```

When strong:

```text
advanced scenario
→ architecture
→ defense
```

---

# 14. GOOGLE AI STUDIO COMPATIBILITY — HARD GATE

After EVERY major phase run:

```text
dependency validation
typecheck
tests
build
startup smoke
```

At final stage run full compatibility audit.

Check:

```text
Node version
package manager
lockfile
ESM/CJS
Vite
frontend entry
backend entry
ports
HOST
environment variables
database
filesystem
Windows paths
client/server boundary
API routes
CORS
static assets
secret exposure
```

---

# 15. NO WINDOWS-ONLY ASSUMPTIONS

The project may be developed on Windows but must remain portable.

Forbidden runtime assumptions:

```text
C:\
D:\
C:/Users/...
D:/Stock/...
PowerShell-only
cmd-only
Windows-only binaries
```

Use portable path APIs.

---

# 16. NO FAKE EXTERNAL INFRASTRUCTURE

If Kafka/Redis/AWS/Kubernetes/etc. cannot run inside Google AI Studio:

do NOT pretend they are running.

Use one of:

```text
REAL SERVICE
SIMULATION
DOCUMENTED EXTERNAL DEPENDENCY
```

Clearly label simulation.

Simulation must be deterministic and useful for learning.

It must never masquerade as production evidence.

---

# 17. FINANCIAL / MARKET DATA SAFETY

If any existing project feature touches financial data:

never introduce:

```text
fake prices
fake market cap
fake index
fake fair value
fake flow
fake fundamentals
fake trading results
```

Learning examples must be clearly labeled:

```text
EDUCATIONAL EXAMPLE
SIMULATION
```

Real application financial data rules must remain unchanged.

---

# 18. TESTING GATE

For each phase:

```text
targeted tests
→ phase tests
→ regression
→ typecheck
→ build
```

Never delete tests to obtain green.

Never weaken assertions without a documented architectural reason.

---

# 19. PERFORMANCE GATE

Performance claims require evidence.

For benchmarkable work capture:

```text
baseline
after
delta
method
environment
limitations
```

Do not compare unrelated environments as if measurements were equivalent.

---

# 20. SECURITY GATE

Every new API or persistence capability must check:

```text
input validation
authorization
data exposure
secret handling
logging
rate limiting where appropriate
```

---

# 21. UI QUALITY GATE

Every new feature must be reachable through the existing UI/navigation architecture.

Check:

```text
loading
empty
error
success
disabled
progress
results
```

Do not create dead pages.

Do not expose fake completion.

---

# 22. PHASE CERTIFICATION

Each phase must create:

```text
docs/SENIOR_<PHASE>_DISCOVERY.md
docs/SENIOR_<PHASE>_ARCHITECTURE.md
docs/SENIOR_<PHASE>_CERTIFICATION.md
```

Certification requires:

```text
Implementation PASS
Tests PASS
Typecheck PASS
Build PASS
Reachability PASS
Learning integration PASS
Evidence PASS
Google AI Studio compatibility PASS
```

---

# 23. AUTONOMOUS REMEDIATION LOOP

After every phase:

```text
AUDIT
```

If:

```text
P0 > 0
OR
P1 > 0
OR
critical capability unreachable
OR
tests failing
OR
build failing
OR
runtime failing
OR
Google AI Studio compatibility failing
```

then:

```text
CREATE REMEDIATION PHASE
→ FIX
→ TEST
→ RE-AUDIT
```

Continue.

Do not ask the user what to do next.

---

# 24. FULL ROAD-TO-SENIOR INTEGRATION AUDIT

At the end audit the entire system:

```text
Java
→ Spring
→ Database
→ REST
→ Security
→ Concurrency
→ Performance
→ Distributed Systems
→ Messaging
→ Cache
→ Observability
→ Production
→ Architecture
→ Code Review
→ Incident Response
→ System Design
→ Leadership
→ AI Engineering
→ Interview
→ Capstone
→ Certification
```

Verify there are no disconnected subsystems.

---

# 25. FINAL COMPETENCY MATRIX

Create:

```text
docs/SENIOR_ENGINEERING_COMPETENCY_MATRIX.md
```

Include:

| Domain | Learn | Build | Break | Debug | Optimize | Review | Explain | Defend | Certified |
|---|---|---|---|---|---|---|---|---|---|
| Java | | | | | | | | | |
| JVM/JMM | | | | | | | | | |
| Concurrency | | | | | | | | | |
| Spring | | | | | | | | | |
| Database | | | | | | | | | |
| REST | | | | | | | | | |
| Security | | | | | | | | | |
| Testing | | | | | | | | | |
| Performance | | | | | | | | | |
| Distributed Systems | | | | | | | | | |
| Kafka/Messaging | | | | | | | | | |
| Redis/Cache | | | | | | | | | |
| Observability | | | | | | | | | |
| Production | | | | | | | | | |
| Architecture | | | | | | | | | |
| Code Review | | | | | | | | | |
| Incident Response | | | | | | | | | |
| Capacity Planning | | | | | | | | | |
| System Design | | | | | | | | | |
| Leadership | | | | | | | | | |
| AI Engineering | | | | | | | | | |
| Interview | | | | | | | | | |

---

# 26. FINAL SENIOR DEFENSE

Generate at minimum:

```text
20 Java
10 JVM/JMM
10 Concurrency
10 Spring
10 Database
10 REST/API
10 Security
10 Performance
10 Distributed Systems
10 Messaging
10 System Design
5 Production incidents
5 Architecture trade-offs
5 Leadership
5 AI-assisted engineering
```

Every question must support follow-up questions.

---

# 27. FINAL CAPSTONE GATE

The learner cannot be certified if the capstone is only:

```text
CRUD application
```

It must demonstrate:

```text
architecture
concurrency
database
security
observability
performance
failure handling
distributed concepts
testing
production readiness
```

---

# 28. FINAL GOOGLE AI STUDIO GATE

Before final certification:

```text
INSTALL                  PASS
TYPECHECK                PASS
TEST                     PASS
BUILD                    PASS
SERVER START             PASS
FRONTEND START           PASS
HTTP SMOKE               PASS
API SMOKE                PASS
UI SMOKE                 PASS
NO SECRET EXPOSURE       PASS
NO WINDOWS PATH          PASS
NO CLIENT/SERVER VIOLATION PASS
NO FAKE DATA INTRODUCED  PASS
```

If any critical gate fails:

```text
ROAD TO SENIOR = NOT CERTIFIED
```

Do not hide it.

---

# 29. FINAL DOCUMENTS

Create:

```text
docs/SENIOR_ENGINEERING_MASTERY_FULL_AUDIT.md
docs/SENIOR_ENGINEERING_REACHABILITY_AUDIT.md
docs/SENIOR_ENGINEERING_COMPETENCY_MATRIX.md
docs/SENIOR_ENGINEERING_FINAL_CERTIFICATION.md
docs/SENIOR_ENGINEERING_FINAL_REPORT.md
docs/GOOGLE_AI_STUDIO_FINAL_COMPATIBILITY.md
```

---

# 30. FINAL REPORT

Create:

```text
docs/SENIOR_ENGINEERING_FINAL_REPORT.md
```

Include:

```text
Initial State
Final State

Existing capabilities
New capabilities
Remediated capabilities

New lessons
New exercises
New labs
New projects
New incidents
New benchmarks
New reviews
New ADRs
New interview content

Tests before
Tests after

Typecheck
Build

Google AI Studio compatibility

P0
P1
P2
P3

Remaining limitations
```

---

# 31. GIT SAFETY

At the end:

```bash
git status --short
git diff --stat
git diff
```

Do not commit unrelated concurrent work.

Do not force push.

Do not reset the repository.

If the current workflow explicitly authorizes autonomous commit:

```text
review
→ test
→ commit
→ verify
```

Otherwise leave changes ready for review.

---

# 32. STOP CONDITIONS

STOP ONLY WHEN:

```text
P0 = 0
P1 = 0

all senior-critical domains implemented
all critical capabilities reachable
all major learning flows integrated
all critical tests pass
typecheck passes
build passes
runtime passes
Google AI Studio compatibility passes
capstone passes
senior defense passes
final certification passes
```

OR when an unavoidable external blocker exists.

External blockers include:

```text
missing credentials
unavailable external infrastructure
permission restrictions
active concurrent agent ownership
hardware-dependent operation unavailable
```

Never fake completion.

---

# 33. AUTONOMOUS EXECUTION LOOP

Execute continuously:

```text
FULL AUDIT
↓
GAP ANALYSIS
↓
PRIORITIZE
↓
CREATE PHASE
↓
IMPLEMENT
↓
TEST
↓
BREAK
↓
DEBUG
↓
BENCHMARK
↓
REVIEW
↓
REMEDIATE
↓
CERTIFY
↓
GOOGLE AI STUDIO COMPATIBILITY CHECK
↓
RE-AUDIT
↓
NEXT PHASE
```

Do not stop after one phase.

Do not wait for user approval between phases.

---

# 34. FINAL STATUS

Return exactly:

```text
SENIOR JAVA 180 — FINAL STATUS

MASTER AUDIT:
PASS / BLOCKED

P0:
N

P1:
N

PHASES COMPLETED:
N

NEW ENGINEERING CAPABILITIES:
N

NEW LABS:
N

NEW INCIDENTS:
N

NEW REVIEWS:
N

NEW BENCHMARKS:
N

CAPSTONE:
PASS / FAIL

SENIOR DEFENSE:
PASS / FAIL

TYPECHECK:
PASS / FAIL

TESTS:
PASS / FAIL

BUILD:
PASS / FAIL

RUNTIME:
PASS / FAIL

GOOGLE AI STUDIO:
PASS / FAIL

FINAL CERTIFICATION:
PASS / FAIL

REMAINING BLOCKERS:
...

REMAINING LIMITATIONS:
...

FINAL STATE:
CERTIFIED / NOT CERTIFIED
```

If every hard gate passes:

```text
SENIOR JAVA 180
=
SENIOR ENGINEERING MASTERY CERTIFIED
=
GOOGLE AI STUDIO RUNNABLE
```

Otherwise report:

```text
SENIOR JAVA 180
=
NOT CERTIFIED
```

---

# 35. START NOW

Do NOT ask for a phase-by-phase confirmation.

Start immediately:

```text
1. Repository discovery
2. Full audit
3. Existing roadmap verification
4. Engineering Judgment audit
5. Code Review audit
6. Production audit
7. Incident audit
8. Observability audit
9. Performance audit
10. Capacity audit
11. Distributed Failure audit
12. Security audit
13. System Design audit
14. ADR audit
15. Anti-pattern audit
16. Testing audit
17. CI/CD audit
18. AWS audit
19. Leadership audit
20. AI Engineering audit
21. Interview audit
22. Capstone audit
23. Google AI Studio compatibility audit
24. Generate missing phases
25. Execute all required phases
26. Remediate all failures
27. Re-run full regression
28. Run final Senior Defense
29. Run final Capstone Gate
30. Run final Google AI Studio Gate
31. Generate final certification
32. Generate final report
```

**DO NOT STOP AFTER THE AUDIT.**

**DO NOT STOP AFTER IMPLEMENTATION.**

**DO NOT STOP AFTER TESTS.**

**DO NOT STOP AFTER BUILD.**

Continue until the final certification gate passes or a genuine external blocker prevents completion.

# END MISSION