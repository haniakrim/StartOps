import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-surface border border-hairline-soft flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-warning" />
        </div>
        <div>
          <h1 className="text-4xl font-app font-bold text-white mb-2">404</h1>
          <p className="text-lg text-white/45">Page not found</p>
        </div>
        <p className="text-sm text-white/30 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="bg-violet hover:bg-violet/90 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
