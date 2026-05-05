import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="w-20 h-20 rounded-full bg-[#f0ad4e]/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-[#f0ad4e]" />
        </div>
        <h1 className="text-6xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-white/60 mb-8">Oops! Page not found</p>
        <Link to="/">
          <Button className="bg-[#6452db] hover:bg-[#5645c7] text-white">
            <Home className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
