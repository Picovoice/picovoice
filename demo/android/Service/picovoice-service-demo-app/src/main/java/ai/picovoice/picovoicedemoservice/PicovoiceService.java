/*
    Copyright 2018-2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

package ai.picovoice.picovoicedemoservice;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.util.Map;

import ai.picovoice.picovoice.*;

public class PicovoiceService extends Service {
    private final String ACCESS_KEY = "${YOUR_ACCESS_KEY_HERE}"; // AccessKey obtained from Picovoice Console (https://picovoice.ai/console/)

    private static final String CHANNEL_ID = "PicovoiceServiceChannel";

    private PicovoiceManager picovoiceManager;

    private final PicovoiceWakeWordCallback picovoiceWakeWordCallback = () -> {
        Notification n = getNotification("Picovoice", "Wake Word Detected...");

        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        assert notificationManager != null;
        notificationManager.notify(1234, n);
    };

    private final PicovoiceInferenceCallback picovoiceInferenceCallback = inference -> {
        StringBuilder builder = new StringBuilder();

        if (inference.getIsUnderstood()) {
            builder.append(inference.getIntent()).append(" - ");
            final Map<String, String> slots = inference.getSlots();
            if (slots.size() > 0) {
                for (String key : slots.keySet()) {
                    builder.append(key).append(" : ").append(slots.get(key)).append(" ");
                }
            }
        } else {
            builder.append("Didn't understand the command.");
        }

        Notification n = getNotification("Picovoice", builder.toString());

        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        assert notificationManager != null;
        notificationManager.notify(1234, n);
    };

    private final PicovoiceManagerErrorCallback picovoiceManagerErrorCallback = error -> {
        onPicovoiceError(error.getMessage());
    };

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel notificationChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Picovoice",
                    NotificationManager.IMPORTANCE_HIGH);

            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(notificationChannel);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();

        String keywordFilePath = intent.getStringExtra("keywordFileName");
        String contextPath = intent.getStringExtra("contextFileName");

        boolean started = false;

        try {
            picovoiceManager = new PicovoiceManager.Builder()
                    .setAccessKey(ACCESS_KEY)
                    .setKeywordPath(keywordFilePath)
                    .setPorcupineSensitivity(0.7f)
                    .setWakeWordCallback(picovoiceWakeWordCallback)
                    .setContextPath(contextPath)
                    .setRhinoSensitivity(0.25f)
                    .setInferenceCallback(picovoiceInferenceCallback)
                    .setErrorCallback(picovoiceManagerErrorCallback)
                    .build(getApplicationContext());
            picovoiceManager.start();
            started = true;
        } catch (PicovoiceInvalidArgumentException e) {
            onPicovoiceError(
                    String.format(
                            "%s\nEnsure your AccessKey '%s' is a valid access key.",
                            e.getLocalizedMessage(),
                            ACCESS_KEY));
        } catch (PicovoiceActivationException e) {
            onPicovoiceError("AccessKey activation error");
        } catch (PicovoiceActivationLimitException e) {
            onPicovoiceError("AccessKey reached its device limit");
        } catch (PicovoiceActivationRefusedException e) {
            onPicovoiceError("AccessKey refused");
        } catch (PicovoiceActivationThrottledException e) {
            onPicovoiceError("AccessKey has been throttled");
        } catch (PicovoiceException e) {
            onPicovoiceError("Failed to initialize Picovoice " + e.getMessage());
        }

        Notification notification = started ?
                getNotification("Picovoice", "Listening...") :
                getNotification("Picovoice init failed", "Service will shutdown");

        startForeground(1234, notification);

        return super.onStartCommand(intent, flags, startId);
    }

    private void onPicovoiceError(String message) {
        Intent i = new Intent("PicovoiceError");
        i.putExtra("errorMessage", message);
        sendBroadcast(i);
    }

    private Notification getNotification(String title, String message) {
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                new Intent(this, MainActivity.class),
                0);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(message)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentIntent(pendingIntent)
                .build();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        try {
            picovoiceManager.stop();
        } catch (PicovoiceException e) {
            Log.e("Picovoice", e.toString());
        }

        super.onDestroy();
    }
}
