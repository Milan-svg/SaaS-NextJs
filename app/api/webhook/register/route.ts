import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Error from "next/error";
import { error } from "console";

export async function POST(req:Request){
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

    if(!WEBHOOK_SECRET){
        console.error("webhook secret not found")
        return new Response("webhook secret not found", {status:500})
        
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    if(!svix_id || !svix_timestamp || !svix_signature){
        return new Response("Error- No svix headers")
    }

    const payload = await req.json()
    console.log("raw payload: ", payload)
    const body = JSON.stringify(payload)
    console.log("stringified payload: ", body)


    const wh = new Webhook(WEBHOOK_SECRET);
    // const payload = wh.verify(payload, headers);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body,{          //payload ki jageh body and headers ka object bna liya, refer to docs.
            "svix-id": svix_id,
            "svix-timestamp":svix_timestamp,
            "svix-signature":svix_signature
        }) as WebhookEvent;
        console.log("verified webhook event: ",evt)
    } catch (error) {
        console.log(error, "error verifying the webhook")
        return new Response("Error while verifying webhook")
    }

    const eventType = evt.type
    //console.log(eventType)
    if(eventType === "user.created"){
        // idhar data me email_addresses array hai and its [0] has an object containing the email.
        try {
            const {primary_email_address_id, email_addresses} = evt.data;
            if (!primary_email_address_id){
                return new Response("no primary email found", {status:400})
            }
            const primaryEmailObj = email_addresses.find(
                ( obj)=> (obj.id === primary_email_address_id)
            )
            if(!primaryEmailObj){
                return new Response("primary email not found",{status:400})
            }
            const primaryEmail = primaryEmailObj.email_address


            if(!evt.data || !evt.data.id || !primaryEmail){
                console.log("Missing data in webhook payload", evt.data);
                return new Response("Invalid webhook payload", { status: 400 })
            }
            // now that weve grabbed the creds, create the user in postgres/neon.
            const newUser = await prisma.user.create({
                data:{
                    id: evt.data.id,
                    email: primaryEmail,
                    isSubbed: false
                }
            })
            console.log("new user created!", newUser)
        } catch (error) {
            console.log("Error while creating user in the database", error)
            return new Response("Error while creating user in the database")
        }
    }
    return new Response("webhook recieved successfully!", {status:200})
}

