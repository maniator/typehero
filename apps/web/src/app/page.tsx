import type { Metadata } from 'next';
import { Provider as BalancerProvider } from 'react-wrap-balancer';
import Community from '~/components/landing/community/community';
import Features from '~/components/landing/features';
import Hero from '~/components/landing/hero';
import Waitlist from '~/components/landing/waitlist/banner';
import { Footsies } from '~/components/ui/footsies';

export const metadata: Metadata = {
  title: 'Typehero',
  description:
    'Connect, collaborate, and grow with a community of TypeScript developers. Elevate your skills through interactive coding challenges, discussions, and knowledge sharing',
};

export default async function Index() {
  return (
    <>
      <BalancerProvider>
        <Hero />
        <Features />
        <Community />
        <Waitlist />
        <Footsies />
      </BalancerProvider>
    </>
  );
}
