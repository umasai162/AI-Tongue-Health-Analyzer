import os
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

from ai_models.src.multitask_model import MultiTaskTongueClassifier

class TongueDataset(Dataset):
    """
    Multi-Task Tongue Image Dataset loader.
    Supports patient-level splits to avoid data leakage between patients.
    """
    def __init__(self, image_paths, labels_dict, transform=None):
        self.image_paths = image_paths
        self.labels_dict = labels_dict  # Dict of task -> list of integer labels
        self.transform = transform

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        targets = {task: torch.tensor(labels[idx], dtype=torch.long) for task, labels in self.labels_dict.items()}
        return image, targets

def get_data_transforms():
    train_transform = transforms.Compose([
        transforms.Resize((260, 260)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((260, 260)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    return train_transform, val_transform

def evaluate_multitask(model, dataloader, device):
    """Evaluate accuracy, classification report, and confusion matrices per task."""
    model.eval()
    task_preds = {task: [] for task in MultiTaskTongueClassifier.TASKS}
    task_trues = {task: [] for task in MultiTaskTongueClassifier.TASKS}

    with torch.no_grad():
        for images, targets in dataloader:
            images = images.to(device)
            outputs = model(images)

            for task in MultiTaskTongueClassifier.TASKS:
                logits = outputs[task]
                preds = torch.argmax(logits, dim=1).cpu().numpy()
                task_preds[task].extend(preds)
                task_trues[task].extend(targets[task].numpy())

    results = {}
    for task in MultiTaskTongueClassifier.TASKS:
        y_true = task_trues[task]
        y_pred = task_preds[task]
        acc = float(np.mean(np.array(y_true) == np.array(y_pred)))
        results[task] = {
            "accuracy": round(acc, 4),
            "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
            "report": classification_report(y_true, y_pred, output_dict=True, zero_division=0)
        }

    return results
