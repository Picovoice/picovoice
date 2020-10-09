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

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.os.Bundle;
import android.widget.Toast;
import android.widget.ToggleButton;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class MainActivity extends AppCompatActivity {
    private void copyResourceFile(int resourceID, String filename) throws IOException {
        Resources resources = getResources();
        try (
                InputStream is = new BufferedInputStream(resources.openRawResource(resourceID), 256);
                OutputStream os = new BufferedOutputStream(openFileOutput(filename, Context.MODE_PRIVATE), 256)
        ){
            int r;
            while ((r = is.read()) != -1) {
                os.write(r);
            }
            os.flush();
        }
    }

    private boolean hasRecordPermission() {
        return ActivityCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestRecordPermission() {
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, 0);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        ToggleButton recordButton = findViewById(R.id.startButton);

        if (grantResults.length == 0 || grantResults[0] == PackageManager.PERMISSION_DENIED) {
            recordButton.toggle();
        } else {
            startService();
        }
    }

    private void startService() {
        Intent serviceIntent = new Intent(this, PicovoiceService.class);
        serviceIntent.putExtra("keywordFileName", "keyword.ppn");
        serviceIntent.putExtra("contextFileName", "context.rhn");
        ContextCompat.startForegroundService(this, serviceIntent);
    }

    private void stopService() {
        Intent serviceIntent = new Intent(this, PicovoiceService.class);
        stopService(serviceIntent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        try {
            copyResourceFile(R.raw.porcupine_params, "porcupine_params.pv");
            copyResourceFile(R.raw.rhino_params, "rhino_params.pv");
            copyResourceFile(R.raw.porcupine_android, "keyword.ppn");
            copyResourceFile(R.raw.smart_lighting_android, "context.rhn");
        } catch (IOException e) {
            Toast.makeText(this, "Failed to copy resource files.", Toast.LENGTH_SHORT).show();
        }

        ToggleButton recordButton = findViewById(R.id.startButton);

        recordButton.setOnClickListener(v -> {
            if (recordButton.isChecked()) {
                if (hasRecordPermission()) {
                    startService();
                } else {
                    requestRecordPermission();
                }
            } else {
                stopService();
            }
        });
    }
}