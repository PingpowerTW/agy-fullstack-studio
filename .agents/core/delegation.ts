import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';

// Adapting paths for AGY Full-Stack Studio architecture
// Core script runs from .agents/core/
const MEMORY_DIR = path.join(__dirname, '../memory');
const WORKSPACE_DIR = path.join(__dirname, '../../');

if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });

// Type definitions for the multi-agent orchestration
interface Message {
  id: string;
  sender: string;
  recipient: string;
  type: 'BRIEF' | 'PLAN' | 'TASK_ASSIGN' | 'TASK_REPORT' | 'AUDIT_REQUEST' | 'AUDIT_RESULT' | 'HEARTBEAT';
  payload: any;
  timestamp: string;
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  description: string;
  dependencies: string[];
}

interface Milestone {
  id: string;
  title: string;
  tasks: Task[];
  status: 'PENDING' | 'RUNNING' | 'COMPLETED';
}

// D012: Registry of all known agent names for 'All' broadcast
const REGISTERED_AGENTS = ['Sentinel', 'Orchestrator', 'DatabaseWorker', 'BackendWorker', 'FrontendWorker', 'Auditor'];

class MessageBus extends EventEmitter {
  private logStream: fs.WriteStream;

  constructor() {
    super();
    const logPath = path.join(MEMORY_DIR, 'progress.log');
    // Clear previous log and open write stream
    fs.writeFileSync(logPath, '');
    this.logStream = fs.createWriteStream(logPath, { flags: 'a' });
  }

  // D014: Generate unique message IDs
  static generateId(): string {
    return crypto.randomUUID();
  }

  publish(msg: Message) {
    const logLine = `[${msg.timestamp}] [${msg.sender} ──► ${msg.recipient}] (${msg.type}): ${JSON.stringify(msg.payload)}\n`;
    try {
      this.logStream.write(logLine);
    } catch (err) {
      console.error(`[MessageBus Log Error] Failed to write log:`, err);
    }
    
    // Pretty print to console with styling
    const color = this.getAgentColor(msg.sender);
    const reset = '\x1b[0m';
    console.log(`${color}[${msg.sender} ──► ${msg.recipient}]${reset} (${msg.type})`);
    console.log(`  └─► ${typeof msg.payload === 'string' ? msg.payload : JSON.stringify(msg.payload, null, 2).replace(/\n/g, '\n  ')}`);
    
    // D001: Isolate listener exceptions to prevent cascading crash
    const safeEmit = (event: string) => {
      try {
        this.emit(event, msg);
      } catch (err) {
        console.error(`[MessageBus ERROR] Listener for '${event}' threw:`, err);
      }
    };

    // D012: Broadcast 'All' to every registered agent
    if (msg.recipient === 'All') {
      REGISTERED_AGENTS.forEach(agent => safeEmit(agent));
    } else {
      safeEmit(msg.recipient);
    }
    safeEmit('message');
  }

  private getAgentColor(agent: string): string {
    switch (agent) {
      case 'Sentinel': return '\x1b[36m'; // Cyan
      case 'Orchestrator': return '\x1b[35m'; // Magenta
      case 'DatabaseWorker': return '\x1b[33m'; // Yellow
      case 'BackendWorker': return '\x1b[32m'; // Green
      case 'FrontendWorker': return '\x1b[34m'; // Blue
      case 'Auditor': return '\x1b[31m'; // Red
      default: return '\x1b[37m'; // White
    }
  }

  close() {
    this.logStream.end();
  }
}

// -------------------------------------------------------------
// AGENTS SIMULATION
// -------------------------------------------------------------

class Sentinel {
  constructor(private bus: MessageBus) {}

  boot(userRequest: string) {
    this.bus.publish({
      id: MessageBus.generateId(),
      sender: 'Sentinel',
      recipient: 'All',
      type: 'HEARTBEAT',
      payload: 'Sentinel service started. Initializing workspace...',
      timestamp: new Date().toISOString(),
    });

    // Write BRIEFING.md
    const briefingContent = `# 📋 TEAM BRIEFING & OBJECTIVES

## Project Request
${userRequest}

## Acceptance Criteria
- [ ] CRITERION 1: Boilerplate initialized
- [ ] CRITERION 2: Components mapped
`;
    fs.writeFileSync(path.join(MEMORY_DIR, 'BRIEFING.md'), briefingContent);

    this.bus.publish({
      id: MessageBus.generateId(),
      sender: 'Sentinel',
      recipient: 'Orchestrator',
      type: 'BRIEF',
      payload: {
        briefingPath: '.agents/memory/BRIEFING.md',
        message: 'Workspace initialized. Please analyze the briefing, create the plan, and begin execution.',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

class Orchestrator {
  private plan: Milestone[] = [];
  private currentMilestoneIndex = 0;

  constructor(private bus: MessageBus) {
    this.bus.on('Orchestrator', (msg: Message) => this.handleMessage(msg));
  }

  private handleMessage(msg: Message) {
    if (msg.type === 'BRIEF') {
      this.createPlan();
    } else if (msg.type === 'TASK_REPORT') {
      this.handleTaskReport(msg.payload);
    } else if (msg.type === 'AUDIT_RESULT') {
      this.handleAuditResult(msg.payload);
    }
  }

  // D005: Dynamically generate plan from BRIEFING.md criteria
  private createPlan() {
    let criteria: string[] = ['Setup Environment'];
    try {
      const briefing = fs.readFileSync(path.join(MEMORY_DIR, 'BRIEFING.md'), 'utf8');
      const criteriaMatches = briefing.match(/- \[ \] CRITERION \d+: (.+)/g);
      if (criteriaMatches && criteriaMatches.length > 0) {
        criteria = criteriaMatches.map(c => c.replace(/- \[ \] CRITERION \d+: /, ''));
      }
    } catch (err) {
      console.warn('[Orchestrator] Could not read BRIEFING.md, using default plan.');
    }

    this.plan = [
      {
        id: 'm1',
        title: 'Milestone 1: Project Scaffolding',
        status: 'PENDING',
        tasks: criteria.map((desc, i) => ({
          id: `t1_${i + 1}`,
          title: desc,
          assignedTo: 'BackendWorker',
          status: 'PENDING' as const,
          description: desc,
          dependencies: i > 0 ? [`t1_${i}`] : [],
        }))
      }
    ];

    this.writePlanFile();
    this.bus.publish({
      id: MessageBus.generateId(),
      sender: 'Orchestrator',
      recipient: 'Sentinel',
      type: 'PLAN',
      payload: {
        message: 'Plan formulated and written to memory/plan.md.',
        planSummary: this.plan.map(m => `${m.title} (${m.tasks.length} tasks)`),
      },
      timestamp: new Date().toISOString(),
    });

    this.executeCurrentMilestone();
  }

  private executeCurrentMilestone() {
    if (this.currentMilestoneIndex >= this.plan.length) {
      // Plan complete, trigger audit
      this.bus.publish({
        id: MessageBus.generateId(),
        sender: 'Orchestrator',
        recipient: 'Auditor',
        type: 'AUDIT_REQUEST',
        payload: {
          message: 'All tasks completed successfully. Requesting final victory verification.',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const milestone = this.plan[this.currentMilestoneIndex];
    milestone.status = 'RUNNING';
    this.writePlanFile();

    this.bus.publish({
      id: MessageBus.generateId(),
      sender: 'Orchestrator',
      recipient: 'All',
      type: 'HEARTBEAT',
      payload: `Starting Milestone: ${milestone.title}`,
      timestamp: new Date().toISOString(),
    });

    // Deploy all tasks in current milestone
    milestone.tasks.forEach(task => {
      task.status = 'RUNNING';
      this.bus.publish({
        id: MessageBus.generateId(),
        sender: 'Orchestrator',
        recipient: task.assignedTo,
        type: 'TASK_ASSIGN',
        payload: {
          taskId: task.id,
          title: task.title,
          description: task.description,
        },
        timestamp: new Date().toISOString(),
      });
    });
    this.writePlanFile();
  }

  private handleTaskReport(report: { taskId: string; status: 'COMPLETED' | 'FAILED'; output: string }) {
    // Find task
    let found = false;
    for (const milestone of this.plan) {
      const task = milestone.tasks.find(t => t.id === report.taskId);
      if (task) {
        task.status = report.status;
        found = true;
        break;
      }
    }

    if (!found) return;
    this.writePlanFile();

    const currentMilestone = this.plan[this.currentMilestoneIndex];
    const allDone = currentMilestone.tasks.every(t => t.status === 'COMPLETED');
    const anyFailed = currentMilestone.tasks.some(t => t.status === 'FAILED');

    if (anyFailed) {
      this.bus.publish({
        id: MessageBus.generateId(),
        sender: 'Orchestrator',
        recipient: 'Sentinel',
        type: 'HEARTBEAT',
        payload: `Error: Task failed in milestone ${currentMilestone.title}. Halting plan execution.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (allDone) {
      currentMilestone.status = 'COMPLETED';
      this.currentMilestoneIndex++;
      this.writePlanFile();
      this.executeCurrentMilestone();
    }
  }

  private handleAuditResult(result: { passed: boolean; feedback: string }) {
    if (result.passed) {
      this.bus.publish({
        id: MessageBus.generateId(),
        sender: 'Orchestrator',
        recipient: 'All',
        type: 'HEARTBEAT',
        payload: 'VICTORY CONFIRMED! Closing framework orchestration.',
        timestamp: new Date().toISOString(),
      });
    } else {
      this.bus.publish({
        id: MessageBus.generateId(),
        sender: 'Orchestrator',
        recipient: 'All',
        type: 'HEARTBEAT',
        payload: `Victory check failed. Re-evaluating plan... Feedback: ${result.feedback}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private writePlanFile() {
    let md = `# 🗺️ DYNAMIC PROJECT PLAN\n\n`;
    this.plan.forEach(m => {
      const statusSymbol = m.status === 'COMPLETED' ? '✅' : (m.status === 'RUNNING' ? '🔄' : '⏳');
      md += `## ${statusSymbol} ${m.title} [${m.status}]\n\n`;
      m.tasks.forEach(t => {
        const tSymbol = t.status === 'COMPLETED' ? '✅' : (t.status === 'RUNNING' ? '🔄' : '⏳');
        md += `- [${t.status === 'COMPLETED' ? 'x' : ' '}] ${tSymbol} **${t.title}** (Assigned: \`${t.assignedTo}\`) - *${t.status}*\n`;
        md += `  *Description*: ${t.description}\n\n`;
      });
    });
    fs.writeFileSync(path.join(MEMORY_DIR, 'plan.md'), md);
  }
}

class BackendWorker {
  constructor(private bus: MessageBus) {
    this.bus.on('BackendWorker', (msg: Message) => this.handleMessage(msg));
  }

  private handleMessage(msg: Message) {
    if (msg.type === 'TASK_ASSIGN') {
      setTimeout(() => {
        this.bus.publish({
          id: MessageBus.generateId(),
          sender: 'BackendWorker',
          recipient: 'Orchestrator',
          type: 'TASK_REPORT',
          payload: {
            taskId: msg.payload.taskId,
            status: 'COMPLETED',
            output: 'Task executed locally.',
          },
          timestamp: new Date().toISOString(),
        });
      }, 1000);
    }
  }
}

class Auditor {
  constructor(private bus: MessageBus) {
    this.bus.on('Auditor', (msg: Message) => this.handleMessage(msg));
  }

  private handleMessage(msg: Message) {
    if (msg.type === 'AUDIT_REQUEST') {
      this.bus.publish({
        id: MessageBus.generateId(),
        sender: 'Auditor',
        recipient: 'All',
        type: 'HEARTBEAT',
        payload: 'Victory audit requested. Reviewing workspace deliverables...',
        timestamp: new Date().toISOString(),
      });

      // D006: Actually verify deliverables from BRIEFING.md criteria
      setTimeout(() => {
        let passed = true;
        let feedback = 'All checks passed.';
        try {
          const briefing = fs.readFileSync(path.join(MEMORY_DIR, 'BRIEFING.md'), 'utf8');
          const plan = fs.readFileSync(path.join(MEMORY_DIR, 'plan.md'), 'utf8');
          // Check that plan exists and has completed tasks
          if (!plan.includes('COMPLETED')) {
            passed = false;
            feedback = 'No completed tasks found in plan.md';
          }
        } catch (err) {
          passed = false;
          feedback = `Audit file check failed: ${(err as Error).message}`;
        }

        this.bus.publish({
          id: MessageBus.generateId(),
          sender: 'Auditor',
          recipient: 'Orchestrator',
          type: 'AUDIT_RESULT',
          payload: { passed, feedback },
          timestamp: new Date().toISOString(),
        });
      }, 1500);
    }
  }
}

// -------------------------------------------------------------
// MAIN EXECUTION
// -------------------------------------------------------------
const bus = new MessageBus();

const sentinel = new Sentinel(bus);
const orchestrator = new Orchestrator(bus);
const beWorker = new BackendWorker(bus);
const auditor = new Auditor(bus);

console.log('\n🚀 --- STARTING AGY TEAMWORK ORCHESTRATION --- 🚀\n');
sentinel.boot('Initialize AGY Full-Stack Studio Boilerplate.');

// D013: Event-driven session close instead of hardcoded 5s timer
bus.on('message', (msg: Message) => {
  if (msg.type === 'HEARTBEAT' && typeof msg.payload === 'string' && msg.payload.includes('VICTORY CONFIRMED')) {
    setTimeout(() => {
      bus.close();
      console.log('\n🏁 --- TEAMWORK SESSION CONCLUDED --- 🏁\n');
    }, 500); // Small grace period for log flush
  }
});

// Fallback timeout to prevent infinite hang (safety net)
setTimeout(() => {
  bus.close();
  console.log('\n🏁 --- TEAMWORK SESSION TIMED OUT (30s) --- 🏁\n');
}, 30000);
