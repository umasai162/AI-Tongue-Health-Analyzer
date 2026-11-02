import os
import sys
import argparse
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(ROOT_DIR / "backend") not in sys.path:
    sys.path.insert(0, str(ROOT_DIR / "backend"))

from ai_models.src.segmentation import UNet, DiceBCELoss, calculate_metrics
from ai_models.src.multitask_model import MultiTaskTongueClassifier
from ai_models.src.classification import get_data_transforms
from ai_models.src.dataset import TongueMultiTaskDataset

def train_multitask(train_loader, val_loader, epochs=5, lr=1e-4, checkpoint_dir="./checkpoints"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Starting MultiTask EfficientNetV2 training on device: {device}")

    model = MultiTaskTongueClassifier(pretrained=False).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss()

    best_val_loss = float("inf")
    os.makedirs(checkpoint_dir, exist_ok=True)
    best_path = os.path.join(checkpoint_dir, "multitask_efficientnetv2.pth")

    for epoch in range(epochs):
        model.train()
        train_loss = 0.0

        for images, targets in train_loader:
            images = images.to(device)
            optimizer.zero_grad()
            outputs = model(images)

            batch_loss = 0.0
            for task, head_output in outputs.items():
                target = targets[task].to(device)
                batch_loss += criterion(head_output, target)

            batch_loss.backward()
            optimizer.step()
            train_loss += batch_loss.item()

        avg_train_loss = train_loss / max(len(train_loader), 1)
        print(f"Epoch [{epoch+1}/{epochs}] - MultiTask Train Loss: {avg_train_loss:.4f}")

    torch.save(model.state_dict(), best_path)
    print(f"Training completed. Model saved to: {best_path}")

def train_unet(train_loader, val_loader, epochs=5, lr=1e-4, checkpoint_dir="./checkpoints"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Starting U-Net Tongue Segmentation training on device: {device}")

    model = UNet(n_channels=3, n_classes=1).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = DiceBCELoss()

    os.makedirs(checkpoint_dir, exist_ok=True)
    save_path = os.path.join(checkpoint_dir, "unet_tongue.pth")

    for epoch in range(epochs):
        model.train()
        train_loss = 0.0

        for images, masks in train_loader:
            images = images.to(device)
            masks = masks.to(device)

            optimizer.zero_grad()
            preds = model(images)
            loss = criterion(preds, masks)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()

        avg_loss = train_loss / max(len(train_loader), 1)
        print(f"Epoch [{epoch+1}/{epochs}] - U-Net Train Loss: {avg_loss:.4f}")

    torch.save(model.state_dict(), save_path)
    print(f"U-Net training complete. Checkpoint saved to: {save_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Tongue AI Models")
    parser.add_argument("--task", choices=["multitask", "unet"], default="multitask")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--lr", type=float, default=1e-4)
    args = parser.parse_args()
    print(f"Execution configured for task: {args.task}, epochs: {args.epochs}")
