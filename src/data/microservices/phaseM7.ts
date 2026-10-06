/**
 * PHASE M7 — Kubernetes & Cloud-Native Infrastructure Engineering.
 *
 * M7 elevates Senior Java engineers into Cloud-Native System Architects
 * capable of containerizing, orchestrating, scaling, securing, and defending
 * high-throughput Spring Boot 4.1 / Java 25 microservices on Kubernetes and AWS.
 */
import type { MsExecutionMode, MsIncident, MsModule, MsPhaseMeta } from './types';
import { english, aiReview } from './authoring';

export const MS_M7_PHASE: MsPhaseMeta = {
  id: 'M7',
  order: 7,
  title: 'Kubernetes & Cloud-Native Infrastructure Engineering',
  subtitle:
    'Docker multi-stage builds, Distroless images, cgroups v2, rolling updates, probes, CIS benchmark, and Multi-AZ AWS architecture',
  goal:
    'Elevate Senior Java engineers into Cloud-Native System Architects capable of containerizing, orchestrating, scaling, securing, and defending high-throughput Spring Boot 4.1 / Java 25 microservices on Kubernetes and AWS.',
  sessions: 'Source sessions 53–60',
  architectureMilestone:
    'Production Kubernetes deployments with zero-downtime rolling updates, Actuator health probes, External Secrets Operator, CoreDNS optimization, CIS benchmark compliance, and Multi-AZ AWS Aurora/MSK resilience.',
};

export interface M7ModuleItem extends MsModule {
  stack: string[];
  minutes: number;
  objective: string;
  why: string;
  mode?: MsExecutionMode;
  defense?: unknown[];
  labs: Array<{
    title: string;
    targetFile: string;
    durationMinutes: number;
    code: string;
  }>;
  debug: Array<{
    title: string;
    symptom: string;
    rootCause: string;
    fixSnippet: string;
  }>;
}

export const MS_M7_MODULES: M7ModuleItem[] = [
  {
    id: 'M7.1',
    phase: 'M7',
    order: 1,
    title: 'Docker & OCI Container Fundamentals',
    subtitle:
      'Multi-stage builds, Distroless images, Linux cgroups v2 memory limits, and Java 25 CDS archives',
    minutes: 180,
    estimatedMinutes: 180,
    prerequisites: ['M6.1'],
    objective:
      'Package Java 25 microservices into hardened, minimal OCI images with Google Distroless, cgroups v2 memory ergonomics, and Class Data Sharing.',
    learningObjective:
      'Package Java 25 microservices into hardened, minimal OCI images with Google Distroless, cgroups v2 memory ergonomics, and Class Data Sharing.',
    stack: ['Docker', 'Distroless', 'Java 25', 'cgroups v2', 'CDS'],
    stackFocus: ['Docker', 'Distroless', 'Java 25', 'cgroups v2', 'CDS'],
    mode: 'REAL_EXECUTABLE',
    executionMode: 'REAL_EXECUTABLE',
    why:
      'Bloated container images carry package managers, shells, and CVEs into production. Unconfigured JVM memory leads to silent kernel OOMKilled evictions (Exit Code 137).',
    whyItMatters:
      'Bloated container images carry package managers, shells, and CVEs into production. Unconfigured JVM memory leads to silent kernel OOMKilled evictions (Exit Code 137).',
    explanation: {
      whatItIs:
        'OCI container packaging using multi-stage builds and minimal runtime distroless base images.',
      whyItExists:
        'To reduce attack surface, eliminate root execution, and align JVM heap sizing with container memory cgroups.',
      problemSolved:
        'Vulnerability scanning bloat, slow image pulls, and sudden kernel SIGKILL termination when JVM off-heap exceeds container limits.',
      internals:
        'Linux kernel cgroups v2 enforce memory.max; Java 25 container awareness detects limits via -XX:+UseContainerSupport.',
      runtimeBehaviour:
        'CDS archives pre-load class metadata during container startup, cutting boot time from 4.8s to 1.4s.',
      tradeoffs:
        'Distroless images have no bash/sh or curl, requiring ephemeral debug containers or JMX probes for troubleshooting.',
      whatCanFail:
        'OOMKilled exit code 137 if MaxRAMPercentage is set above 75% without accounting for Metaspace and thread stacks.',
      howToObserve:
        'Inspect dmesg, /sys/fs/cgroup/memory.current, and container exit codes via kubectl describe pod.',
      howToDebug:
        'Run Native Memory Tracking (-XX:NativeMemoryTracking=summary) to profile off-heap allocations.',
      howToFix:
        'Configure -XX:InitialRAMPercentage=50.0 -XX:MaxRAMPercentage=70.0 and tune -XX:MaxDirectMemorySize.',
      whenNotToUse:
        'Do not use fat JDK base images in production environments.',
      seniorQuestion:
        'How does cgroups v2 differ from v1 in handling page cache reclamation before triggering OOM killer for JVM containers?',
    },
    keyPoints: [
      'Multi-stage Docker builds separate build toolchains from runtime binaries',
      'Distroless nonroot user (UID 10001) blocks privilege escalation',
      'cgroups v2 memory.max dictates MaxRAMPercentage calculations',
      'Application CDS cuts Spring Boot cold start time by >65%',
    ],
    conceptExercises: [],
    codeLabs: [],
    labs: [
      {
        title: 'Hardened Distroless Java 25 Dockerfile with CDS',
        targetFile: 'Dockerfile',
        durationMinutes: 45,
        code: `# Stage 1: Build & CDS Training Archive
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /workspace
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -B
COPY src src
RUN ./mvnw package -DskipTests
RUN java -Djarmode=tools -jar target/app.jar extract --layers --destination extracted/

# CDS Training run
WORKDIR /workspace/extracted
RUN java -XX:ArchiveClassesAtExit=app-cds.jsa -Dspring.context.exit=onRefresh -jar application/app.jar

# Stage 2: Distroless Minimal Secure Runtime
FROM gcr.io/distroless/java25-debian12:nonroot
WORKDIR /app
COPY --from=builder /workspace/extracted/dependencies/ ./
COPY --from=builder /workspace/extracted/spring-boot-loader/ ./
COPY --from=builder /workspace/extracted/snapshot-dependencies/ ./
COPY --from=builder /workspace/extracted/application/ ./
COPY --from=builder /workspace/extracted/app-cds.jsa ./

USER 10001:10001
ENV JAVA_TOOL_OPTIONS="-XX:InitialRAMPercentage=50.0 -XX:MaxRAMPercentage=70.0 -XX:+UseZGC -XX:SharedArchiveFile=app-cds.jsa"
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]`,
      },
    ],
    debuggingExercises: [],
    debug: [
      {
        title: 'Kernel OOMKilled Exit 137 Investigation',
        symptom: 'Container restarts intermittently with exit code 137 under peak traffic.',
        rootCause:
          'JVM heap was set to 90% of container limit, leaving insufficient headroom for Netty off-heap buffers and Metaspace.',
        fixSnippet:
          'ENV JAVA_TOOL_OPTIONS="-XX:InitialRAMPercentage=50.0 -XX:MaxRAMPercentage=70.0 -XX:MaxDirectMemorySize=256m"',
      },
    ],
    failureLabs: [],
    defenseQuestions: [],
    defense: [],
    english: english(['Docker', 'Distroless', 'cgroups v2', 'CDS']),
    aiReview: aiReview('OCI Packaging Review', 'Verify multi-stage separation and nonroot UID enforcement.'),
    assessment: [],
  },
  {
    id: 'M7.2',
    phase: 'M7',
    order: 2,
    title: 'Kubernetes Architecture & Workloads',
    subtitle:
      'Deployments, ReplicaSets, zero-downtime rolling updates, and Spring Boot Actuator probes',
    minutes: 195,
    estimatedMinutes: 195,
    prerequisites: ['M7.1'],
    objective:
      'Architect zero-downtime Kubernetes deployments with graceful shutdown, preStop lifecycle hooks, and Actuator health probes.',
    learningObjective:
      'Architect zero-downtime Kubernetes deployments with graceful shutdown, preStop lifecycle hooks, and Actuator health probes.',
    stack: ['Kubernetes', 'Spring Actuator', 'RollingUpdate', 'Probes'],
    stackFocus: ['Kubernetes', 'Spring Actuator', 'RollingUpdate', 'Probes'],
    mode: 'REAL_EXECUTABLE',
    executionMode: 'REAL_EXECUTABLE',
    why:
      'Improper probe configurations or missing preStop sleep hooks cause 502 Bad Gateway errors during rolling updates as iptables rules desynchronize.',
    whyItMatters:
      'Improper probe configurations or missing preStop sleep hooks cause 502 Bad Gateway errors during rolling updates as iptables rules desynchronize.',
    explanation: {
      whatItIs:
        'Declarative workload management orchestrating Pod replicas across multi-node Kubernetes clusters.',
      whyItExists:
        'To ensure automated failover, zero-downtime upgrades, and self-healing resilience.',
      problemSolved:
        'Traffic dropped during pod termination, cold-start timeouts triggering crash loops, and single points of failure.',
      internals:
        'Kubelet probes poll Actuator endpoints; kube-proxy updates iptables/IPVS routing tables asynchronously.',
      runtimeBehaviour:
        'RollingUpdate creates new pods with maxSurge=1, verifies ReadinessProbe, and drains old pods with preStop hooks.',
      tradeoffs:
        'Excessive probe frequency saturates application threads; conservative timeouts slow down rolling deployments.',
      whatCanFail:
        'Liveness probe failing during heavy GC pause causing unnecessary pod restarts.',
      howToObserve:
        'kubectl get events, endpoint slice state, and Ingress 502 error rates in Prometheus.',
      howToDebug:
        'Compare pod termination timestamp with ingress error access log timestamps.',
      howToFix:
        'Add lifecycle.preStop.exec: sleep 15 and configure server.shutdown=graceful in Spring Boot.',
      whenNotToUse:
        'Do not point LivenessProbe to external dependency health checks (e.g. database).',
      seniorQuestion:
        'Why does a readiness probe failure not terminate the pod, and why must liveness probes never check downstream databases?',
    },
    keyPoints: [
      'StartupProbe prevents premature LivenessProbe kills during JVM cold start',
      'ReadinessProbe isolates pods from Service endpoints during warming or overload',
      'preStop sleep 15 gives kube-proxy time to remove pod from iptables',
      'RollingUpdate strategy maxSurge: 1, maxUnavailable: 0 guarantees capacity',
    ],
    conceptExercises: [],
    codeLabs: [],
    labs: [
      {
        title: 'Production Kubernetes Deployment with Actuator Probes',
        targetFile: 'deployment.yaml',
        durationMinutes: 40,
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  labels:
    app: order-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      terminationGracePeriodSeconds: 45
      containers:
      - name: order-service
        image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/order-service:1.0.0
        ports:
        - containerPort: 8080
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sleep", "15"]
        startupProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 12
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          periodSeconds: 5
          failureThreshold: 2
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          periodSeconds: 10
          failureThreshold: 3
        resources:
          requests:
            cpu: "500m"
            memory: "1024Mi"
          limits:
            cpu: "2000m"
            memory: "2048Mi"`,
      },
    ],
    debuggingExercises: [],
    debug: [
      {
        title: 'Rolling Update 502 Traffic Blackhole',
        symptom: '502 Bad Gateway errors spike for 8 seconds whenever a new deployment is applied.',
        rootCause:
          'Pod receives SIGTERM immediately upon termination and closes socket while kube-proxy still forwards traffic.',
        fixSnippet:
          'lifecycle:\n  preStop:\n    exec:\n      command: ["/bin/sleep", "15"]',
      },
    ],
    failureLabs: [],
    defenseQuestions: [],
    defense: [],
    english: english(['RollingUpdate', 'Probes', 'Actuator', 'Zero-Downtime']),
    aiReview: aiReview('Workload Rollout Review', 'Verify preStop sleep hooks and probe timeouts.'),
    assessment: [],
  },
  {
    id: 'M7.3',
    phase: 'M7',
    order: 3,
    title: 'ConfigMaps, Secrets & Dynamic Storage',
    subtitle:
      'External Secrets Operator, AWS Secrets Manager sync, and read-only root filesystems',
    minutes: 180,
    estimatedMinutes: 180,
    prerequisites: ['M7.2'],
    objective:
      'Eliminate static credentials using External Secrets Operator and AWS Secrets Manager integration with read-only filesystems.',
    learningObjective:
      'Eliminate static credentials using External Secrets Operator and AWS Secrets Manager integration with read-only filesystems.',
    stack: ['ConfigMaps', 'Secrets', 'External Secrets', 'AWS Secrets Manager', 'IRSA'],
    stackFocus: ['ConfigMaps', 'Secrets', 'External Secrets', 'AWS Secrets Manager', 'IRSA'],
    mode: 'REAL_EXECUTABLE',
    executionMode: 'REAL_EXECUTABLE',
    why:
      'Hardcoding secrets in Git or ConfigMaps violates SOC2/PCI-DSS. Running writable root filesystems allows malware persistence.',
    whyItMatters:
      'Hardcoding secrets in Git or ConfigMaps violates SOC2/PCI-DSS. Running writable root filesystems allows malware persistence.',
    explanation: {
      whatItIs:
        'Externalized configuration and secret injection using Kubernetes native primitives synchronized with cloud vaults.',
      whyItExists:
        'To separate configuration from code and protect sensitive credentials without storing plaintext in Git.',
      problemSolved:
        'Secret leakage in source control, manual credential rotation, and filesystem tampering.',
      internals:
        'External Secrets Operator controller reconciles SecretStore resources with AWS Secrets Manager via IAM Roles for Service Accounts (IRSA).',
      runtimeBehaviour:
        'Secrets are projected as environment variables or mounted files; Spring Boot detects changes or reloads on pod bounce.',
      tradeoffs:
        'Mounted secret file updates are eventually consistent; environment variable updates require pod restart.',
      whatCanFail:
        'IRSA IAM role policy misconfiguration preventing secret synchronization during cluster auto-scaling.',
      howToObserve:
        'kubectl get externalsecret, review SecretStore status conditions, and check AWS CloudTrail assume-role events.',
      howToDebug:
        'Check operator logs: kubectl logs -n external-secrets -l app.kubernetes.io/name=external-secrets.',
      howToFix:
        'Attach correct IAM trust relationship with the service account OIDC provider ARN.',
      whenNotToUse:
        'Do not store binary blobs or gigabyte datasets in Kubernetes ConfigMaps (1MB limit).',
      seniorQuestion:
        'How does External Secrets Operator eliminate the need to run HashiCorp Vault Agent sidecars for every pod?',
    },
    keyPoints: [
      'External Secrets Operator bridges AWS Secrets Manager to Kubernetes Secret objects',
      'Zero secrets in Git repositories (GitOps safety)',
      'readOnlyRootFilesystem: true prevents container runtime tampering',
      'emptyDir scratch volume on /tmp enables Tomcat embedded operations',
    ],
    conceptExercises: [],
    codeLabs: [],
    labs: [
      {
        title: 'ExternalSecret Syncing Aurora Credentials',
        targetFile: 'external-secret.yaml',
        durationMinutes: 35,
        code: `apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: aurora-db-secret
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: db-credentials
    creationPolicy: Owner
  data:
  - secretKey: DB_USERNAME
    remoteRef:
      key: prod/order-service/aurora
      property: username
  - secretKey: DB_PASSWORD
    remoteRef:
      key: prod/order-service/aurora
      property: password`,
      },
    ],
    debuggingExercises: [],
    debug: [
      {
        title: 'ReadOnlyRootFilesystem Tomcat Crash',
        symptom: 'Spring Boot pod crashes with java.io.IOException: Permission denied on /tmp.',
        rootCause:
          'Embedded Tomcat requires a writable temporary directory to unpack embedded jars and write multipart files.',
        fixSnippet:
          'volumeMounts:\n- name: tmp\n  mountPath: /tmp\nvolumes:\n- name: tmp\n  emptyDir: {}',
      },
    ],
    failureLabs: [],
    defenseQuestions: [],
    defense: [],
    english: english(['ExternalSecret', 'Secrets Manager', 'ReadOnlyRootFilesystem']),
    aiReview: aiReview('Secret Synchronization Review', 'Verify zero plaintext credentials and IRSA permissions.'),
    assessment: [],
  },
  {
    id: 'M7.4',
    phase: 'M7',
    order: 4,
    title: 'Ingress, Service Mesh & Networking',
    subtitle:
      'AWS ALB Controller, CoreDNS ndots:5 query amplification, and zero-trust NetworkPolicies',
    minutes: 200,
    estimatedMinutes: 200,
    prerequisites: ['M7.2'],
    objective:
      'Configure production Ingress routing, mitigate CoreDNS 5-second latency traps, and isolate microservices with default-deny NetworkPolicies.',
    learningObjective:
      'Configure production Ingress routing, mitigate CoreDNS 5-second latency traps, and isolate microservices with default-deny NetworkPolicies.',
    stack: ['Ingress', 'AWS ALB', 'CoreDNS', 'NetworkPolicy', 'Calico'],
    stackFocus: ['Ingress', 'AWS ALB', 'CoreDNS', 'NetworkPolicy', 'Calico'],
    mode: 'REAL_EXECUTABLE',
    executionMode: 'REAL_EXECUTABLE',
    why:
      'Default ndots:5 creates 4 redundant DNS lookups for every external HTTP request, causing 5-second UDP drop spikes. Default open cluster networking enables lateral movement.',
    whyItMatters:
      'Default ndots:5 creates 4 redundant DNS lookups for every external HTTP request, causing 5-second UDP drop spikes. Default open cluster networking enables lateral movement.',
    explanation: {
      whatItIs:
        'L7 Ingress traffic management, DNS resolution tuning, and L3/L4 packet filtering across namespaces.',
      whyItExists:
        'To safely expose services to external traffic while enforcing least-privilege network perimeter controls internally.',
      problemSolved:
        'CoreDNS query amplification, external call timeouts, and lateral compromise in multi-tenant clusters.',
      internals:
        'glibc resolv.conf defaults to ndots:5; CoreDNS responds to search domain suffixes before querying external root.',
      runtimeBehaviour:
        'NetworkPolicy agents (e.g. Cilium/Calico) program eBPF or iptables rules to drop unapproved packets at the veth seam.',
      tradeoffs:
        'Strict default-deny NetworkPolicies require explicit egress rules for DNS (port 53) and internal dependencies.',
      whatCanFail:
        'DNS resolution failure when adding default-deny without explicitly whitelisting kube-dns egress.',
      howToObserve:
        'CoreDNS Prometheus metrics coredns_dns_request_duration_seconds and drop count.',
      howToDebug:
        'Execute dig inside pod to inspect DNS search domain query sequence.',
      howToFix:
        'Add trailing dot to external URLs (api.stripe.com.) or tune dnsConfig ndots:2.',
      whenNotToUse:
        'Do not expose internal microservices directly via public Ingress controllers.',
      seniorQuestion:
        'How does CoreDNS query amplification interact with Linux conntrack table exhaustion on high-throughput worker nodes?',
    },
    keyPoints: [
      'AWS Load Balancer Controller provisions native Application Load Balancers for Ingress',
      'CoreDNS ndots:5 causes 4 failed queries for external hostnames before success',
      'dnsConfig with ndots:2 or trailing dot eliminates 5-second lookup pauses',
      'Default-deny ingress/egress NetworkPolicies enforce Zero Trust networking',
    ],
    conceptExercises: [],
    codeLabs: [],
    labs: [
      {
        title: 'Zero-Trust Default-Deny NetworkPolicy with DNS Egress',
        targetFile: 'network-policy.yaml',
        durationMinutes: 40,
        code: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: order-service-netpol
spec:
  podSelector:
    matchLabels:
      app: order-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api-gateway
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
  - to:
    - podSelector:
        matchLabels:
          app: inventory-service
    ports:
    - protocol: TCP
      port: 8080`,
      },
    ],
    debuggingExercises: [],
    debug: [
      {
        title: '5-Second DNS Latency Spikes (ndots:5)',
        symptom: 'External payment API calls intermittently take exactly 5000ms to resolve.',
        rootCause:
          'glibc sends queries for api.stripe.com appending local search domains. Conntrack race drops UDP packet, causing 5s retry.',
        fixSnippet:
          'dnsConfig:\n  options:\n  - name: ndots\n    value: "2"',
      },
    ],
    failureLabs: [],
    defenseQuestions: [],
    defense: [],
    english: english(['Ingress', 'CoreDNS', 'ndots:5', 'NetworkPolicy']),
    aiReview: aiReview('Cluster Network Review', 'Verify default-deny policies and CoreDNS query amplification controls.'),
    assessment: [],
  },
  {
    id: 'M7.5',
    phase: 'M7',
    order: 5,
    title: 'Helm & GitOps',
    subtitle:
      'Helm 3 parameterized charts, values schema validation, and ArgoCD continuous delivery',
    minutes: 185,
    estimatedMinutes: 185,
    prerequisites: ['M7.2'],
    objective:
      'Package microservices into reusable, parameterized Helm 3 charts and orchestrate automated GitOps releases with ArgoCD.',
    learningObjective:
      'Package microservices into reusable, parameterized Helm 3 charts and orchestrate automated GitOps releases with ArgoCD.',
    stack: ['Helm 3', 'ArgoCD', 'GitOps', 'JSONSchema'],
    stackFocus: ['Helm 3', 'ArgoCD', 'GitOps', 'JSONSchema'],
    mode: 'REAL_EXECUTABLE',
    executionMode: 'REAL_EXECUTABLE',
    why:
      'Manual kubectl applies cause configuration drift between staging and production, leading to un-reproducible deployment outages.',
    whyItMatters:
      'Manual kubectl applies cause configuration drift between staging and production, leading to un-reproducible deployment outages.',
    explanation: {
      whatItIs:
        'Declarative package management and continuous reconciliation matching Git state to cluster state.',
      whyItExists:
        'To provide version-controlled, auditable, and automated application releases across environments.',
      problemSolved:
        'Configuration drift, tribal deployment knowledge, and failed rollbacks during production incidents.',
      internals:
        'Helm renders Go templates using values.yaml; ArgoCD controllers poll Git and execute server-side applies.',
      runtimeBehaviour:
        'ArgoCD monitors sync status and triggers automated self-healing if drift occurs on the live cluster.',
      tradeoffs:
        'Go templating complexity in Helm; strict GitOps requires dedicated branching or repo-per-env strategies.',
      whatCanFail:
        'ArgoCD sync storms during mass cluster upgrades or Helm values schema validation rejections.',
      howToObserve:
        'ArgoCD application sync status, helm history command, and deployment revision counts.',
      howToDebug:
        'Run helm template . -f values.yaml --debug to inspect generated Kubernetes YAML.',
      howToFix:
        'Enforce values.schema.json to catch type and boundary errors prior to Git commit.',
      whenNotToUse:
        'Do not use Helm for static one-off cluster resources with zero parameterization.',
      seniorQuestion:
        'How does ArgoCD prevent split-brain states when multiple cluster operators edit manifests simultaneously?',
    },
    keyPoints: [
      'Helm 3 parameterized charts eliminate duplicate YAML manifests across stages',
      'values.schema.json catches invalid memory strings before deployment',
      'ArgoCD provides automated reconciliation and auditability via Git commits',
      'Automated rollback triggers on probe failure via Helm release history',
    ],
    conceptExercises: [],
    codeLabs: [],
    labs: [
      {
        title: 'Production Helm Chart values.yaml with Strict Resource Controls',
        targetFile: 'values.yaml',
        durationMinutes: 35,
        code: `replicaCount: 3
image:
  repository: 123456789012.dkr.ecr.us-east-1.amazonaws.com/order-service
  tag: "1.0.0"
  pullPolicy: IfNotPresent

resources:
  requests:
    cpu: 500m
    memory: 1024Mi
  limits:
    cpu: 2000m
    memory: 2048Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL`,
      },
    ],
    debuggingExercises: [],
    debug: [
      {
        title: 'ArgoCD OutOfSync Flapping',
        symptom: 'ArgoCD repeatedly marks deployment as OutOfSync every 3 minutes.',
        rootCause:
          'Mutating webhook or HPA was modifying replica count in live cluster while Git committed a static replicaCount.',
        fixSnippet:
          'spec:\n  ignoreDifferences:\n  - group: apps\n    kind: Deployment\n    jsonPointers:\n    - /spec/replicas',
      },
    ],
    failureLabs: [],
    defenseQuestions: [],
    defense: [],
    english: english(['Helm 3', 'ArgoCD', 'GitOps', 'values.schema.json']),
    aiReview: aiReview('GitOps Deployment Review', 'Verify Helm values schema validation and automated reconciliation.'),
    assessment: [],
  },
  {
    id: 'M7.6',
    phase: 'M7',
    order: 6,
    title: 'CIS Kubernetes Security Hardening',
    subtitle:
      'Pod Security Standards, non-root execution, privilege escalation denial, and read-only filesystems',
    minutes: 190,
    estimatedMinutes: 190,
    prerequisites: ['M7.2'],
    objective:
      'Audit and enforce CIS Kubernetes Benchmark compliance across workloads using restricted Pod Security Standards and admission controllers.',
    learningObjective:
      'Audit and enforce CIS Kubernetes Benchmark compliance across workloads using restricted Pod Security Standards and admission controllers.',
    stack: ['CIS Benchmark', 'Pod Security Admission', 'Trivy', 'Kyverno'],
    stackFocus: ['CIS Benchmark', 'Pod Security Admission', 'Trivy', 'Kyverno'],
    mode: 'REAL_EXECUTABLE',
    executionMode: 'REAL_EXECUTABLE',
    why:
      'Running containers as root with default Linux capabilities allows container breakout and node host compromise.',
    whyItMatters:
      'Running containers as root with default Linux capabilities allows container breakout and node host compromise.',
    explanation: {
      whatItIs:
        'Workload security hardening adhering to Center for Internet Security (CIS) standards and restricted Pod Security profile.',
      whyItExists:
        'To mitigate zero-day container escape vulnerabilities and enforce defense-in-depth security.',
      problemSolved:
        'Privilege escalation, host filesystem overwrite, and host network/IPC namespace leakage.',
      internals:
        'Kubernetes Pod Security Admission validates pod manifests against restricted profile specifications at API admission time.',
      runtimeBehaviour:
        'API server rejects non-compliant pod creation requests with 403 Forbidden admission denial.',
      tradeoffs:
        'Restricted pods cannot bind to privileged ports (<1024) or write to root directories.',
      whatCanFail:
        'Legacy third-party images crashing when executed without root permissions.',
      howToObserve:
        'Kubernetes audit logs, admission controller metrics, and Trivy/Kyverno violation reports.',
      howToDebug:
        'Inspect Pod securityContext and test running image locally with docker run --read-only --user 10001.',
      howToFix:
        'Configure explicit securityContext dropping ALL capabilities and setting runAsNonRoot: true.',
      whenNotToUse:
        'Do not disable Pod Security Standards on production multi-tenant namespaces.',
      seniorQuestion:
        'How does dropping Linux capability CAP_NET_RAW prevent ARP spoofing inside shared Kubernetes overlay networks?',
    },
    keyPoints: [
      'CIS Kubernetes Benchmark requires runAsNonRoot: true and runAsUser: 10001',
      'allowPrivilegeEscalation: false blocks setuid/setgid binary escalation',
      'capabilities: drop: ["ALL"] removes all default kernel capabilities',
      'readOnlyRootFilesystem: true prevents malicious script injection into /bin or /usr',
    ],
    conceptExercises: [],
    codeLabs: [],
    labs: [
      {
        title: 'CIS-Compliant SecurityContext Manifest',
        targetFile: 'security-context.yaml',
        durationMinutes: 30,
        code: `securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  runAsGroup: 10001
  fsGroup: 10001
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL
  seccompProfile:
    type: RuntimeDefault`,
      },
    ],
    debuggingExercises: [],
    debug: [
      {
        title: 'Pod Admission Webhook Denial',
        symptom: 'Deployment fails with error: admission webhook denied request: container violates CIS benchmark.',
        rootCause:
          'Container did not specify allowPrivilegeEscalation: false and was missing drop: ["ALL"] capabilities.',
        fixSnippet:
          'securityContext:\n  allowPrivilegeEscalation: false\n  capabilities:\n    drop: ["ALL"]',
      },
    ],
    failureLabs: [],
    defenseQuestions: [],
    defense: [],
    english: english(['CIS Benchmark', 'PodSecurityAdmission', 'Restricted Profile']),
    aiReview: aiReview('CIS Hardening Audit', 'Verify drop all capabilities and allowPrivilegeEscalation: false.'),
    assessment: [],
  },
  {
    id: 'M7.7',
    phase: 'M7',
    order: 7,
    title: 'Multi-AZ Resilient Cloud Infrastructure',
    subtitle:
      'Multi-AZ VPC subnet topology, EKS managed node groups, Karpenter autoscaling, and Aurora sub-second failover',
    minutes: 210,
    estimatedMinutes: 210,
    prerequisites: ['M7.2', 'M7.4'],
    objective:
      'Architect a Multi-AZ AWS cloud infrastructure for enterprise Java workloads featuring sub-second Aurora failover and Karpenter autoscaling.',
    learningObjective:
      'Architect a Multi-AZ AWS cloud infrastructure for enterprise Java workloads featuring sub-second Aurora failover and Karpenter autoscaling.',
    stack: ['AWS VPC', 'EKS', 'Aurora PostgreSQL', 'Karpenter', 'JDBC Wrapper'],
    stackFocus: ['AWS VPC', 'EKS', 'Aurora PostgreSQL', 'Karpenter', 'JDBC Wrapper'],
    mode: 'REAL_EXECUTABLE',
    executionMode: 'REAL_EXECUTABLE',
    why:
      'Single-AZ outages occur routinely in cloud regions. Unprepared database drivers hang for 60+ seconds during failover, causing cascading microservice thread pool exhaustion.',
    whyItMatters:
      'Single-AZ outages occur routinely in cloud regions. Unprepared database drivers hang for 60+ seconds during failover, causing cascading microservice thread pool exhaustion.',
    explanation: {
      whatItIs:
        'Multi-AZ VPC infrastructure partitioning compute, database, and ingress layers across isolated physical data centers.',
      whyItExists:
        'To achieve 99.99% availability and withstand entire Availability Zone fiber cuts or power failures.',
      problemSolved:
        'Catastrophic downtime during AZ outages, slow DNS database failover, and compute capacity exhaustion.',
      internals:
        'Aurora shared storage replicates 6 ways across 3 AZs; AWS Advanced JDBC Wrapper monitors cluster topology directly.',
      runtimeBehaviour:
        'When primary AZ fails, Aurora reader promotes in <20s; JDBC wrapper fails over in <1s by swapping physical socket.',
      tradeoffs:
        'Cross-AZ data transfer costs ($0.01/GB); slight latency overhead for cross-AZ synchronous storage writes.',
      whatCanFail:
        'Standard JDBC driver caching DNS IP of dead primary and hanging on TCP socket timeout during AZ cutover.',
      howToObserve:
        'AWS CloudWatch Aurora cluster failover events, Karpenter node allocation latency, and HikariCP pool metrics.',
      howToDebug:
        'Simulate AZ outage via AWS Fault Injection Simulator (FIS) or RDS reboot with failover.',
      howToFix:
        'Use aws-advanced-jdbc-wrapper and configure topologySpreadConstraints across topology.kubernetes.io/zone.',
      whenNotToUse:
        'Do not deploy all compute pods into a single AZ or subnet in production.',
      seniorQuestion:
        'Why does the AWS Advanced JDBC Wrapper cut Aurora failover from 30+ seconds to <1 second compared to standard PostgreSQL JDBC driver?',
    },
    keyPoints: [
      'Multi-AZ VPC topology isolates Public Ingress, Private Compute, and Isolated Database subnets',
      'TopologySpreadConstraints maxSkew: 1 guarantees balanced pod placement across AZs',
      'AWS Advanced JDBC Wrapper detects Aurora failover via cluster status rather than stale DNS',
      'Karpenter provides just-in-time node provisioning with multi-AZ spot and on-demand balancing',
    ],
    conceptExercises: [],
    codeLabs: [],
    labs: [
      {
        title: 'Spring Boot Aurora Multi-AZ AWS JDBC Wrapper Configuration',
        targetFile: 'application.yml',
        durationMinutes: 40,
        code: `spring:
  datasource:
    url: jdbc:aws-wrapper:postgresql://aurora-cluster.cluster-xyz.us-east-1.rds.amazonaws.com:5432/orders
    driver-class-name: software.amazon.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 5000
      data-source-properties:
        wrapperPlugins: failover,efm
        failoverTimeoutMs: 15000
        clusterInstanceHostPattern: "aurora-cluster-?.xyz.us-east-1.rds.amazonaws.com"`,
      },
    ],
    debuggingExercises: [],
    debug: [
      {
        title: 'Aurora DNS Failover Cache Hang',
        symptom: 'Application hangs for 45 seconds during Aurora Multi-AZ failover before reconnecting.',
        rootCause:
          'Standard JDBC driver was resolving Aurora cluster endpoint via DNS, which is cached by JVM and OS.',
        fixSnippet:
          'url: jdbc:aws-wrapper:postgresql://aurora-cluster.cluster-xyz.us-east-1.rds.amazonaws.com:5432/orders\ndriver-class-name: software.amazon.jdbc.Driver',
      },
    ],
    failureLabs: [],
    defenseQuestions: [],
    defense: [],
    english: english(['Multi-AZ', 'AWS VPC', 'Aurora PostgreSQL', 'Karpenter']),
    aiReview: aiReview('Multi-AZ Resilience Review', 'Verify sub-second Aurora failover and topology spread constraints.'),
    assessment: [],
  },
  {
    id: 'M7.8',
    phase: 'M7',
    order: 8,
    title: 'AWS Cloud-Native System Architecture',
    subtitle:
      'Multi-AZ VPC design in AWS, Amazon MSK IAM authentication, and S3 asynchronous ingestion pipelines',
    minutes: 220,
    estimatedMinutes: 220,
    prerequisites: ['M7.7'],
    objective:
      'Design and defend end-to-end cloud-native microservice architectures on AWS integrating Multi-AZ EKS, MSK, Aurora, and S3.',
    learningObjective:
      'Design and defend end-to-end cloud-native microservice architectures on AWS integrating Multi-AZ EKS, MSK, Aurora, and S3.',
    stack: ['AWS Architecture', 'Amazon MSK', 'Amazon S3', 'Presigned URLs', 'IAM SASL'],
    stackFocus: ['AWS Architecture', 'Amazon MSK', 'Amazon S3', 'Presigned URLs', 'IAM SASL'],
    mode: 'REAL_EXECUTABLE',
    executionMode: 'REAL_EXECUTABLE',
    why:
      'Uploading large payloads directly through microservice Ingress saturates worker thread pools and exhausts bandwidth. Synchronous processing cascades into total system failure.',
    whyItMatters:
      'Uploading large payloads directly through microservice Ingress saturates worker thread pools and exhausts bandwidth. Synchronous processing cascades into total system failure.',
    explanation: {
      whatItIs:
        'Enterprise AWS cloud-native architecture patterns combining multi-region resilience, managed streaming, and offloaded file pipelines.',
      whyItExists:
        'To support massive scale, zero data loss, and high availability without bottlenecking backend microservices.',
      problemSolved:
        'Ingress saturation during file upload, credential leakage in Kafka clients, and unconstrained cross-AZ latency.',
      internals:
        'Clients request short-lived S3 presigned URLs from API Gateway; direct upload triggers S3 event notifications into MSK.',
      runtimeBehaviour:
        'MSK brokers spread across 3 AZs replicate messages with min.insync.replicas=2; IAM SASL authenticates connections without static passwords.',
      tradeoffs:
        'Event-driven S3 upload flow introduces eventual consistency for file availability verification.',
      whatCanFail:
        'IAM role session duration expiry causing Kafka producer connection drops during heavy batch publishing.',
      howToObserve:
        'AWS CloudWatch MSK BytesInPerSec, S3 4xx/5xx metrics, and VPC Flow Logs.',
      howToDebug:
        'Inspect IAM policy permissions for PutObject and Kafka DescribeCluster actions.',
      howToFix:
        'Use AWS IAM Authenticator for Kafka with automatic STS token refresh in Spring Cloud Stream.',
      whenNotToUse:
        'Do not stream multi-gigabyte video or batch files through synchronous HTTP microservice REST endpoints.',
      seniorQuestion:
        'Why does decoupling file uploads via S3 presigned URLs prevent Tomcat worker thread starvation during 100MB file submissions?',
    },
    keyPoints: [
      'Multi-AZ VPC architecture with private subnets protects backend microservices',
      'Amazon MSK with IAM SASL authentication eliminates static Kafka credentials',
      'S3 presigned URLs offload heavy file uploads directly from browser to object storage',
      'Event-driven architecture decouples high-throughput ingest from synchronous REST tiers',
    ],
    conceptExercises: [],
    codeLabs: [],
    labs: [
      {
        title: 'S3 Presigned URL Generator for Asynchronous Ingestion',
        targetFile: 'FileUploadService.java',
        durationMinutes: 45,
        code: `package com.ecommerce.order.service;

import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
public class FileUploadService {

    private final S3Presigner s3Presigner;
    private static final String BUCKET_NAME = "prod-order-invoices-us-east-1";

    public FileUploadService(S3Presigner s3Presigner) {
        this.s3Presigner = s3Presigner;
    }

    public String generatePresignedUploadUrl(String orderId, String fileName) {
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key("orders/" + orderId + "/" + fileName)
                .contentType("application/pdf")
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        return presignedRequest.url().toString();
    }
}`,
      },
    ],
    debuggingExercises: [],
    debug: [
      {
        title: 'Microservice Ingress Gateway Timeout on File Upload',
        symptom: '504 Gateway Timeout on 50MB invoice uploads during peak billing hours.',
        rootCause:
          'Clients were uploading 50MB files synchronously through API Gateway and Ingress, consuming Tomcat threads for 30s.',
        fixSnippet:
          '// Offload upload via S3 Presigned URL:\nString uploadUrl = fileUploadService.generatePresignedUploadUrl(orderId, fileName);\nreturn ResponseEntity.ok(Map.of("uploadUrl", uploadUrl));',
      },
    ],
    failureLabs: [],
    defenseQuestions: [],
    defense: [],
    english: english(['Amazon MSK', 'IAM SASL', 'S3 Presigned URLs', 'Asynchronous Ingestion']),
    aiReview: aiReview('Cloud Architecture Defense', 'Verify decoupled file ingestion and cross-AZ Kafka replication.'),
    assessment: [],
  },
];

export const MS_M7_INCIDENTS: MsIncident[] = [
  {
    id: 'M7-K8S-01',
    title: 'Pod CrashLoopBackOff & Container OOMKilled (Exit Code 137)',
    moduleId: 'M7.1',
    severity: 'P0',
    environment: 'production',
    symptomSummary:
      'Order service pods are restarting in a continuous CrashLoopBackOff cycle under heavy promotion traffic. Kernel OOM killer terminates containers with exit code 137.',
    alerts: [
      'CRITICAL: KubePodCrashLooping (order-service in namespace prod)',
      'CRITICAL: ContainerOOMKilled (exit code 137 on order-service-7f8d-4x9z)',
      'WARNING: PodRestartCountHigh (pod restarted 14 times in 10m)',
    ],
    hypothesisOptions: [
      'The container memory limit (1024Mi) is being exceeded by JVM off-heap allocations, Metaspace, and thread stacks because -XX:MaxRAMPercentage is unconfigured or set too high.',
      'The application has a deadlocked database connection pool causing CPU starvation.',
      'CoreDNS has crashed and cannot resolve the database hostname.',
    ],
    correctHypothesisIndex: 0,
    metrics: [
      { name: 'Container Memory Usage', value: '1023Mi / 1024Mi', baseline: '650Mi', interpretation: 'At 99.9% of cgroups memory.max' },
      { name: 'JVM Heap Usage', value: '780Mi', baseline: '450Mi', interpretation: 'Within allocated heap' },
      { name: 'JVM Off-Heap (Direct + Metaspace)', value: '250Mi', baseline: '180Mi', interpretation: 'Off-heap pushes total RSS over container limit' },
    ],
    logs: [
      'kernel: [12948.12] Memory cgroup out of memory: Killed process 41209 (java) total-vm:2410292kB, anon-rss:1047520kB, file-rss:1024kB',
      'kubectl: Reason: OOMKilled, Exit Code: 137',
      'order-service: Initializing Spring Boot application v4.1.0...',
    ],
    trace: [
      'client -> api-gateway [200 OK]',
      'api-gateway -> order-service [503 Service Unavailable - Pod terminated]',
    ],
    rootCauseOptions: [
      'Container cgroups memory.max was set to 1024Mi while JVM was running with -XX:MaxRAMPercentage=90.0, leaving only 100Mi for Netty direct memory, Metaspace, GC buffers, and OS overhead.',
      'A disk full error occurred on the Kubernetes master node.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Update container memory limit to 2048Mi with 1024Mi request in deployment.yaml',
      'Set JAVA_TOOL_OPTIONS: "-XX:InitialRAMPercentage=50.0 -XX:MaxRAMPercentage=70.0 -XX:MaxDirectMemorySize=256m"',
      'Deploy and verify container RSS stabilizes below 80% of limit under peak load',
    ],
    verification: {
      metricName: 'Container Memory Headroom',
      expectedAfterFix: '> 25% free headroom (RSS < 1500Mi of 2048Mi limit)',
    },
    explainPrompt:
      'Explain to senior engineering leadership why Java containers get OOMKilled by the Linux kernel without throwing a java.lang.OutOfMemoryError, and how cgroups v2 memory limits must be configured for Spring Boot 4.1.',
    postmortem: {
      impact: '100% of order-service pods entered CrashLoopBackOff for 14 minutes; 620 checkout requests failed.',
      detection: 'ContainerOOMKilled alert fired within 60 seconds of promotion traffic surge.',
      rootCause:
        'JVM heap was sized at 90% of container cgroups memory.max (1024Mi), leaving insufficient headroom for Netty direct memory buffers and Metaspace, triggering Linux kernel SIGKILL (Exit Code 137).',
      resolution:
        'Increased pod memory limit to 2048Mi and tuned JVM flags to -XX:InitialRAMPercentage=50.0 -XX:MaxRAMPercentage=70.0 -XX:MaxDirectMemorySize=256m.',
      prevention:
        'Enforce CI gate checking that container memory limits leave at least 30% headroom above MaxRAMPercentage heap allocation.',
      timeline: ['14:02 Peak traffic begins', '14:03 Pods OOMKilled', '14:08 Hotfix applied', '14:16 Recovery verified'],
      preventativeActions: [
        'Add memory headroom check to helm lint',
        'Set up Prometheus alert for container memory usage > 85%',
      ],
    },
    defenseQuestions: [
      'Why does the Linux kernel terminate a Java container with exit code 137 rather than the JVM throwing OutOfMemoryError?',
      'How do cgroups v2 memory.max and memory.high thresholds differ in container memory reclamation?',
    ],
  },
  {
    id: 'M7-K8S-02',
    title: 'Premature Traffic Blackhole during Rolling Update (502 Spikes)',
    moduleId: 'M7.2',
    severity: 'P1',
    environment: 'production',
    symptomSummary:
      'During every deployment rollout, Ingress reports an 8-second spike in 502 Bad Gateway errors affecting ~1.4% of active customer checkout requests.',
    alerts: [
      'WARNING: Ingress5xxRateHigh (> 1% 502 Bad Gateway during rollout)',
      'INFO: DeploymentRollingUpdateStarted (order-service revision 42)',
    ],
    hypothesisOptions: [
      'When old pods receive SIGTERM, Spring Boot terminates the server socket immediately before kube-proxy and Ingress controllers have finished withdrawing the pod IP from iptables/endpoints.',
      'The new image has a syntax error in application.properties.',
      'AWS NAT Gateway ran out of port allocations.',
    ],
    correctHypothesisIndex: 0,
    metrics: [
      { name: '502 Error Rate', value: '1.4%', baseline: '0.001%', interpretation: 'Substantial error spike coinciding with pod termination' },
      { name: 'Pod termination grace period', value: '30s', baseline: '30s', interpretation: 'Grace period is normal' },
    ],
    logs: [
      'ingress-nginx: [error] 481#481: *192831 connect() failed (111: Connection refused) while connecting to upstream: 10.244.2.148:8080',
      'order-service: Commencing graceful shutdown of embedded Tomcat server',
    ],
    trace: [
      'client -> ingress-nginx [502 Bad Gateway]',
      'ingress-nginx -> order-service-pod-old (Connection refused)',
    ],
    rootCauseOptions: [
      'Missing preStop sleep hook and unconfigured graceful shutdown. Kubernetes removes pod endpoints asynchronously across nodes, so Ingress routes packets for 5-15 seconds after pod termination begins.',
      'The Ingress NGINX controller CPU was throttled by the Linux CFS scheduler.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Add lifecycle.preStop.exec with sleep 15 to deployment manifest',
      'Configure server.shutdown=graceful and spring.lifecycle.timeout-per-shutdown-phase=30s in application.yml',
      'Ensure terminationGracePeriodSeconds is at least 45 seconds',
    ],
    verification: {
      metricName: 'Rollout 502 Error Rate',
      expectedAfterFix: '0.00% (zero 502 errors during full rolling deployment)',
    },
    explainPrompt:
      'Explain the race condition between Kubernetes endpoint propagation (kube-proxy / Ingress) and the container SIGTERM signal during pod termination, and how preStop sleep hooks solve it.',
    postmortem: {
      impact: '1.4% of checkout API requests returned 502 Bad Gateway during rolling deployments.',
      detection: 'Ingress5xxRateHigh alert triggered during automated canary deployment.',
      rootCause:
        'Terminating pods closed TCP sockets upon receiving SIGTERM before kube-proxy and Ingress controllers finished withdrawing endpoints from routing tables.',
      resolution:
        'Added lifecycle.preStop.exec sleep 15 hook and enabled Spring Boot graceful shutdown with 30s timeout.',
      prevention:
        'Require all microservice Helm charts to define preStop sleep hooks and terminationGracePeriodSeconds >= 45.',
      timeline: ['11:00 Rollout started', '11:01 502 errors observed', '11:05 PreStop hook added', '11:10 Zero errors verified'],
      preventativeActions: [
        'Enforce preStop hook validation in values schema',
        'Configure Ingress retry on 502 upstream errors',
      ],
    },
    defenseQuestions: [
      'Why is a preStop sleep hook necessary even if Spring Boot has graceful shutdown enabled?',
      'How do endpoint slices propagate across worker nodes during pod termination?',
    ],
  },
  {
    id: 'M7-K8S-03',
    title: 'CoreDNS 5-Second Latency Spike & Query Amplification (ndots:5)',
    moduleId: 'M7.4',
    severity: 'P1',
    environment: 'production',
    symptomSummary:
      'Payment authorization requests to Stripe (api.stripe.com) intermittently take exactly 5002ms, causing tail latency breaches and client timeouts.',
    alerts: [
      'WARNING: PaymentServiceP99LatencyBreach (p99 > 5s)',
      'WARNING: CoreDNSPacketDropsHigh (UDP packet drop rate spike)',
    ],
    hypothesisOptions: [
      'glibc ndots:5 configuration causes the resolver to append cluster search domains (api.stripe.com.prod.svc.cluster.local), causing 4 NXDOMAIN queries; a UDP race condition in Linux conntrack drops the reply, causing a 5-second DNS retransmission delay.',
      'Stripe API servers are undergoing a regional outage.',
      'Java SSL certificate verification takes 5 seconds due to a slow OCSP responder.',
    ],
    correctHypothesisIndex: 0,
    metrics: [
      { name: 'CoreDNS query latency p99', value: '5002ms', baseline: '2ms', interpretation: 'Severe tail latency spike exactly matching DNS timeout' },
      { name: 'DNS Queries per payment request', value: '5 queries', baseline: '1 query', interpretation: 'Extreme query amplification' },
    ],
    logs: [
      'payment-service: DNS lookup for api.stripe.com completed in 5003ms',
      'coredns: [INFO] 10.244.1.22:38912 - "A IN api.stripe.com.default.svc.cluster.local. udp 62 false 512" NXDOMAIN qr,aa,rd 142 0.0003s',
      'coredns: [INFO] 10.244.1.22:38912 - "A IN api.stripe.com.svc.cluster.local. udp 54 false 512" NXDOMAIN qr,aa,rd 134 0.0002s',
    ],
    trace: [
      'payment-service -> CoreDNS [UDP Query: api.stripe.com.default.svc.cluster.local -> NXDOMAIN]',
      'payment-service -> CoreDNS [UDP Query: api.stripe.com -> UDP Drop -> 5s retry -> 200 OK]',
    ],
    rootCauseOptions: [
      'Kubernetes default resolv.conf ndots:5 forces external domains with fewer than 5 dots to traverse all cluster search domains before querying the root domain, triggering Linux conntrack race conditions.',
      'The AWS NAT Gateway bandwidth was exhausted by video streaming.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Configure dnsConfig in pod spec with options: [{ name: "ndots", value: "2" }]',
      'Append trailing dot to external URLs in application configuration (e.g. api.stripe.com.)',
      'Enable NodeLocal DNSCache daemonset to avoid worker node conntrack UDP races',
    ],
    verification: {
      metricName: 'Payment DNS Resolution Latency p99',
      expectedAfterFix: '< 4ms (zero 5-second retransmission pauses)',
    },
    explainPrompt:
      'Explain the mechanics of resolv.conf ndots:5 in Kubernetes, why Linux conntrack table locks drop UDP replies under high traffic, and how NodeLocal DNSCache eliminates the 5-second penalty.',
    postmortem: {
      impact: 'P99 payment authorization latency spiked to 5002ms, causing intermittent client timeout errors.',
      detection: 'PaymentServiceP99LatencyBreach alert detected tail latency explosion.',
      rootCause:
        'Kubernetes default ndots:5 caused 4 failed internal DNS search domain lookups for api.stripe.com; conntrack UDP race condition dropped packets, forcing a 5-second retransmission timeout.',
      resolution:
        'Configured dnsConfig ndots:2 on payment-service and appended trailing dot to external URLs.',
      prevention:
        'Deploy NodeLocal DNSCache across all cluster nodes and enforce ndots:2 in base service templates.',
      timeline: ['09:15 Latency spike begins', '09:20 Root cause identified via CoreDNS logs', '09:25 dnsConfig applied', '09:30 Tail latency restored to <4ms'],
      preventativeActions: [
        'Deploy NodeLocal DNSCache daemonset',
        'Audit all external third-party API configurations for trailing dots',
      ],
    },
    defenseQuestions: [
      'How does glibc resolv.conf ndots:5 trigger DNS query amplification in Kubernetes clusters?',
      'Why does Linux netfilter conntrack race condition specifically cause a 5-second timeout on UDP packets?',
    ],
  },
  {
    id: 'M7-K8S-04',
    title: 'Kubernetes HPA Flapping & Autoscaling Cascade Thrashing',
    moduleId: 'M7.2',
    severity: 'P2',
    environment: 'production',
    symptomSummary:
      'Horizontal Pod Autoscaler rapidly scales order-service from 3 to 20 pods and back to 3 every 4 minutes, causing CPU spikes, connection storming on PostgreSQL, and unstable latency.',
    alerts: [
      'WARNING: HPAFlappingDetected (order-service replica churn > 15 pods / 5m)',
      'WARNING: DatabaseConnectionPoolSaturation (HikariCP connections spiking to max)',
    ],
    hypothesisOptions: [
      'HPA scale-down stabilization window is unset or too short (default 300s overridden to 0s) while target CPU utilization is set too close to startup baseline.',
      'The Kubernetes metrics-server is sending corrupted CPU telemetry.',
      'Someone is running a load test script without permission.',
    ],
    correctHypothesisIndex: 0,
    metrics: [
      { name: 'Replica count oscillations', value: '3 <-> 20 every 4m', baseline: 'Stable 4-6 pods', interpretation: 'Severe autoscaler thrashing' },
      { name: 'Database active connections', value: '380 / 400', baseline: '60 / 400', interpretation: 'Mass pod creation storms database connection pool' },
    ],
    logs: [
      'kube-controller-manager: Successfully scaled order-service to 20 replicas based on CPU 85%',
      'kube-controller-manager: Successfully scaled order-service to 3 replicas based on CPU 15%',
    ],
    trace: [
      'traffic surge -> CPU 85% -> scale to 20 pods -> CPU drops to 12% -> immediate scale down -> CPU surges back',
    ],
    rootCauseOptions: [
      'Missing HPA behavior.scaleDown stabilizationWindowSeconds and lack of target metric buffering, causing immediate downscaling before new pods complete initialization.',
      'The Linux kernel cgroups were disabled on worker nodes.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Configure behavior.scaleDown.stabilizationWindowSeconds: 300 in HPA manifest',
      'Set targetCPUUtilizationPercentage: 70 with minimum 4 replicas',
      'Add targetMemoryUtilizationPercentage as a stabilizing secondary metric',
    ],
    verification: {
      metricName: 'HPA Replica Churn Rate',
      expectedAfterFix: '< 2 scale events per hour under steady traffic',
    },
    explainPrompt:
      'Explain how HPA stabilization windows and cooldown algorithms prevent autoscaler flapping, and why database connection pool limits must be factored into maxReplicas.',
    postmortem: {
      impact: 'HPA oscillated between 3 and 20 pods every 4 minutes, causing CPU churn and database connection pool exhaustion.',
      detection: 'HPAFlappingDetected alert fired due to frequent replica count fluctuations.',
      rootCause:
        'Missing scaleDown stabilization window caused HPA to terminate pods immediately after transient load spikes subsided, before target metric smoothed out.',
      resolution:
        'Configured behavior.scaleDown.stabilizationWindowSeconds: 300 and set targetCPUUtilizationPercentage: 70 with minimum 4 replicas.',
      prevention:
        'Standardize HPA templates with mandatory 300s scale-down stabilization and secondary memory stabilization metrics.',
      timeline: ['16:00 Autoscaler flapping detected', '16:04 Database connection alerts', '16:10 Stabilization window configured', '16:20 Replica count stabilized'],
      preventativeActions: [
        'Add HPA cooldown rules to cluster policy',
        'Size PostgreSQL max_connections to account for maxReplicas',
      ],
    },
    defenseQuestions: [
      'How does an HPA stabilization window prevent cascading load thrashing during bursty traffic?',
      'Why must database connection pooling limits constrain the maximum replicas of a stateless microservice?',
    ],
  },
  {
    id: 'M7-K8S-05',
    title: 'Ingress 504 Gateway Timeout during Large File Ingestion',
    moduleId: 'M7.8',
    severity: 'P1',
    environment: 'production',
    symptomSummary:
      'Corporate clients uploading 80MB bulk order invoices receive 504 Gateway Timeout errors. Ingress worker sockets saturate, degrading all API endpoints across the cluster.',
    alerts: [
      'CRITICAL: Ingress504RateSpike (504 errors on /api/v1/orders/upload)',
      'WARNING: TomcatActiveThreadsMax (198 / 200 busy threads on order-service)',
    ],
    hypothesisOptions: [
      'Synchronous multipart file streaming through Ingress and Tomcat blocks application worker threads for tens of seconds per file, exceeding Ingress proxy-read-timeout and exhausting connection pools.',
      'The AWS S3 bucket has reached its object limit.',
      'The network cables connecting worker nodes have packet loss.',
    ],
    correctHypothesisIndex: 0,
    metrics: [
      { name: 'Ingress 504 error rate', value: '18% on upload endpoint', baseline: '0%', interpretation: 'Frequent upload timeouts' },
      { name: 'Tomcat worker thread occupancy', value: '99%', baseline: '15%', interpretation: 'Threads stuck reading slow client HTTP bodies' },
    ],
    logs: [
      'ingress-nginx: upstream timed out (110: Connection timed out) while reading response header from upstream, client: 203.0.113.4, request: "POST /api/v1/orders/upload HTTP/1.1"',
      'order-service: StandardWrapperValve[dispatcherServlet]: Servlet.service() for servlet [dispatcherServlet] threw exception',
    ],
    trace: [
      'client -> Ingress [streaming 80MB payload over slow 2Mbps link for 40s]',
      'Ingress -> order-service [Tomcat thread held for 40s -> proxy-read-timeout 30s exceeded -> 504]',
    ],
    rootCauseOptions: [
      'Architectural anti-pattern: routing large file payloads through synchronous REST API microservice Ingress instead of offloading directly to S3 via presigned URLs.',
      'PostgreSQL database reached maximum disk space.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Refactor API to return S3 presigned PUT URL in lightweight metadata call',
      'Client uploads directly from browser to S3 bucket bypass Ingress completely',
      'Configure S3 Event Notification to publish upload completion event to Amazon MSK',
    ],
    verification: {
      metricName: 'Upload API Latency & Tomcat Thread Utilization',
      expectedAfterFix: 'Presigned URL generated in < 25ms; Tomcat thread occupancy < 20%',
    },
    explainPrompt:
      'Defend the architectural decision to replace synchronous multipart REST file uploads with asynchronous S3 presigned URLs, highlighting socket preservation and zero Ingress saturation.',
    postmortem: {
      impact: '18% of large invoice file uploads failed with 504 Gateway Timeout; Ingress worker threads were exhausted.',
      detection: 'Ingress504RateSpike alert triggered during morning corporate invoice submission window.',
      rootCause:
        'Synchronous multipart file streaming through microservice Ingress held Tomcat worker threads for tens of seconds per file, saturating connection pools.',
      resolution:
        'Refactored upload flow to generate S3 presigned URLs, offloading file uploads directly to Amazon S3.',
      prevention:
        'Establish architectural rule banning synchronous file payloads > 10MB through microservice Ingress tiers.',
      timeline: ['08:30 Upload failures begin', '08:45 Thread starvation diagnosed', '09:15 S3 presigned URL pipeline deployed', '09:30 Zero 504s confirmed'],
      preventativeActions: [
        'Enforce 10MB request body limit on Ingress',
        'Publish S3 ObjectCreated events to Amazon MSK for async processing',
      ],
    },
    defenseQuestions: [
      'Why does offloading file uploads to S3 presigned URLs protect Tomcat thread pools from slow-client attacks?',
      'How does S3 event notification with Kafka maintain decoupling between ingest and processing tiers?',
    ],
  },
  {
    id: 'M7-K8S-06',
    title: 'Pod Admission Denial under CIS Kubernetes Security Benchmark',
    moduleId: 'M7.6',
    severity: 'P1',
    environment: 'production',
    symptomSummary:
      'Emergency security patch deployment is rejected by the Kubernetes API server with 403 Forbidden: PodSecurity violation, leaving critical vulnerabilities unpatched in production.',
    alerts: [
      'CRITICAL: DeploymentFailedAdmission (order-service rejected by PodSecurityAdmission)',
      'WARNING: SecurityVulnerabilityUnpatched (CVE-2026-4412 active on old pods)',
    ],
    hypothesisOptions: [
      'The deployment manifest violates the restricted Pod Security Standard because securityContext is missing allowPrivilegeEscalation: false, runAsNonRoot: true, or capabilities.drop: ["ALL"].',
      'The Kubernetes cluster license has expired.',
      'The ECR image repository does not have the specified image tag.',
    ],
    correctHypothesisIndex: 0,
    metrics: [
      { name: 'API Server Admission Rejections', value: '12 per minute', baseline: '0', interpretation: 'Continuous rejection by admission controller' },
      { name: 'Cluster CIS Benchmark Compliance Score', value: '98%', baseline: '100%', interpretation: 'Non-compliant manifest blocked at the door' },
    ],
    logs: [
      'kubectl: Error from server (Forbidden): pods "order-service-9f7b-1" is forbidden: violates PodSecurity "restricted:latest": allowPrivilegeEscalation != false, unrestricted capabilities, runAsNonRoot != true',
      'apiserver: audit.k8s.io/v1: event=admission_denied user="ci-deployer" resource="pods"',
    ],
    trace: [
      'CI/CD Pipeline -> kubectl apply -> Kubernetes API Server -> PodSecurity Admission Webhook [DENIED: Restricted Profile Violation]',
    ],
    rootCauseOptions: [
      'The developer omitted the explicit securityContext configuration required by the namespace pod-security.kubernetes.io/enforce=restricted label.',
      'The worker node ran out of memory.',
    ],
    correctRootCauseIndex: 0,
    fixSteps: [
      'Add securityContext to container spec: allowPrivilegeEscalation: false, runAsNonRoot: true, runAsUser: 10001',
      'Add capabilities: drop: ["ALL"] and set seccompProfile: type: RuntimeDefault',
      'Set readOnlyRootFilesystem: true and mount emptyDir on /tmp',
    ],
    verification: {
      metricName: 'Admission Controller Verdict',
      expectedAfterFix: 'Pod accepted and scheduled successfully with 100% CIS compliance',
    },
    explainPrompt:
      'Explain the three tiers of Kubernetes Pod Security Standards (Privileged, Baseline, Restricted) and why enterprise production clusters must enforce the Restricted profile via Admission Controllers.',
    postmortem: {
      impact: 'Emergency security patch deployment was rejected with 403 Forbidden by PodSecurity admission controller.',
      detection: 'DeploymentFailedAdmission alert fired in CI/CD pipeline.',
      rootCause:
        'Manifest omitted explicit securityContext required by the restricted Pod Security Standard (missing allowPrivilegeEscalation: false, capabilities.drop: ["ALL"]).',
      resolution:
        'Added hardened securityContext with non-root UID 10001, dropped capabilities, and read-only root filesystem.',
      prevention: 'Add kyverno/trivy manifest linting to pre-commit and CI verification stages.',
      timeline: ['13:00 Deployment rejected', '13:05 SecurityContext missing fields identified', '13:12 Hardened manifest applied', '13:15 Deployment successfully admitted'],
      preventativeActions: [
        'Integrate conftest CIS policy checks into GitHub Actions pipeline',
        'Provide standard base manifests compliant with restricted PSS',
      ],
    },
    defenseQuestions: [
      'What are the three Kubernetes Pod Security Standards and why is the Restricted profile required in enterprise production?',
      'How does allowPrivilegeEscalation: false prevent container breakouts via setuid binaries?',
    ],
  },
];
