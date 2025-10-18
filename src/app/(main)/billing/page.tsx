"use client";

import { useRouter } from "next/navigation";

export default function BillingPage() {
  const router = useRouter();
  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-900">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-lg">Free Plan</h3>
              <p className="text-sm text-gray-600">
                Basic access with limited features. Upgrade to unlock full capabilities.
              </p>
            </div>
            <button 
            onClick={() => {router.push('/subscription')}}
            className="bg-[#5d5bd0] text-white px-4 py-2 rounded-md hover:bg-[#4a47a3] transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="border-t pt-6">
          <h3 className="font-medium text-lg mb-4">Billing History</h3>
          <div className="space-y-4">
            {[
              { id: 1, plan: "Free Plan", period: "Sep 2025 - Oct 2025", amount: "₹0", status: "Paid" },
              { id: 2, plan: "Free Plan", period: "Aug 2025 - Sep 2025", amount: "₹0", status: "Paid" },
              { id: 3, plan: "Free Plan", period: "Jul 2025 - Aug 2025", amount: "₹0", status: "Paid" },
            ].map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <div>
                  <p className="font-medium">{item.plan}</p>
                  <p className="text-sm text-gray-500">{item.period}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.amount}</p>
                  <p className={`text-sm ${item.status === "Paid" ? "text-green-600" : "text-red-600"}`}>
                    {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        <div className="border rounded-lg p-4 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
              alt="Visa"
              className="w-10 h-auto"
            />
            <span className="font-mono tracking-wider">•••• •••• •••• 4242</span>
            <span className="text-sm text-gray-500">(Exp: 12/27)</span>
          </div>
          <button className="text-[#5d5bd0] hover:underline">Edit</button>
        </div>
      </div>
    </div>
  );
}
