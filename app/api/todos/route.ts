import { NextRequest, NextResponse } from "next/server";
import {auth} from "@clerk/nextjs/server"
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 10
//get todos
export async function GET(req: NextRequest){
    const  {userId} = await auth()
    if(!userId){
        return NextResponse.json({error: "unauthorized"}, {status:401})
    }
    const {searchParams}= new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""

    try {
        const todos = await prisma.todo.findMany({
            where:{
                userId:userId,
                title:{
                    contains: search,
                    mode: "insensitive"
                }
            },
            orderBy:{createdAt:"desc"},
            take: ITEMS_PER_PAGE,
            skip: (page -1)* ITEMS_PER_PAGE
        })

        const totalItems = await prisma.todo.count({
            where:{
                id:userId,
                title:{
                    contains: search,
                    mode: "insensitive"
                }
            }
        })
        const totalPages = Math.ceil(totalItems/ ITEMS_PER_PAGE)

        return NextResponse.json({message:"todos fetched!",todos, currentPage: page, totalPages})
    } catch (error) {
        console.error("error while getting Todos", error)
        return NextResponse.json({error:"error while getting Todos", status:500})
    }
}

export async function POST(req:NextRequest){
    const  {userId} = await auth()
    if(!userId){
        return NextResponse.json({error: "unauthorized"}, {status:401})
    }

    const currUser = await prisma.user.findUnique({
        where:{id:userId},
        include:{todos: true}
    })
    console.log(currUser)
    if(!currUser){
        return NextResponse.json({error: "user not found"}, {status:401})
    }
    // if(!currUser.isSubbed && currUser.todos.length >= 3){
    //     return NextResponse.json({error:"Upto 3 Todos Exhausted, please subscribe"}, {status:400})
    // }

    const {title} = await req.json()
    const newTodo = await prisma.todo.create({
        data:{title,userId}
    })
    return NextResponse.json({message:"Todo successfully created", status:201, newTodo})
}

