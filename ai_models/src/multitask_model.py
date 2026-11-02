import torch
import torch.nn as nn
from torchvision.models import efficientnet_v2_s, EfficientNet_V2_S_Weights

class MultiTaskTongueClassifier(nn.Module):
    """
    Multi-Task Learning Deep Neural Network for Tongue Feature Analysis.
    Utilizes EfficientNetV2-S as the shared feature backbone with separate
    classification heads for each clinical tongue characteristic.
    """

    TASKS = {
        "color": ["Normal Pink", "Pale", "Red", "Deep Red", "Bluish/Purplish"],
        "coating": ["Thin White (Normal)", "Thick White", "Yellow", "Peeled/None"],
        "texture": ["Smooth/Normal", "Rough/Granular", "Fissured"],
        "shape": ["Normal", "Swollen/Enlarged", "Thin"],
        "fissures": ["Absent", "Mild/Superficial", "Deep/Severe"],
        "teeth_marks": ["Absent", "Present (Scalloped)"],
        "visible_patches": ["None/Uniform", "Geographic Patches", "Erythematous Spots"]
    }

    def __init__(self, pretrained: bool = False, dropout_rate: float = 0.3):
        super(MultiTaskTongueClassifier, self).__init__()

        # Shared Feature Extractor
        weights = EfficientNet_V2_S_Weights.DEFAULT if pretrained else None
        backbone = efficientnet_v2_s(weights=weights)
        self.features = backbone.features
        self.pool = nn.AdaptiveAvgPool2d((1, 1))

        in_features = 1280  # EfficientNetV2-S output channels

        # Individual Task Prediction Heads
        self.heads = nn.ModuleDict()
        for task_name, classes in self.TASKS.items():
            self.heads[task_name] = nn.Sequential(
                nn.Dropout(p=dropout_rate),
                nn.Linear(in_features, 256),
                nn.ReLU(inplace=True),
                nn.Dropout(p=dropout_rate / 2),
                nn.Linear(256, len(classes))
            )

    def forward(self, x: torch.Tensor) -> dict:
        feat = self.features(x)
        feat = self.pool(feat)
        feat = torch.flatten(feat, 1)

        outputs = {}
        for task_name, head in self.heads.items():
            outputs[task_name] = head(feat)
        return outputs

    def get_last_conv_layer(self):
        """Returns the final convolutional feature layer for Grad-CAM explainability."""
        return self.features[-1]
