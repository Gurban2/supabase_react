const handleReset = async () => {
    if (!accessToken) {
      setError('Invalid or missing access token');
      return;
    }
  
    // Set the session with the access token
    const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken });
    if (sessionError) {
      setError('Error setting session: ' + sessionError.message);
      return;
    }
  
    // Update user password
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError('Error updating password: ' + error.message);
    } else {
      setSuccess(true);
    }
  };
  