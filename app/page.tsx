"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import StakeholdersSection from '@/components/StakeholdersSection';
import FeaturesSection from '@/components/FeaturesSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    if (user?.verification_status && user.verification_status !== 'approved') {
      router.replace('/provider-onboarding');
      router.refresh();
      return;
    }

    if (user?.role === 'provider') {
      router.replace('/provider-dashboard');
      router.refresh();
      return;
    }

    if (user?.role === 'admin') {
      router.replace('/admin');
      router.refresh();
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  }, [isAuthenticated, loading, router, user?.role, user?.verification_status]);

  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <StakeholdersSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
