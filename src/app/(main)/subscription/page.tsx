export default function SubscriptionPage() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: [
        'Basic access to ChatAadi',
        'Limited message history',
        'Standard response time',
        'Community support'
      ],
      buttonText: 'Your Current Plan',
      buttonVariant: 'outline',
    },
    {
      name: 'Pro',
      price: '₹1000',
      period: 'per month',
      popular: true,
      features: [
        'Everything in Free',
        'Unlimited message history',
        'Faster response times',
        'Priority support',
        'Early access to new features'
      ],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default',
    },
    {
      name: 'Business',
      price: '₹2000',
      period: 'per month',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Advanced analytics',
        'Dedicated account manager',
        'SLA & priority support'
      ],
      buttonText: 'Get Business',
      buttonVariant: 'outline',
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your needs. Start for free and upgrade anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div 
            key={index}
            className={`relative rounded-xl border p-6 ${plan.popular ? 'border-[#5d5bd0] ring-1 ring-[#5d5bd0]' : 'border-gray-200'}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#5d5bd0] text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500">
                  {plan.period === 'forever' ? '' : '/'}{plan.period}
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              className={`w-full py-2 px-4 rounded-md ${
                plan.buttonVariant === 'default' 
                  ? 'bg-[#5d5bd0] text-white hover:bg-[#4a47a3]' 
                  : 'border border-gray-300 hover:bg-gray-50'
              } transition-colors`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            'Can I change my plan later?',
            'What payment methods do you accept?',
            'Is there a free trial?',
            'How do I cancel my subscription?'
          ].map((question, i) => (
            <div key={i} className="border-b pb-3">
              <button className="flex justify-between items-center w-full text-left">
                <span className="font-medium">{question}</span>
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
