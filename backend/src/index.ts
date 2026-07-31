import http from 'http'
import env from './core/config/env.config.js';
import App from './app.js';



export class Server {
   private readonly PORT: number = 5000
   private readonly SERVER: http.Server;
   private shuttingDown: boolean = false
   private app: App = new App();
   constructor() {
      this.PORT = env.PORT;
      this.SERVER = http.createServer(this.app.getInstance());

   }

   public start() { }
   public stop() { }



   private registerServerEvents(): void {
      this.SERVER.on('listening', this.onListening);
      this.SERVER.on('error', this.onError);
   }
   private shutdown() {
   }


   private onSIGTERM() { }
   private onSIGHUP() { }
   private onSIGINT() { }
}