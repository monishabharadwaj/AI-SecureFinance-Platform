import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Shield, Phone, Mail, User } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: (user as any).phone || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData.name, formData.phone);
      toast({ title: "Profile updated successfully! ✅" });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message || "Could not save profile settings.", variant: "destructive" });
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold">Your Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
            <div className="absolute -bottom-12 left-8">
              <div className="h-24 w-24 rounded-full bg-background border-4 border-background flex items-center justify-center overflow-hidden shadow-lg">
                <UserCircle className="h-20 w-20 text-muted-foreground/30" strokeWidth={1} />
              </div>
            </div>
          </div>
          
          <div className="pt-16 px-8 pb-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-display">{user.name}</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4 text-primary" /> Verified Account
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
              <div className="grid gap-4">
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground/80 font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> Full Name
                  </Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    className="h-11 bg-background/50 focus:bg-background transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground/80 font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" /> Email Address
                  </Label>
                  <Input 
                    id="email" 
                    value={user.email} 
                    disabled 
                    className="h-11 bg-muted/50 cursor-not-allowed text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground italic">Email address cannot be changed.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground/80 font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder="Add phone number"
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                    className="h-11 bg-background/50 focus:bg-background transition-colors"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-border/40 flex justify-end">
                <Button type="submit" disabled={isLoading} className="h-11 px-8 font-semibold gradient-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]">
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
