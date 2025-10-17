import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import translations from "@/lib/i18n";
import { loginSchema } from "@shared/schema";

export default function Login() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { login } = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    setLoginError("");
    
    try {
      const success = await login(values.username, values.password);
      
      if (success) {
        navigate("/panel");
      } else {
        setLoginError(translations.auth.loginFailed);
      }
    } catch (error) {
      setLoginError((error as Error).message || translations.auth.loginFailed);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Header />
      
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold font-heading">
                  {translations.auth.login}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loginError && (
                  <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 text-sm">
                    <i className="fas fa-exclamation-circle ml-2"></i>
                    {loginError}
                  </div>
                )}
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translations.auth.username}</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل اسم المستخدم" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translations.auth.password}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="أدخل كلمة المرور" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-circle-notch fa-spin ml-2"></i>
                          جاري التحميل...
                        </>
                      ) : (
                        translations.auth.login
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="text-center text-sm text-neutral-500">
                <div className="w-full">
                  <p>{translations.auth.adminAccess}</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
