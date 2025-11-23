import torch
from pipelines import DiffusionPipeline

base_model = "black-forest-labs/FLUX.1-dev"
pipe = DiffusionPipeline.from_pretrained(base_model, torch_dtype=torch.bfloat16)

lora_repo = "strangerzonehf/Ghibli-Flux-Cartoon-LoRA"
trigger_word = "Ghibli Art"
pipe.load_lora_weights(lora_repo)

device = torch.device("cuda")
pipe.to(device)
