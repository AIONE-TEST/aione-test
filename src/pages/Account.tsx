import { useState } from "react";
import { User, Image, Video, History, Settings, Save, Camera } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface UserProfile {
  displayName: string;
  email: string;
  avatar: string;
}

interface GenerationHistoryItem {
  id: string;
  type: "image" | "video" | "audio";
  prompt: string;
  thumbnail: string;
  createdAt: Date;
  model: string;
}

const Account = () => {
  const [profile, setProfile] = useState<UserProfile>({
    displayName: "",
    email: "",
    avatar: "",
  });

  const [history] = useState<GenerationHistoryItem[]>([
    // Empty for now - will be populated when generations are made
  ]);

  const handleSaveProfile = () => {
    // Save profile logic
    console.log("Profile saved:", profile);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[200px] min-h-screen p-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(210,100%,60%)] to-[hsl(280,100%,65%)] glow-blue">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-black gradient-text-cyan text-glow-cyan tracking-wider">
                MON COMPTE
              </h1>
              <p className="text-lg text-muted-foreground font-display tracking-wide mt-2">
                ESPACE PERSONNEL & HISTORIQUE
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="bg-[hsl(220,20%,12%)] border border-[hsl(220,15%,25%)] p-1 rounded-xl">
            <TabsTrigger 
              value="profile" 
              className="font-display text-base tracking-wider px-6 py-3 data-[state=active]:bg-[hsl(174,100%,50%)]/20 data-[state=active]:text-[hsl(174,100%,50%)]"
            >
              <User className="h-5 w-5 mr-2" />
              PROFIL
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="font-display text-base tracking-wider px-6 py-3 data-[state=active]:bg-[hsl(280,100%,65%)]/20 data-[state=active]:text-[hsl(280,100%,65%)]"
            >
              <History className="h-5 w-5 mr-2" />
              HISTORIQUE
            </TabsTrigger>
            <TabsTrigger 
              value="images" 
              className="font-display text-base tracking-wider px-6 py-3 data-[state=active]:bg-[hsl(320,100%,60%)]/20 data-[state=active]:text-[hsl(320,100%,60%)]"
            >
              <Image className="h-5 w-5 mr-2" />
              IMAGES
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="font-display text-base tracking-wider px-6 py-3 data-[state=active]:bg-[hsl(280,100%,65%)]/20 data-[state=active]:text-[hsl(280,100%,65%)]"
            >
              <Video className="h-5 w-5 mr-2" />
              VIDÉOS
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="font-display text-base tracking-wider px-6 py-3 data-[state=active]:bg-[hsl(45,100%,55%)]/20 data-[state=active]:text-[hsl(45,100%,55%)]"
            >
              <Settings className="h-5 w-5 mr-2" />
              PARAMÈTRES
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="panel-3d p-8 max-w-2xl">
              <h2 className="font-display text-2xl font-bold gradient-text-cyan mb-6">
                INFORMATIONS PERSONNELLES
              </h2>
              <p className="text-muted-foreground mb-6 font-display">
                Toutes les informations sont optionnelles
              </p>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[hsl(280,100%,65%)] to-[hsl(320,100%,60%)] flex items-center justify-center glow-purple">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[hsl(174,100%,50%)] flex items-center justify-center hover:scale-110 transition-transform">
                    <Camera className="h-4 w-4 text-black" />
                  </button>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">PHOTO DE PROFIL</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG max 2MB</p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div>
                  <label className="font-display text-sm font-bold text-muted-foreground mb-2 block">
                    NOM D'AFFICHAGE
                  </label>
                  <Input
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    placeholder="Votre pseudo..."
                    className="input-3d text-lg font-display"
                  />
                </div>

                <div>
                  <label className="font-display text-sm font-bold text-muted-foreground mb-2 block">
                    EMAIL (OPTIONNEL)
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="email@exemple.com"
                    className="input-3d text-lg font-display"
                  />
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  className="btn-3d-green font-display text-lg px-8 py-4 h-auto gap-3"
                >
                  <Save className="h-5 w-5" />
                  SAUVEGARDER
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="panel-3d p-8">
              <h2 className="font-display text-2xl font-bold gradient-text-purple mb-6">
                HISTORIQUE DES GÉNÉRATIONS
              </h2>
              
              {history.length === 0 ? (
                <div className="text-center py-16">
                  <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="font-display text-xl text-muted-foreground">
                    AUCUNE GÉNÉRATION POUR LE MOMENT
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Vos créations apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {history.map((item) => (
                    <Card key={item.id} className="panel-3d overflow-hidden">
                      <div className="aspect-video bg-muted" />
                      <div className="p-4">
                        <p className="font-display text-sm truncate">{item.prompt}</p>
                        <p className="text-xs text-muted-foreground">{item.model}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card className="panel-3d p-8">
              <h2 className="font-display text-2xl font-bold gradient-text-pink mb-6">
                MES IMAGES GÉNÉRÉES
              </h2>
              <div className="text-center py-16">
                <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="font-display text-xl text-muted-foreground">
                  AUCUNE IMAGE GÉNÉRÉE
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <Card className="panel-3d p-8">
              <h2 className="font-display text-2xl font-bold gradient-text-purple mb-6">
                MES VIDÉOS GÉNÉRÉES
              </h2>
              <div className="text-center py-16">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="font-display text-xl text-muted-foreground">
                  AUCUNE VIDÉO GÉNÉRÉE
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="panel-3d p-8 max-w-2xl">
              <h2 className="font-display text-2xl font-bold gradient-text-yellow mb-6">
                PARAMÈTRES
              </h2>
              <p className="text-muted-foreground font-display">
                Les paramètres avancés seront disponibles prochainement
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Account;
