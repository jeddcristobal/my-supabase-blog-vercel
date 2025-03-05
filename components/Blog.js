import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import PostForm from './PostForm';
import PostList from './PostList';

export default function Blog() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return <p>Please log in to view the blog.</p>;
  }

  return (
    <div>
      <PostForm />
      <PostList />
    </div>
  );
}