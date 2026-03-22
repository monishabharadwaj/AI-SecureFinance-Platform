import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { Eye, EyeOff, ShieldCheck, Activity, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login(email, password);
      toast({ title: "Welcome back! 👋" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch {
      toast({ title: "Login failed", description: error || "Invalid credentials", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      
      {/* Left Pane - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 overflow-hidden items-center justify-center p-12">
        
        {/* Abstract Background Ornaments */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="relative z-10 max-w-lg text-white space-y-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/25 relative overflow-hidden">
               <div className="absolute inset-0 bg-white/20 w-full h-full pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%, 0 100%)' }} />
               <BrainCircuit className="h-8 w-8 text-white relative z-10" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Smart Finance Manager</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-5xl font-display font-bold leading-tight">
              Track your income, manage expenses, and stay in control of your finances.
            </h2>
            <p className="text-lg text-zinc-400 max-w-md">
              All your financial data in one place — simple and easy to understand.
            </p>
          </div>

          <div className="pt-8 grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-white/5 border border-white/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Secure Architecture</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-white/5 border border-white/10 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Intelligent Insights</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/30 z-0" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <BrainCircuit className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Smart Finance</h1>
              <p className="text-xs text-muted-foreground">Manager</p>
            </div>
          </div>

          <Card className="p-8 sm:p-10 border-border/50 shadow-2xl shadow-black/5 bg-card/80 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mt-2">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80 font-medium">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="alex@example.com" 
                  className="bg-background/50 border-input/50 focus:bg-background h-11 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-foreground/80 font-medium">Password</Label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPw ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="bg-background/50 border-input/50 focus:bg-background h-11 pr-11 transition-all"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1 h-9 w-9 text-muted-foreground hover:text-foreground" 
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-[15px] font-semibold gradient-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin duration-500 rounded-full h-4 w-4 border-b-2 border-white" />
                    Authenticating...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Create one now
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
