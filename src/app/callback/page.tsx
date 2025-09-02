'use client';

import React, { Suspense } from 'react'
import { useSearchParams } from "next/navigation";
import { useBrandStore } from "@/stores/brandStore";

function CallbackContent() {
  const { brandName, website } = useBrandStore();
  const params = useSearchParams();
  const action = params.get('action');

  if (action === 'brandData') {
    // Handle brandData action
  }

  return (
    <div>
      <h1>Callback Page</h1>
      <p>Action: {action}</p>
      <p>Brand: {brandName}</p>
      <p>Website: {website}</p>
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