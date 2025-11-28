
import { EventEmitter } from 'events';

// This is a global event emitter for handling specific app-wide events.
// We are using the node 'events' module, which is available in Next.js Edge and Node runtimes.
export const errorEmitter = new EventEmitter();

    