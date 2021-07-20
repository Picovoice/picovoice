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
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import java.util.Map;

import ai.picovoice.picovoice.PicovoiceException;
import ai.picovoice.picovoice.PicovoiceInferenceCallback;
import ai.picovoice.picovoice.PicovoiceManager;
import ai.picovoice.picovoice.PicovoiceWakeWordCallback;
import ai.picovoice.rhino.RhinoInference;

public class MainActivity extends AppCompatActivity {
    private PicovoiceManager picovoiceManager;
    private TextView intentTextView;

    private void displayError(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initPicovoice();
        intentTextView = findViewById(R.id.intentView);
    }

    private boolean hasRecordPermission() {
        return ActivityCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestRecordPermission() {
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, 0);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (grantResults.length == 0 || grantResults[0] == PackageManager.PERMISSION_DENIED) {
            ToggleButton toggleButton = findViewById(R.id.startButton);
            toggleButton.toggle();
        } else {
            initPicovoice();
        }
    }

    private void initPicovoice() {
            picovoiceManager = new PicovoiceManager.Builder()
                    .setKeywordPath("porcupine_android.ppn")
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
                    .setContextPath("smart_lighting_android.rhn")
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

            Log.i("PicovoiceManager", picovoiceManager.getContextInformation());
    }

    public void process(View view) {
        ToggleButton recordButton = findViewById(R.id.startButton);

        try {
            if (recordButton.isChecked()) {
                if (hasRecordPermission()) {
                    intentTextView.setText("\n    Listening ...\n");
                    picovoiceManager.start();
                } else {
                    requestRecordPermission();
                }
            } else {
                intentTextView.setText("");
                picovoiceManager.stop();
            }
        } catch (PicovoiceException e) {
            displayError("Something went wrong");
        }
    }

    public void showContextCheatSheet(View view) {
        if (!hasRecordPermission()) {
            requestRecordPermission();
            return;
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);
        ViewGroup viewGroup = findViewById(R.id.content);
        View dialogView = LayoutInflater.from(view.getContext()).inflate(R.layout.context_cheat_sheet, viewGroup, false);
        builder.setView(dialogView);

        try {
            picovoiceManager.start();
            TextView contextField = (TextView) dialogView.findViewById(R.id.contextField);
            contextField.setText(picovoiceManager.getContextInformation());
            picovoiceManager.stop();
        } catch (PicovoiceException e) {
            displayError("Something went wrong");
        }

        AlertDialog dialog = builder.create();
        dialog.show();
    }
}
