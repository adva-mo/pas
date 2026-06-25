import { vi } from 'vitest'

/**
 * Supabase chain mock: supports both terminal-awaited chains (delete/update)
 * and explicit terminal methods (maybeSingle, single, insert, upsert, order).
 */
function makeChain(defaultResolved: any = { data: null, error: null }) {
  let resolved = defaultResolved
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockImplementation(() => Promise.resolve({ error: null })),
    upsert: vi.fn().mockImplementation(() => Promise.resolve({ error: null })),
    maybeSingle: vi.fn().mockImplementation(() => Promise.resolve(resolved)),
    single: vi.fn().mockImplementation(() => Promise.resolve(resolved)),
    // Makes the chain itself awaitable (for delete/update at end of call chain)
    then: (onFulfilled: any, onRejected: any) =>
      Promise.resolve(resolved).then(onFulfilled, onRejected),
  }
  chain.setResolved = (val: any) => { resolved = val }
  return chain
}

export function makeDb() {
  const chains = {
    employees: makeChain(),
    bot_sessions: makeChain(),
    daily_reports: makeChain(),
    projects: makeChain({ data: [{ id: 'proj-1', name: 'בבלי' }], error: null }),
  }
  return {
    from: vi.fn((table: string) => chains[table as keyof typeof chains] ?? makeChain()),
    chains,
  }
}

export function makeMockBot() {
  let startHandler: Function | null = null
  const actionHandlers = new Map<string, Function>()
  let textHandler: Function | null = null

  return {
    start: vi.fn((fn: Function) => { startHandler = fn }),
    action: vi.fn((pattern: any, fn: Function) => { actionHandlers.set(String(pattern), fn) }),
    on: vi.fn((event: string, fn: Function) => { if (event === 'text') textHandler = fn }),
    triggerStart: (ctx: any) => startHandler!(ctx),
    triggerText: (ctx: any) => textHandler!(ctx),
    triggerAction: (name: string, ctx: any) => actionHandlers.get(name)?.(ctx),
  }
}

export function makeCtx(overrides: any = {}) {
  return {
    from: { id: 123456, first_name: 'Test', last_name: 'User', username: 'testuser' },
    message: { text: 'דני כהן' },
    match: [],
    reply: vi.fn().mockResolvedValue(undefined),
    answerCbQuery: vi.fn().mockResolvedValue(undefined),
    editMessageReplyMarkup: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}
