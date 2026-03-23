import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const categories = [
  'Frontend Dev',
  'Backend Dev',
  'UI/UX Design',
  'Data Analyst',
  'Digital Marketing',
  'Content Writing'
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    totalEmployers: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/stats');
        const { success, message, data } = response.data;

        if (!success) {
          toast.error(message || 'Something went wrong. Please try again.');
          return;
        }

        setStats({
          totalJobs: data?.totalJobs || 0,
          totalCandidates: data?.totalCandidates || 0,
          totalEmployers: data?.totalEmployers || 0
        });
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set('keyword', keyword.trim());
    }

    if (location.trim()) {
      params.set('location', location.trim());
    }

    const query = params.toString();
    navigate(query ? `/jobs?${query}` : '/jobs');
  };

  return (
    <div className="bg-slate-50">
      <section style={{ background: '#1E1B4B' }}>
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 text-center md:px-6">
          <h1 className="font-display text-4xl text-white md:text-5xl">
            Find Your First Big Opportunity
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Internships and full-time roles from companies that are actually hiring
          </p>

          <form
            onSubmit={handleSearch}
            className="-mb-8 mx-auto mt-10 max-w-4xl rounded-xl bg-white p-5 shadow-lg"
          >
            <div className="grid gap-4 md:grid-cols-[1fr,1fr,auto]">
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="input-field"
                placeholder="Search by role or skill"
              />
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="input-field"
                placeholder="Search by location"
              />
              <button type="submit" className="btn-primary">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mt-8 bg-slate-50 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 text-center md:grid-cols-3 md:px-6">
          <div>
            <p className="font-display text-4xl text-indigo-600">
              {loading ? '...' : `${stats.totalJobs.toLocaleString('en-IN')}+`}
            </p>
            <p className="mt-2 text-slate-500">Jobs</p>
          </div>
          <div>
            <p className="font-display text-4xl text-indigo-600">
              {loading ? '...' : `${stats.totalEmployers.toLocaleString('en-IN')}+`}
            </p>
            <p className="mt-2 text-slate-500">Employers</p>
          </div>
          <div>
            <p className="font-display text-4xl text-indigo-600">
              {loading ? '...' : `${stats.totalCandidates.toLocaleString('en-IN')}+`}
            </p>
            <p className="mt-2 text-slate-500">Candidates</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center">
            <h2 className="font-display text-3xl text-slate-900">Explore by Role</h2>
            <p className="mt-3 text-slate-500">Jump into the most active categories on HireBridge.</p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(category)}`)}
                className="rounded-lg border border-slate-200 bg-white p-6 text-left transition-colors hover:border-indigo-600"
              >
                <p className="font-semibold text-slate-900">{category}</p>
                <p className="mt-2 text-sm text-slate-500">See open roles in this category</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
