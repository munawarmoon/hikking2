import QueryResultView from "../query-results/QueryResultView";

export default function AdminGuideQueriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Guide Management Queries
      </h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Join, aggregate, and subquery results across users, guide profiles,
        verification documents, notifications, and complaints.
      </p>

      <QueryResultView endpoint="guides" />
    </div>
  );
}
