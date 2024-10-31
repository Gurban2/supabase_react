import './index.css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
// import { GlobalStyle } from "./styles";


const supabase = createClient('https://wtkwfzrdqxsdueyooqtr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0a3dmenJkcXhzZHVleW9vcXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyODY2OTAsImV4cCI6MjA0NTg2MjY5MH0.5LJP-tBA41weLnmfgKM6bFYQm5mSeOn234xPzZrOtfU')

// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL; // Store this in an .env file
// const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY; // Store this in an .env file
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Main() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [resetStatus, setResetStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const accessToken = queryParams.get('access_token');
  const [userAccessToken, setUserAccessToken] = useState(null);  

  const isValidToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      return decoded.exp > now; // true if not expired
    } catch (error) {
      console.error('Invalid token:', error);
      return false; // Invalid token
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      if (accessToken && isValidToken(accessToken)) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken });
        if (error) {
          console.error('Error setting session:', error.message);
        }else {
          setUserAccessToken(accessToken);
        };
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          setUserAccessToken(session.access_token);
        };
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setUserAccessToken(session.access_token); // Get the access token from the session
      }
    });   

    return () => subscription.unsubscribe();
  }, [accessToken]);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     if (session) {
  //       const { data, error } = await supabase.auth.getUser();
  //       if (error) {
  //         console.error(error);
  //       } else {
  //         // console.log('User:', data.user); 
  //         setUserAccessToken(data.user?.access_token);
  //         // console.log('User:', data.user?.access_token);
          
  //       }
  //     }
  //   };

  //   fetchUser();
  // }, [session]);
 
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserAccessToken(null); // Clear the access token on logout
  }  
  
  const handleResetPassword = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      //  redirectTo: `http://localhost:3000/reset-password?`
    });
    setLoading(false);
    if (error) {
      setResetStatus('Error: ' + error.message);
    } else {
      setResetStatus('Check your email for the reset link!');
    }
  };

  if (!session) {
    return (      
      <Auth 
      supabaseClient={supabase} 
      appearance={{ theme: ThemeSupa }}
      providers={['google', 'github']} // Add any other providers if needed
      socialLayout="horizontal"
        onAuth={async (session) => {
          setSession(session);
          setUserAccessToken(session.access_token); // Access token after sign-in
        }}
        // view='update_password'
      />
      
    );
  } else {
    return (      
      <div>
        <h2>Logged in!</h2>
        <p>Access Token: {userAccessToken}</p> {/* Display access token */}
        <button onClick={handleLogout}>Log out</button>
        <h3>Reset Password</h3>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleResetPassword} disabled={loading}>
          {loading ? 'Sending...' : 'Reset Password'}
        </button>
        {resetStatus && <p>{resetStatus}</p>}
      </div>
      
    )
  }
}
