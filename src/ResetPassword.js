import { useState } from "react";
import { useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { useEffect } from "react";

const supabase = createClient(
  "https://wtkwfzrdqxsdueyooqtr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0a3dmenJkcXhzZHVleW9vcXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyODY2OTAsImV4cCI6MjA0NTg2MjY5MH0.5LJP-tBA41weLnmfgKM6bFYQm5mSeOn234xPzZrOtfU"
);

function ResetPassword() {
  const { search } = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const queryParams = new URLSearchParams(search);
  const tokenHash = queryParams.get("token_hash"); // Get token_hash from the URL

  useEffect(() => {
    // Clear error when component mounts or token changes
    setError(null);
  }, [tokenHash]);

  const handleReset = async () => {
    if (!tokenHash) {
      setError("Invalid or missing token");
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const { data, error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError("Error updating password: " + updateError.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {success ? (
        <>
          <p>Your password has been reset successfully!</p>
          <a href="/">s</a>
        </>
      ) : (
        <>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleReset}>Reset Password</button>
          {error && <p>{error}</p>}
        </>
      )}
    </div>
  );
}

export default ResetPassword;
