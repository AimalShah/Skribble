import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, UserCheck } from "lucide-react";

export default function AuthForm() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1222] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900/80 sketchy-card border-slate-700 p-8 wobbly-glow">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/15 text-indigo-300 border-2 border-dashed border-indigo-400/40 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>{isLogin ? "Welcome Back" : "Join the Studio"}</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-yellow-300">
            {isLogin ? "Log In" : "Sign Up"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 font-display">Artist Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                placeholder="PencilKing"
                className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-sans"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1 font-display">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="artist@skribble.com"
              className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-sans"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1 font-display">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min 6 characters"
              className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-mono"
            />
          </div>
          {error && <p className="text-red-400 text-sm font-display">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide sketchy-btn border-white/20 shadow flex items-center justify-center gap-2 cursor-pointer transition font-display"
          >
            <UserCheck className="w-4 h-4" />
            {loading ? "Loading..." : isLogin ? "Access Account" : "Create Profile"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-yellow-400 hover:underline font-bold"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
