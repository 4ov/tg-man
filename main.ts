import "https://deno.land/std@0.168.0/dotenv/load.ts";
import { grammy, grammyTypes } from "./deps.ts";
import storageJson from './storage.json' assert { type: "json" }
import { z } from 'npm:zod'
import { ChatFeat, Storage } from "./types.ts";


const storage = Storage.parse(storageJson)

const bot = new grammy.Bot<MyCtx>(Deno.env.get("BOT_TOKEN")!);


type MyCtx = grammy.Context & {
    sub: z.infer<typeof Storage>['subs'][0]
}



const feat = (feats: z.infer<typeof ChatFeat>[]) => (c: MyCtx, n: grammy.NextFunction)=>c.sub && feats.every(feat=>c.sub.features.includes(feat)) ? n() : undefined



bot.use(
    (c,n)=>{
    
    const id = `${c.msg?.chat.id!}`
    const sub = storage.subs.filter(sub=>sub.id === id)[0]
    
    if(sub){
        c.sub = sub
        n()
    }
})

bot.on(["message", "edit"], 
feat(['nolink']),
async (ctx) => {
    let entities: grammyTypes.MessageEntity[] | null = null;
    if (ctx.message) entities = ctx.message.entities || [];
    else if (ctx.editedMessage) {
        entities =
            ctx.editedMessage.entities ||
            ctx.editedMessage.caption_entities ||
            null;
    }

    if (
        entities &&
        entities.some((e) => e.type === "url") &&
        ["group", "supergroup"].includes(ctx.chat.type)
    ) {
        const sender = ctx.from!;
        const admins = await bot.api.getChatAdministrators(ctx.chat.id);
        if (admins.findIndex((admin) => admin.user.id === sender.id) === -1) {
            //not admin
            // const creator = admins.filter((a) => a.status === "creator")[0];
            // await bot.api.sendMessage(
            //     creator.user.id,
            //     `🗑\n${
            //         ctx.from?.username
            //             ? `@${ctx.from.username}`
            //             : ctx.from?.first_name
            //     }\n${ctx.msg.text || ctx.message?.caption}`
            // );
            await ctx.deleteMessage();
        }
    }
});

bot.start();
