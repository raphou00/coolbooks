import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import env from "./env";

const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const ratelimitBase = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(50, "60s"),
});

export const ratelimitBasePost = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(20, "60s"),
});

export const ratelimitLogin = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "10m"),
});

export const ratelimitRegiser = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "24h"),
});

export const ratelimitForgotPassword = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, "1h"),
});

export const ratelimitPayment = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "1h"),
});

export const ratelimitSearch = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(300, "30m"),
});
