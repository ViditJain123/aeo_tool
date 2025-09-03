'use client';

import React, { Suspense, useEffect } from 'react'
import { useSearchParams } from "next/navigation";
import { useBrandStore } from "@/stores/brandStore"; 
import setBrandDetails from "@/services/onboarding/brandDetails";
import { useRouter } from 'next/navigation';

function CallbackContent() {
  const { brandName, website, setPrompts, setBrandId } = useBrandStore();
  const params = useSearchParams();
  const action = params.get('action');
  const router = useRouter();
  
  useEffect(() => {
    const fetchData = async () => {
      if (action === 'brandData' && brandName && website) {
        const response = await setBrandDetails(brandName, website)
        if (response.success) {
          // Extract categories from the first promptData item
          const categories = response.data.brandData.promptData[0]?.categories || [];
          setPrompts(categories);
          setBrandId(response.data.brandData._id);
          router.push('/onboarding/prompts');
        }
        console.log(response);
      }
    }
    fetchData();
  }, [action, brandName, website, setPrompts, setBrandId, router]);

  return (
    <div>
      <h1>You will be redirected to the next step once we are done processing your data.</h1>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  )
}