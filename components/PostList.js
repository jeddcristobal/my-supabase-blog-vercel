import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import PostForm from './PostForm';

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [postsPerPage] = useState(5);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    const from = currentPage * postsPerPage;
    const to = from + postsPerPage - 1;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data);
    }
    setLoading(false);
  };

  const handleDelete = async (postId) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) {
      console.error('Error deleting post:', error);
    } else {
      console.log('Post deleted!');
      fetchPosts(); // Refresh the list
    }
  };

  const handleUpdate = (postId) => {
    setSelectedPostId(postId);
  };

  const handlePostUpdated = () => {
    setSelectedPostId(null);
    fetchPosts();
  };

  const nextPage = () => setCurrentPage((prev) => prev + 1);
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {selectedPostId && <PostForm postId={selectedPostId} onPostUpdated={handlePostUpdated}/>}
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <button onClick={() => handleDelete(post.id)}>Delete</button>
            <button onClick={() => handleUpdate(post.id)}>Update</button>
          </li>
        ))}
      </ul>
      <div>
        <button onClick={prevPage} disabled={currentPage === 0}>Previous</button>
        <button onClick={nextPage} disabled={posts.length < postsPerPage}>Next</button>
      </div>
    </div>
  );
}