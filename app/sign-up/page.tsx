"use client"
import React, { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
  
export default function Signup(){
    const {isLoaded, signUp, setActive} = useSignUp();
    const [emailAddress, setEmailAddress] = useState("")
    const [password, setPassword] = useState("")
    const [pendingVerification, setPendingVerification]= useState(false)
    const [code, setCode] = useState("")
    const [error, setError]= useState("")
    const [showPassword, setShowPassword]= useState(false)
    const router = useRouter()

    if(!isLoaded){
        return null;
    }
    async function submit(e: React.FormEvent){
        e.preventDefault()
        if(!isLoaded){
            return;
        }
        try {
            await signUp.create({
                emailAddress,
                password
            })
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            });
            setPendingVerification(true)
        } catch (error: any) {
            console.log(JSON.stringify(error, null,2));
            setError(error.errors[0].message)
        }
    }

    async function onPressVerify(e:React.FormEvent){
        e.preventDefault()
        if(!isLoaded){
            return;
        }
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({code}) //this returns promises n stuff
            if(completeSignUp.status !== "complete"){
                console.log(JSON.stringify(completeSignUp))
            }
            if(completeSignUp.status === "complete"){
                await setActive({session: completeSignUp.createdSessionId})
                router.push("/dashboard")
            }

        } catch (err: any) {
            console.log(JSON.stringify(err, null, 2));
            setError(err.errors[0].message)
        }
    }

    return(
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>
                    Sign Up please
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {!pendingVerification ? (
                        <form onSubmit={submit}>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                type="email"
                                id="email"
                                value={emailAddress}
                                onChange={(e)=>{ setEmailAddress(e.target.value)}}
                                required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">password</Label>
                                <Input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e)=>{setPassword(e.target.value)}}
                                required
                                />
                            
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
                            </div>
                            {error && (
                                <Alert>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit">Sign Up</Button>
                        </form>
                    ): (
                        <form onSubmit={onPressVerify}>
                            <div>
                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                id="code"
                                value={code}
                                required
                                onChange={(e)=> {setCode(e.target.value)}}
                                placeholder="enter your verification code"
                                />
                            </div>
                            {error && (
                                <Alert>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit">Verify email</Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter>
                    <p>Already have an account?
                        <Link href="/sign-in">Sign in</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
