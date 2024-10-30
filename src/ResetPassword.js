import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://wtkwfzrdqxsdueyooqtr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0a3dmenJkcXhzZHVleW9vcXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyODY2OTAsImV4cCI6MjA0NTg2MjY5MH0.5LJP-tBA41weLnmfgKM6bFYQm5mSeOn234xPzZrOtfU')


function ResetPassword() {
    const { search } = useLocation();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const queryParams = new URLSearchParams(search);
    const accessToken = queryParams.get('access_token');
  
    const handleReset = async () => {
        if (!accessToken) {
          setError('Invalid or missing access token');
          return;
        }
  
        const { error } = await supabase.auth.updateUser({ password }, { accessToken });
        if (error) {
          setError('Error updating password: ' + error.message);
        } else {
          setSuccess(true);
        }
      };
  
    return (
      <div>
        <h2>Reset Your Password</h2>
        {success ? (
          <p>Your password has been reset successfully!</p>
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