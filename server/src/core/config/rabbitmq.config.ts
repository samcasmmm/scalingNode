import amqp, { type ChannelModel, type Channel, type Options } from 'amqplib';
import env from './env.config.js';

const RECONNECT_DELAY_MS = 5_000;
const MAX_RECONNECT_ATTEMPTS = env.RABBITMQ_MAX_RECONNECT_ATTEMPTS ?? 10;

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let reconnectAttempts = 0;
let isShuttingDown = false;

const connectionConfig: Options.Connect = {
   hostname: env.RABBITMQ_HOST,
   port: env.RABBITMQ_PORT ?? 5672,
   username: env.RABBITMQ_USER,
   password: env.RABBITMQ_PASSWORD,
   vhost: env.RABBITMQ_VHOST ?? '/',
   heartbeat: 30,
};

const connectWithRetry = async (): Promise<ChannelModel> => {
   try {
      const conn = await amqp.connect(connectionConfig);
      reconnectAttempts = 0;
      console.log('[rabbitmq] Connected');

      conn.on('error', (err) => {
         console.error('[rabbitmq] Connection error', err);
      });

      conn.on('close', () => {
         console.warn('[rabbitmq] Connection closed');
         connection = null;
         channel = null;
         if (!isShuttingDown) {
            scheduleReconnect();
         }
      });

      return conn;
   } catch (err) {
      console.error('[rabbitmq] Connection failed', err);
      throw err;
   }
};

const scheduleReconnect = (): void => {
   if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error(`[rabbitmq] Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached, giving up`);
      return;
   }
   reconnectAttempts += 1;
   const delay = RECONNECT_DELAY_MS * Math.min(reconnectAttempts, 6); // capped backoff
   console.log(`[rabbitmq] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
   setTimeout(() => {
      void getConnection().catch((err) => {
         console.error('[rabbitmq] Reconnect attempt failed', err);
      });
   }, delay);
};

export const getConnection = async (): Promise<ChannelModel> => {
   if (connection) return connection;
   connection = await connectWithRetry();
   return connection;
};

export const getChannel = async (): Promise<Channel> => {
   if (channel) return channel;

   const conn = await getConnection();
   const ch = await conn.createChannel();

   ch.on('error', (err) => {
      console.error('[rabbitmq] Channel error', err);
      channel = null;
   });

   ch.on('close', () => {
      console.warn('[rabbitmq] Channel closed');
      channel = null;
   });

   // Cap in-flight unacked messages per consumer to avoid overwhelming workers
   await ch.prefetch(env.RABBITMQ_PREFETCH ?? 10);

   channel = ch;
   return ch;
};

export const assertQueue = async (
   queueName: string,
   options: Options.AssertQueue = {},
): Promise<void> => {
   const ch = await getChannel();
   await ch.assertQueue(queueName, {
      durable: true,
      // Route to DLQ on reject/nack/expiry instead of silently dropping
      arguments: {
         'x-dead-letter-exchange': `${queueName}.dlx`,
         'x-dead-letter-routing-key': `${queueName}.dead`,
      },
      ...options,
   });
};

export const publishToQueue = async (
   queueName: string,
   payload: unknown,
   options: Options.Publish = {},
): Promise<boolean> => {
   const ch = await getChannel();
   return ch.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
      ...options,
   });
};

export const checkRabbitMQHealth = async (): Promise<boolean> => {
   try {
      const ch = await getChannel();
      return ch !== null;
   } catch (err) {
      console.error('[rabbitmq] Health check failed', err);
      return false;
   }
};

export const closeRabbitMQ = async (): Promise<void> => {
   isShuttingDown = true;
   try {
      if (channel) {
         await channel.close();
         channel = null;
      }
      if (connection) {
         await connection.close();
         connection = null;
      }
      console.log('[rabbitmq] Closed gracefully');
   } catch (err) {
      console.error('[rabbitmq] Error during shutdown', err);
   }
};

process.on('SIGTERM', closeRabbitMQ);
process.on('SIGINT', closeRabbitMQ);

export default {
   getConnection,
   getChannel,
   assertQueue,
   publishToQueue,
   checkRabbitMQHealth,
   closeRabbitMQ,
};