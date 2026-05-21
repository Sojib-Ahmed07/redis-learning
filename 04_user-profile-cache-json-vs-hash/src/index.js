import express from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());


const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => {
  console.log(" Redis connected");
});

redis.on("ready", () => {
  console.log(" Redis ready");
});

redis.on("error", (err) => {
  console.log(" Redis error:", err);
});

redis.on("close", () => {
  console.log(" Redis connection closed");
});


app.post("/user/:id/json", async (req, res) => {
  try {
    const key = `user:${req.params.id}:json`;

    console.log("\n========== POST JSON ==========");
    console.log("Key:", key);
    console.log("Body:", req.body);

    const value = JSON.stringify(req.body);

    const result = await redis.set(key, value);

    console.log("Redis SET result:", result);

    // verify immediately
    const saved = await redis.get(key);

    console.log("Saved value from Redis:", saved);

    res.json({
      success: true,
      savedAs: "json",
      key,
      saved: JSON.parse(saved),
    });
  } catch (err) {
    console.log("POST JSON ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get("/user/:id/json", async (req, res) => {
  try {
    const key = `user:${req.params.id}:json`;

    console.log("\n========== GET JSON ==========");
    console.log("Key:", key);

    const raw = await redis.get(key);

    console.log("Raw Redis value:", raw);

    res.json({
      success: true,
      key,
      user: raw ? JSON.parse(raw) : null,
    });
  } catch (err) {
    console.log("GET JSON ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


app.post("/user/:id/hash", async (req, res) => {
  try {
    const key = `user:${req.params.id}:hash`;

    console.log("\n========== POST HASH ==========");
    console.log("Key:", key);
    console.log("Body:", req.body);

    await redis.hset(key, req.body);

    const saved = await redis.hgetall(key);

    console.log("Saved HASH:", saved);

    res.json({
      success: true,
      savedAs: "hash",
      key,
      saved,
    });
  } catch (err) {
    console.log("POST HASH ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get("/user/:id/hash", async (req, res) => {
  try {
    const key = `user:${req.params.id}:hash`;

    console.log("\n========== GET HASH ==========");
    console.log("Key:", key);

    const user = await redis.hgetall(key);

    console.log("Fetched HASH:", user);

    res.json({
      success: true,
      key,
      user,
    });
  } catch (err) {
    console.log("GET HASH ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
