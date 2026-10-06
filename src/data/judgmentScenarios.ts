/**
 * Phase A — Engineering Judgment scenarios.
 *
 * Every scenario follows mission §A1:
 *
 *   Context → Constraints → Symptoms → Evidence → Options → Trade-offs
 *   → Decision → Rejected Alternatives → Consequences → Verification
 *
 * Every scenario also carries a documented TEMPTING SHORTCUT (§A2). A learner
 * can score by guessing that shortcut — and the evaluation will mark them down
 * for it. The scenarios below are authored from real failure patterns, not
 * invented: each names a symptom a senior has actually seen at 02:00.
 */
import type { JudgmentScenario } from '../engines/judgmentEngine';

export const JUDGMENT_SCENARIOS: JudgmentScenario[] = [
  {
    id: 'JUD-01',
    title: 'Checkout latency jumped 100ms → 800ms at 14:02',
    domain: 'performance',
    temptingShortcut: 'Add Redis in front of the database.',
    whyTempting:
      'Caching is the reflex answer to latency. It is also the fastest way to hide a regression and to introduce a second consistency model under load.',
    context:
      'A Spring Boot checkout service has served p95 = 100ms for six weeks. At 14:02 today p95 = 800ms and p99 = 2.4s. Error rate is unchanged at 0.02%. Checkout is the only affected endpoint; catalogue browsing is untouched. The last deploy was 11 days ago.',
    constraints: [
      'A page is open and revenue is affected for every customer currently checking out',
      'No infrastructure change may be made during business hours without a two-hour soak',
      'The team has never run this service with a cache and has no cache hit-rate dashboard',
    ],
    symptoms: [
      'p95 8x worse, p99 24x worse, error rate flat',
      'Only checkout is affected — catalogue and account are normal',
      'Last deploy was 11 days ago, so a fresh deploy is not the obvious trigger',
    ],
    availableEvidence: ['metric', 'percentile', 'trace', 'dependency', 'database', 'cpu-memory', 'gc', 'thread-pool', 'deployment-diff'],
    options: [
      {
        id: 'JUD-01-A',
        action: 'Add Redis in front of the database.',
        outcome: 'Latency improves for reads that hit the cache and silently degrades for writes. The team cannot tell, because there is no hit-rate dashboard.',
      },
      {
        id: 'JUD-01-B',
        action: 'Roll back to the previous version immediately.',
        outcome: 'A no-op: the last deploy was 11 days ago, so there is nothing newer to roll back to. You burn 20 minutes of incident time and learn nothing.',
      },
      {
        id: 'JUD-01-C',
        action: 'Read the trace waterfall for a slow checkout before changing anything, then follow the slowest span into the database or the dependency it calls.',
        outcome: 'You find the actual bottleneck. If it is a new slow query you fix the query. If it is a saturated thread pool you size the pool. Either way you learn which one it is.',
      },
      {
        id: 'JUD-01-D',
        action: 'Increase the Tomcat thread pool and container CPU limit.',
        outcome: 'Latency drops until the database saturates, then the whole service fails at once instead of degrading gradually. You converted a partial degradation into an outage.',
      },
      {
        id: 'JUD-01-E',
        action: 'Add a circuit breaker around the database.',
        outcome: 'Requests fail fast and the error rate climbs from 0.02% to 40%. You converted a slow success into a fast failure.',
      },
    ],
    correctOptionIndex: 2,
    rejectedAlternatives: [
      'JUD-01-A: a cache adds a second consistency model and no observability. It hides the regression instead of locating it, and it cannot explain an 11-day-stable service degrading today.',
      'JUD-01-B: rolling back requires a change. There is no change to roll back, so this action has no effect on the system.',
      'JUD-01-D: raising limits without knowing the bottleneck moves the queue to the next saturated resource. Unbounded concurrency converts degradation into failure.',
      'JUD-01-E: a circuit breaker protects a dependency, it does not repair one. The database is not the reported problem — nothing in the evidence says it is.',
    ],
    seniorDecision:
      'Read the trace waterfall first and follow the slowest span to its cause. Only add a cache afterwards, if the trace proves the cost is repeated identical reads — and then ship it with a hit-rate dashboard, because an unobservable cache is an unverifiable optimisation.',
    consequence:
      'You spend 10-15 minutes reading telemetry instead of 2 minutes applying a fix. During that time some checkouts still fail. You also accept that whatever you find will need a fix plus a soak, so the full time-to-mitigate is longer than the shortcut would have taken.',
    verification:
      'Re-measure p95 and p99 after the change, and confirm the error rate did not move. Keep the trace waterfall open during the soak — the metric must move, not just your intuition.',
    falsifier:
      'If the slowest span in the trace is the database query and the plan has not changed, then the cause is data volume or lock contention, not code — and a cache would mask it while the underlying lock problem keeps growing.',
  },
  {
    id: 'JUD-02',
    title: 'A Kafka consumer is losing messages under rebalance',
    domain: 'distributed-systems',
    temptingShortcut: 'Increase max.poll.records so each batch is bigger.',
    whyTempting:
      'Bigger batches mean fewer rebalances per unit of work. It also means longer processing per poll, a larger rebalance window, and more work thrown away each time a consumer leaves.',
    context:
      'An order-service consumer group has 12 members. Each message is processed in ~400ms. max.poll.records = 500, so a poll can take up to 200s to drain. Processing is idempotent. The group rebalances every few minutes and throughput drops ~40% each time.',
    constraints: [
      'Processing is already idempotent, so duplicate delivery is survivable',
      'The rebalance must not be disabled by setting a session timeout far above the processing time',
      'The team cannot redeploy all 12 members at once',
    ],
    symptoms: [
      'Rebalance every few minutes',
      'Throughput drops ~40% per rebalance then recovers',
      'Processing time per message (~400ms) is far below the poll drain time (~200s)',
    ],
    availableEvidence: ['metric', 'log', 'queue-depth', 'dependency', 'deployment-diff'],
    options: [
      {
        id: 'JUD-02-A',
        action: 'Increase max.poll.records so each batch is bigger.',
        outcome: 'Rebalances become less frequent, but each one now discards far more unprocessed work. Net throughput often drops further.',
      },
      {
        id: 'JUD-02-B',
        action: 'Pause the consumers, then resume them.',
        outcome: 'You get one clean rebalance and the same steady-state behaviour immediately after.',
      },
      {
        id: 'JUD-02-C',
        action: 'Lower max.poll.records so a poll drains well inside max.poll.interval.ms, and let the consumer keep polling.',
        outcome: 'The consumer returns to the group between batches, so it is not evicted mid-batch. Rebalance storms stop.',
      },
      {
        id: 'JUD-02-D',
        action: 'Set max.poll.interval.ms to 30 minutes.',
        outcome: 'Eviction stops, but a genuinely stuck consumer now holds its partitions for 30 minutes before anyone notices. You converted a throughput problem into a silent availability problem.',
      },
      {
        id: 'JUD-02-E',
        action: 'Add more consumer instances to the group.',
        outcome: 'More partitions are consumed in parallel until the group exceeds the partition count, at which point extra members idle and the rebalance cost grows.',
      },
    ],
    correctOptionIndex: 2,
    rejectedAlternatives: [
      'JUD-02-A: the eviction is caused by the poll taking too long to drain, so enlarging the batch lengthens the eviction window. Bigger batches increase the discarded work per rebalance.',
      'JUD-02-B: a restart changes nothing about the steady-state configuration; the storm returns.',
      'JUD-02-D: raising the interval hides the symptom by refusing to evict a slow consumer. The correct fix is to make the batch drain inside the existing interval.',
      'JUD-02-E: consumer count is only useful up to the partition count; beyond that, members idle and rebalance cost rises.',
    ],
    seniorDecision:
      'Treat max.poll.records as the variable that must fit inside max.poll.interval.ms. Size the batch so a full drain finishes with headroom, and verify with consumer lag and rebalance counts from the group describe output.',
    consequence:
      'Per-poll throughput drops because each poll carries less work. You accept lower batch efficiency in exchange for never losing the partition, which is the correct trade when the group is the bottleneck.',
    verification:
      'Watch `kafka-consumer-groups --describe --group <group>` for a falling rebalance count and consumer lag returning to zero. If lag still climbs, the batch is still too large.',
    falsifier:
      'If consumer lag stays at zero and the group rebalance counter is flat while p99 processing time is climbing, then the cause is not eviction but downstream latency — and shrinking the batch will make things worse by reducing parallelism.',
  },
  {
    id: 'JUD-03',
    title: 'A production database is at 92% CPU with no deploy',
    domain: 'data',
    temptingShortcut: 'Add a read replica and route reads to it.',
    whyTempting:
      'A replica is the standard answer to read-heavy CPU. It also introduces replication lag, and if the problem is a lock rather than read volume, a replica changes nothing while quietly serving stale data.',
    context:
      'PostgreSQL primary at 92% CPU for 20 minutes, peaking at 98%. No deploy in 3 days. pg_stat_statements shows one query at 61% of total time: an N+1 pattern introduced by a feature that reads an account and then its last 50 orders, one query per order. The replica is 400ms behind.',
    constraints: [
      'Reads must return the order the customer just placed',
      'The replica cannot be rebuilt tonight',
      'No schema change may be deployed during the incident',
    ],
    symptoms: [
      'No deploy in 3 days, so code is not the trigger',
      'One query dominates total time at 61%',
      'The replica already exists and is 400ms behind',
    ],
    availableEvidence: ['metric', 'database', 'log', 'trace', 'cpu-memory', 'customer-impact', 'deployment-diff'],
    options: [
      {
        id: 'JUD-03-A',
        action: 'Add a read replica and route reads to it.',
        outcome: 'Primary CPU falls, but the replica is already 400ms behind and the N+1 still runs there — you have moved the load and added a stale-read risk.',
      },
      {
        id: 'JUD-03-B',
        action: 'Restart PostgreSQL.',
        outcome: 'A restart drops every connection and every in-flight transaction. On a 92% CPU primary this is an outage, and the N+1 returns within minutes.',
      },
      {
        id: 'JUD-03-C',
        action: 'Confirm from pg_stat_statements and a captured plan that the load is one N+1 query, then stop the account page from fanning out and let the cache absorb the account row.',
        outcome: 'You fix the cause at the query level. CPU falls because the work stops, not because it was moved.',
      },
      {
        id: 'JUD-03-D',
        action: 'Kill the longest-running query.',
        outcome: 'One query dies. The next N+1 fires immediately and CPU stays at 92%. You have reduced one victim without changing the cause.',
      },
      {
        id: 'JUD-03-E',
        action: 'Raise max_connections.',
        outcome: 'More connections can increase contention on an already-saturated primary and make CPU worse.',
      },
    ],
    correctOptionIndex: 2,
    rejectedAlternatives: [
      'JUD-03-A: a replica solves read VOLUME, not read AMOUNT. One query generating 50 round trips still generates them on the replica, and 400ms of lag now sits in front of a freshly placed order.',
      'JUD-03-B: restarting the primary is a destructive action taken without evidence, and it destroys the very plan data needed for diagnosis.',
      'JUD-03-D: killing one statement does not change the statement pattern; the next request repeats it.',
      'JUD-03-E: raising max_connections on a CPU-saturated primary increases context-switching and can lower throughput.',
    ],
    seniorDecision:
      'Treat 61% of time in one query as an application defect until proven otherwise. Fix the N+1 at the source, keep the replica as a genuine read-scale lever for later, and never route a read-your-own-write path to a lagging replica.',
    consequence:
      'The account page degrades while the fix ships. You accept a visible partial outage in exchange for not introducing a stale-read correctness bug that is far harder to detect.',
    verification:
      'Re-check pg_stat_statements for the query share and watch primary CPU fall to baseline. Confirm the replica lag figure separately before any read traffic is ever routed there.',
    falsifier:
      'If the query share stays flat after the N+1 is fixed, the CPU is coming from something pg_stat_statements is not attributing — checkpoint I/O, autovacuum, or a background worker — and adding a replica would then be a reasonable lever.',
  },
  {
    id: 'JUD-04',
    title: 'A dependency is deprecated and the team must upgrade this week',
    domain: 'delivery',
    temptingShortcut: 'Bump the version, run the tests, ship it.',
    whyTempting:
      'The test suite is green and the upgrade is described as routine. Green tests are the classic false signal in a dependency upgrade, because the tests were written against the old behaviour.',
    context:
      'A Spring Boot 3.x service must move to a newer minor that removes a deprecated API. The upgrade touches 14 files. The test suite has 212 tests, all green on the current version. One of the changed defaults is the graceful-shutdown timeout, which no test asserts.',
    constraints: [
      'The release is promised to the customer on Friday',
      'There is no staging environment that mirrors production traffic',
      'A silent behaviour change in a default is possible and undetectable by unit tests',
    ],
    symptoms: [
      'A deprecated API is removed upstream',
      '14 files must change',
      'One changed default (graceful-shutdown timeout) is not asserted anywhere in the suite',
    ],
    availableEvidence: ['deployment-diff', 'dependency-version', 'metric', 'log', 'customer-impact'],
    options: [
      {
        id: 'JUD-04-A',
        action: 'Bump the version, run the tests, ship it.',
        outcome: 'Green tests prove nothing about the changed default. The service loses in-flight requests on every deploy until someone notices the dropped count.',
      },
      {
        id: 'JUD-04-B',
        action: 'Read the upstream release notes for every changed default before writing any code, then add an assertion for each changed default this service relies on.',
        outcome: 'You find the graceful-shutdown change, pin it explicitly, and convert an invisible behaviour change into a tested, intentional configuration.',
      },
      {
        id: 'JUD-04-C',
        action: 'Pin the old version and defer the upgrade indefinitely.',
        outcome: 'The deprecated API stays, the maintenance burden stays, and the customer still gets the old behaviour.',
      },
      {
        id: 'JUD-04-D',
        action: 'Upgrade, then watch production error rates for an hour before declaring success.',
        outcome: 'You are watching production with customers in it, with no prior signal and no rollback trigger defined.',
      },
    ],
    correctOptionIndex: 1,
    rejectedAlternatives: [
      'JUD-04-A: a green suite is the expected outcome of a change that alters a default. The suite encodes the OLD contract, so it is evidence of nothing about the new one.',
      'JUD-04-C: deferring without a date converts a scheduled task into permanent technical debt with a growing security surface.',
      'JUD-04-D: using production as the test environment for a known-riskable default change is the definition of an unrecoverable incident.',
    ],
    seniorDecision:
      'Treat a dependency upgrade as a behaviour-change review, not a version bump. Read every changed default, pin the ones this service depends on, add an assertion for each, then ship behind the normal rollback plan.',
    consequence:
      'The upgrade takes longer than a version bump. You spend time on release-note reading that feels like overhead, and you delay the Friday release by hours to avoid a silent outage on every deploy.',
    verification:
      'Diff the effective configuration before and after the bump. Assert the pinned default in a test. Ship, then confirm graceful-shutdown behaviour by observing that in-flight request count reaches zero on terminate.',
    falsifier:
      'If the release notes contain no changed defaults that this service depends on and the effective config diff is empty, then the upgrade is genuinely mechanical and a faster path is defensible.',
  },
  {
    id: 'JUD-05',
    title: 'Two teams need the same table and both want their own service',
    domain: 'architecture',
    temptingShortcut: 'Let both services read and write the shared table directly.',
    whyTempting:
      'A shared table is one line of code instead of an API contract, a saga and an eventual-consistency story. It is also the exact step that turns independently deployable services into a distributed monolith.',
    context:
      'Order-service and Billing-service both need the customer table. Billing needs read access today. Order-service writes it. Neither team wants to own an internal API, and both teams ship weekly.',
    constraints: [
      'Order-service is the only writer today',
      'Billing needs customer data inside the checkout request path',
      'Both teams deploy independently and cannot coordinate a release train',
    ],
    symptoms: [
      'Two consumers of one table',
      'Independent deploy cadence',
      'No owner-defined contract for the read',
    ],
    availableEvidence: ['dependency', 'metric', 'log', 'database', 'deployment-diff', 'customer-impact'],
    options: [
      {
        id: 'JUD-05-A',
        action: 'Let both services read and write the shared table directly.',
        outcome: 'Shipping is fast until the first time Order-service changes the customer schema and Billing breaks in production with no deploy of its own.',
      },
      {
        id: 'JUD-05-B',
        action: 'Make Billing call Order-service synchronously over HTTP for customer data.',
        outcome: 'Checkout now depends on Order-service being up and fast. A customer-service blip becomes a checkout failure — you traded a schema coupling for a runtime coupling.',
      },
      {
        id: 'JUD-05-C',
        action: 'Order-service owns the table and exposes a versioned read contract; Billing receives customer updates as events and keeps a local read model.',
        outcome: 'Billing decouples from Order-service availability, at the cost of eventual consistency in a path that must show a fresh customer.',
      },
      {
        id: 'JUD-05-D',
        action: 'Extract a Customer-service that owns the table, and migrate both teams onto it.',
        outcome: 'The boundary is clean, but you have created a third service and a migration for two teams who only need read access.',
      },
    ],
    correctOptionIndex: 2,
    rejectedAlternatives: [
      'JUD-05-A: two writers on one table is hidden coupling. Deploys become coordinated in practice while appearing independent — the definition of a distributed monolith.',
      'JUD-05-B: a synchronous call in the checkout path converts an availability requirement into a hard runtime dependency. If the read must be fresh, this cost must be paid deliberately, not by default.',
      'JUD-05-D: a new service is justified by independent change and scale requirements, not by a single read. Extract a service when there is a second reason.',
    ],
    seniorDecision:
      'Give the table one owner and one contract. Publish customer changes as events so Billing stops depending on Order-service availability, and decide explicitly — and write down — whether the checkout path can tolerate the resulting staleness.',
    consequence:
      'Billing now reads a local model that can be up to one event-propagation interval stale. You accept that window in exchange for removing a synchronous dependency from the checkout path. If the window is unacceptable, option B becomes correct and you must own the runtime coupling consciously.',
    verification:
      'Measure real propagation lag between the Order-service write and the Billing read model. If the measured lag exceeds what checkout can tolerate, the design is wrong and you must move to a synchronous read.',
    falsifier:
      'If the checkout path genuinely requires read-your-own-write on customer data, then eventual consistency is not an option and a synchronous contract (B) is the correct answer — in which case the cost is Order-service availability, which must then be measured and owned.',
  },
  {
    id: 'JUD-06',
    title: 'A token was found in a public git repository',
    domain: 'security',
    temptingShortcut: 'Delete the file, force-push, and move on.',
    whyTempting:
      'Removing the file feels like removing the secret. The secret is already in every clone, every fork and every mirror, and force-push rewrites shared history for everyone.',
    context:
      'A production database password was committed to a public repository 3 hours ago. The repository has 40 forks and 200 clones. CI consumed it. Rotating it may break a downstream consumer nobody has documented.',
    constraints: [
      'The secret is public and must be assumed already harvested',
      'Force-push destroys shared history for 40 collaborators',
      'An undocumented consumer may still hold a copy of the credential',
    ],
    symptoms: [
      'Credential is live and public',
      'Forks and clones already contain it',
      'A consumer of the credential may be unknown',
    ],
    availableEvidence: ['log', 'metric', 'customer-impact', 'deployment-diff'],
    options: [
      {
        id: 'JUD-06-A',
        action: 'Delete the file, force-push, and move on.',
        outcome: 'The credential is still valid everywhere it was cloned. You have destroyed history, broken 40 collaborators, and changed nothing about the exposure.',
      },
      {
        id: 'JUD-06-B',
        action: 'Rotate the credential first, then audit every authentication log for use of the old value, then tell the affected teams and remove the file from history.',
        outcome: 'The exposure is closed before cleanup begins, you learn whether it was used, and the history rewrite is a courtesy rather than a security measure.',
      },
      {
        id: 'JUD-06-C',
        action: 'Ask the hosting provider to unlist the repository.',
        outcome:
          "Unlisting hides a URL. Every clone and fork persists, and the URL may already be in someone's clipboard history.",
      },
      {
        id: 'JUD-06-D',
        action: 'Wait for the auto-scanner to confirm the secret before rotating.',
        outcome: 'You add delay to a live exposure in exchange for a confirmation that changes nothing about the required action.',
      },
    ],
    correctOptionIndex: 1,
    rejectedAlternatives: [
      'JUD-06-A: history rewriting is not containment. Deleting the tip of a branch a credential was pushed to leaves the value in every existing clone, and it breaks 40 collaborators to achieve nothing.',
      'JUD-06-C: secrecy is not revocation, and any clone still works.',
      'JUD-06-D: confirmation is not a prerequisite for rotation. A live public credential is rotated immediately, and the audit happens afterwards.',
    ],
    seniorDecision:
      'Treat the credential as already harvested. Rotate first, audit authentication logs for use of the old value to learn the blast radius, then communicate to affected teams, then rewrite history as hygiene — in that order.',
    consequence:
      'Rotation may break an undocumented consumer and cause a second, smaller incident. You accept a controlled, known outage in exchange for closing the exposure immediately rather than after an investigation.',
    verification:
      'Confirm the old credential is rejected, then confirm no unexpected principal used it, and confirm no other credential shares the same pattern. Rotate anything else found in the same class.',
    falsifier:
      'If authentication logs show the credential was already rotated by the provider or was a non-production value, then the incident is smaller — but the ordering rule (rotate before cleanup) still holds for the next occurrence.',
  },
  {
    id: 'JUD-07',
    title: 'AI-assisted code review finds a plausible concurrency bug',
    domain: 'architecture',
    temptingShortcut: 'Accept the finding and apply the suggested fix.',
    whyTempting:
      'The finding is specific, names a real class of bug, and arrives with confident reasoning. Accepting it feels like senior judgement; it is actually outsourcing the verification step.',
    context:
      'A code-review assistant reports a race condition in a double-checked locking block in a new cache component. The block uses a non-volatile field. The code has no concurrency test and the class is used from request threads and a scheduled refresher.',
    constraints: [
      'The component is not yet in production',
      'There is no concurrency test to reproduce the race',
      'The finding cannot be confirmed by reading the code alone — it needs a reproduction',
    ],
    symptoms: [
      'Non-volatile field guarding lazy initialisation',
      'Concurrent access from request threads and a scheduler',
      'No test can currently demonstrate the race',
    ],
    availableEvidence: ['metric', 'log', 'trace', 'thread-pool', 'deployment-diff', 'customer-impact'],
    options: [
      {
        id: 'JUD-07-A',
        action: 'Accept the finding and apply the suggested fix.',
        outcome: 'The code is probably safer, but you have accepted an unverifiable claim. If the fix was wrong you now own a change nobody can validate.',
      },
      {
        id: 'JUD-07-B',
        action: 'Reject the finding because an assistant cannot be trusted.',
        outcome: 'You discard a correct, specific, reproducible-by-reasoning finding on the basis of who produced it. Blanket rejection is its own failure mode.',
      },
      {
        id: 'JUD-07-C',
        action: 'Write a stress test that forces the race, confirm it reproduces, then apply the fix and confirm the test no longer reproduces it.',
        outcome: 'You convert an unverifiable claim into a test that fails before the fix and passes after. The claim is either confirmed or refuted on evidence.',
      },
      {
        id: 'JUD-07-D',
        action: 'Rewrite the whole component without a lazy initialisation path at all.',
        outcome: 'A large unrequested change made on the strength of an unverified claim, with no way to show the original bug is fixed.',
      },
    ],
    correctOptionIndex: 2,
    rejectedAlternatives: [
      'JUD-07-A: accepting a specific claim without a reproduction is trusting the confidence of the wording rather than the evidence. The wording is the part that is easiest to fake.',
      'JUD-07-B: dismissing a finding because of its source discards real signal. The source is a prior, not a verdict.',
      'JUD-07-D: a rewrite removes the symptom class entirely but cannot demonstrate the bug is fixed, and it multiplies the review surface.',
    ],
    seniorDecision:
      'Treat any review finding — human or AI — as a hypothesis. Build the reproduction first. A finding you cannot reproduce is not fixed; a finding you cannot reproduce because you never tried is not triaged.',
    consequence:
      'Writing the stress test costs time on a component that may already be correct. You accept that cost because the alternative is shipping a change whose correctness nobody, human or machine, has established.',
    verification:
      'The stress test must fail on the pre-fix code and pass on the post-fix code. If it passes on both, the finding was wrong and you record that outcome as evidence too.',
    falsifier:
      'If the stress test passes reliably before the fix, the race is not reachable on this runtime and the finding is a false positive — in which case the correct action is to close the finding with the test as proof, not to apply the fix.',
  },
  {
    id: 'JUD-08',
    title: 'The monthly AWS bill rose 40% with no traffic growth',
    domain: 'cost',
    temptingShortcut: 'Resize to a previous-generation instance family.',
    whyTempting:
      'Instance price is the line item people recognise, so it is the first one they blame. It is frequently not the line item that moved.',
    context:
      'A production cost rose from $18k to $25k per month. Request volume is flat. The team has proposed resizing to a previous-generation family for a projected 18% saving. Cost Explorer shows the increase split across three services, with data transfer and one line item nobody on the team recognises.',
    constraints: [
      'Traffic is flat, so this is not a scale problem',
      'The proposed saving is 18% of the total, while the growth is 40%',
      'One line item has no obvious owner',
    ],
    symptoms: [
      'Flat traffic, +40% cost',
      'Growth split across three services',
      'One unattributed line item',
    ],
    availableEvidence: ['metric', 'log', 'dependency', 'database', 'customer-impact'],
    options: [
      {
        id: 'JUD-08-A',
        action: 'Resize to a previous-generation instance family.',
        outcome: 'You capture a fraction of a problem you have not yet located, add a migration risk, and leave the actual growth driver untouched.',
      },
      {
        id: 'JUD-08-B',
        action: 'Cut costs by reducing log retention and disabling tracing.',
        outcome: 'You destroy the observability needed to diagnose the cost anomaly, permanently, and may not recover the saving at all.',
      },
      {
        id: 'JUD-08-C',
        action: 'Attribute the unattributed line item first — by service, by resource and by day — then act on the largest identified driver.',
        outcome: 'You find the real driver before changing anything. The 18% instance saving may then be unnecessary, or may be the correct lever once the 40% is explained.',
      },
      {
        id: 'JUD-08-D',
        action: 'Turn on a cost anomaly alert and review next month.',
        outcome: 'The current overspend continues for another full cycle and the next month may be reviewed with the same missing attribution.',
      },
    ],
    correctOptionIndex: 2,
    rejectedAlternatives: [
      'JUD-08-A: an 18% saving cannot address a 40% increase. Choosing a lever before locating the driver optimises the wrong term.',
      'JUD-08-B: observability is the tool you need for this investigation. Cutting it removes the ability to answer the question, irreversibly.',
      'JUD-08-D: deferring the investigation keeps the spend growing and repeats the same unanswered question next cycle.',
    ],
    seniorDecision:
      'Attribute before optimising. An unexplained line item is an open question, and an optimisation chosen without attribution is a guess with a migration attached. Fix the driver, then revisit the instance family on its own merits.',
    consequence:
      'You spend investigation effort this month rather than delivering a saving. The explicit risk is that attribution finds nothing and you have spent a cycle — in which case you have learned the cost model, which is not nothing.',
    verification:
      'Re-run the attribution by resource and day until every line item has an owner. Confirm the change moved the specific metric it was supposed to move, not the total bill in general.',
    falsifier:
      'If every line item, including the unattributed one, is fully explained and none of them grew, then the increase is a pricing or commitment change rather than a usage change, and instance right-sizing becomes the correct lever.',
  },
];

/** Domains the track is designed to cover — used to show honest gaps, never filled. */
export const JUDGMENT_DOMAINS = Array.from(
  new Set(JUDGMENT_SCENARIOS.map((scenario) => scenario.domain))
).sort();