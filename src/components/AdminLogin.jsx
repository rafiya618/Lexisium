import { useState } from "react";
import { loginAdmin } from "../api/api";
import { Lock, User } from "lucide-react";
import CustomAlert from "./CustomAlert";

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });

  const showAlert = (message, type = "error") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 4000);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showAlert("Please enter both username and password", "warning");
      return;
    }

    try {
      const res = await loginAdmin({ username, password });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        showAlert("Login successful! Redirecting...", "success");
        setTimeout(() => onLogin(true), 1000);
      }
    } catch (error) {
      showAlert("Invalid credentials. Please try again.", "error");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      {/* Custom Alert */}
      <CustomAlert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "" })}
      />

      <div className="w-full max-w-md bg-[var(--color-background)] rounded-xl shadow-lg border border-[var(--color-border)] p-8">
        {/* Header */}
        <h1 className="text-3xl font-fenix text-center text-gradient mb-6">
          Admin Login
        </h1>

        {/* Username Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[var(--color-gunmetal)] mb-1">
            Username
          </label>
          <div className="flex items-center border-2 border-[var(--color-border)] rounded-lg px-3 py-2 focus-within:border-[var(--color-coral)] transition">
            <User className="text-[var(--color-paynesgray)] mr-2" size={18} />
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full outline-none text-[var(--color-text)] placeholder:text-[var(--color-silver-dark)]"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[var(--color-gunmetal)] mb-1">
            Password
          </label>
          <div className="flex items-center border-2 border-[var(--color-border)] rounded-lg px-3 py-2 focus-within:border-[var(--color-coral)] transition">
            <Lock className="text-[var(--color-paynesgray)] mr-2" size={18} />
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full outline-none text-[var(--color-text)] placeholder:text-[var(--color-silver-dark)]"
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-[var(--color-gunmetal)] text-white font-semibold py-3 rounded-lg shadow-md hover:bg-[var(--color-gunmetal-dark)] transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
