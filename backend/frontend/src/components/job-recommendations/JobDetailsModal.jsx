import { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Bookmark,
  Share2,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Building,
  Briefcase,
  Clock,
  CheckCircle,
  Award,
  Star,
  Download,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Copy,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const JobDetailsModal = ({ job, isOpen, onClose, onApply, onSave, darkMode }) => {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSave = () => {
    setSaved(!saved);
    if (onSave) onSave(job.jobId);
  };

  const handleShare = async () => {
    const shareData = {
      title: job.title,
      text: `Check out this ${job.title} position at ${job.company}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
    if (score >= 60) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
    return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-4xl rounded-2xl shadow-2xl ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
            : 'bg-gradient-to-br from-white to-blue-50'
        }`}>
          {/* Header */}
          <div className="sticky top-0 z-10 rounded-t-2xl p-6 border-b backdrop-blur-sm ${
            darkMode ? 'border-gray-700 bg-gray-800/90' : 'border-gray-200 bg-white/90'
          }">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h2>
                <div className="flex items-center flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Posted {formatDate(job.postedDate)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className={`p-2 rounded-lg transition-colors ${
                    saved
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title={saved ? 'Saved' : 'Save Job'}
                >
                  <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={handleShare}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Share"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Match Score & Quick Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-full ${getMatchColor(job.matchScore)} font-medium`}>
                  {job.matchScore}% Match Score
                </div>
                
                {job.remote && (
                  <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                    Remote Available
                  </span>
                )}
                
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                  {job.type || 'Full-time'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Source: <span className="font-medium">{job.source?.toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-1 px-6">
              {['overview', 'requirements', 'benefits', 'company', 'application'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab
                      ? darkMode
                        ? 'text-blue-400 border-b-2 border-blue-500'
                        : 'text-blue-600 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Job Description</h3>
                  <div className={`prose prose-blue max-w-none ${
                    darkMode ? 'prose-invert' : ''
                  }`}>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {job.description || 'No description available.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Salary</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {job.salary || 'Negotiable'}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Experience</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {job.experience || '2+ years'}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Team Size</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {job.teamSize || '5-10'}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Work Type</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {job.remote ? 'Remote' : 'On-site'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.requiredSkills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-300 rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Qualifications</h3>
                  <ul className="space-y-3">
                    {[
                      "Bachelor's degree in Computer Science or related field",
                      '3+ years of professional experience',
                      'Strong problem-solving skills',
                      'Excellent communication skills'
                    ].map((qual, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: Award, title: 'Health Insurance', desc: 'Comprehensive medical, dental, and vision' },
                    { icon: Star, title: 'Stock Options', desc: 'Equity in a fast-growing company' },
                    { icon: Sparkles, title: 'Learning Budget', desc: '$2,000 annual learning stipend' },
                    { icon: Calendar, title: 'Flexible PTO', desc: 'Unlimited paid time off' },
                    { icon: DollarSign, title: '401(k) Matching', desc: 'Up to 4% company match' },
                    { icon: Users, title: 'Team Events', desc: 'Quarterly team building activities' }
                  ].map((benefit, index) => (
                    <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                          <benefit.icon className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{benefit.title}</h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{benefit.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.company}</h3>
                    <p className="text-gray-600 dark:text-gray-300">Technology • 500+ employees • Founded 2015</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">About Company</h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {job.company} is a leading technology company specializing in innovative solutions. 
                    We're committed to creating products that make a difference in people's lives.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Industry</div>
                    <div className="font-medium text-gray-900 dark:text-white">Technology/SaaS</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Company Size</div>
                    <div className="font-medium text-gray-900 dark:text-white">501-1000 employees</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Funding</div>
                    <div className="font-medium text-gray-900 dark:text-white">Series C • $150M</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location</div>
                    <div className="font-medium text-gray-900 dark:text-white">San Francisco, CA</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Globe className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Linkedin className="w-5 h-5 text-blue-700" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20">
                    <Twitter className="w-5 h-5 text-sky-500" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'application' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-gray-900 dark:text-white">Application Tips</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Tailor your resume to highlight skills mentioned above</li>
                    <li>• Include specific achievements with metrics</li>
                    <li>• Write a personalized cover letter</li>
                    <li>• Apply within 24 hours for best chances</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">Application Process</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">Submit Application</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Upload resume and answer screening questions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">Technical Assessment</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Complete a coding challenge or technical test</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">Interviews</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">3 rounds: technical, behavioral, and cultural fit</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        4
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">Offer</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Receive offer and negotiate terms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 rounded-b-2xl p-6 border-t backdrop-blur-sm ${
            darkMode ? 'border-gray-700 bg-gray-800/90' : 'border-gray-200 bg-white/90'
          }">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <Download className="w-4 h-4" />
                  <span>Save as PDF</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <Mail className="w-4 h-4" />
                  <span>Email to Friend</span>
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.open(job.applyUrl, '_blank')}
                  className="px-6 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on {job.source || 'Original'} Site
                </button>
                
                <button
                  onClick={() => onApply && onApply(job.jobId)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Apply with Your Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;