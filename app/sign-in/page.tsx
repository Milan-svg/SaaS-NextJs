"use client"
import React, {useState} from "react"
import { useSignIn } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {Card,CardContent,CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation"

export default function Signin(){
    const router = useRouter();
    //loaded h ki nahi check krna h
    //form submit krne ka func
    //successfull submit pe redirect, and unsuc pe error throw
    const {isLoaded, signIn, setActive} = useSignIn()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError]= useState("")
    const [showPassword, setShowPassword]= useState(false)

    if(!isLoaded){
        return null
    }
    async function signInSubmit(e:React.FormEvent) {
        e.preventDefault()
        if(!isLoaded){
            return null
        }
        try {
            const result = await signIn.create({
                identifier: email, password
            })
            if(result.status === "complete"){
                await setActive({ session: result.createdSessionId})
                router.push("/dashboard")
            } else {
                console.log(JSON.stringify(result))
            }
        } catch (err: any) {
            console.log("Error:", err.errors[0].message)
            setError(err.errors[0].message)
        }
    }
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Sign In Please</CardTitle>
                </CardHeader>


                <CardContent>
                    <form onSubmit={signInSubmit}>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                            type="email"
                            placeholder="enter your email"
                            id="email"
                            value={email}
                            onChange={(e)=>{setEmail(e.target.value)}}
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e)=>{setPassword(e.target.value)}}
                            placeholder="enter your password"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={()=> setShowPassword(!showPassword)}
                            className=""
                            >
                                {showPassword ? (
                                    <EyeOff className=""/>
                                ): (
                                    <Eye className=""/>
                                )}
                        </Button>
                        {error && (
                            <Alert>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit">Sign In</Button>
                    </form>
                </CardContent>


                <CardFooter>
                        <p>Dont have an account?
                            <Link href="/sign-up">Sign up here!</Link>
                        </p>
                </CardFooter>
            </Card>
        </div>
    )
}