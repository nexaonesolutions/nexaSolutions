import React from 'react';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Testimonials } from '../components/Testimonials';
import { CTA } from '../components/CTA';

const HomePage = () => (
  <>
    <Hero />
    <Features />
    <Testimonials />
    <CTA />
  </>
);

export default HomePage;