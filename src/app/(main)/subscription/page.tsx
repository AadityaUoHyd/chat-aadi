// app/subscription/page.tsx or components/SubscriptionPage.tsx

'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function SubscriptionPage() {
  const [selectedModel, setSelectedModel] = useState('mistral-tiny');

  const modelBasedPrices: Record<string, { Pro: number; Business: number }> = {
    'mistral-tiny': { Pro: 500, Business: 1200 },
    'qwen-7b': { Pro: 700, Business: 1400 },
    'GPT-4': { Pro: 1000, Business: 2000 },
    'llama3.2': { Pro: 600, Business: 1300 },
    'claude-3-5-sonnet': { Pro: 900, Business: 1800 },
    'gemini-2.0-flash': { Pro: 800, Business: 1600 },
  };

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: [
        'Basic access to ChatAadi',
        'Limited message history',
        'Access to open models',
      ],
      buttonText: 'Your Current Plan',
      buttonVariant: 'outline',
    },
    {
      name: 'Pro',
      price: `₹${modelBasedPrices[selectedModel]?.Pro || 1000}`,
      period: 'per month',
      popular: true,
      features: [
        'Everything in Free',
        'Unlimited message history',
        'Faster response times',
        'Priority support',
        'Early access to new features',
      ],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default',
    },
    {
      name: 'Business',
      price: `₹${modelBasedPrices[selectedModel]?.Business || 2000}`,
      period: 'per month',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Advanced analytics',
        'Dedicated account manager',
        'SLA & priority support',
      ],
      buttonText: 'Get Business',
      buttonVariant: 'outline',
    },
  ];

  const faqs = [
    {
      question: 'Can I change my plan later?',
      answer:
        'Yes, you can upgrade or downgrade your plan at any time from your account settings.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, UPI, and bank transfers. Invoices are also available for Business plans.',
    },
    {
      question: 'Is there a free trial?',
      answer:
        'Yes, all new Pro users get a 7-day free trial with no credit card required.',
    },
    {
      question: 'How do I cancel my subscription?',
      answer:
        'You can cancel anytime from your billing settings. Your access will continue until the end of your billing cycle.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Absolutely. We use industry-standard encryption and never share your data with third parties.',
    },
    {
      question: 'Do you offer custom enterprise plans?',
      answer:
        'Yes, we do! Please contact us directly for tailored enterprise solutions and SLAs.',
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-800">Choose the Perfect Plan</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-lg">
          Start for free, scale as you grow. No hidden fees, cancel anytime.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Selected Model: <strong>{selectedModel}</strong>
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-2xl shadow-sm p-8 transition-all duration-300 border ${
              plan.popular
                ? 'border-[#5d5bd0] ring-2 ring-[#5d5bd0] bg-gradient-to-br from-[#f5f4ff] to-white'
                : 'border-gray-200 bg-white hover:shadow-lg'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#5d5bd0] text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md uppercase tracking-wide">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-1 text-gray-800">{plan.name}</h2>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 text-lg">
                  {plan.period === 'forever' ? '' : '/'}{plan.period}
                </span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 text-gray-700">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 px-5 rounded-md font-semibold text-sm transition-all duration-200 ${
                plan.buttonVariant === 'default'
                  ? 'bg-[#5d5bd0] text-white hover:bg-[#4a47a3]'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-20 bg-gray-50 p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6 max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b pb-4">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800 hover:text-[#5d5bd0] transition-colors">
                  <span>{faq.question}</span>
                  <svg
                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed">{faq.answer}</p>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
