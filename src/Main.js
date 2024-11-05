import "./index.css";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const supabase = createClient(
  "https://wtkwfzrdqxsdueyooqtr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0a3dmenJkcXhzZHVleW9vcXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyODY2OTAsImV4cCI6MjA0NTg2MjY5MH0.5LJP-tBA41weLnmfgKM6bFYQm5mSeOn234xPzZrOtfU"
);

export default function Main() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [resetStatus, setResetStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const accessToken = queryParams.get("access_token");
  const [userAccessToken, setUserAccessToken] = useState(null);
  const navigate = useNavigate();

  // Функция для проверки срока действия токена
  const isValidToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      if (accessToken && isValidToken(accessToken)) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
        });
        if (error) {
        } else {
          setUserAccessToken(accessToken);
        }
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();
       
        setSession(session);
        if (session) {
          setUserAccessToken(session.access_token);
        }
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session); // Логирование изменений состояния аутентификации
      setSession(session);
      if (session) {
        console.log("New session access token:", session.access_token); // Логирование нового токена сессии
        setUserAccessToken(session.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, [accessToken]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {

    } else {

      setSession(null);
      setUserAccessToken(null);
    }
  };

  const handleResetPasswordOutAuth = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `http://localhost:3000/reset-password`, // Убедитесь, что путь совпадает с вашим
    });
    setLoading(false);
    if (error) {
     
      setResetStatus("Error: " + error.message);
    } else {
      
      setResetStatus("Check your email for the reset link!");
    }
  };

  if (!session) {
    return (
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["google", "github"]}
        socialLayout="horizontal"
        onAuth={(session) => {
          setSession(session);
          setUserAccessToken(session.access_token);
        }}
      />
    );
  } else {
    return (
      <div>
        <h2>Logged in!</h2>
        <p>Access Token: {userAccessToken}</p>
        <button onClick={handleLogout}>Log out</button>
        <h3>Reset Password</h3>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleResetPasswordOutAuth} disabled={loading}>
          {loading ? "Sending..." : "Reset Password"}
        </button>
        {resetStatus && <p>{resetStatus}</p>}
      </div>
    );
  }
}
