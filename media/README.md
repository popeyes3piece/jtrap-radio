# Media Player Directory

This directory is for media files that will be available in the Media Player window.

## Supported File Types

- **Videos**: MP4, WebM, OGG
- **Images**: JPG, JPEG, PNG, WebP
- **Animated Images**: GIF

## How to Add Media Files

1. Place your media files in this `media` directory
2. Update the `mediaFiles` array in `script.js` to include your files
3. The format is:
   ```javascript
   { name: 'Display Name', path: 'media/filename.ext', type: 'video' }
   ```

## Example

If you add a file called `my-video.mp4`:

1. Place it in this directory: `media/my-video.mp4`
2. Add this line to the `mediaFiles` array in `script.js`:
   ```javascript
   { name: 'My Cool Video', path: 'media/my-video.mp4', type: 'video' }
   ```

## Notes

- Videos will autoplay and loop
- GIFs will play automatically
- Images will display statically
- All media will scale to fit the player window
