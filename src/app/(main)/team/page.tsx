export default function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Aadi Raj',
      email: 'aadi@example.com',
      role: 'Owner',
      avatar: '👨‍💼',
      status: 'active',
    },
    {
      id: 2,
      name: 'Santosh Bhandari',
      email: 'santosh@example.com',
      role: 'Admin',
      avatar: '👩‍💼',
      status: 'active',
    },
    {
      id: 3,
      name: 'Suman Gupta',
      email: 'suman@example.com',
      role: 'Member',
      avatar: '👨‍🔧',
      status: 'pending',
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <button className="bg-[#5d5bd0] text-white px-4 py-2 rounded-md hover:bg-[#4a47a3] transition-colors">
          Invite Team Member
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="grid grid-cols-12 gap-4 font-medium text-gray-500">
            <div className="col-span-4">Name</div>
            <div className="col-span-4">Role</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-1"></div>
          </div>
        </div>
        
        <div className="divide-y">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-4 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4 flex items-center space-x-3">
                <span className="text-2xl">{member.avatar}</span>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="col-span-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {member.role}
                </span>
              </div>
              <div className="col-span-3">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  member.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
