import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Eye, Trash2, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTest } from '../contexts/TestContext';
import { useUI } from '../contexts/UIContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EditTestModal from '../components/test/EditTestModal';
import { formatDate } from '../utils/formatters';
import { Test } from '../types';

const statusBadgeClasses: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  live: 'bg-green-100 text-green-700',
  scheduled: 'bg-yellow-100 text-yellow-700',
};

const DashboardPage: React.FC = () => {
  const { state, fetchTests, deleteTest } = useTest();
  const { showConfirmDialog, openEditModal } = useUI();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // Filter tests based on search query and status filter
  const filteredTests = useMemo(() => {
    return state.tests.filter((test) => {
      const matchesSearch =
        searchQuery === '' ||
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || (test.status || 'draft') === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [state.tests, searchQuery, statusFilter]);

  const handleDelete = (test: Test) => {
    showConfirmDialog(
      'Delete Test',
      `Are you sure you want to delete "${test.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteTest(test.id);
          toast.success(`"${test.name}" has been deleted successfully.`);
        } catch {
          toast.error('Failed to delete test. Please try again.');
        }
      }
    );
  };

  if (state.isLoading && state.tests.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (state.error && state.tests.length === 0) {
    return (
      <div className="p-6">
        <ErrorMessage message={state.error} onRetry={fetchTests} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Tests</h1>
        <button
          type="button"
          onClick={() => navigate('/tests/create')}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create New Test
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by test name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="live">Live</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {filteredTests.length === 0 ? (
        <p className="text-center text-gray-500">
          {state.tests.length === 0
            ? 'No tests found. Create your first test to get started.'
            : 'No tests match your search criteria.'}
        </p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Test Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[200px]">
                      {test.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {test.subject}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses[test.status || 'draft']}`}
                      >
                        {test.status || 'draft'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDate(test.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(test.id)}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`Edit ${test.name}`}
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/tests/${test.id}/preview`)}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                          aria-label={`View ${test.name}`}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(test)}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Delete ${test.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{test.name}</h3>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses[test.status || 'draft']}`}
                  >
                    {test.status || 'draft'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{test.subject}</p>
                <p className="mt-1 text-xs text-gray-400">{formatDate(test.created_at)}</p>
                <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(test.id)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Edit ${test.name}`}
                  >
                    <Edit className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/tests/${test.id}/preview`)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label={`View ${test.name}`}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(test)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Delete ${test.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog />
      <EditTestModal />
    </div>
  );
};

export default DashboardPage;
