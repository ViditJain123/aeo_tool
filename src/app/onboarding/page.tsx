'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { APP_CONFIG } from '@/config/app';
import { useRouter } from 'next/navigation';
import { useBrandStore } from '@/stores/brandStore';

export default function OnboardingPage() {
  const [brandName, setBrandName] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setBrandName: setStoreBrandName, setWebsite: setStoreWebsite } = useBrandStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Save to store before navigation
    setStoreBrandName(brandName);
    setStoreWebsite(website);
    
    router.push(`/callback?action=brandData`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {APP_CONFIG.name}
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Name Input */}
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand name</Label>
              <Input
                id="brandName"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="The AEO Analyser"
                required
              />
            </div>

            {/* Website Input */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://aeoanalyser.com"
                required
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              size="lg"
              disabled={loading || !brandName.trim() || !website.trim()}
            >
              {loading ? 'Processing...' : 'Next'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
