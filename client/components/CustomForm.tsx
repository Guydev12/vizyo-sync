"use client"

import { Button } from '@app/@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@app/@/components/ui/form'
import { Input } from '@app/@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'path'
import React from 'react'
import { useForm } from 'react-hook-form'
import {z}from "zod"


const formSchema = z.object({
  username:z.string().min(2,{message:"username should be at least 2 charaters"})
})


const CustomForm = () => {
  const form=useForm<z.infer<typeof formSchema>>(
    {
      resolver:zodResolver(formSchema),
      defaultValues:{
        username:"",
      },
    }
  )

  const onSubmit=(value:z.infer<typeof formSchema>)=>{
    console.log(value)
  }
  return (
    <Form {...form}>
      <form 
         onSubmit={form.handleSubmit(onSubmit)}
         className="space-y-8">
          <FormField
             control={form.control}
             name="username"
             render={({field})=>(
              <FormItem>
                <FormLabel>username</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="enter your username"
                    />
 
                </FormControl>
                <FormMessage/>
              </FormItem>
             )}
          />
        <Button type='submit'>Login</Button>
       </form>
    </Form>
  )
}

export default CustomForm
