import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useFavoriteModels() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch favorites from database
  const fetchFavorites = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('favorite_models')
        .select('model_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites((data || []).map(item => item.model_id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchFavorites();

    const channel = supabase
      .channel('favorite_models_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorite_models',
        },
        () => {
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFavorites]);

  // Add to favorites
  const addFavorite = useCallback(async (modelId: string) => {
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Non connecté",
          description: "Veuillez vous connecter pour ajouter des favoris",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('favorite_models')
        .insert({ model_id: modelId, user_id: user.id });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Déjà en favoris",
            description: "Ce modèle est déjà dans vos favoris",
          });
          return;
        }
        throw error;
      }

      setFavorites(prev => [modelId, ...prev]);
      toast({
        title: "⭐ Ajouté aux favoris",
        description: "Le modèle a été épinglé en haut de la liste",
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter aux favoris",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Remove from favorites
  const removeFavorite = useCallback(async (modelId: string) => {
    try {
      const { error } = await supabase
        .from('favorite_models')
        .delete()
        .eq('model_id', modelId);

      if (error) throw error;

      setFavorites(prev => prev.filter(id => id !== modelId));
      toast({
        title: "Retiré des favoris",
        description: "Le modèle n'est plus épinglé",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer des favoris",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (modelId: string) => {
    if (favorites.includes(modelId)) {
      await removeFavorite(modelId);
    } else {
      await addFavorite(modelId);
    }
  }, [favorites, addFavorite, removeFavorite]);

  // Check if model is favorite
  const isFavorite = useCallback((modelId: string) => {
    return favorites.includes(modelId);
  }, [favorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
}
