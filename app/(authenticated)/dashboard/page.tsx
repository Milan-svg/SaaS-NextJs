"use client";
import { useUser } from "@clerk/nextjs";
import { Todo } from "@prisma/client";
import React, { useCallback, useEffect, useState }  from "react"
import { useDebounceValue } from "usehooks-ts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import { AlertTriangle } from "lucide-react";
  import Link from "next/link";  

function Dashboard(){
    const {user} = useUser()
    const [todos, setTodos] = useState<Todo[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedTerm] = useDebounceValue(searchTerm, 300) 
    const [loading, setLoading] = useState(true)
    const [totalPage, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [isSubscribed, setIsSubscribed] = useState(false)
    //ui
    const [title,setTitle] = useState("")

    // handleApi functions
    const fetchTodos = useCallback(async(page:number)=>{
        try {
            setLoading(true)
            const response = await fetch(`api/todos?page=${page}&search=${debouncedTerm}`)
            if(!response.ok){
                throw new Error("failed to fetch todos")
            }
            const data = await response.json()
            //console.log(data)
            setTodos(data.todos)
            setTotalPages(data.totalPages)
            setCurrentPage(data.currentPage)
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
            throw new Error("something went wrong while fetching todos")
        }
    }, [debouncedTerm])

    useEffect(()=>{
        fetchTodos(1)
        fetchSubStatus()
    }, [fetchTodos])
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
                body: JSON.stringify({title})
            })
            if(!response.ok){
                throw new Error("failed to add todo")
            }
            setTitle("")
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
    // handleUi functions

    const handleAddTitle =(e:React.FormEvent)=>{
      e.preventDefault()
      if(title.trim()){
        handleAddTodo(title);
      }
    };
    
    return (
      <>
      <div>
        <Card>
          <CardHeader>
          <CardTitle>Add a Todos</CardTitle>
          </CardHeader>
          <CardContent>
          <form onSubmit={handleAddTitle}>
            <input 
            type="text"
            placeholder="enter your todo"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
             />
             <button type="submit" >Add Todo</button>
          </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
          <CardTitle>Your Todos:</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <h1>Loading...</h1>
            ) : (
              <ul>
            {todos.map((todo)=>(
              <>
              <li key={todo.id} className={todo.completed ? "line-through" : ""}>{todo.title}</li>
              <button onClick={()=> handleUpdateTodo(todo.id, !todo.completed)}>
                {todo.completed ? "Mark inComplete" : "Mark Complete"}
              </button>
              <button onClick={()=> handleDeleteTodo(todo.id)}>Delete</button>
              </>
            ))}
            </ul>
            )}
            
          </CardContent>

        </Card>

      </div>

      </>
      );
}
export default Dashboard