"use client";
import { useUser } from "@clerk/nextjs";
import { Todo } from "@prisma/client";
import React, { useCallback, useEffect, useState }  from "react"
import { useDebounceValue } from "usehooks-ts";

function Dashboard(){
    const {user} = useUser()
    const [todos, setTodos] = useState<Todo[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedTerm] = useDebounceValue(searchTerm, 300) 
    const [loading, setLoading] = useState(false)
    const [totalPage, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [isSubscribed, setIsSubscribed] = useState(false)

    const fetchTodos = useCallback(async(page:number)=>{
        try {
            setLoading(true)
            const response = await fetch(`api/todos?page=${page}&search=${debouncedTerm}`)
            if(!response.ok){
                throw new Error("failed to fetch todos")
            }
            const data = await response.json()
            setTodos(data.todos)
            setTotalPages(data.totalPages)
            setCurrentPage(data.currentPage)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            throw new Error("something went wrong while fetching todos")
        }
    }, [debouncedTerm])

    useEffect(()=>{
        fetchTodos(1)
        fetchSubStatus()
    }, [])
    const fetchSubStatus = async()=>{
        const response = await fetch(`api/subscription`)
        if(!response.ok){
            throw new Error("failed to fetch subscription status")
        }
        const data = await response.json()
        setIsSubscribed(data.issubbed)
    }

    const handleAddTodo = async(title:string)=>{
        try {
            const response = await fetch("api/todos",{
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify(title)
            })
            if(!response.ok){
                throw new Error("failed to add todo")
            }
            await fetchTodos(1)
        } catch (error) {
            console.log("failed to add todo",error)
            throw new Error("failed to add todo")
        }
    }

    const handleUpdateTodo = async(id:string, completed: boolean) =>{
        try {
            const response = await fetch(`api/todos/${id}`,{
                method: "PUT",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({completed})
            })
            if(!response.ok){
                throw new Error("failed to update todo")
            }
            await fetchTodos(currentPage)
        } catch (error) {
            console.log("failed to update todo", error)
            throw new Error("failed to update todo")
        }
    }
    const handleDeleteTodo = async(id:string)=>{
        try {
            const response = await fetch(`api/todos/${id}`,{
                method: "DELETE"
            })
            if(!response.ok){
                throw new Error("failed to delete todo")
            }
            fetchTodos(currentPage)
        } catch (error) {
            console.log("failed to delete todo", error)
            throw new Error("failed to delete todo")
        }

    }
    return(
        <div>Dashboard</div>
    )
}
export default Dashboard