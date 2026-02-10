import Image from "next/image";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-48 w-48 border-t-2 border-b-2 border-blue-500">
        <img 
          src="https://raw.githubusercontent.com/abchatterjee7/chat-aadi/refs/heads/main/screenshots/chatAadi.png" 
          alt="Loading..." 
          width={48} 
          height={48} 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
