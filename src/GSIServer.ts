import { EventEmitter } from 'events';
import * as http from 'http';

export enum BasicEvent {
  RawState = 'raw-state',
}

export abstract class GSIServer {
  public events: EventEmitter;
  public server: http.Server;

  private debug: boolean;
  private url: string;

  constructor(url: string = '/', host: string = '127.0.0.1', debug: boolean = false) {
    if (!url.startsWith('/')) {
      throw Error(`Invalid serve url '${url}'! Must be starting from '/'.`);
    }
    this.debug = debug;
    this.events = new EventEmitter();
    this.url = url;
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  public listen(port: number = 9001) {
    if (this.debug) {
      console.log(`Starting serving at http://localhost:${port}${this.url}`);
    }
    this.server.listen(port);
  }

  public close() {
    this.server.close();
  }

  public abstract feedState(rawObject: object): any;

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    res.setHeader('Content-Type', 'text/html');
    if (req.url === this.url) {
      switch (req.method) {
        case 'HEAD': {
          res.writeHead(200);
          break;
        }
        case 'POST': {
          const [code, body] = await this.parsePOST(req);
          res.writeHead(code);
          res.write(body);
          break;
        }
        default: {
          // Method not allowed
          res.writeHead(405);
          break;
        }
      }
    } else {
      res.writeHead(404);
    }
    res.end('\n');
    if (this.debug) {
      console.log('[%s] %s %s %s', new Date(), req.method, req.url, res.statusCode);
    }
  }

  private async parsePOST(req: http.IncomingMessage): Promise<[number, string]> {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const content = chunks.join();
    try {
      const rawState = JSON.parse(content);
      this.events.emit(BasicEvent.RawState, rawState);
      this.feedState(rawState);
      return [200, ''];
    } catch (e) {
      if (this.debug) {
        console.trace(e);
      }
      return [500, `Invalid JSON in request body: '${e}'.\n`];
    }
  }
}
