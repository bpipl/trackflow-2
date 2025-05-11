
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { CustomerOnboardingForm } from '@/components/customers/CustomerOnboardingForm';

const CustomerOnboarding = () => {
  return (
    <PageLayout title="Customer Onboarding">
      <CustomerOnboardingForm />
    </PageLayout>
  );
};

export default CustomerOnboarding;
