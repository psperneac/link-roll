
export interface Context {
  get(key: any): any;
  getType<T>(key: any): T;
  put(key: any, value: any): void;
  createSubContext(name: string): Context;
  deleteSubContext(name: string): void;
}

export class ContextImpl implements Context {
  values = {};
  parent: Context;

  constructor(parent?: Context) {
    this.parent = parent;
  }
  
  reset(): void {
    this.values = {};
    this.parent = undefined;
  } 

  get(key: any): any {
    const value = this.values[key];
    if (value !== undefined) {
      return value;
    }

    if (this.parent) {
      return this.parent.get(key);
    }

    return undefined;
  }

  getType<T>(key: any): T {
    return this.values[key] as T;
  }

  put(key: any, value: any): ContextImpl {
    this.values[key] = value;
    return this;
  }

  createSubContext(name: string): Context {
    const subContext = new ContextImpl(this);
    this.values[name] = subContext;
    return subContext;
  }

  deleteSubContext(name: string): void {
    const ctx = this.values[name] as ContextImpl;
    ctx.reset();
    delete this.values[name];
  }
}

export const createRequestContext = (req) => {
  const context = new ContextImpl();
  context.put('req', req);
  context.put('user', req.user);
  return context;
}
