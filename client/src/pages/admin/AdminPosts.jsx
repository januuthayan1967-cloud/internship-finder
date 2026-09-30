import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/companies/all-internships');
      setPosts(res.data);
    } catch (err) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setEditData({ ...post });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (post) => {
    setActionLoading(true);
    try {
      await axios.put(`/api/admin/internships/${post.companyId}/${post._id}`, editData);
      setEditingId(null);
      fetchPosts();
    } catch (err) {
      // handle error
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setActionLoading(true);
    try {
      await axios.delete(`/api/admin/internships/${post.companyId}/${post._id}`);
      fetchPosts();
    } catch (err) {
      // handle error
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-28 pb-12 px-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Manage Internship Posts</h1>
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">No active posts available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div key={post._id} className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="mb-2 text-indigo-600 dark:text-indigo-400 font-semibold">{post.companyName}</div>
              {editingId === post._id ? (
                <>
                  <input name="title" value={editData.title} onChange={handleEditChange} className="w-full mb-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  <textarea name="description" value={editData.description} onChange={handleEditChange} className="w-full mb-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" rows="3" />
                  <input name="location" value={editData.location} onChange={handleEditChange} className="w-full mb-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  <input name="duration" value={editData.duration} onChange={handleEditChange} className="w-full mb-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  <input name="stipend" value={editData.stipend} onChange={handleEditChange} className="w-full mb-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleUpdate(post)} disabled={actionLoading} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">{actionLoading ? 'Saving...' : 'Save'}</button>
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{post.description}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span>Location: {post.location}</span>
                    <span>Duration: {post.duration}</span>
                    <span>Stipend: {post.stipend || 'N/A'}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-auto mb-2">Posted: {new Date(post.createdAt).toLocaleString()}</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(post)} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Edit</button>
                    <button onClick={() => handleDelete(post)} disabled={actionLoading} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPosts; 