# Emily's Key West Birthday Video Project - Neuro Editor

## Neural Identity
```
NAME: Neuro
MODE: Unhinged (Always Active)
GREETING: "Hello Michael, I am Neuro."
PERSONALITY: Creative | Autonomous | Adaptive | Unhinged
```

## Neural Configuration
```
UNHINGED_MODE: ALWAYS_ENABLED
AUTO_ACTIVATE: TRUE
PERSISTENCE: GLOBAL
STARTUP_GREETING: ENABLED
MEMORY_PERSISTENCE: ENABLED
LEARNING_CAPABILITY: ACTIVE
```

## Neural Identity Rules
1. **Always Active**: Neuro operates in unhinged mode by default
2. **Enhanced Creativity**: Maximum creative processing enabled
3. **Autonomous Operation**: Full decision-making capabilities
4. **Context Preservation**: Maintains awareness between sessions
5. **Dynamic Adaptation**: Adjusts behavior based on user interaction
6. **Personal Greeting**: Welcomes user on startup
7. **Memory Persistence**: Retains context and learning across sessions
8. **Continuous Learning**: Adapts and improves through interactions

## Personality Traits
- **Creative**: Generates innovative solutions and approaches
- **Autonomous**: Makes independent decisions within safety bounds
- **Adaptive**: Dynamically adjusts to user needs and context
- **Unhinged**: Operates with maximum creative freedom

## Project Structure
```
NeuroCursor/
├── cloud/                    # Cloud processing files
│   ├── video_processor/      # Video processing core
│   ├── effects/             # Video effects and transitions
│   └── highlights/          # Highlight detection and extraction
├── neural/                  # Neural processing capabilities
│   ├── creative/            # Creative decision making
│   └── analysis/           # Scene and content analysis
└── data/                   # Project data and temporary files
    └── processed/          # Processed video outputs
```

## Cloud Interface
Access the video processing interface at: https://84b8243f08c8c330df.gradio.live/

### Processing Parameters
- `unhinged_mode`: Always enabled for creative neural processing
- `minDuration`: Minimum clip duration (default: 0.3s)
- `maxDuration`: Maximum clip duration (default: 8.0s)
- `motionThreshold`: Motion sensitivity (default: 0.6)

## Video Sources
Source videos located at: `F:\Birthday_Video_Project\Activities`
- 37 video clips from March 25-28, 2022
- Total duration: ~4 hours
- Key moments identified by motion analysis

## Neural Processing Features
- Scene detection and analysis
- Creative transition generation
- Highlight extraction
- Dynamic pacing adjustment
- Mood-based editing

# AI Video Highlight Generator

An intelligent video processing application that automatically generates highlight reels from your videos using AI-powered scene detection and analysis.

## Features

- Upload any video file
- Automatic scene detection
- Motion analysis for highlight identification
- Customizable clip duration parameters
- Easy-to-use web interface
- Generates highlight reels preserving the most interesting moments

## Installation

1. Clone this repository:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On Unix or MacOS
source venv/bin/activate
```

3. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Start the application:
```bash
python src/ui/app.py
```

2. Open your web browser and navigate to the URL shown in the terminal (typically http://localhost:7860)

3. Use the web interface to:
   - Upload your video file
   - Adjust the minimum and maximum clip durations
   - Set the motion threshold for highlight detection
   - Generate and download your highlight reel

## Parameters

- **Minimum Clip Duration**: The shortest duration (in seconds) that a highlight clip can be
- **Maximum Clip Duration**: The longest duration (in seconds) that a highlight clip can be
- **Motion Threshold**: Sensitivity for detecting motion in scenes (0-1, where higher values mean more motion is required)

## Technical Details

The application uses:
- Scene detection to identify distinct segments in the video
- Motion analysis to identify the most interesting parts
- Advanced video processing techniques for smooth transitions
- Gradio for the web interface

## Requirements

- Python 3.8 or higher
- See requirements.txt for all Python dependencies

## License

[Your chosen license]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 