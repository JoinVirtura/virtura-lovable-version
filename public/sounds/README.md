# Notification Sound Files

This directory contains sound files for notification preferences.

## Required Files

- `default.mp3` - Standard notification beep (250ms, 800Hz)
- `chime.mp3` - Pleasant chime sound (500ms, multi-tone)
- `bell.mp3` - Classic bell ring (400ms)
- `pop.mp3` - Subtle pop/bubble sound (150ms)

## File Specifications

- **Format:** MP3
- **Sample Rate:** 44.1kHz
- **Bit Rate:** 128kbps
- **Duration:** 150ms - 500ms
- **Volume:** Normalized to -3dB peak

## How to Add Sound Files

### Option 1: Use Online Sound Libraries
1. Visit freesound.org or soundbible.com
2. Search for notification sounds
3. Download MP3 format
4. Rename to match required filenames
5. Place in this directory

### Option 2: Generate Synthetic Sounds
1. Use Audacity or similar audio editor
2. Generate tone at specified frequency (e.g., 800Hz for default)
3. Set duration (e.g., 250ms for default)
4. Apply fade in/out (10ms)
5. Export as MP3
6. Place in this directory

### Option 3: Temporary Web Audio API Fallback
If sound files are not present, the application will use the browser's Web Audio API to generate synthetic tones as a fallback.

## Sound Samples

You can find free notification sounds at:
- https://freesound.org (Creative Commons licensed)
- https://soundbible.com
- https://zapsplat.com
- https://mixkit.co/free-sound-effects/notification/

## Testing

After adding sound files, test them in the notification preferences page:
1. Go to Settings → Notifications
2. Select different sound options
3. Click "Test Sound" button
4. Adjust volume if needed
