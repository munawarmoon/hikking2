<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with complete HikKing data
     * for application features and advanced database operations demonstration.
     */
    public function run(): void
    {
        $password = Hash::make('password123');
        $now = now();

        // 1. Users
        DB::table('users')->insert([
            [
                'id' => 1,
                'name' => 'System Admin',
                'email' => 'admin@hikking.com',
                'phone' => '01700000001',
                'role' => 'admin',
                'password' => $password,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'name' => 'Rahim Uddin',
                'email' => 'rahim.guide@example.com',
                'phone' => '01711000002',
                'role' => 'guide',
                'password' => $password,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'name' => 'Karim Chowdhury',
                'email' => 'karim.guide@example.com',
                'phone' => '01722000003',
                'role' => 'guide',
                'password' => $password,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'name' => 'Tariq Hasan',
                'email' => 'tariq.guide@example.com',
                'phone' => '01733000004',
                'role' => 'guide',
                'password' => $password,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 5,
                'name' => 'Aiman Ahmed',
                'email' => 'traveler@test.com',
                'phone' => '01744000005',
                'role' => 'traveler',
                'password' => $password,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 6,
                'name' => 'Tanvir Rahman',
                'email' => 'tanvir@test.com',
                'phone' => '01755000006',
                'role' => 'traveler',
                'password' => $password,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 7,
                'name' => 'Nusrat Jahan',
                'email' => 'nusrat@test.com',
                'phone' => '01766000007',
                'role' => 'traveler',
                'password' => $password,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 8,
                'name' => 'Farhan Kabir',
                'email' => 'farhan@test.com',
                'phone' => '01777000008',
                'role' => 'traveler',
                'password' => $password,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 2. Guide Profiles
        DB::table('guide_profiles')->insert([
            [
                'id' => 1,
                'user_id' => 2,
                'bio' => 'Certified trekking and mountaineering guide with extensive experience in Bandarban trails.',
                'experience_years' => 6,
                'rating_avg' => 4.85,
                'verification_status' => 'verified',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'user_id' => 3,
                'bio' => 'Eco-tourist and coastal expedition leader specializing in Cox\'s Bazar and Saint Martin.',
                'experience_years' => 4,
                'rating_avg' => 4.60,
                'verification_status' => 'verified',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'user_id' => 4,
                'bio' => 'Junior mountain guide training on Keokradong and Saka Haphong routes.',
                'experience_years' => 1,
                'rating_avg' => 4.00,
                'verification_status' => 'pending',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 3. Verification Documents
        DB::table('verification_documents')->insert([
            [
                'guide_profile_id' => 1,
                'document_type' => 'National ID',
                'document_url' => 'https://example.com/docs/nid_rahim.pdf',
                'status' => 'approved',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'guide_profile_id' => 1,
                'document_type' => 'Mountain Guide Certification',
                'document_url' => 'https://example.com/docs/cert_rahim.pdf',
                'status' => 'approved',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'guide_profile_id' => 2,
                'document_type' => 'National ID',
                'document_url' => 'https://example.com/docs/nid_karim.pdf',
                'status' => 'approved',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 4. Destinations
        DB::table('destinations')->insert([
            [
                'destination_id' => 1,
                'name' => 'Cox\'s Bazar',
                'description' => 'World\'s longest unbroken natural sand sea beach.',
                'location' => 'Chittagong Division, Bangladesh',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'destination_id' => 2,
                'name' => 'Bandarban',
                'description' => 'Mountainous district famous for Keokradong, Nilgiri, and Amiakhum waterfall treks.',
                'location' => 'Chittagong Hill Tracts, Bangladesh',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'destination_id' => 3,
                'name' => 'Sajek Valley',
                'description' => 'The kingdom of clouds perched on lush hills near the Mizoram border.',
                'location' => 'Rangamati, Bangladesh',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'destination_id' => 4,
                'name' => 'Sreemangal',
                'description' => 'Tea capital of Bangladesh renowned for tropical rain forests and bird sanctuaries.',
                'location' => 'Moulvibazar, Sylhet, Bangladesh',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 5. Categories
        DB::table('categories')->insert([
            ['category_id' => 1, 'category_name' => 'Trekking & Hiking', 'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 2, 'category_name' => 'Beach & Coastal', 'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 3, 'category_name' => 'Eco-Tourism', 'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 4, 'category_name' => 'Camping & Adventure', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // 6. Packages
        DB::table('packages')->insert([
            [
                'id' => 1,
                'destination_id' => 1,
                'guide_profile_id' => 2,
                'title' => 'Cox\'s Bazar Beach & Marine Drive Tour',
                'description' => '3-day coastal experience covering Inani beach, Himchari waterfalls, and sea surfing.',
                'duration_days' => 3,
                'duration_nights' => 2,
                'price' => 8500.00,
                'max_travelers' => 12,
                'status' => 'published',
                'image_url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'destination_id' => 2,
                'guide_profile_id' => 1,
                'title' => 'Keokradong Summit Trek & Boga Lake Camp',
                'description' => 'High adventure mountain trail climbing Keokradong peak with lakeside camping.',
                'duration_days' => 4,
                'duration_nights' => 3,
                'price' => 14500.00,
                'max_travelers' => 10,
                'status' => 'published',
                'image_url' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'destination_id' => 3,
                'guide_profile_id' => 1,
                'title' => 'Sajek Valley Cloud Peak Trek',
                'description' => 'Witness sunrise through clouds, Konglak peak hike, and indigenous community culture.',
                'duration_days' => 3,
                'duration_nights' => 2,
                'price' => 9500.00,
                'max_travelers' => 15,
                'status' => 'published',
                'image_url' => 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'destination_id' => 4,
                'guide_profile_id' => 2,
                'title' => 'Lawachara Rainforest Nature Walk',
                'description' => 'Serene canopy trail walk, tea garden cycling, and bird watching.',
                'duration_days' => 2,
                'duration_nights' => 1,
                'price' => 6000.00,
                'max_travelers' => 8,
                'status' => 'draft',
                'image_url' => 'https://images.unsplash.com/photo-1448375240586-882707db888b',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 5,
                'destination_id' => 2,
                'guide_profile_id' => 1,
                'title' => 'Amiakhum Extreme Waterfall Expedition',
                'description' => 'Challenging deep-jungle expedition through Nafakhum and Remakri trails.',
                'duration_days' => 5,
                'duration_nights' => 4,
                'price' => 18000.00,
                'max_travelers' => 6,
                'status' => 'draft',
                'image_url' => 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 6,
                'destination_id' => 1,
                'guide_profile_id' => 2,
                'title' => 'Saint Martin Coral Island Escape',
                'description' => 'Ferry cruise to Bangladesh\'s only coral island with snorkeling and beach cycling.',
                'duration_days' => 3,
                'duration_nights' => 2,
                'price' => 11000.00,
                'max_travelers' => 15,
                'status' => 'published',
                'image_url' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 7. Package Categories
        DB::table('package_categories')->insert([
            ['package_id' => 1, 'category_id' => 2],
            ['package_id' => 2, 'category_id' => 1],
            ['package_id' => 2, 'category_id' => 4],
            ['package_id' => 3, 'category_id' => 1],
            ['package_id' => 4, 'category_id' => 3],
            ['package_id' => 5, 'category_id' => 1],
            ['package_id' => 6, 'category_id' => 2],
        ]);

        // 8. Hotels
        DB::table('hotels')->insert([
            ['hotel_id' => 1, 'hotel_name' => 'Sayeman Beach Resort', 'address' => 'Marine Drive, Kolatoli, Cox\'s Bazar', 'star_rating' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['hotel_id' => 2, 'hotel_name' => 'Boga Lake Eco Cottage', 'address' => 'Boga Lake Trailhead, Ruma, Bandarban', 'star_rating' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['hotel_id' => 3, 'hotel_name' => 'Sajek Resort & Cottage', 'address' => 'Ruilui Para, Sajek Valley', 'star_rating' => 4, 'created_at' => $now, 'updated_at' => $now],
            ['hotel_id' => 4, 'hotel_name' => 'Grand Sultan Tea Resort', 'address' => 'Radhanagar, Sreemangal', 'star_rating' => 5, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // 9. Package Hotels
        DB::table('package_hotels')->insert([
            ['package_id' => 1, 'hotel_id' => 1],
            ['package_id' => 2, 'hotel_id' => 2],
            ['package_id' => 3, 'hotel_id' => 3],
            ['package_id' => 4, 'hotel_id' => 4],
        ]);

        // 10. Package Itineraries
        DB::table('package_itineraries')->insert([
            ['package_id' => 1, 'day_number' => 1, 'title' => 'Arrival & Sunset Beach Walk', 'description' => 'Check in hotel and explore Laboni point.', 'location' => 'Laboni Beach', 'start_time' => '14:00:00', 'end_time' => '18:30:00', 'created_at' => $now, 'updated_at' => $now],
            ['package_id' => 1, 'day_number' => 2, 'title' => 'Marine Drive & Inani Rocks', 'description' => 'Jeep safari through Marine drive to Inani.', 'location' => 'Inani Beach', 'start_time' => '08:00:00', 'end_time' => '16:00:00', 'created_at' => $now, 'updated_at' => $now],
            ['package_id' => 2, 'day_number' => 1, 'title' => 'Bandarban to Ruma & Boga Lake', 'description' => 'Chander Gari drive and hike up to Boga Lake.', 'location' => 'Ruma Bazar', 'start_time' => '07:00:00', 'end_time' => '17:00:00', 'created_at' => $now, 'updated_at' => $now],
            ['package_id' => 2, 'day_number' => 2, 'title' => 'Summiting Keokradong Peak', 'description' => 'Climb to the summit of Keokradong (3,235 ft).', 'location' => 'Keokradong Summit', 'start_time' => '06:00:00', 'end_time' => '15:00:00', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // 11. Bookings (Giving Package 1 >= 3 bookings, Package 2 = 2 bookings, Package 3 = 1 booking, Package 4 = 0 bookings)
        DB::table('bookings')->insert([
            [
                'booking_id' => 1001,
                'traveler_id' => 5,
                'package_id' => 1,
                'travel_date' => '2026-10-15',
                'total_travelers' => 2,
                'total_price' => 17000.00,
                'booking_status' => 'confirmed',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'booking_id' => 1002,
                'traveler_id' => 6,
                'package_id' => 1,
                'travel_date' => '2026-10-20',
                'total_travelers' => 1,
                'total_price' => 8500.00,
                'booking_status' => 'confirmed',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'booking_id' => 1003,
                'traveler_id' => 7,
                'package_id' => 1,
                'travel_date' => '2026-10-25',
                'total_travelers' => 3,
                'total_price' => 25500.00,
                'booking_status' => 'pending',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'booking_id' => 1004,
                'traveler_id' => 5,
                'package_id' => 2,
                'travel_date' => '2026-11-05',
                'total_travelers' => 2,
                'total_price' => 29000.00,
                'booking_status' => 'confirmed',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'booking_id' => 1005,
                'traveler_id' => 8,
                'package_id' => 2,
                'travel_date' => '2026-11-12',
                'total_travelers' => 1,
                'total_price' => 14500.00,
                'booking_status' => 'confirmed',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'booking_id' => 1006,
                'traveler_id' => 7,
                'package_id' => 3,
                'travel_date' => '2026-11-20',
                'total_travelers' => 2,
                'total_price' => 19000.00,
                'booking_status' => 'pending',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'booking_id' => 1007,
                'traveler_id' => 5,
                'package_id' => 6,
                'travel_date' => '2026-12-01',
                'total_travelers' => 2,
                'total_price' => 22000.00,
                'booking_status' => 'confirmed',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 12. Payments
        DB::table('payments')->insert([
            [
                'payment_id' => 1,
                'booking_id' => 1001,
                'transaction_id' => 'TXN-BKASH-88231',
                'amount' => 17000.00,
                'payment_status' => 'paid',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'payment_id' => 2,
                'booking_id' => 1002,
                'transaction_id' => 'TXN-NAGAD-99120',
                'amount' => 8500.00,
                'payment_status' => 'paid',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'payment_id' => 3,
                'booking_id' => 1003,
                'transaction_id' => 'TXN-BKASH-Pending1',
                'amount' => 25500.00,
                'payment_status' => 'pending',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'payment_id' => 4,
                'booking_id' => 1004,
                'transaction_id' => 'TXN-CARD-44122',
                'amount' => 29000.00,
                'payment_status' => 'paid',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'payment_id' => 5,
                'booking_id' => 1005,
                'transaction_id' => 'TXN-CARD-55219',
                'amount' => 14500.00,
                'payment_status' => 'paid',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'payment_id' => 6,
                'booking_id' => 1006,
                'transaction_id' => 'TXN-NAGAD-Fail1',
                'amount' => 19000.00,
                'payment_status' => 'failed',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'payment_id' => 7,
                'booking_id' => 1007,
                'transaction_id' => 'TXN-BKASH-77124',
                'amount' => 22000.00,
                'payment_status' => 'paid',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 13. Reviews
        DB::table('reviews')->insert([
            ['booking_id' => 1001, 'traveler_id' => 5, 'package_id' => 1, 'rating' => 5, 'comment' => 'Spectacular views and well organized tour by Rahim Bhai!', 'created_at' => $now, 'updated_at' => $now],
            ['booking_id' => 1002, 'traveler_id' => 6, 'package_id' => 1, 'rating' => 4, 'comment' => 'Great experience, hotel food could be slightly better.', 'created_at' => $now, 'updated_at' => $now],
            ['booking_id' => 1004, 'traveler_id' => 5, 'package_id' => 2, 'rating' => 5, 'comment' => 'Challenging climb to Keokradong, summit view was breathless!', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // 14. Complaints
        DB::table('complaints')->insert([
            ['booking_id' => 1003, 'user_id' => 7, 'subject' => 'Payment gateway timeout during Bkash confirmation', 'status' => 'open', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // 15. Notifications
        DB::table('notifications')->insert([
            ['user_id' => 2, 'type' => 'new_booking', 'message' => 'Aiman Ahmed booked "Cox\'s Bazar Beach & Marine Drive Tour" on 2026-10-15', 'is_read' => 0, 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 5, 'type' => 'payment_success', 'message' => 'Your payment of 17000.00 BDT for Booking #1001 was confirmed.', 'is_read' => 1, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
