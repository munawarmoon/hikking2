import QueryResultView from "../query-results/QueryResultView";

export default function AdminBookingQueriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Booking Management Queries
      </h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Join, aggregate, and subquery results across hotels, package hotels,
        bookings, payments, and reviews.
      </p>

      <QueryResultView endpoint="bookings" />
    </div>
  );
}
