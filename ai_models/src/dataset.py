import os
import json
import random
from pathlib import Path
from typing import Dict, List, Tuple
from PIL import Image
import torch
from torch.utils.data import Dataset
from torchvision import transforms

from ai_models.src.multitask_model import MultiTaskTongueClassifier

class TongueMultiTaskDataset(Dataset):
    """
    Patient-level stratified dataset loader for multi-task tongue classification.
    Prevents data leakage by ensuring all images from the same patient/subject
    remain strictly within either train or validation set.
    """
    def __init__(self, samples: List[Dict], transform=None):
        self.samples = samples
        self.transform = transform
        self.task_maps = {
            task: {cls_name: i for i, cls_name in enumerate(classes)}
            for task, classes in MultiTaskTongueClassifier.TASKS.items()
        }

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        item = self.samples[idx]
        image = Image.open(item["image_path"]).convert("RGB")

        if self.transform:
            image = self.transform(image)

        targets = {}
        for task, label_str in item["labels"].items():
            class_idx = self.task_maps[task].get(label_str, 0)
            targets[task] = torch.tensor(class_idx, dtype=torch.long)

        return image, targets

def split_by_patient(samples: List[Dict], val_ratio: float = 0.2, seed: int = 42) -> Tuple[List[Dict], List[Dict]]:
    """Group samples by patient_id to prevent data leakage."""
    random.seed(seed)
    patients = list({s.get("patient_id", s["image_path"]) for s in samples})
    random.shuffle(patients)

    split_idx = int(len(patients) * (1 - val_ratio))
    train_patients = set(patients[:split_idx])

    train_samples = [s for s in samples if s.get("patient_id", s["image_path"]) in train_patients]
    val_samples = [s for s in samples if s.get("patient_id", s["image_path"]) not in train_patients]

    return train_samples, val_samples
