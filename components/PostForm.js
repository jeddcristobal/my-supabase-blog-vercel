import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PostForm({ postId, onPostUpdated }) { // postId for update
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch post data for update if postId exists
    if (postId) {
      async function fetchPost() {
        setLoading(true);
        const { data, error } = await supabase.from('posts').select('*').eq('id', postId).single();
        if (error) {
          console.error('Error fetching post:', error);
        } else {
          setTitle(data.title);
          setContent(data.content);
        }
        setLoading(false);
      }
      fetchPost();
    }
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("Session Error:", sessionError);
      alert("You must be logged in.");
      return;
    }

    const userId = session.user.id;

    if (postId) {
      // Update existing post
      const { error } = await supabase.from('posts').update({ title, content }).eq('id', postId);
      if (error) {
        console.error('Error updating post:', error);
      } else {
        console.log('Post updated!');
        onPostUpdated(); // Notify parent component
      }
    } else {
      // Create new post
      const { error } = await supabase.from('posts').insert([{ title, content, user_id: userId }]);
      if (error) {
        console.error('Error creating post:', error);
      } else {
        console.log('Post created!');
        setTitle('');
        setContent('');
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
      <button type="submit" disabled={loading}>{postId ? 'Update Post' : 'Create Post'}</button>
    </form>
  );
}