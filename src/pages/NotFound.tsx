import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0d10]">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-white/50 mb-6">Oops! Page not found</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[#ff8964] hover:text-[#ff8964]/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;