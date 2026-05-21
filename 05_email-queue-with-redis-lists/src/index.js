import express from "express"
import Redis from "ioredis"

const app = express()
app.use(express.json())
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

const QUEUE_KEY = "queue:emails"

app.post("/emails", async (req, res) => {
    const job = {
        to: req.body.to || "",
        subject: req.body.subject || "No subject provided",
        body: req.body.body || "No content",
        created_at: new Date().toISOString()
    }
    await redis.lpush(QUEUE_KEY, JSON.stringify(job))
    res.json({queued: true, job})
});

app.get("/emails/process-one", async (req, res)=>{
    const rawJob = await redis.rpop(QUEUE_KEY)
    if(!rawJob){
        return res.json({queued: false})
    }
    const job = JSON.parse(rawJob)
    res.json({message: "email sent", job})
})

app.listen(3000, ()=>{
    console.log("listening on port 3000")
})