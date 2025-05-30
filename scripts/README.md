# Mport Media Group Scripts

This directory contains utility scripts for managing the Mport Media Group file structure and branding.

## Folder Cover Generator

The `generate_folder_covers.py` script creates consistent, branded folder covers for all directories and subdirectories using the AI Meditation Robot theme.

### Features

- Generates 256x256 PNG folder covers for main directories and subdirectories
- Applies consistent branding colors and styles with hierarchy-based variations
- Includes directory-specific descriptions and visual indicators
- Follows the AI Meditation Robot theme guidelines
- Preview functionality in web browser before generating
- Creates covers in the `assets/folder_covers` directory
- Animated shine effects and geometric patterns
- Subdirectory-specific styling and visual hierarchy

### Requirements

Install the required packages:

```bash
pip install -r requirements.txt
```

### Usage

1. Ensure you have all dependencies installed
2. Run the script with desired options:

```bash
# Generate all covers
python scripts/generate_folder_covers.py

# Preview all covers in browser without generating files
python scripts/generate_folder_covers.py --preview

# Generate cover for specific directory
python scripts/generate_folder_covers.py --dir branding/guidelines

# Preview specific directory cover
python scripts/generate_folder_covers.py --dir marketing/campaigns --preview
```

### Color Schemes

Each directory type has its own color scheme with subdirectory variations:

#### Main Directories
- Assets: Tech Blue → Deep Mind Purple
- Branding: Deep Mind Purple → Tech Blue
- Clients: Tech Blue → Zen Gray
- Docs: Zen Gray → Tech Blue
- Marketing: Deep Mind Purple → Zen Gray
- Projects: Tech Blue → Deep Mind Purple
- Services: Deep Mind Purple → Tech Blue
- Website: Tech Blue → Zen Gray

#### Subdirectory Color Examples
- Assets/Images: Mindful Teal → Tech Blue
- Branding/Guidelines: Deep Mind Purple → Mindful Teal
- Marketing/Campaigns: Focus Amber → Deep Mind Purple
- Projects/Active: Growth Emerald → Tech Blue

### Visual Hierarchy

The script implements a clear visual hierarchy:

1. **Main Directories**
   - Larger robot icon (128px)
   - Bolder geometric patterns
   - Full opacity elements
   - Larger text size

2. **Subdirectories**
   - Smaller robot icon (96px)
   - Subtle geometric patterns
   - Slightly reduced opacity
   - Smaller text size
   - Visual indicator in top-left corner
   - Subtle shadow effect

### Customization

To modify the appearance of folder covers:

1. **Template Customization**
   - Edit `assets/templates/folder_cover_template.html`
   - Adjust CSS variables and styles
   - Modify animations and effects
   - Change layout and spacing

2. **Color Schemes**
   - Update color definitions in `FolderCoverGenerator.colors`
   - Modify directory color mappings in `FolderCoverGenerator.dir_colors`
   - Add new color combinations for subdirectories

3. **Directory Information**
   - Update descriptions in `get_directory_info` method
   - Add new directory types and their descriptions
   - Customize subdirectory descriptions

4. **Visual Effects**
   - Adjust geometric pattern density
   - Modify shine animation timing
   - Change shadow properties
   - Update subdirectory indicators

### Notes

- Requires Cairo library for SVG rendering
- Generated covers follow Mport Media Group's branding guidelines
- Automatically scales the AI Meditation Robot image when present
- Preview mode uses temporary files that are automatically cleaned up
- Supports nested directory structures with consistent styling

# Meta Agent Deployment Script

## Overview

`meta_agent_deploy.py` automates the build, push, and deployment of your AI agent Docker image to Google Cloud Run, including secure handling of Hugging Face and Gemini API keys.

## Prerequisites
- Google Cloud CLI (`gcloud`) installed and authenticated
- Docker installed and running
- Permissions to push to Artifact Registry and deploy to Cloud Run
- Python 3.7+

## Usage

From the project root:

```bash
cd scripts
python meta_agent_deploy.py
```

The script will prompt for your Hugging Face and Gemini API keys if not set as environment variables.

### Environment Variables

You can set your API keys as environment variables to avoid prompts:

- `HF_TOKEN` — Hugging Face API token
- `GEMINI_API_KEY` — Gemini API key

Example:

```bash
export HF_TOKEN=your_hf_token
export GEMINI_API_KEY=your_gemini_key
python meta_agent_deploy.py
```

## What It Does
- Builds the Docker image for your agent
- Pushes the image to Google Artifact Registry
- Deploys the image to Cloud Run with your API keys as environment variables
- Prints the live service URL

## Extending
This script is modular and ready for future extension (e.g., supporting more agent types, conversational UI, additional GCP services). 