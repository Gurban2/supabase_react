import './index.css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useLocation } from 'react-router-dom';

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

  console.log('Access Token:', accessToken); // Debugging

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session)
  //   })

  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session)
  //   })

  //   return () => subscription.unsubscribe()
  // }, [])
  useEffect(() => {
    const fetchSession = async () => {
      if (accessToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken });
        if (error) {
          console.error('Error setting session:', error.message);
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [accessToken]);

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const handleResetPassword = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `http://localhost:3000/reset-password?access_token=`
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
      <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
    )
  } else {
    return (
      <div>
        <h2>Logged in!</h2>
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