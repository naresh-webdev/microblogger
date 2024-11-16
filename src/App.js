import React, { useState, useEffect } from 'react';

const App = () => {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [showLogin, setShowLogin] = useState(true);
  const [selectedFollower, setSelectedFollower] = useState('');
  const [following, setFollowing] = useState([]);


  console.log('userId:', userId);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:3001/posts');
      if (response.status === 500) {
        console.error('Failed to retrieve posts');
        return
      } else {
        const data = await response.json();
        setPosts(data);
      }
      
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setUserId(data._id);
      setShowLogin(false);

    } catch (error) {
      console.error('Error creating or fetching user:', error);
    }
  };

  const handlePost = async () => {
    if (userId && content) {
      try {
        await fetch('http://localhost:3001/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: username, content }),
        });
        setContent('');
        fetchPosts();
      } catch (error) {
        console.error('Error creating post:', error);
      }
    }
  };

  const handleFollow = async (userIdToFollow) => {
    try {
      const response = await fetch("http://localhost:3001/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followerusername: username, 
          userNameToFollow: userIdToFollow,  
        }),
      });
      
      if (response.ok) {
        await fetchFollowing();
        console.log("User followed successfully");
      } else {
        console.error("Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };


  async function fetchFollowing() {
    try {
      const response = await fetch(`http://localhost:3001/following?userName=${username}`);
      const data = await response.json();
      setFollowing(data.following); // Assume backend sends an array of usernames
    } catch (error) {
      console.error('Error fetching following list:', error);
    }
  }

  
  
  function handleFilterChange(event) {
    setSelectedFollower(event.target.value);
  }

  useEffect(() => {
    async function fetchFilteredPost() {
      try {
        const response = await fetch(`http://localhost:3001/posts/${username}`);
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching filtered posts:', error);
      }
    }

    fetchFilteredPost();
  }, [selectedFollower]);
  

  useEffect(() => {
    fetchFollowing()
  }, [username]);


  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
  <h2 className="text-3xl font-bold text-blue-600 mb-4">Microblogging App</h2>

  {showLogin && (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mb-6">
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleUser}
        className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
      >
        Enter
      </button>
    </div>
  )}

  {userId && (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Post Content</h3>
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handlePost}
        className="w-full mt-4 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
      >
        Post
      </button>
    </div>
  )}

  <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-6 mb-4">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter by Following</h3>
    <select
      value={selectedFollower}
      onChange={handleFilterChange}
      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
    >
      <option value="">All Posts</option>
      {following?.map((follower, index) => (
        <option key={index} value={follower}>
          {follower}
        </option>
      ))}
    </select>
  </div>

  <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-6">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">All Posts</h3>
    <ul className="space-y-4">
      {posts
        .filter((post) => !selectedFollower || post.username === selectedFollower)
        .map((post, index) => (
          <li key={index} className="p-4 border border-gray-200 rounded bg-gray-50 flex justify-between items-center">
            <div>
              <strong className="text-blue-600">{post.username}</strong>:
              <p className="text-gray-700">{post.content}</p>
            </div>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
              onClick={() => handleFollow(post.username)}
            >
              Follow
            </button>
          </li>
        ))}
    </ul>
  </div>
</div>

  );
};

export default App;
