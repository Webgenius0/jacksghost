<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class FirebaseService
{
    protected $messaging;

    public function __construct()
    {
        $factory = (new Factory)->withServiceAccount('storage/firebase/firebase.json');
        $this->messaging = $factory->createMessaging();
    }

    /**
     * Send push notification to a specific device
     */
    public function sendToDevice(string $fcmToken, string $title, string $body): array
    {
        $message = CloudMessage::withTarget('token', $fcmToken)
            ->withNotification(Notification::create($title, $body))
            ->withData([
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
            ]);

            // dd($message);
            \Log::info('success send push from service');

        return $this->messaging->send($message);
    }
}
