import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AIModel, aiModels, APIStatus } from '@/data/aiModels';

interface APIKeyRecord {
  service_name: string;
  is_configured: boolean;
}

export function useAPIStatus() {
  const [configuredAPIs, setConfiguredAPIs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch configured APIs from database
  const fetchConfiguredAPIs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('service_name, is_configured')
        .eq('is_configured', true);

      if (error) throw error;

      const configured = (data || []).map((item: APIKeyRecord) => item.service_name.toLowerCase());
      setConfiguredAPIs(configured);
    } catch (error) {
      console.error('Error fetching API status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchConfiguredAPIs();

    // Realtime subscription
    const channel = supabase
      .channel('api_keys_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'api_keys',
        },
        () => {
          fetchConfiguredAPIs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConfiguredAPIs]);

  // Get updated models with real API status
  const getModelsWithStatus = useCallback((models: AIModel[]): AIModel[] => {
    return models.map(model => {
      // If model has an apiKeyName and it's configured
      if (model.apiKeyName && configuredAPIs.includes(model.apiKeyName.toLowerCase())) {
        return { ...model, apiStatus: 'active' as APIStatus };
      }
      // Keep original status for free models
      if (model.isFree) {
        return model;
      }
      // Mark as inactive if not configured
      if (model.apiKeyName && !configuredAPIs.includes(model.apiKeyName.toLowerCase())) {
        return { ...model, apiStatus: 'inactive' as APIStatus };
      }
      return model;
    });
  }, [configuredAPIs]);

  // Get all models with updated status
  const getAllModelsWithStatus = useCallback((): AIModel[] => {
    return getModelsWithStatus(aiModels);
  }, [getModelsWithStatus]);

  return {
    configuredAPIs,
    loading,
    getModelsWithStatus,
    getAllModelsWithStatus,
    refetch: fetchConfiguredAPIs,
  };
}
