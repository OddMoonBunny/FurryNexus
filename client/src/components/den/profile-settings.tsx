
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useContentFilters } from "@/hooks/use-content-filters";
import { ErrorAlert } from "@/components/ui/error-alert";

export function ProfileSettings() {
  const { browseShowNsfw, browseShowAiGenerated, updateNsfwFilter, updateAiFilter } = useContentFilters();
  const [error, setError] = useState<string | null>(null);

  const handleNsfwToggle = async (checked: boolean) => {
    try {
      setError(null);
      await updateNsfwFilter(checked);
    } catch (err) {
      setError("Failed to update NSFW preferences");
      console.error(err);
    }
  };

  const handleAiToggle = async (checked: boolean) => {
    try {
      setError(null);
      await updateAiFilter(checked);
    } catch (err) {
      setError("Failed to update AI content preferences");
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <ErrorAlert 
            message={error} 
            onDismiss={() => setError(null)} 
          />
        )}
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="nsfw-toggle">Show NSFW Content</Label>
            <p className="text-sm text-muted-foreground">
              Toggle to show or hide mature content
            </p>
          </div>
          <Switch
            id="nsfw-toggle"
            checked={browseShowNsfw}
            onCheckedChange={handleNsfwToggle}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ai-toggle">Show AI-Generated Content</Label>
            <p className="text-sm text-muted-foreground">
              Toggle to show or hide AI-generated artwork
            </p>
          </div>
          <Switch
            id="ai-toggle"
            checked={browseShowAiGenerated}
            onCheckedChange={handleAiToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}
