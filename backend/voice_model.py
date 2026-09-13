import os

import torch
import torch.nn as nn
import torchaudio
from transformers import Wav2Vec2Config, Wav2Vec2Model


MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "models",
    "voice",
    "caa-wav2vec2",
    "best.pt",
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TARGET_SAMPLE_RATE = 16000


class VoiceScamClassifier(nn.Module):
    def __init__(self):
        super().__init__()

        config = Wav2Vec2Config(
            hidden_size=768,
            num_hidden_layers=12,
            num_attention_heads=12,
            intermediate_size=3072,
            conv_dim=(512, 512, 512, 512, 512, 512, 512),
            conv_stride=(5, 2, 2, 2, 2, 2, 2),
            conv_kernel=(10, 3, 3, 3, 3, 2, 2),
        )

        self.encoder = Wav2Vec2Model(config)

        self.classifier = nn.Sequential(
            nn.Linear(768, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 2),
        )

        self._load_checkpoint()

    def _load_checkpoint(self):
        print(f"Loading voice checkpoint: {MODEL_PATH}")

        checkpoint = torch.load(
            MODEL_PATH,
            map_location="cpu",
            weights_only=False,
        )

        state = checkpoint["model_state_dict"]

        # class_weights is training metadata, not model parameters.
        state = {
            key: value
            for key, value in state.items()
            if key != "class_weights"
        }

        encoder_state = {}
        classifier_state = {}

        for key, value in state.items():
            if key.startswith("encoder."):
                encoder_state[key[len("encoder."):]] = value

            elif key.startswith("classifier."):
                # Convert:
                # classifier.0.weight -> 0.weight
                # classifier.0.bias   -> 0.bias
                # classifier.3.weight -> 3.weight
                # classifier.3.bias   -> 3.bias
                classifier_state[key[len("classifier."):]] = value

        encoder_result = self.encoder.load_state_dict(
            encoder_state,
            strict=False,
        )

        if encoder_result.unexpected_keys:
            raise RuntimeError(
                f"Unexpected encoder keys: "
                f"{encoder_result.unexpected_keys}"
            )

        allowed_missing = {"masked_spec_embed"}

        unexpected_missing = (
            set(encoder_result.missing_keys) - allowed_missing
        )

        if unexpected_missing:
            raise RuntimeError(
                f"Unexpected missing encoder keys: "
                f"{sorted(unexpected_missing)}"
            )

        print("Encoder missing keys:", encoder_result.missing_keys)

        classifier_result = self.classifier.load_state_dict(
            classifier_state,
            strict=True,
        )

        print(
            "Classifier missing keys:",
            classifier_result.missing_keys,
        )
        print(
            "Classifier unexpected keys:",
            classifier_result.unexpected_keys,
        )

        self.to(DEVICE)
        self.eval()

        print("Voice model ready on:", DEVICE)

    @torch.inference_mode()
    def predict_waveform(self, waveform, sample_rate):
        if waveform.ndim == 2:
            waveform = waveform.mean(dim=0)

        waveform = waveform.float()

        if sample_rate != TARGET_SAMPLE_RATE:
            waveform = torchaudio.functional.resample(
                waveform,
                sample_rate,
                TARGET_SAMPLE_RATE,
            )

        max_value = waveform.abs().max()

        if max_value > 0:
            waveform = waveform / max_value

        waveform = waveform.unsqueeze(0).to(DEVICE)

        outputs = self.encoder(
            input_values=waveform,
        )

        hidden = outputs.last_hidden_state
        embedding = hidden.mean(dim=1)

        logits = self.classifier(embedding)
        probabilities = torch.softmax(logits, dim=-1)[0]

        scam_probability = float(probabilities[1].item())
        safe_probability = float(probabilities[0].item())

        label = "Scam" if scam_probability >= 0.5 else "Safe"

        return {
            "label": label,
            "probability": round(
                max(scam_probability, safe_probability) * 100,
                2,
            ),
            "scam_probability": round(
                scam_probability * 100,
                2,
            ),
            "safe_probability": round(
                safe_probability * 100,
                2,
            ),
        }

    @torch.inference_mode()
    def predict_file(self, path):
        waveform, sample_rate = torchaudio.load(path)
        return self.predict_waveform(waveform, sample_rate)


voice_model = VoiceScamClassifier()
