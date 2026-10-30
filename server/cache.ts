/** Cache em memória com validade e deduplicação de requisições simultâneas. */
export class TtlCache<T> {
  private store = new Map<string, { value: T; expires: number }>();
  private pending = new Map<string, Promise<T>>();

  constructor(private ttlMs: number) {}

  async get(key: string, load: () => Promise<T>): Promise<T> {
    const hit = this.store.get(key);
    if (hit && hit.expires > Date.now()) return hit.value;
    const running = this.pending.get(key);
    if (running) return running;
    const p = load()
      .then((value) => {
        this.store.set(key, { value, expires: Date.now() + this.ttlMs });
        return value;
      })
      .finally(() => this.pending.delete(key));
    this.pending.set(key, p);
    return p;
  }
}

/** Limita quantas tarefas rodam ao mesmo tempo (para não sobrecarregar o portal). */
export function limiter(max: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  const next = () => {
    if (active >= max || !queue.length) return;
    active++;
    queue.shift()!();
  };
  return <T>(task: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      queue.push(() =>
        task()
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          }),
      );
      next();
    });
}
