# Chrome plugin to copy cycling workouts from whatsonzwift.com to your Garmin Connect account

This is a very basic plugin, MVP (minimal viable product) to ease creating power-based workouts from those available on [WhatsOnZwift](https://whatsonzwift.com).

Once plugin is installed - it adds a new icon to plugin panel. Clicking on it will open a popup with a field to enter your current FTP, a list of available workouts with export buttons (if a tab with Garmin Connect is opened too).

To export desired workout to your Garmin Connect account you should:
- Download plugin code source (unpack if it is needed)
- Go to Chrome's extensions settings page ([chrome://extensions/](chrome://extensions/) or Settings -> More Tools -> Extensions)
- Enable developer mode
- Load unpacked extension
- Go to [WhatsOnZwift](https://whatsonzwift.com), proceed to a page with workouts list (or individual workout page) 
- Open a separate tab with Garmin Connect logged in. Plugin will send requests to Garmin Connect from this tab.
- Open plugin popup and choose desired workout
- Press the export button located near workout plot