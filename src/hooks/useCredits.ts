import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

interface QuotaInfo {
  id: string;
  service_name: string;
  total_quota: number;
  used_quota: number;
  quality: string;
  reset_date: string | null;
}

export function useCredits() {
  const { session } = useSession();
  const [quotas, setQuotas] = useState<QuotaInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuotas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("user_quotas")
        .select("*");

      if (error) throw error;
      setQuotas(data || []);
    } catch (err) {
      console.error("Error fetching quotas:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotas();
  }, [fetchQuotas]);

  const getCreditsForService = useCallback((serviceName: string, quality: string = "standard"): number => {
    const quota = quotas.find(
      q => q.service_name.toLowerCase() === serviceName.toLowerCase() && 
           q.quality.toLowerCase() === quality.toLowerCase()
    );
    if (quota) {
      return quota.total_quota - quota.used_quota;
    }
    // Default credits if no quota found
    return 50;
  }, [quotas]);

  const getTotalCreditsForService = useCallback((serviceName: string, quality: string = "standard"): number => {
    const quota = quotas.find(
      q => q.service_name.toLowerCase() === serviceName.toLowerCase() && 
           q.quality.toLowerCase() === quality.toLowerCase()
    );
    return quota?.total_quota || 100;
  }, [quotas]);

  const useCredit = useCallback(async (serviceName: string, quality: string = "standard", amount: number = 1): Promise<boolean> => {
    const remaining = getCreditsForService(serviceName, quality);
    if (remaining < amount) return false;

    try {
      const quota = quotas.find(
        q => q.service_name.toLowerCase() === serviceName.toLowerCase() && 
             q.quality.toLowerCase() === quality.toLowerCase()
      );

      if (quota) {
        const { error } = await supabase
          .from("user_quotas")
          .update({ used_quota: quota.used_quota + amount })
          .eq("id", quota.id);

        if (error) throw error;
        
        // Refresh quotas
        fetchQuotas();
        return true;
      }

      // Create quota if doesn't exist
      const { error } = await supabase
        .from("user_quotas")
        .insert({
          service_name: serviceName,
          quality,
          total_quota: 100,
          used_quota: amount
        });

      if (error) throw error;
      fetchQuotas();
      return true;
    } catch (err) {
      console.error("Error using credit:", err);
      return false;
    }
  }, [quotas, getCreditsForService, fetchQuotas]);

  const canGenerate = useCallback((serviceName: string, quality: string = "standard"): boolean => {
    return getCreditsForService(serviceName, quality) > 0;
  }, [getCreditsForService]);

  return {
    quotas,
    isLoading,
    getCreditsForService,
    getTotalCreditsForService,
    useCredit,
    canGenerate,
    refreshQuotas: fetchQuotas
  };
}
