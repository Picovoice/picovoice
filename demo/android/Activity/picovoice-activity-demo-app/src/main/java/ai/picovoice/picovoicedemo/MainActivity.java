/*
    Copyright 2018-2023 Picovoice Inc.

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
import android.os.CountDownTimer;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.ToggleButton;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.Guideline;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.Map;
import java.util.Objects;

import ai.picovoice.picovoice.*;
import ai.picovoice.rhino.RhinoInference;

public class MainActivity extends AppCompatActivity {
    private static final String ACCESS_KEY = "${YOUR_ACCESS_KEY_HERE}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
    private String wakeWordName = "";
    private String contextName = "";

    private PicovoiceManager picovoiceManager;
    private TextView intentTextView;
    private TextView errorTextView;
    private Guideline errorGuideline;
    private ToggleButton recordButton;
    private Button cheatSheetButton;

    private final CountDownTimer countDownTimer = new CountDownTimer(2000, 1000) {
        @Override
        public void onTick(long l) {

        }

        @Override
        public void onFinish() {
            intentTextView.setText("\n    Listening ...\n");
        }
    };

    private final PicovoiceWakeWordCallback picovoiceWakeWordCallback = new PicovoiceWakeWordCallback() {
        @Override
        public void invoke() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    countDownTimer.cancel();
                    intentTextView.setText("\n    Wake Word Detected ...\n");
                }
            });
        }
    };

    private final PicovoiceInferenceCallback picovoiceInferenceCallback = new PicovoiceInferenceCallback() {
        @Override
        public void invoke(final RhinoInference inference) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    intentTextView.setText("\n    {\n");
                    intentTextView.append(
                            String.format("        \"isUnderstood\" : \"%b\",\n", inference.getIsUnderstood()));
                    if (inference.getIsUnderstood()) {
                        intentTextView.append(
                                String.format("        \"intent\" : \"%s\",\n", inference.getIntent()));
                        final Map<String, String> slots = inference.getSlots();
                        if (slots.size() > 0) {
                            intentTextView.append("        \"slots\" : {\n");
                            for (String key : slots.keySet()) {
                                intentTextView.append(
                                        String.format("            \"%s\" : \"%s\",\n", key, slots.get(key)));
                            }
                            intentTextView.append("        }\n");
                        }
                    }
                    intentTextView.append("    }\n");
                    countDownTimer.start();
                }
            });
        }
    };

    private final PicovoiceManagerErrorCallback picovoiceManagerErrorCallback = new PicovoiceManagerErrorCallback() {
        @Override
        public void invoke(final PicovoiceException e) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    onPicovoiceError(e.getMessage());
                }
            });
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        TextView wakeWordNameTextView = findViewById(R.id.wakeWordName);
        TextView contextNameTextView = findViewById(R.id.contextName);
        intentTextView = findViewById(R.id.intentView);
        errorTextView = findViewById(R.id.errorView);
        errorGuideline = findViewById(R.id.errorGuideLine);
        recordButton = findViewById(R.id.startButton);
        cheatSheetButton = findViewById(R.id.cheatSheetButton);

        wakeWordName = getApplicationContext().getString(R.string.pvWakeword);
        wakeWordNameTextView.setText(wakeWordName);

        contextName = getApplicationContext().getString(R.string.pvContextName);
        contextNameTextView.setText(contextName);

        initPicovoice();
    }

    private boolean hasRecordPermission() {
        return ActivityCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) ==
                PackageManager.PERMISSION_GRANTED;
    }

    private void requestRecordPermission(int requestCode) {
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, requestCode);
    }

    @Override
    public void onRequestPermissionsResult(
            int requestCode,
            @NonNull String[] permissions,
            @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (grantResults.length == 0 || grantResults[0] == PackageManager.PERMISSION_DENIED) {
            if (requestCode == 0) {
                recordButton.toggle();
            }
            onPicovoiceError("Microphone permissions denied");
        } else {
            if (requestCode == 0) {
                process(null);
            } else if (requestCode == 1) {
                View view = findViewById(R.id.cheatSheetButton);
                showContextCheatSheet(view);
            }
        }
    }

    private void initPicovoice() {
        String porcupineModel;
        String rhinoModel;
        if (Objects.equals(BuildConfig.FLAVOR, "en")) {
            porcupineModel = "porcupine_params.pv";
            rhinoModel = "rhino_params.pv";
        } else {
            porcupineModel = "porcupine_params_" + BuildConfig.FLAVOR + ".pv";
            rhinoModel = "rhino_params_" + BuildConfig.FLAVOR + ".pv";
        }

        picovoiceManager = new PicovoiceManager.Builder()
                .setAccessKey(ACCESS_KEY)
                .setKeywordPath("wakewords/" + wakeWordName.replace(" ", "_") + ".ppn")
                .setPorcupineSensitivity(0.75f)
                .setPorcupineModelPath("models/" + porcupineModel)
                .setWakeWordCallback(picovoiceWakeWordCallback)
                .setContextPath("contexts/" + contextName + ".rhn")
                .setRhinoSensitivity(0.25f)
                .setRhinoModelPath("models/" + rhinoModel)
                .setInferenceCallback(picovoiceInferenceCallback)
                .setProcessErrorCallback(picovoiceManagerErrorCallback)
                .build(getApplicationContext());

        try {
            Log.i("PicovoiceManager", picovoiceManager.getContextInformation());
        } catch (PicovoiceException e) {
            Log.e("PicovoiceManager", "Failed to get context info: \n" + e);
        }
    }

    public void process(View view) {
        ToggleButton recordButton = findViewById(R.id.startButton);

        try {
            if (recordButton.isChecked()) {
                if (hasRecordPermission()) {
                    picovoiceManager.start();
                    intentTextView.setText("\n    Listening ...\n");
                } else {
                    requestRecordPermission(0);
                }
            } else {
                countDownTimer.cancel();
                picovoiceManager.stop();
                intentTextView.setText("");
            }
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
    }

    public void showContextCheatSheet(View view) {
        String contextInformation;
        try {
            contextInformation = picovoiceManager.getContextInformation();
        } catch (PicovoiceException e) {
            Log.e("PicovoiceManager", "Failed to get context info: \n" + e);
            return;
        }

        if (contextInformation.equals("")) {
            if (!hasRecordPermission()) {
                requestRecordPermission(1);
                return;
            }
            try {
                picovoiceManager.start();
                contextInformation = picovoiceManager.getContextInformation();
                picovoiceManager.stop();
            } catch (PicovoiceException e) {
                onPicovoiceError(e.getMessage());
                return;
            }
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);
        ViewGroup viewGroup = findViewById(R.id.content);
        View dialogView = LayoutInflater.from(view.getContext())
                                        .inflate(R.layout.context_cheat_sheet, viewGroup, false);
        builder.setView(dialogView);

        TextView contextField = dialogView.findViewById(R.id.contextField);
        contextField.setText(contextInformation);

        AlertDialog dialog = builder.create();
        dialog.show();
    }

    private void onPicovoiceError(String errorMessage) {
        recordButton.setChecked(false);
        recordButton.setEnabled(false);
        recordButton.setBackground(ContextCompat.getDrawable(
                getApplicationContext(),
                R.drawable.button_disabled));

        cheatSheetButton.setEnabled(false);

        errorTextView.setText(errorMessage);
        errorTextView.setVisibility(View.VISIBLE);

        ConstraintLayout.LayoutParams intentParam = (ConstraintLayout.LayoutParams) intentTextView.getLayoutParams();
        intentParam.bottomToTop = errorGuideline.getId();
        intentTextView.requestLayout();
        intentTextView.setText("");
    }
}
