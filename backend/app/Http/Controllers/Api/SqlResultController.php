<?php
// app/Http/Controllers/Api/SqlResultController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SqlResultController extends Controller
{
    /** key => SELECT (শুধু whitelist করা query চলবে) */
    private array $reads = [
        // mysql_1 booking
        'booking_view'          => 'SELECT * FROM `OutstandingBookings` ORDER BY 1 DESC',
        'booking_notifications' => 'SELECT * FROM `notifications` ORDER BY `notification_id` DESC LIMIT 5',
        'booking_latest'        => 'SELECT * FROM `bookings` ORDER BY `booking_id` DESC LIMIT 5',
        'booking_payments'      => 'SELECT * FROM `payments` ORDER BY `payment_id` DESC LIMIT 5',
        // mysql_2 package
        'pkg_view'              => 'SELECT * FROM `vw_DestinationPackageSummary` ORDER BY `AveragePrice` DESC',
        'pkg_packages'          => 'SELECT `id`, `title`, `price`, `status`, `duration_days` FROM `packages` ORDER BY `id` DESC LIMIT 10',
        'pkg_audit'             => 'SELECT * FROM `package_audit` ORDER BY `id` DESC LIMIT 10',
        'pkg_itin'              => 'SELECT `package_id`, `day_number`, `title` FROM `package_itineraries` ORDER BY `id` DESC LIMIT 10',
        // mysql_3 guide
        'guide_view'            => 'SELECT * FROM `vw_GuideVerificationSummary` ORDER BY `GuideProfileID`',
        'guide_notifications'   => 'SELECT * FROM `notifications` ORDER BY `notification_id` DESC LIMIT 5',
        'guide_complaints'      => 'SELECT * FROM `complaints` ORDER BY `complaint_id`',
    ];

    /** key => [sql, [param => validation rule]] (param-এর ক্রম = ? এর ক্রম) */
    private function runs(): array
    {
        return [
            'traveler_status'   => ['CALL sp_TravelerBookingStatus(?)', ['traveler_id' => 'required|integer']],
            'insert_booking'    => ["INSERT INTO `bookings` (traveler_id, package_id, travel_date, total_travelers, total_price, booking_status, created_at, updated_at) VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL 90 DAY), 1, 5000, 'pending', NOW(), NOW())",
                                    ['traveler_id' => 'required|integer', 'package_id' => 'required|integer']],
            'create_booking'    => ['CALL sp_CreateBookingWithPayment(?, ?, ?, ?, ?)',
                                    ['traveler_id' => 'required|integer', 'package_id' => 'required|integer', 'travel_date' => 'required|date',
                                     'travelers' => 'required|integer|min:1', 'amount' => 'required|numeric']],
            'review_packages'   => ['CALL sp_ReviewPackages()', []],
            'update_price'      => ['UPDATE `packages` SET `price` = `price` + ? WHERE `id` = ?',
                                    ['delta' => 'required|numeric', 'package_id' => 'required|integer']],
            'create_package'    => ['CALL sp_CreatePackageWithItinerary(?, ?, ?, ?, ?, ?)',
                                    ['destination_id' => 'required|integer', 'guide_profile_id' => 'required|integer', 'title' => 'required|string|max:200',
                                     'price' => 'required|numeric', 'days' => 'required|integer', 'category_id' => 'required|integer']],
            'verify_guide'      => ['CALL sp_VerifyGuide(?)', ['guide_profile_id' => 'required|integer']],
            'add_doc'           => ["INSERT INTO `verification_documents` (guide_profile_id, document_type, document_url, status, created_at, updated_at) VALUES (?, 'NID', 'nid.jpg', 'approved', NOW(), NOW())",
                                    ['guide_profile_id' => 'required|integer']],
            'resolve_complaint' => ['CALL sp_ResolveComplaint(?, ?)', ['complaint_id' => 'required|integer', 'status' => 'required|string|max:20']],
        ];
    }

    public function read(string $key): JsonResponse
    {
        if (! isset($this->reads[$key])) {
            return response()->json(['success' => false, 'message' => 'Unknown key'], 404);
        }

        try {
            return response()->json(['success' => true, 'data' => DB::select($this->reads[$key])]);
        } catch (\Throwable $e) {
            // যেমন view/table না থাকলে: migration চালাতে হবে
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() . ' — php artisan migrate চালিয়েছ?',
            ], 500);
        }
    }

    public function run(Request $request, string $key): JsonResponse
    {
        $runs = $this->runs();
        if (! isset($runs[$key])) {
            return response()->json(['success' => false, 'message' => 'Unknown key'], 404);
        }

        [$sql, $rules] = $runs[$key];

        $v = Validator::make($request->all(), $rules);
        if ($v->fails()) {
            return response()->json(['success' => false, 'message' => $v->errors()->first()], 422);
        }

        $params = array_map(fn ($name) => $request->input($name), array_keys($rules));

        try {
            $stmt = DB::connection()->getPdo()->prepare($sql);
            $stmt->execute($params);

            $rows = [];
            do { // procedure একাধিক result set দিতে পারে, সব পড়তে হবে
                if ($stmt->columnCount() > 0) {
                    foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
                        $rows[] = $row;
                    }
                }
            } while ($stmt->nextRowset());

            $stmt->closeCursor();

            if (empty($rows)) {
                $rows[] = ['result' => 'OK', 'affected_rows' => $stmt->rowCount()];
            }

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }
}