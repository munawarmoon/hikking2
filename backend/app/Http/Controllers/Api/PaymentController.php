<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    // List payments (traveler: only their own via ?mine=1, admin: all)
    public function index(Request $request)
    {
        $query = Payment::with('booking.package');

        if ($request->boolean('mine')) {
            $query->whereHas('booking', function ($q) use ($request) {
                $q->where('traveler_id', $request->user()->id);
            });
        }

        return response()->json($query->latest('payment_id')->get());
    }

    public function show($id)
    {
        return response()->json(Payment::with('booking.package')->findOrFail($id));
    }

    // Pay for a booking (demo bKash / Nagad gateway)
    public function store(Request $request)
    {
        $data = $request->validate([
            'booking_id'     => 'required|exists:bookings,booking_id',
            'payment_method' => 'required|in:bkash,nagad',
            'payer_account'  => ['required', 'regex:/^01[3-9]\d{8}$/'],
        ]);

        $booking = Booking::with('package.guideProfile')->findOrFail($data['booking_id']);

        // 1) Safety checks
        if ($booking->traveler_id !== $request->user()->id) {
            return response()->json(['message' => 'This is not your booking.'], 403);
        }
        if ($booking->booking_status !== 'pending') {
            return response()->json(['message' => 'This booking cannot be paid.'], 422);
        }
        if (Payment::where('booking_id', $booking->booking_id)->where('payment_status', 'paid')->exists()) {
            return response()->json(['message' => 'This booking is already paid.'], 422);
        }

        $base = [
            'booking_id'     => $booking->booking_id,
            'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
            'amount'         => $booking->total_price,
            'payment_method' => $data['payment_method'],
            'payer_account'  => substr($data['payer_account'], -4),
        ];

        // 2) Fake gateway rule (demo): an account number ending in 0000 is always declined
        if (str_ends_with($data['payer_account'], '0000')) {
            Payment::create($base + ['payment_status' => 'failed']);

            return response()->json(['message' => 'Payment declined: insufficient balance.'], 422);
        }

        // 3) Success: everything together or nothing (ACID)
        $payment = DB::transaction(function () use ($booking, $base) {
            $payment = Payment::create($base + ['payment_status' => 'paid', 'paid_at' => now()]);

            $booking->update(['booking_status' => 'confirmed']);

            $guideUserId = $booking->package?->guideProfile?->user_id;
            if ($guideUserId) {
                Notification::create([
                    'user_id'  => $guideUserId,
                    'type'     => 'booking_confirmed',
                    'message'  => "A new booking for \"{$booking->package->title}\" has been confirmed.",
                    'is_read'  => false,
                ]);
            }

            Notification::create([
                'user_id'  => $booking->traveler_id,
                'type'     => 'payment_success',
                'message'  => "Your payment for booking #{$booking->booking_id} was successful.",
                'is_read'  => false,
            ]);

            return $payment;
        });

        return response()->json($payment->load('booking.package'), 201);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
        ]);

        $payment->update($validated);

        return response()->json($payment);
    }

    public function destroy($id)
    {
        Payment::findOrFail($id)->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}