import { Logger } from '../../../utils/Logger';
import { HttpSerializer } from '../../model/HttpSerializer';

export class JSONSerializer implements HttpSerializer {

  constructor() {
  }

  contentType(): string {
    return 'application/json';
  }

  request?(body: string, schema?: object): object {
    return JSON.parse(body);
  }

  response?(body?: string | Buffer | object, schema?: object): Buffer {
    if (!body) return Buffer.from('{}');
    Logger.trace('response() no schema.', { bodyType: typeof body });
    if (typeof body === 'string') return Buffer.from(body, 'utf-8');
    if (Buffer.isBuffer(body)) return body;
    return Buffer.from(JSON.stringify(body), 'utf-8');
  }
}
