import { Worker } from "bullmq";
import { connection } from "./queue";

const worker = new Worker(
    "emails",
    async(job)=>{
        console.log("processing email job...", job.id, job.name, job.data);
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log("email job completed", job.id, job.name, job.data)
    },
    {connection}
)

worker.on("completed", (job)=>{
    console.log("email job completed", job.id, job.name, job.data)
})

worker.on("failed", (job, err)=>{
    console.log("email job failed", job.id, job.name, job.data, err)
})