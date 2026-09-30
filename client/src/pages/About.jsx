import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Info, Search, Briefcase, Users, Shield, Sparkles, Mail } from 'lucide-react';

function About() {
  const section = (title, children, delay = 0) => (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h2>
      <div className="text-gray-600 dark:text-gray-300 text-sm leading-6">
        {children}
      </div>
    </motion.section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">About Future desk</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Your hub for internships, interviews, and hiring.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          {section(
            'What is this platform?',
            <>
              <p>
                Future desk connects <strong>students</strong> and <strong>companies</strong> for internship opportunities. 
                Students can complete their profiles, upload a CV, discover active posts, and join interviews. Companies can 
                publish internships, search talent, and manage interviews. Admins oversee approvals and platform health.
              </p>
            </>,
            0
          )}

          {section(
            'Key features',
            <ul className="list-disc pl-5 space-y-1">
              <li className="flex items-center gap-2"><Search className="w-4 h-4" /> Browse the latest internship posts.</li>
              <li className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Schedule and join interviews in-app.</li>
              <li className="flex items-center gap-2"><Users className="w-4 h-4" /> Student profiles with skills, domains, and CV preview.</li>
              <li className="flex items-center gap-2"><Shield className="w-4 h-4" /> Role-based access for students, companies, and admins.</li>
            </ul>,
            0.05
          )}

          {section(
            'How it works',
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Students</h3>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li>Register and complete onboarding (questions + CV + photo).</li>
                  <li>Explore <Link to="/posts" className="text-indigo-600 dark:text-indigo-400 underline">Posts</Link> and apply.</li>
                  <li>Join scheduled interviews and track progress.</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Companies</h3>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li>Create posts and manage applications.</li>
                  <li>Search students by skills and domains.</li>
                  <li>Host interviews and review outcomes.</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Admins</h3>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li>Approve companies and monitor activity.</li>
                  <li>Manage interviews and investigate issues.</li>
                  <li>Maintain platform insights.</li>
                </ol>
              </div>
            </div>,
            0.1
          )}

          {section(
            'Tips for getting started',
            <ul className="list-disc pl-5 space-y-1">
              <li>Keep your profile and CV up to date for better visibility.</li>
              <li>Use relevant programming languages and domains to power matching.</li>
              <li>Check Posts frequently; new internships appear daily.</li>
            </ul>,
            0.15
          )}

          {section(
            'Need help?',
            <div className="flex items-center justify-between">
              <p>Have questions or feedback? We’d love to hear from you.</p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                <Mail className="w-4 h-4" /> Contact support
              </Link>
            </div>,
            0.2
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400"
        >
          <Sparkles className="inline w-4 h-4 mr-1" />
          Built for learning and career growth.
        </motion.div>
      </div>
    </div>
  );
}

export default About;


