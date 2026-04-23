import { useEffect } from "react";
// Remove useNavigate, we will use window.location instead
import { useSearchParams } from "react-router-dom"; 
import { Loader2 } from "lucide-react"; 

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userString = searchParams.get("user");

    if (token && userString) {
      try {
        // 1. Verify JSON (Safety check)
        JSON.parse(userString);

        // 2. Save to Storage
        localStorage.setItem("flowstate_token", token);
        localStorage.setItem("flowstate_user", userString);

        // 3. 🚀 CRITICAL FIX: HARD RELOAD
        // Instead of navigate("/dashboard"), we use window.location.href.
        // This forces the browser to reload the app, ensuring all 
        // components (like ProtectedRoute) read the fresh localStorage data.
        window.location.href = "/dashboard";

      } catch (error) {
        console.error("Login Error:", error);
        window.location.href = "/login";
      }
    } else {
      // Only redirect to login if data is truly missing
      window.location.href = "/login";
    }
  }, [searchParams]);

  return (
    <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center text-white space-y-4">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse text-sm">
        Finalizing secure login...
      </p>
    </div>
  );
}