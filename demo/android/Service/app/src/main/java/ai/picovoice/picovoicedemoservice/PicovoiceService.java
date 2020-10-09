/*
    Copyright 2018-2020 Picovoice Inc.

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

import java.io.File;

import ai.picovoice.picovoice.PicovoiceException;
import ai.picovoice.picovoice.PicovoiceManager;

public class PicovoiceService extends Service {
    private static final String CHANNEL_ID = "PorcupineServiceChannel";

    private PicovoiceManager picovoiceManager;

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

        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                new Intent(this, MainActivity.class),
                0);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Picovoice")
                .setContentText("Listening ...")
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentIntent(pendingIntent)
                .build();

        startForeground(1234, notification);

        final String porcupineModelPath = new File(this.getFilesDir(), "porcupine_params.pv").getAbsolutePath();
        final String rhinoModelPath = new File(this.getFilesDir(), "rhino_params.pv").getAbsolutePath();

        String keywordFileName = intent.getStringExtra("keywordFileName");
        assert keywordFileName != null;
        String keywordFilePath = new File(this.getFilesDir(), keywordFileName).getAbsolutePath();

        String contextFileName = intent.getStringExtra("contextFileName");
        assert contextFileName != null;
        String contextPath = new File(this.getFilesDir(), contextFileName).getAbsolutePath();

        try {
            picovoiceManager = new PicovoiceManager(
                    porcupineModelPath,
                    keywordFilePath,
                    0.7f,
                    () -> {
                        PendingIntent contentIntent = PendingIntent.getActivity(
                                this,
                                0,
                                new Intent(this, MainActivity.class),
                                0);

                        Notification n = new NotificationCompat.Builder(this, CHANNEL_ID)
                                .setContentTitle("Picovoice")
                                .setContentText("[Wake Word]")
                                .setSmallIcon(R.drawable.ic_launcher_background)
                                .setContentIntent(contentIntent)
                                .build();

                        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                        assert notificationManager != null;
                        notificationManager.notify(1234, n);
                    },
                    rhinoModelPath,
                    contextPath,
                    0.25f,
                    (rhinoInference) -> {
                        PendingIntent contentIntent = PendingIntent.getActivity(
                                this,
                                0,
                                new Intent(this, MainActivity.class),
                                0);

                        Notification n = new NotificationCompat.Builder(this, CHANNEL_ID)
                                .setContentTitle("Picovoice")
                                .setContentText("Rhino")
                                .setSmallIcon(R.drawable.ic_launcher_background)
                                .setContentIntent(contentIntent)
                                .build();

                        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                        assert notificationManager != null;
                        notificationManager.notify(1234, n);
                    });
            picovoiceManager.start();
        } catch (PicovoiceException e) {
            Log.e("Picovoice", e.toString());
        }

        return super.onStartCommand(intent, flags, startId);
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
            picovoiceManager.delete();
        } catch (PicovoiceException e) {
            Log.e("Picovoice", e.toString());
        }

        super.onDestroy();
    }
}
