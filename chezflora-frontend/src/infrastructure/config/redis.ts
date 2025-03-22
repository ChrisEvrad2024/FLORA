// src/infrastructure/config/redis.ts
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// Options de connexion Redis
const redisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    lazyConnect: true, // Ne pas connecter automatiquement
    retryStrategy: (times: number) => {
        if (times > 10) {
            logger.error(`Redis connection failed after ${times} attempts, giving up`);
            return null; // Abandonner après 10 tentatives
        }
        const delay = Math.min(times * 100, 3000); // Augmente le délai jusqu'à 3 secondes max
        logger.warn(`Redis connection attempt ${times} failed. Retrying in ${delay}ms...`);
        return delay;
    }
};

class RedisService {
    private static instance: RedisService;
    private client: Redis.Redis;
    private connected: boolean = false;

    private constructor() {
        logger.info('Initializing Redis service');
        this.client = new Redis(redisOptions);

        this.client.on('connect', () => {
            this.connected = true;
            logger.info('Successfully connected to Redis');
        });

        this.client.on('error', (err) => {
            this.connected = false;
            logger.error(`Redis error: ${err.message}`);
        });
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    // Connecter au serveur Redis
    public async connect(): Promise<void> {
        if (!this.connected) {
            try {
                await this.client.connect();
            } catch (err) {
                logger.error(`Failed to connect to Redis: ${err instanceof Error ? err.message : 'Unknown error'}`);
                throw err;
            }
        }
    }

    // Définir une valeur avec une durée de vie optionnelle
    public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        try {
            if (ttlSeconds) {
                await this.client.set(key, value, 'EX', ttlSeconds);
            } else {
                await this.client.set(key, value);
            }
        } catch (err) {
            logger.error(`Redis set error for key "${key}": ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }

    // Récupérer une valeur
    public async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (err) {
            logger.error(`Redis get error for key "${key}": ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }

    // Supprimer une ou plusieurs clés
    public async del(...keys: string[]): Promise<number> {
        try {
            return await this.client.del(...keys);
        } catch (err) {
            logger.error(`Redis del error for keys "${keys.join(', ')}": ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }

    // Définir une valeur dans un hash
    public async hset(key: string, field: string, value: string): Promise<number> {
        try {
            return await this.client.hset(key, field, value);
        } catch (err) {
            logger.error(`Redis hset error for key "${key}", field "${field}": ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }

    // Récupérer une valeur d'un hash
    public async hget(key: string, field: string): Promise<string | null> {
        try {
            return await this.client.hget(key, field);
        } catch (err) {
            logger.error(`Redis hget error for key "${key}", field "${field}": ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }

    // Récupérer toutes les valeurs d'un hash
    public async hgetall(key: string): Promise<Record<string, string>> {
        try {
            return await this.client.hgetall(key);
        } catch (err) {
            logger.error(`Redis hgetall error for key "${key}": ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }

    // Ajouter un élément à un ensemble
    public async sadd(key: string, ...members: string[]): Promise<number> {
        try {
            return await this.client.sadd(key, ...members);
        } catch (err) {
            logger.error(`Redis sadd error for key "${key}": ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }

    // Récupérer tous les membres d'un ensemble
    public async smembers(key: string): Promise<string[]> {
        try {
            return await this.client.smembers(key);
        } catch (err) {
            logger.error(`Redis smembers error for key "${key}": ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }

    // Vérifier si un élément est dans un ensemble
    public async sismember(key: string, member: string): Promise<number> {
        try {
            return await this.client.sismember(key, member);
        } catch (err) {
            logger.error(`Redis sismember error for key "${key}", member "${member}": ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }

    // Publier un message sur un canal
    public async publish(channel: string, message: string): Promise<number> {
        try {
            return await this.client.publish(channel, message);
        } catch (err) {
            logger.error(`Redis publish error for channel "${channel}": ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }

    // S'abonner à un canal
    public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        try {
            await this.client.subscribe(channel);
            this.client.on('message', (ch, message) => {
                if (ch === channel) {
                    callback(message);
                }
            });
        } catch (err) {
            logger.error(`Redis subscribe error for channel "${channel}": ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        }
    }

    // Obtenir directement le client Redis pour des opérations avancées
    public getClient(): Redis.Redis {
        return this.client;
    }

    // Fermer la connexion
    public async disconnect(): Promise<void> {
        if (this.connected) {
            await this.client.quit();
            this.connected = false;
            logger.info('Redis connection closed');
        }
    }
}

export default RedisService.getInstance();