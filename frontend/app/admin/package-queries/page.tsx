import QueryResultView from "../query-results/QueryResultView";

export default function AdminPackageQueriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Package Management Queries
      </h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Join, aggregate, and subquery results across destinations, packages,
        itineraries, categories, and package categories.
      </p>

      <QueryResultView endpoint="packages" />
    </div>
  );
}
