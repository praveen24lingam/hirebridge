import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatSalary, getDaysUntilDeadline } from '../../utils/helpers';

const createInitialFilters = (searchParams) => ({
  keyword: searchParams.get('keyword') || '',
  location: searchParams.get('location') || '',
  jobType: searchParams.get('jobType') || '',
  salaryMin: searchParams.get('salaryMin') || '',
  salaryMax: searchParams.get('salaryMax') || '',
  sort: searchParams.get('sort') || 'latest'
});

const JobListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [filters, setFilters] = useState(createInitialFilters(searchParams));
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        location: locationInput
      }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [locationInput]);

  useEffect(() => {
    const params = {};

    if (filters.keyword) {
      params.keyword = filters.keyword;
    }

    if (filters.location) {
      params.location = filters.location;
    }

    if (filters.jobType) {
      params.jobType = filters.jobType;
    }

    if (filters.salaryMin) {
      params.salaryMin = filters.salaryMin;
    }

    if (filters.salaryMax) {
      params.salaryMax = filters.salaryMax;
    }

    if (filters.sort) {
      params.sort = filters.sort;
    }

    if (currentPage > 1) {
      params.page = String(currentPage);
    }

    setSearchParams(params);
  }, [filters, currentPage, setSearchParams]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);

      try {
        const params = { ...filters, page: currentPage };
        Object.keys(params).forEach((key) => {
          if (!params[key]) {
            delete params[key];
          }
        });

        const response = await api.get('/jobs', { params });
        const { success, message, data } = response.data;

        if (!success) {
          toast.error(message || 'Something went wrong. Please try again.');
          setJobs([]);
          setTotalPages(0);
          return;
        }

        setJobs(data?.jobs || []);
        setTotalPages(data?.totalPages || 0);
        setCurrentPage(data?.currentPage || 1);
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Something went wrong. Please try again.'
        );
        setJobs([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters, currentPage]);

  const setJobType = (jobType) => {
    setFilters((prev) => ({
      ...prev,
      jobType: prev.jobType === jobType ? '' : jobType
    }));
    setCurrentPage(1);
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    const nextFilters = {
      keyword: '',
      location: '',
      jobType: '',
      salaryMin: '',
      salaryMax: '',
      sort: 'latest'
    };

    setFilters(nextFilters);
    setLocationInput('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const paginationNumbers = useMemo(() => {
    if (!totalPages) {
      return [];
    }

    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + 4, totalPages);

    if (endPage - startPage < 4) {
      startPage = Math.max(endPage - 4, 1);
    }

    const pages = [];

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  const handleSortChange = (event) => {
    const { value } = event.target;

    setFilters((prev) => ({
      ...prev,
      sort: value
    }));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-10 md:px-6">
        <aside className="sticky top-6 hidden h-fit w-72 flex-none self-start md:block">
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
              <button type="button" onClick={clearFilters} className="text-sm font-medium text-indigo-600">
                Clear All
              </button>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-slate-900">Keyword</p>
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={handleFieldChange}
                className="input-field mt-3"
                placeholder="Frontend, Node, Design"
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-slate-900">Job Type</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['internship', 'full-time', 'part-time'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setJobType(type)}
                    className={`rounded-lg border px-4 py-2 text-sm ${
                      filters.jobType === type
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-slate-900">Location</p>
              <input
                type="text"
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                className="input-field mt-3"
                placeholder="Bengaluru"
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-slate-900">Salary Range</p>
              <div className="mt-3 grid gap-3">
                <input
                  type="number"
                  name="salaryMin"
                  value={filters.salaryMin}
                  onChange={handleFieldChange}
                  className="input-field"
                  placeholder="Min salary"
                />
                <input
                  type="number"
                  name="salaryMax"
                  value={filters.salaryMax}
                  onChange={handleFieldChange}
                  className="input-field"
                  placeholder="Max salary"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex flex-col gap-3 md:hidden">
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFieldChange}
              className="input-field"
              placeholder="Search jobs"
            />
            <input
              type="text"
              value={locationInput}
              onChange={(event) => setLocationInput(event.target.value)}
              className="input-field"
              placeholder="Location"
            />
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-slate-500">Showing {jobs.length} jobs</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Sort by</span>
                  <select
                    value={filters.sort}
                    onChange={handleSortChange}
                    className="input-field w-44"
                  >
                    <option value="latest">Most Recent</option>
                    <option value="salary">Highest Salary</option>
                  </select>
                </div>
              </div>

              {jobs.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="mb-2 text-lg text-slate-500">No jobs match your filters</p>
                  <button onClick={clearFilters} className="text-indigo-600 underline">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => {
                    const deadlineLabel = getDaysUntilDeadline(job.deadline);
                    const deadlineColor =
                      deadlineLabel === 'Closes today' ||
                      deadlineLabel === 'Closes tomorrow' ||
                      deadlineLabel.includes('Closes in 1') ||
                      deadlineLabel.includes('Closes in 2')
                        ? 'text-amber-500'
                        : 'text-slate-500';

                    return (
                      <div
                        key={job._id}
                        className="rounded-lg border border-slate-200 border-l-4 border-l-indigo-600 bg-white p-5 transition-colors hover:border-l-amber-500"
                      >
                        <p className="text-sm text-slate-500">{job.companyProfile?.companyName || 'Employer'}</p>
                        <h2 className="mt-1 text-lg font-semibold text-slate-900">{job.title}</h2>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{job.location}</span>
                          <StatusBadge status={job.jobType} />
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm">
                          <span className="text-slate-500">Posted {formatDate(job.createdAt)}</span>
                          <span className={deadlineColor}>{deadlineLabel}</span>
                        </div>

                        <div className="mt-5">
                          <Link to={`/jobs/${job._id}`} className="btn-secondary">
                            View & Apply
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  {paginationNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`h-10 w-10 rounded-lg border ${
                        currentPage === pageNumber
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JobListings;
