import { Button, Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

// Dummy components to prevent errors
const CallToAction = () => (
  <div className="p-5 text-center bg-gray-100 mb-5">Call To Action Placeholder</div>
);

const CommentSection = ({ postId }) => (
  <div className="p-5 text-center bg-gray-50 mb-5">
    Comment Section Placeholder for Post ID: {postId}
  </div>
);

const PostCard = ({ post }) => (
  <div className="p-3 border rounded shadow w-60">
    <img src={post.image || 'https://via.placeholder.com/150'} alt={post.title} className="w-full h-32 object-cover" />
    <h3 className="mt-2 font-semibold">{post.title}</h3>
    <p className="text-sm text-gray-600">{post.category || 'Category'}</p>
  </div>
);

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        if (!res.ok || !data.posts?.length) {
          setError(true);
          setLoading(false);
          return;
        }
        setPost(data.posts[0]);
        setLoading(false);
        setError(false);
      } catch (err) {
        console.log(err);
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await fetch(`/api/post/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) setRecentPosts(data.posts || []);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchRecentPosts();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Error loading post. Please try again later.
      </div>
    );

  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {post?.title || 'Post Title'}
      </h1>

      <Link to={`/search?category=${post?.category || 'general'}`} className="self-center mt-5">
        <Button color="gray" pill size="xs">
          {post?.category || 'Category'}
        </Button>
      </Link>

      <img
        src={post?.image || 'https://via.placeholder.com/600x400'}
        alt={post?.title || 'Post Image'}
        className="mt-10 p-3 max-h-[600px] w-full object-cover"
      />

      <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
        <span>{post ? new Date(post.createdAt).toLocaleDateString() : 'Date'}</span>
        <span className="italic">{post ? (post.content?.length / 1000).toFixed(0) : 1} mins read</span>
      </div>

      <div
        className="p-3 max-w-2xl mx-auto w-full post-content"
        dangerouslySetInnerHTML={{ __html: post?.content || '<p>No content available.</p>' }}
      ></div>

      <CallToAction />
      <CommentSection postId={post?._id || '123'} />

      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl mt-5">Recent articles</h1>
        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {recentPosts.map((p) => (
            <PostCard key={p._id || Math.random()} post={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
