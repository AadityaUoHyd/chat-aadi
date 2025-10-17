"use client"
export default function BillingPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Free Plan</h3>
              <p className="text-sm text-gray-600">Basic access with limited features</p>
            </div>
            <button className="bg-[#5d5bd0] text-white px-4 py-2 rounded-md hover:bg-[#4a47a3] transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Billing History</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Free Plan</p>
                  <p className="text-sm text-gray-500">March 2023 - April 2023</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$0.00</p>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
        <div className="border rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs">VISA</span>
            </div>
            <span>•••• •••• •••• 4242</span>
          </div>
          <button className="text-[#5d5bd0] hover:underline">Edit</button>
        </div>
      </div>
    </div>
  );
}
