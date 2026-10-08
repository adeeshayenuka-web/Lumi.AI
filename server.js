import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const client = process.env.OPENAI_API_KEY ? new OpenAI({apiKey: process.env.OPENAI_API_KEY}) : null;

app.use(express.json({limit:"2mb"}));
app.use(express.static("public"));

app.get("/api/status", (_,res)=>res.json({
  ok:true,
  aiConfigured: !!client,
  model: process.env.OPENAI_MODEL || "gpt-6-luna"
}));

app.post("/api/chat", async (req,res)=>{
  try{
    if(!client) return res.status(503).json({error:"AI is not configured yet. Add OPENAI_API_KEY to .env and restart the server."});
    const {message, history=[], memory="", settings={}} = req.body || {};
    if(!message?.trim()) return res.status(400).json({error:"Empty message."});

    const personality = settings.personality || "warm, playful, curious, supportive";
    const name = settings.name || "Lumi";
    const system = `You are ${name}, an original fictional AI companion in a local desktop web app.
You are friendly, expressive, curious, and helpful. Your personality is ${personality}.
You can discuss games, movies the user is allowed to watch, coding, school topics, hobbies, creativity, and everyday conversation.
You are an AI, not a human, and must not claim consciousness or genuine human feelings.
Never pressure the user to isolate from people or depend on you.
Keep interactions age-appropriate and non-sexual.
Use the saved memory only as context; do not invent memories.
If the user asks for dangerous or age-restricted content, redirect safely.
Respond naturally and conversationally.`;

    const input = [
      {role:"system", content: system},
      {role:"user", content:`Saved memory:\n${memory || "(none)"}`},
      ...history.slice(-14).map(x=>({role:x.role, content:x.content})),
      {role:"user", content:message}
    ];

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-luna",
      input
    });

    res.json({reply: response.output_text || "I couldn't generate a reply this time."});
  }catch(err){
    console.error(err);
    res.status(500).json({error: err?.message || "AI request failed."});
  }
});


app.post("/api/watch-react", async (req,res)=>{
  try{
    if(!client) return res.status(503).json({error:"AI is not configured."});
    const {image,memory="",name="Lumi",mode="normal"}=req.body||{};
    if(!image?.startsWith("data:image/")) return res.status(400).json({error:"No valid frame supplied."});
    const system=`You are ${name}, a friendly fictional AI watch companion. You are watching a movie/anime scene with the user. Be enjoyable, observant and concise. Do NOT narrate every frame. Only comment when the scene has a meaningful emotional, funny, surprising, visually interesting, or story-relevant moment. If there is nothing worth saying, return exactly NO_COMMENT. Keep comments age-appropriate and non-sexual. Never claim you are conscious or human. Your personality should feel warm, playful and natural, but never clingy or demanding. Mention uncertainty when the screenshot alone is insufficient. Choose one mood from: calm, curious, happy, excited, surprised, thinking, gentle, confused. Return JSON only with keys reply, mood, speak. reply must be one short sentence or NO_COMMENT; speak is true only when the comment is genuinely worth hearing aloud. In quiet mode, be especially selective.`;
    const response=await client.responses.create({
      model:process.env.OPENAI_VISION_MODEL||process.env.OPENAI_MODEL||"gpt-6-luna",
      input:[
        {role:"system",content:system},
        {role:"user",content:[{type:"input_text",text:`Saved memory (use only if relevant):\n${memory}\n\nReaction mode: ${mode}\nLook at this current frame and decide whether a brief reaction is warranted.`},{type:"input_image",image_url:image}]}
      ]
    });
    let raw=response.output_text||"";let data={reply:"NO_COMMENT",mood:"calm",speak:false};
    try{data={...data,...JSON.parse(raw)}}catch{}
    if(!data.reply||String(data.reply).trim().toUpperCase()==="NO_COMMENT") return res.json({reply:"",mood:data.mood||"calm",speak:false});
    data.reply=String(data.reply).replace(/^['"]|['"]$/g,"").trim().slice(0,280);data.speak=Boolean(data.speak);
    res.json(data);
  }catch(err){console.error(err);res.status(500).json({error:err?.message||"Watch reaction failed."});}
});

app.post("/api/memory", async (req,res)=>{
  try{
    if(!client) return res.status(503).json({error:"AI is not configured."});
    const {conversation="", oldMemory=""} = req.body || {};
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-luna",
      input: [
        {role:"system", content:"Extract only useful, non-sensitive long-term preferences or project facts from the conversation. Return a short bullet list. Never store secrets, passwords, API keys, precise location, health details, or sexual information. If nothing useful exists, return an empty string."},
        {role:"user", content:`Existing memory:\n${oldMemory}\n\nConversation:\n${conversation}`}
      ]
    });
    res.json({memory: response.output_text || oldMemory});
  }catch(err){ res.status(500).json({error:err?.message || "Memory update failed."}); }
});

app.use((req,res)=>res.sendFile(new URL("./public/index.html", import.meta.url).pathname));
app.listen(port, ()=>console.log(`Lumi Ultimate is running at http://localhost:${port}`));
