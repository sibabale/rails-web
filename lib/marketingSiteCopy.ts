import type { MarketingCopyVariantId } from '@/lib/marketingCopyVariant';

export type MarketingModuleTile = { icon: string; title: string; desc: string };

export type MarketingSiteCopy = {
  home: {
    heroEyebrow: string;
    /** Use `\n` for intentional line breaks in the hero headline. */
    heroTitle: string;
    heroSubtitle: string;
    heroPrimaryCta: string;
    heroSupportedSdksLabel: string;
    problemTitle: string;
    problemLead: string;
    problemEmphasis: string;
    modules: MarketingModuleTile[];
    ossMicro: string;
    ossHeading: string;
    ossBullets: string[];
  };
  cta: { title: string; primaryLabel: string; secondaryLabel: string };
  siteFooterTagline: string;
  infraOverview: {
    hero: { micro: string; title: string; subtitle: string };
    architecture: { micro: string; heading: string };
    sdkCard: { title: string; body: string };
    apiCard: { title: string; body: string };
    dbCard: { title: string; body: string };
    diagram: { sdkSub: string; dbSub: string };
    coreConcepts: [{ title: string; body: string }, { title: string; body: string }, { title: string; body: string }];
    codeAccount: { title: string; p1: string; p2: string };
    codeTransfer: { title: string; p1: string; p2: string };
  };
  useCases: {
    micro: string;
    heroTitle: string;
    heroSubtitle: string;
    railsCore: { ribbon: string; headline: string; postgres: string; telemetry: string };
    banks: {
      label: string;
      title: string;
      p1: string;
      p2: string;
      bullets: [string, string, string];
      diagramUi: string;
      diagramCompliance: string;
    };
    neoBanks: { label: string; title: string; p1: string; p2: string; bullets: [string, string, string] };
    fintech: { label: string; title: string; p1: string; p2: string; bullets: [string, string, string] };
  };
  railsApi: {
    backLabel: string;
    micro: string;
    heroTitle: string;
    heroSubtitle: string;
    segregatedTitle: string;
    splitIntro: string;
    nginxGatewayTitle: string;
    gatewayP1: string;
    accountsTitle: string;
    accountsBody: string;
    usersTitle: string;
    usersBody: string;
    auditTitle: string;
    auditBody: string;
    ledgerTitle: string;
    ledgerBody: string;
    meshTitle: string;
    meshBody: string;
  };
  clientsBackend: {
    backLabel: string;
    micro: string;
    heroTitle: string;
    heroSubtitle: string;
    logicTitle: string;
    logicP1: string;
    logicP2: string;
    flowHeading: string;
    flowSteps: [string, string, string, string, string, string];
    sdkFooterTitle: string;
  };
  database: {
    backLabel: string;
    micro: string;
    heroTitle: string;
    heroSubtitle: string;
    byodTitle: string;
    byodBody: string;
    securityTitle: string;
    securityBody: string;
    complianceTitle: string;
    complianceBody: string;
  };
};

const variantA: MarketingSiteCopy = {
  home: {
    heroEyebrow: 'Open source · beta',
    heroTitle: 'Bank—without building the engine yourself.',
    heroSubtitle:
      'Build accounts, wallets, ledgers, and money movement systems faster—with Rust-grade performance and bank-grade integrity.',
    heroPrimaryCta: 'Get Started',
    heroSupportedSdksLabel: 'Supported SDKs',
    problemTitle: 'Most teams underestimate how much work the money side really is.',
    problemLead:
      'Rebuilding accounts, transfers, reconciliation, and audit trails from scratch costs time you do not get back.',
    problemEmphasis: ' Rails gives you a working place to start—end to end.',
    modules: [
      {
        icon: 'database',
        title: 'Double Entry Ledger',
        desc: 'Movement of funds stays balanced—so totals are easier to explain later.',
      },
      {
        icon: 'inventory_2',
        title: 'Accounts Engine',
        desc: 'Stand up customer, business, and system accounts without assembling the basics by hand.',
      },
      {
        icon: 'shield',
        title: 'Users & Identity',
        desc: 'Organizations and access controls your team can reason about as you grow.',
      },
      {
        icon: 'sync_alt',
        title: 'Accounts & transfers',
        desc: 'Deposits, transfers between accounts, and balance reads—wired to the ledger so totals stay consistent.',
      },
      {
        icon: 'history',
        title: 'Audit trail',
        desc: 'Append-only audit ingest from users, accounts, and ledger—structured events and correlation IDs for reviews and investigations.',
      },
      {
        icon: 'code',
        title: 'SDK Ecosystem',
        desc: 'Official clients so engineers spend time on your product—not boilerplate.',
      },
    ],
    ossMicro: 'Open Source',
    ossHeading: 'Infrastructure you can inspect, trust, and extend.',
    ossBullets: [
      'No black box vendor lock-in',
      'Full source visibility',
      'Self-host anywhere via Docker',
      'Forkable long-term resilience',
    ],
  },
  cta: {
    title: 'Ship accounts and transfers faster.',
    primaryLabel: 'Get Started',
    secondaryLabel: 'Read Documentation',
  },
  siteFooterTagline: 'Accounts, balances, transfers—less rebuild, more ship.',
  infraOverview: {
    hero: {
      micro: 'Infrastructure Overview',
      title: 'A working setup you can run end to end.',
      subtitle:
        'See how accounts, balances, transfers, and traceability fit together—so your team is not guessing at the foundation.',
    },
    architecture: {
      micro: 'System Architecture',
      heading: 'How everything fits together',
    },
    sdkCard: {
      title: 'Backend SDKs',
      body: 'Integrate from your backend with official SDKs—credentials stay private.',
    },
    apiCard: {
      title: 'Rails Core',
      body: 'Build products, not a bank. Leverage our scalable and secure services to deliver value.',
    },
    dbCard: {
      title: 'Database',
      body: 'Your ledger and audit trail sit on storage built to survive failures, growth, and scrutiny.',
    },  
    diagram: {
      sdkSub: 'Official SDKs',
      dbSub: 'Durable and scalable persistence',
    },
    coreConcepts: [
      {
        title: '1. The Ledger',
        body: 'A dependable record of what moved, when. Movements pair up so balances behave the way finance and support expect.',
      },
      {
        title: '2. Accounts',
        body: 'Accounts hold balances for customers, businesses, and fees—so you are not reinventing account modeling every sprint.',
      },
      {
        title: '3. Transfers',
        body: 'Move funds between accounts in one coherent step. With no stuck-in-between states.',
      },
    ],
    codeAccount: {
      title: 'Creating an account',
      p1: 'Define the basics—name, currency, ownership hints—and let the engine persist the right shape for transfers to land safely.',
      p2: 'You keep product rules in your app; Rails keeps the money-shaped tables consistent.',
    },
    codeTransfer: {
      title: 'Sending a payment',
      p1: 'Balances change through transfers, not ad-hoc edits—so “who owes what” stays legible as volume grows.',
      p2: 'Insufficient funds, blocked auth, or flaky networks reject cleanly instead of half-applying.',
    },
  },
  useCases: {
    micro: 'Real-world Implementations',
    heroTitle: 'Problems you can solve before the next core rebuild.',
    heroSubtitle:
      'From payouts to internal treasury, teams use Rails to skip the longest rebuild—and still answer “what happened?” with confidence.',
    railsCore: {
      ribbon: 'rails core',
      headline: 'Double-entry ledger & accounts',
      postgres: 'PostgreSQL',
      telemetry: 'Telemetry',
    },
    banks: {
      label: 'Banks',
      title: 'Modernize the core without freezing the business.',
      p1: 'Big cores are expensive to feed and slow to change—every new product waits on the same fragile path.',
      p2: 'Rails gives teams a credible place to land balances and transfers while you stage migration carefully—less “big bang,” more controlled progress.',
      bullets: [
        'Fewer years lost to bespoke ledger glue',
        'Clearer trail when regulators and auditors ask questions',
        'Room to expose APIs customers already expect',
      ],
      diagramUi: 'Web & mobile banking UI',
      diagramCompliance: 'Compliance & AML service',
    },
    neoBanks: {
      label: 'NeoBanks',
      title: 'Launch multi-currency experiences in months, not years.',
      p1: 'Checking plus savings-like products usually means two ledgers, two teams, and a long integration tail.',
      p2: 'Rails lets you focus on cards, crypto partners, and UX—while the money core starts from something you can run and test today.',
      bullets: [
        'Faster path from zero to first real transfer',
        'Less custom plumbing between providers',
        'A story your risk team can follow',
      ],
    },
    fintech: {
      label: 'Fintech',
      title: 'Reconcile B2B money movement without heroics.',
      p1: 'High-volume adjustments expose every weak assumption—ghost pennies, racey updates, manual fixes at month end.',
      p2: 'Rails is built to be the boring source of truth: atomic transfers, consistent balances, and fewer 2 a.m. reconciliations.',
      bullets: [
        'Fewer manual “true up” weeks',
        'Throughput that matches real batch peaks',
        'Typed service contracts instead of tribal JSON lore',
      ],
    },
  },
  railsApi: {
    backLabel: 'Back to Infrastructure',
    micro: 'Architecture Deep Dive',
    heroTitle: 'Rails core',
    heroSubtitle:
      'A gateway in front, focused services behind it, and a ledger path you can trust when money actually moves.',
    segregatedTitle: 'Why the core is split',
    splitIntro:
      'Separation of concerns is the point: each surface scales and ships on its own cadence, blast radius stays smaller, and balance and posting rules stay concentrated where they are easiest to reason about and prove.',
    nginxGatewayTitle: 'NGINX Gateway',
    gatewayP1:
      'NGINX sits between the services and the rest of the world, managing, throttling, and routing traffic.',
    accountsTitle: 'Accounts',
    accountsBody:
      'High-read, high-change account operations stay fast and isolated—so balance lookups do not compete with ledger commits.',
    usersTitle: 'Users',
    usersBody:
      'Identity and auth scale on their own cadence—separate from postings—so login storms do not starve transfers.',
    auditTitle: 'Audit',
    auditBody:
      'Append-only trails and compliance signals live beside the money path—so you can prove what happened without slowing commits.',
    ledgerTitle: 'Ledger Engine',
    ledgerBody:
      'Double-entry needs relational discipline. Keeping entries predictable as rules grow complex.',
    meshTitle: 'Internal mesh (gRPC)',
    meshBody:
      'Traffic runs on gRPC: keeping payloads lean and round-trips short with strict communication contracts and predictable wire shapes so services stay fast under load.',
  },
  clientsBackend: {
    backLabel: 'Back to Infrastructure',
    micro: 'Architecture Deep Dive',
    heroTitle: 'Backend SDKs',
    heroSubtitle:
      'Rails handles the money-shaped execution; your backend keeps pricing, risk, and customer-specific logic where it belongs.',
    logicTitle: 'Where your logic lives',
    logicP1: 'We do not force your business rules into the ledger.',
    logicP2:
      'You decide the story—Rails executes the final, safe movements once your backend has done the thinking.',
    flowHeading: 'The application flow',
    flowSteps: [
      'A customer does something in your app.',
      'Your app calls your backend—not Rails directly from the browser.',
      'Your backend applies pricing, limits, and policies you own.',
      'Your backend calls the Rails SDK to move money with idempotency and guardrails.',
      'Rails records the immutable financial result.',
      'State lands in the database you configured—ready for reporting and support.',
    ],
    sdkFooterTitle: 'Official SDK repositories',
  },
  database: {
    backLabel: 'Back to Infrastructure',
    micro: 'Architecture Deep Dive',
    heroTitle: 'Database',
    heroSubtitle:
      'Financial records deserve the same durability bar you expect from serious relational storage—not throwaway persistence.',
    byodTitle: 'Bring your own database',
    byodBody:
      'Keep the recovery, backup, and lifecycle practices you already trust for critical systems—without rewriting your money domain when infrastructure changes.',
    securityTitle: 'Tamper-proof audit storage',
    securityBody:
      'All critical events land in dedicated audit storage with strict immutability rules—creating traceability and trust.',
    complianceTitle: 'Compliance stays yours to define',
    complianceBody:
      'Rails core is financial infrastructure, not a turnkey regulated program—licensing, jurisdiction-specific controls, retention schedules, and filings stay yours to define.',
  },
};

const variantD: MarketingSiteCopy = {
  home: {
    heroEyebrow: 'Open source · beta',
    heroTitle: 'The backend behind balances and payouts.',
    heroSubtitle:
      'Spin it up quickly, keep totals trustworthy, and keep a dependable record of important actions.',
    heroPrimaryCta: 'Get Started',
    heroSupportedSdksLabel: 'Supported SDKs',
    problemTitle: 'Production money movement needs more than endpoints.',
    problemLead:
      'Without a disciplined core, teams fight drift, mysterious totals, and fragile integrations.',
    problemEmphasis: ' Rails is structured for balances, movement of funds, and traceability.',
    modules: [
      {
        icon: 'database',
        title: 'Double Entry Ledger',
        desc: 'Disciplined bookkeeping at the deepest layer—consistency you can build on.',
      },
      {
        icon: 'inventory_2',
        title: 'Accounts Engine',
        desc: 'Customer, business, and operating accounts with clear structure and boundaries.',
      },
      {
        icon: 'shield',
        title: 'Users & Identity',
        desc: 'Organizations, permissions, and access patterns designed for production systems.',
      },
      {
        icon: 'sync_alt',
        title: 'Accounts & transfers',
        desc: 'Programmatic deposits and transfers with ledger-backed finality and predictable balance semantics.',
      },
      {
        icon: 'history',
        title: 'Audit trail',
        desc: 'Services emit append-only audit events over gRPC—immutable history for compliance, support, and operational forensics.',
      },
      {
        icon: 'code',
        title: 'SDK Ecosystem',
        desc: 'Contract-backed clients—integrate like any serious platform dependency.',
      },
    ],
    ossMicro: 'Open Source',
    ossHeading: 'Infrastructure you can inspect, trust, and extend.',
    ossBullets: [
      'No black box vendor lock-in',
      'Full source visibility',
      'Self-host anywhere via Docker',
      'Forkable long-term resilience',
    ],
  },
  cta: {
    title: 'Put balances and payouts on infrastructure you trust.',
    primaryLabel: 'Get Started',
    secondaryLabel: 'Read Documentation',
  },
  siteFooterTagline: 'The backend behind balances and payouts.',
  infraOverview: {
    hero: {
      micro: 'Infrastructure Overview',
      title: 'A reliable backbone for balances and payouts.',
      subtitle:
        'Strict separation, double-entry discipline, and PostgreSQL—so money movement stays explainable as you scale.',
    },
    architecture: {
      micro: 'System Architecture',
      heading: 'How the stack connects',
    },
    sdkCard: {
      title: 'Backend SDKs',
      body: 'Official backend SDKs—credentials stay private.',
    },
    apiCard: {
      title: 'Rails Core',
      body: 'Build products, not a bank. Leverage our scalable and secure service to deliver value.',
    },
    dbCard: {
      title: 'PostgreSQL',
      body: 'Money data persisted with operational-grade durability—survives failures, scales with load, and stays explainable over time.',
    },
    diagram: {
      sdkSub: 'Official SDKs',
      dbSub: 'Production-grade durability for balances, postings, and audit history',
    },
    coreConcepts: [
      {
        title: '1. The Ledger',
        body: 'Immutable financial truth: every debit matched to a credit—no stranded funds, no silent double-counting.',
      },
      {
        title: '2. Accounts',
        body: 'Logical balance containers for users, businesses, clearing, and fees—modeled for operational scale, not demos.',
      },
      {
        title: '3. Transfers',
        body: 'Atomic balance mutations. Partial failure rolls back—predictable states under load and retries.',
      },
    ],
    codeAccount: {
      title: 'Creating an account',
      p1: 'Programmatic account creation with currency and ownership metadata—structured persistence for downstream transfers.',
      p2: 'The engine prepares durable state so postings land without manual intervention.',
    },
    codeTransfer: {
      title: 'Sending a payment',
      p1: 'Transfers—not direct balance edits—enforce invariants at the transaction boundary.',
      p2: 'Insufficient funds, authorization failure, or network faults reject the entire operation—no torn writes.',
    },
  },
  useCases: {
    micro: 'Real-world Implementations',
    heroTitle: 'Problems you can solve when balance risk becomes the bottleneck.',
    heroSubtitle:
      'Teams standardize on Rails when “good enough scripts” stop being good enough—and the product needs a credible core.',
    railsCore: {
      ribbon: 'rails core',
      headline: 'Double-entry ledger & accounts',
      postgres: 'PostgreSQL',
      telemetry: 'Telemetry',
    },
    banks: {
      label: 'Banks',
      title: 'Core modernization with operational continuity.',
      p1: 'Monolithic ledgers slow product velocity and inflate run-cost—every launch queues behind the same brittle path.',
      p2: 'Rails provides a hardened ledger and account surface so you can decouple delivery from legacy constraints while preserving controls.',
      bullets: [
        'Operational cost discipline on ledger maintenance',
        'Data fidelity and traceability for regulated flows',
        'API-ready posture for open banking demands',
      ],
      diagramUi: 'Web & mobile banking UI',
      diagramCompliance: 'Compliance & AML service',
    },
    neoBanks: {
      label: 'NeoBanks',
      title: 'Global, multi-rail launches on a strict timeline.',
      p1: 'Neo products combine fiat, rewards, and partner rails—each integration adds concurrency and reconciliation risk.',
      p2: 'Rails supplies the ledger substrate so engineering focuses on card processors, crypto ramps, and UX—not bespoke money kernels.',
      bullets: [
        'Compressed time-to-first production posting',
        'Multi-currency sync with deterministic outcomes',
        'Security posture that scales with customer growth',
      ],
    },
    fintech: {
      label: 'Fintech',
      title: 'High-volume B2B payouts with atomic guarantees.',
      p1: 'Granular adjustments expose race conditions—manual fixes do not scale past early revenue.',
      p2: 'Rails enforces atomic transfers via gRPC contracts—failed operations roll back immediately, eliminating ghost balances.',
      bullets: [
        'Automated reconciliation at volume',
        'Throughput for burst batch patterns',
        'Strict typing across service boundaries',
      ],
    },
  },
  railsApi: {
    backLabel: 'Back to Infrastructure',
    micro: 'Architecture Deep Dive',
    heroTitle: 'Rails core',
    heroSubtitle:
      'Safety-biased partitioning: performance where reads dominate, relational rigor where money finalizes.',
    segregatedTitle: 'The segregated core',
    splitIntro:
      'The core is a gated set of narrow runtimes—accounts, identity, audit, ledger—fronted by a gateway and joined with schema-validated RPCs instead of one omnibus process. Partitioning is the product: independent scale and deploy paths per concern, bounded failure domains, and monetary correctness kept close to postings and balances instead of diffused across shared code.',
    nginxGatewayTitle: 'NGINX Gateway',
    gatewayP1:
      'NGINX sits between core services and the public internet, managing termination, throttling, and routing for inbound traffic.',
    accountsTitle: 'Accounts',
    accountsBody:
      'Memory-safe, GC-pause-free paths for account routing and high-volume balance operations at sub-millisecond latencies.',
    usersTitle: 'Users',
    usersBody:
      'Authentication and authorization scale independently from postings—high-read identity checks do not contend with ledger commits.',
    auditTitle: 'Audit',
    auditBody:
      'Immutable audit events and traceability stay isolated from balance and posting latency—so investigations do not contend with transfers.',
    ledgerTitle: 'Ledger Engine',
    ledgerBody:
      'ACID transactions and mature ORM semantics for double-entry—predictable behavior under complex posting rules.',
    meshTitle: 'Internal mesh (gRPC)',
    meshBody:
      'gRPC moves internal calls over HTTP/2 with schema-validated protobufs—tight framing, multiplexed streams, and binary payloads—so latency stays low and cross-service traffic stays strict and predictable as throughput and release cadence climb.',
  },
  clientsBackend: {
    backLabel: 'Back to Infrastructure',
    micro: 'Architecture Deep Dive',
    heroTitle: 'Backend SDKs',
    heroSubtitle:
      'Your domain logic stays in your service tier; Rails executes the hardened money movements your policies authorize.',
    logicTitle: 'Where your logic lives',
    logicP1: 'Business rules do not live inside the ledger.',
    logicP2:
      'Pricing, risk, and customer workflows resolve in your stack; Rails applies the resulting, auditable financial commands.',
    flowHeading: 'The application flow',
    flowSteps: [
      'User action in the client surface.',
      'Client calls your backend API boundary.',
      'Your service enforces policy, pricing, and fraud checks.',
      'Your service invokes the Rails SDK for ledger execution.',
      'Rails commits immutable financial facts.',
      'Persistence to your chosen Postgres deployment.',
    ],
    sdkFooterTitle: 'Official SDK repositories',
  },
  database: {
    backLabel: 'Back to Infrastructure',
    micro: 'Architecture Deep Dive',
    heroTitle: 'Database',
    heroSubtitle:
      'Operational-grade durability for the rows that must survive incidents, audits, and years of real traffic.',
    byodTitle: 'Bring your own database',
    byodBody:
      'Stay portable across hosts while keeping the same bar for durability, recovery, and operational control you demand for critical data.',
    securityTitle: 'Append-only evidence, isolated ledgers',
    securityBody:
      'All critical events land in dedicated audit storage with strict immutability rules—creating traceability and trust.',
    complianceTitle: 'Policy at the edge, durable facts inside',
    complianceBody:
      'Rails core does not ship compliance-as-a-service or per-country rule packs. Customers own regulatory posture while relying on durable ledger storage and append-only audit ingest for traceability—service boundaries keep operational policy separate from ledger correctness so you can evolve controls without rewriting postings primitives.',
  },
};

const byVariant: Record<MarketingCopyVariantId, MarketingSiteCopy> = {
  a: variantA,
  d: variantD,
};

export const getMarketingSiteCopy = (variant: MarketingCopyVariantId): MarketingSiteCopy => byVariant[variant];
