import { useState, useEffect, useRef } from "react";
import { Wand2, Paperclip, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PromptHelperModal } from "@/components/PromptHelperModal";
import { cn } from "@/lib/utils";

interface PromptTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showLanguageSelector?: boolean;
  showPaperclip?: boolean;
  onPaperclipClick?: () => void;
}

const languages = [
  { code: "fr", name: "FR" },
  { code: "en", name: "EN" },
  { code: "es", name: "ES" },
  { code: "de", name: "DE" },
  { code: "it", name: "IT" },
  { code: "pt", name: "PT" },
  { code: "ja", name: "JA" },
  { code: "zh", name: "ZH" },
  { code: "ko", name: "KO" },
  { code: "ar", name: "AR" },
  { code: "ru", name: "RU" },
];

export function PromptTextarea({
  value,
  onChange,
  placeholder = "Entrez votre prompt...",
  disabled = false,
  className,
  showLanguageSelector = true,
  showPaperclip = true,
  onPaperclipClick,
}: PromptTextareaProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [showHelperModal, setShowHelperModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <div className={cn("flex gap-2 items-start", className)}>
        {/* Paperclip x3 */}
        {showPaperclip && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-16 w-16 flex-shrink-0"
            onClick={onPaperclipClick}
          >
            <Paperclip className="h-12 w-12 text-muted-foreground" />
          </Button>
        )}

        <div className="flex-1 relative">
          {/* Toolbar au dessus du textarea */}
          <div className="flex items-center justify-between mb-1 px-1">
            {/* Sélecteur de langue */}
            {showLanguageSelector && (
              <div className="flex items-center gap-1">
                <Languages className="h-3 w-3 text-muted-foreground" />
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="h-6 w-14 text-xs border-0 bg-transparent hover:bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-xs">
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Bouton aide au prompt */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelperModal(true)}
              className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-[hsl(var(--primary))]"
              disabled={disabled}
            >
              <Wand2 className="h-3 w-3" />
              Aide au prompt
            </Button>
          </div>

          {/* Textarea avec spellcheck */}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            spellCheck={true}
            lang={selectedLanguage}
            className={cn(
              "input-3d min-h-[50px] text-sm resize-none",
              // Les fautes d'orthographe seront soulignées en rouge par le navigateur
            )}
          />
        </div>
      </div>

      {/* Modal d'aide au prompt */}
      <PromptHelperModal
        isOpen={showHelperModal}
        onClose={() => setShowHelperModal(false)}
        originalPrompt={value}
      />
    </>
  );
}
