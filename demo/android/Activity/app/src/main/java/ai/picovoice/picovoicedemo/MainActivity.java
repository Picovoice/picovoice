/*
    Copyright 2018-2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

package ai.picovoice.picovoicedemo;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

import ai.picovoice.picovoice.PicovoiceException;
import ai.picovoice.picovoice.PicovoiceInferenceCallback;
import ai.picovoice.picovoice.PicovoiceManager;
import ai.picovoice.picovoice.PicovoiceWakeWordCallback;
import ai.picovoice.rhino.RhinoInference;

public class MainActivity extends AppCompatActivity {
    private PicovoiceManager picovoiceManager;

    private void copyResourceFile(int resourceId, String filename) throws IOException {
        Resources resources = getResources();
        try (
                InputStream is = new BufferedInputStream(resources.openRawResource(resourceId), 256);
                OutputStream os = new BufferedOutputStream(openFileOutput(filename, Context.MODE_PRIVATE), 256)
        ) {
            int r;
            while ((r = is.read()) != -1) {
                os.write(r);
            }
            os.flush();
        }
    }

    private String getAbsolutePath(String filename) {
        return new File(this.getFilesDir(), filename).getAbsolutePath();
    }

    private void displayError(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        try {
            copyResourceFile(R.raw.porcupine_android, "keyword.ppn");
            copyResourceFile(R.raw.smart_lighting_android, "context.rhn");
        } catch (IOException e) {
            Toast.makeText(this, "Failed to copy resource files.", Toast.LENGTH_SHORT).show();
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
        if (grantResults.length == 0 || grantResults[0] == PackageManager.PERMISSION_DENIED) {
            ToggleButton toggleButton = findViewById(R.id.startButton);
            toggleButton.toggle();
        } else {
            initPicovoice();
        }
    }

    private void initPicovoice() {
        try {
            final TextView intentTextView = findViewById(R.id.intentView);

            intentTextView.setText("\n    Listening ...\n");
            picovoiceManager = new PicovoiceManager.Builder()
                    .setKeywordPath(getAbsolutePath("keyword.ppn"))
                    .setPorcupineSensitivity(0.75f)
                    .setWakeWordCallback(new PicovoiceWakeWordCallback() {
                        @Override
                        public void invoke() {
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    intentTextView.setText("\n    Wake Word Detected ...\n");
                                }
                            });
                        }
                    })
                    .setContextPath(getAbsolutePath("context.rhn"))
                    .setRhinoSensitivity(0.25f)
                    .setInferenceCallback(new PicovoiceInferenceCallback() {
                        @Override
                        public void invoke(final RhinoInference inference) {
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    intentTextView.setText("\n    {\n");
                                    intentTextView.append(String.format("        \"isUnderstood\" : \"%b\",\n", inference.getIsUnderstood()));
                                    if (inference.getIsUnderstood()) {
                                        intentTextView.append(String.format("        \"intent\" : \"%s\",\n", inference.getIntent()));
                                        final Map<String, String> slots = inference.getSlots();
                                        if (slots.size() > 0) {
                                            intentTextView.append("        \"slots\" : {\n");
                                            for (String key : slots.keySet()) {
                                                intentTextView.append(String.format("            \"%s\" : \"%s\",\n", key, slots.get(key)));
                                            }
                                            intentTextView.append("        }\n");
                                        }
                                    }
                                    intentTextView.append("    }\n");
                                }
                            });
                        }
                    })
                    .build(getApplicationContext());
            picovoiceManager.start();
        } catch (PicovoiceException e) {
            displayError("Failed to initialize Picovoice.");
        }
    }

    public void process(View view) {
        ToggleButton recordButton = findViewById(R.id.startButton);

        try {
            if (recordButton.isChecked()) {
                if (hasRecordPermission()) {
                    initPicovoice();
                } else {
                    requestRecordPermission();
                }
            } else {
                picovoiceManager.stop();
            }
        } catch (PicovoiceException e) {
            displayError("Something went wrong");
        }
    }
}
