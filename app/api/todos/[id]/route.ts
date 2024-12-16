import { NextRequest, NextResponse } from "next/server";
import {auth} from "@clerk/nextjs/server"
import prisma from "@/lib/prisma";

export async function PUT(req:NextRequest, {params}:{params:{id:string}}){
    const {userId} = await auth()
    if(!userId){
        return NextResponse.json({error: "unauthorized"}, {status:401})
    }
    try {
        const todoId = params.id
        const todo = await prisma.todo.findUnique({where:{id:todoId}})
        if(!todo){
            return NextResponse.json({error:"todo not found"}, {status:404})
        }
        if(todo.userId !== userId){
            return NextResponse.json({error:"not authorized to update this todo"}, {status:400})
        }
        const{title} = await req.json()
        const updatedTodo = await prisma.todo.update({
            where:{id:todoId},
            data:{title: title}
        })
        return NextResponse.json({message:"todo successfully updated!",status:200, updatedTodo})
    } catch (error) {
        console.error("error while updating the todo", error)
        return NextResponse.json({error:"error while updating the todo", status:500})
    }
}
export async function DELETE(req:NextRequest,{params}:{params:{id:string}}){

    const {userId} = await auth()
    if(!userId){
        return NextResponse.json({error: "unauthorized"}, {status:401})
    }

    try {
        const todoId = params.id
        const todo = await prisma.todo.findUnique({where:{id:todoId}})

        if(!todo){
            return NextResponse.json({error:"todo not found"}, {status:404})
        }
        if(todo.userId !== userId){
            return NextResponse.json({error:"not authorized to delete this todo"}, {status:400})
        }
        const deletedTodo = await prisma.todo.delete({where:{id:todoId}})
        return NextResponse.json({message:"todo successfully deleted", deletedTodo, status:200})

    } catch (error) {
        console.error("error while deleting the todo", error)
        return NextResponse.json({error:"error while deleting the todo"},{status:500})
    }
}