import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');

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

  // Get unique filter options
  const companies = Array.from(new Set(posts.map(p => p.companyName)));
  const locations = Array.from(new Set(posts.map(p => p.location)));
  const durations = Array.from(new Set(posts.map(p => p.duration)));

  // Filtered posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.description.toLowerCase().includes(search.toLowerCase());
    const matchesCompany = !companyFilter || post.companyName === companyFilter;
    const matchesLocation = !locationFilter || post.location === locationFilter;
    const matchesDuration = !durationFilter || post.duration === durationFilter;
    return matchesSearch && matchesCompany && matchesLocation && matchesDuration;
  });

  return (
    <div className="max-w-6xl mx-auto pt-28 pb-12 px-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Active Internship Posts</h1>
      {/* Filters/Search */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors w-full sm:w-64"
        />
        <select 
          value={companyFilter} 
          onChange={e => setCompanyFilter(e.target.value)} 
          className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors"
        >
          <option value="">All Companies</option>
          {companies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          value={locationFilter} 
          onChange={e => setLocationFilter(e.target.value)} 
          className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors"
        >
          <option value="">All Locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select 
          value={durationFilter} 
          onChange={e => setDurationFilter(e.target.value)} 
          className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors"
        >
          <option value="">All Durations</option>
          {durations.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">No posts match your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <div key={post._id} className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Post Image */}
              {post.image && (
                <div className="mb-4">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      console.error('Image failed to load:', post.image);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Company Profile Section */}
              <div className="flex items-center mb-2">
                {post.companyProfile?.profilePicture && (
                  <img
                    src={`/api/uploads/profiles/${post.companyProfile.profilePicture}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full mr-2 object-cover border"
                  />
                )}
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{post.companyProfile?.name}</span>
              </div>
              <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-2">{post.companyProfile?.industry}</span>
                <span className="mr-2">{post.companyProfile?.location}</span>
                <span className="mr-2">Size: {post.companyProfile?.size}</span>
                {post.companyProfile?.website && (
                  <a href={post.companyProfile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline ml-2">Website</a>
                )}
              </div>
              {post.companyProfile?.description && (
                <div className="mb-2 text-xs text-gray-600 dark:text-gray-300 italic">{post.companyProfile.description}</div>
              )}
              {/* Post Details */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">{post.description}</p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span>Location: {post.location}</span>
                <span>Duration: {post.duration}</span>
                <span>Stipend: {post.stipend || 'N/A'}</span>
              </div>
              <div className="text-xs text-gray-400 mt-auto">Posted: {new Date(post.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Posts; 