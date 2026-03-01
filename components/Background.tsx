import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-[#f8fafc]">
      {/* Animated Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[45rem] h-[45rem] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-yellow-100/40 rounded-full mix-blend-multiply filter blur-[60px] animate-blob animation-delay-6000"></div>

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      
      {/* Geometric Accents */}
      <div className="absolute top-20 left-10 opacity-20 animate-float">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
           <circle cx="20" cy="20" r="18" stroke="#6366f1" strokeWidth="4" />
        </svg>
      </div>

      <div className="absolute bottom-40 right-10 opacity-20 animate-float-delayed">
         <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="36" height="36" rx="8" stroke="#ec4899" strokeWidth="4" />
         </svg>
      </div>
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animation-delay-6000 { animation-delay: 6s; }
        
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 7s ease-in-out infinite 1s; }
      `}</style>
    </div>
  );
};

export default Background;