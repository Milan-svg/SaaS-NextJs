import { NextResponse } from "next/server";
import {auth} from "@clerk/nextjs/server"
import prisma from "@/lib/prisma";

export async function POST(){
    const  {userId} = await auth()
    if(!userId){
        return NextResponse.json({error: "unauthorized"}, {status:401})
    }
    //add subscription

    try {
        const user = await prisma.user.findUnique({where: {id: userId}})
        if(!user){
            return NextResponse.json({error: "user not found"}, {status:401})
        }
        const subscriptionEnds = new Date()
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1)
        const updatedUser = await prisma.user.update({
            where:{id: userId},
            data:{isSubbed: true, subscriptionEnds: subscriptionEnds},
        })
        return NextResponse.json({message: "subscription added!", updatedUser} )
    } catch (error) {
        console.error("error while adding subscription", error)
        return NextResponse.json({error:"couldnt update the subscription", status:500})
    }
}


export async function GET(){
    const {userId} = await auth()
    if(!userId){
        return NextResponse.json({error: "unauthorized"}, {status:401})
    }
    // get subscription status from prisma

    try {
        const user = await prisma.user.findUnique(
            {
                where:{id: userId},
                select:{isSubbed:true,subscriptionEnds:true}
            }
        )
        if(!user){
            return NextResponse.json({error: "user not found"}, {status:401})
        }
        const now = new Date()
        if(user.subscriptionEnds && user.subscriptionEnds< now){
            await prisma.user.update({
                where:{id:userId},
                data:{
                    isSubbed: false,
                    subscriptionEnds: null
                }
            })
            return NextResponse.json({
                message:"user subscription details fetched successfully!",
                issubbed: false,
                subscriptionEnds: null
            })
        }
        return NextResponse.json({
            message:"user subscription details fetched successfully!",
            issubbed: user.isSubbed,
            subscriptionEnds: user.subscriptionEnds
        })
    } catch (error) {
        console.error("error while getting user subscription details", error)
        return NextResponse.json({error:"error while getting user subscription details", status:500})
    }

}